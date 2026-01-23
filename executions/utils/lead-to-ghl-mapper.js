/**
 * Lead to GoHighLevel Mapper Utility
 *
 * Maps lead data from Apify/Instantly/SmartLead format to GoHighLevel CRM format.
 * Handles sentiment-based pipeline stage mapping, custom field transformations,
 * and data validation for CRM sync.
 *
 * @version 1.0.0
 * @requires validator
 */

const validator = require('validator');

/**
 * Pipeline stage mapping configuration
 */
const PIPELINE_STAGES = {
    LEAD: 'lead',
    CONTACTED: 'contacted',
    REPLIED: 'replied',
    QUALIFIED: 'qualified',
    BOOKED: 'booked',
    CLOSED_WON: 'closed_won',
    CLOSED_LOST: 'closed_lost'
};

/**
 * Sentiment to stage mapping
 */
const SENTIMENT_STAGE_MAP = {
    positive: PIPELINE_STAGES.QUALIFIED,
    neutral: PIPELINE_STAGES.REPLIED,
    negative: PIPELINE_STAGES.CLOSED_LOST,
    'out-of-office': PIPELINE_STAGES.CONTACTED
};

/**
 * Default opportunity values by vertical
 */
const VERTICAL_DEAL_VALUES = {
    'commercial-insurance': 500000, // $5,000 in cents
    'commercial-real-estate': 300000, // $3,000 in cents
    'recruitment': 400000, // $4,000 in cents
    'default': 250000 // $2,500 in cents
};

/**
 * Main mapper function - Convert enriched lead to GHL contact format
 *
 * @param {Object} leadData - Lead data from Apify/Instantly
 * @param {string} source - Source identifier (e.g., 'Cold Email - Commercial Insurance')
 * @returns {Object} GHL contact format
 */
function mapLeadToGHLContact(leadData, source = 'Cold Email Campaign') {
    try {
        // Extract fields with fallbacks
        const firstName = leadData.firstName || leadData.first_name || extractFirstName(leadData.fullName || leadData.name);
        const lastName = leadData.lastName || leadData.last_name || extractLastName(leadData.fullName || leadData.name);
        const email = leadData.email || leadData.Email || null;
        const phone = leadData.phone || leadData.Phone || leadData.customField5 || null;
        const companyName = leadData.companyName || leadData.Company || leadData.name || leadData.company_name || null;

        // Validate required fields
        if (!firstName || !lastName) {
            throw new Error('firstName and lastName are required for GHL contact');
        }

        if (!email && !phone) {
            throw new Error('Either email or phone is required for GHL contact');
        }

        // Map custom fields
        const customFields = {
            lead_source: source,
            campaign_name: leadData.campaignName || leadData.campaign_name || 'Unknown',
            quality_score: leadData.qualityScore || leadData.quality_score || 0,
            vertical: leadData.vertical || leadData.industry || leadData.Industry || 'unknown',
            company_size: leadData.companySizeRange || leadData.companySize || leadData['Company Size'] || null,
            enrichment_date: leadData.enrichmentDate || new Date().toISOString()
        };

        // Add sentiment if present
        if (leadData.sentiment) {
            customFields.sentiment = leadData.sentiment;
        }

        // Add original reply if present
        if (leadData.replyBody || leadData.reply_body) {
            customFields.original_reply = leadData.replyBody || leadData.reply_body;
        }

        // Build tags array
        const tags = [];
        if (leadData.vertical || leadData.industry) {
            tags.push(leadData.vertical || leadData.industry);
        }
        tags.push('cold-outreach');
        if (leadData.sentiment === 'positive') {
            tags.push('replied');
        }
        if (leadData.leadSource || leadData.lead_source) {
            tags.push(leadData.leadSource || leadData.lead_source);
        }

        // Parse location
        const location = parseLocation(leadData.location || leadData.standardizedLocation || leadData.Location || null);

        // Build GHL contact object
        const ghlContact = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone ? standardizePhone(phone) : null,
            companyName: companyName,
            source: source,
            customFields: customFields,
            tags: tags,
            address: location.address,
            city: location.city,
            state: location.state,
            postalCode: location.postalCode,
            website: leadData.website || leadData.Website || leadData.customField6 || null
        };

        // Remove null/undefined values
        return removeNullValues(ghlContact);

    } catch (error) {
        console.error('Error mapping lead to GHL contact:', error.message);
        throw error;
    }
}

/**
 * Map reply webhook to GHL opportunity format
 *
 * @param {Object} webhookData - Webhook data from Instantly/SmartLead
 * @param {string} contactId - Existing GHL contact ID
 * @param {string} pipelineId - GHL pipeline ID
 * @returns {Object} GHL opportunity format
 */
function mapReplyToGHLOpportunity(webhookData, contactId, pipelineId) {
    try {
        const {
            sentiment = 'neutral',
            companyName = 'Unknown Company',
            vertical = 'unknown',
            replyBody = '',
            leadEmail = '',
            leadName = ''
        } = webhookData;

        // Map sentiment to pipeline stage
        const pipelineStage = SENTIMENT_STAGE_MAP[sentiment.toLowerCase()] || PIPELINE_STAGES.REPLIED;

        // Get deal value based on vertical
        const monetaryValue = VERTICAL_DEAL_VALUES[vertical.toLowerCase()] || VERTICAL_DEAL_VALUES.default;

        // Determine lead temperature
        const leadTemperature = getLeadTemperature(sentiment, webhookData.qualityScore);

        // Generate opportunity name
        const opportunityName = `${companyName} - ${capitalize(vertical)} Deal`;

        // Build custom fields
        const customFields = {
            estimated_value: monetaryValue / 100, // Convert cents to dollars for display
            lead_temperature: leadTemperature,
            next_action: getNextAction(sentiment),
            ai_notes: generateAINotes(webhookData)
        };

        // Build GHL opportunity object
        const ghlOpportunity = {
            contactId: contactId,
            pipelineId: pipelineId,
            pipelineStage: pipelineStage,
            name: opportunityName,
            monetaryValue: monetaryValue,
            status: sentiment === 'negative' ? 'lost' : 'open',
            customFields: customFields
        };

        return removeNullValues(ghlOpportunity);

    } catch (error) {
        console.error('Error mapping reply to GHL opportunity:', error.message);
        throw error;
    }
}

/**
 * Map Instantly webhook to standardized format
 *
 * @param {Object} instantlyWebhook - Raw webhook from Instantly
 * @returns {Object} Standardized webhook data
 */
function mapInstantlyWebhook(instantlyWebhook) {
    try {
        const {
            event_type,
            campaign_id,
            lead_email,
            lead_name,
            timestamp,
            data
        } = instantlyWebhook;

        const standardized = {
            eventType: event_type,
            campaignId: campaign_id,
            leadEmail: lead_email,
            leadName: lead_name,
            timestamp: timestamp || new Date().toISOString()
        };

        // Extract event-specific data
        if (event_type === 'reply') {
            standardized.replyBody = data.reply_body;
            standardized.replySubject = data.reply_subject;
            standardized.sentiment = data.sentiment || 'neutral';
            standardized.threadId = data.thread_id;
        }

        // Parse name into first/last
        if (lead_name) {
            const nameParts = lead_name.split(' ');
            standardized.firstName = nameParts[0];
            standardized.lastName = nameParts.slice(1).join(' ') || nameParts[0];
        }

        return standardized;

    } catch (error) {
        console.error('Error mapping Instantly webhook:', error.message);
        throw error;
    }
}

/**
 * Map SmartLead webhook to standardized format
 *
 * @param {Object} smartleadWebhook - Raw webhook from SmartLead
 * @returns {Object} Standardized webhook data
 */
function mapSmartLeadWebhook(smartleadWebhook) {
    try {
        const {
            event,
            campaign_id,
            email,
            full_name,
            timestamp,
            message_body,
            sentiment
        } = smartleadWebhook;

        const standardized = {
            eventType: event === 'email_reply' ? 'reply' : event,
            campaignId: campaign_id,
            leadEmail: email,
            leadName: full_name,
            timestamp: timestamp || new Date().toISOString(),
            replyBody: message_body,
            sentiment: sentiment || 'neutral'
        };

        // Parse name into first/last
        if (full_name) {
            const nameParts = full_name.split(' ');
            standardized.firstName = nameParts[0];
            standardized.lastName = nameParts.slice(1).join(' ') || nameParts[0];
        }

        return standardized;

    } catch (error) {
        console.error('Error mapping SmartLead webhook:', error.message);
        throw error;
    }
}

/**
 * Validate lead data before sending to GHL
 *
 * @param {Object} leadData - Lead data to validate
 * @returns {Object} Validation result
 */
function validateLeadData(leadData) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!leadData.firstName) {
        errors.push('firstName is required');
    }

    if (!leadData.lastName) {
        errors.push('lastName is required');
    }

    if (!leadData.email && !leadData.phone) {
        errors.push('Either email or phone is required');
    }

    // Email validation
    if (leadData.email && !validator.isEmail(leadData.email)) {
        errors.push('Invalid email format');
    }

    // Phone validation (E.164 format)
    if (leadData.phone && !isValidE164Phone(leadData.phone)) {
        warnings.push('Phone number may not be in E.164 format (+1XXXXXXXXXX)');
    }

    // Field length validation
    if (leadData.firstName && leadData.firstName.length > 100) {
        errors.push('firstName exceeds maximum length (100 characters)');
    }

    if (leadData.lastName && leadData.lastName.length > 100) {
        errors.push('lastName exceeds maximum length (100 characters)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

/**
 * Map custom fields from enriched lead to GHL format
 *
 * @param {Object} enrichedLead - Enriched lead with all data
 * @returns {Object} GHL custom fields object
 */
function mapCustomFields(enrichedLead) {
    const customFields = {};

    // Map standard custom fields
    const fieldMapping = {
        'quality_score': enrichedLead.qualityScore || enrichedLead.quality_score || 0,
        'lead_source': enrichedLead.leadSource || enrichedLead.lead_source || 'Unknown',
        'campaign_name': enrichedLead.campaignName || enrichedLead.campaign_name || null,
        'vertical': enrichedLead.vertical || enrichedLead.industry || null,
        'company_size': enrichedLead.companySizeRange || enrichedLead.companySize || null,
        'job_title': enrichedLead.jobTitle || enrichedLead.customField1 || null,
        'linkedin_profile': enrichedLead.linkedinProfile || null,
        'google_rating': enrichedLead.googleRating || null,
        'enrichment_date': enrichedLead.enrichmentDate || new Date().toISOString()
    };

    // Only include non-null values
    Object.keys(fieldMapping).forEach(key => {
        if (fieldMapping[key] !== null && fieldMapping[key] !== undefined) {
            customFields[key] = fieldMapping[key];
        }
    });

    return customFields;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract first name from full name
 */
function extractFirstName(fullName) {
    if (!fullName) return null;
    const parts = fullName.trim().split(' ');
    return parts[0];
}

/**
 * Extract last name from full name
 */
function extractLastName(fullName) {
    if (!fullName) return null;
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || parts[0]; // Use first name as last if no last name
}

/**
 * Standardize phone number to E.164 format
 */
function standardizePhone(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle US numbers
    if (digits.length === 10) {
        return `+1${digits}`;
    } else if (digits.length === 11 && digits[0] === '1') {
        return `+${digits}`;
    } else if (digits.startsWith('+')) {
        return digits;
    }

    return phone; // Return as-is if can't standardize
}

/**
 * Validate E.164 phone format
 */
function isValidE164Phone(phone) {
    if (!phone) return false;
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
}

/**
 * Parse location string into address components
 */
function parseLocation(locationStr) {
    if (!locationStr) {
        return {
            address: null,
            city: null,
            state: null,
            postalCode: null
        };
    }

    // Try to parse "City, State" format
    const cityStateMatch = locationStr.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
    if (cityStateMatch) {
        return {
            address: null,
            city: cityStateMatch[1].trim(),
            state: cityStateMatch[2],
            postalCode: null
        };
    }

    // If no match, return full string as address
    return {
        address: locationStr,
        city: null,
        state: null,
        postalCode: null
    };
}

/**
 * Determine lead temperature based on sentiment and quality score
 */
function getLeadTemperature(sentiment, qualityScore = 0) {
    if (sentiment === 'positive' && qualityScore >= 80) {
        return 'hot';
    } else if (sentiment === 'positive' || (sentiment === 'neutral' && qualityScore >= 70)) {
        return 'warm';
    } else {
        return 'cold';
    }
}

/**
 * Get next action based on sentiment
 */
function getNextAction(sentiment) {
    const actionMap = {
        positive: 'Send calendar link and follow up within 2 hours',
        neutral: 'Send additional information and follow up in 3 days',
        negative: 'Suppress from future campaigns',
        'out-of-office': 'Retry after return date'
    };

    return actionMap[sentiment.toLowerCase()] || 'Review and determine next step';
}

/**
 * Generate AI notes from webhook data
 */
function generateAINotes(webhookData) {
    const {
        sentiment = 'unknown',
        replyBody = '',
        qualityScore = 0,
        vertical = 'unknown'
    } = webhookData;

    const notes = [];

    // Sentiment analysis
    notes.push(`Sentiment: ${capitalize(sentiment)}`);

    // Quality score
    if (qualityScore) {
        notes.push(`Lead Quality Score: ${qualityScore}/100`);
    }

    // Vertical
    notes.push(`Vertical: ${capitalize(vertical)}`);

    // Reply preview
    if (replyBody) {
        const preview = replyBody.substring(0, 150);
        notes.push(`Reply Preview: "${preview}${replyBody.length > 150 ? '...' : ''}"`);
    }

    return notes.join(' | ');
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Remove null and undefined values from object
 */
function removeNullValues(obj) {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    });
    return cleaned;
}

/**
 * Map pipeline stage name to stage ID (requires lookup from GHL API)
 * This is a placeholder - actual implementation needs to call GHL API
 */
function getPipelineStageId(pipelineId, stageName) {
    // In production, this should call GHL API to get stage IDs
    // For now, return the stage name (caller should replace with actual ID)
    return stageName;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    mapLeadToGHLContact,
    mapReplyToGHLOpportunity,
    mapInstantlyWebhook,
    mapSmartLeadWebhook,
    validateLeadData,
    mapCustomFields,
    standardizePhone,
    parseLocation,
    getLeadTemperature,
    getNextAction,
    PIPELINE_STAGES,
    SENTIMENT_STAGE_MAP,
    VERTICAL_DEAL_VALUES
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Map Instantly webhook to GHL contact and opportunity
 *
 * const { mapInstantlyWebhook, mapLeadToGHLContact, mapReplyToGHLOpportunity } = require('./lead-to-ghl-mapper');
 * const GoHighLevelAPI = require('../integrations/gohighlevel-api');
 *
 * // Receive webhook from Instantly
 * const instantlyWebhook = {
 *   event_type: 'reply',
 *   campaign_id: 'camp_abc123',
 *   lead_email: 'john@company.com',
 *   lead_name: 'John Smith',
 *   data: {
 *     reply_body: 'Yes, I am interested in learning more.',
 *     reply_subject: 'Re: Insurance optimization',
 *     sentiment: 'positive'
 *   }
 * };
 *
 * // Standardize webhook
 * const standardizedData = mapInstantlyWebhook(instantlyWebhook);
 *
 * // Add enriched lead data
 * const enrichedLead = {
 *   ...standardizedData,
 *   companyName: 'ABC Corp',
 *   phone: '+13125551234',
 *   vertical: 'commercial-insurance',
 *   qualityScore: 85
 * };
 *
 * // Map to GHL contact format
 * const ghlContact = mapLeadToGHLContact(enrichedLead, 'Cold Email - Commercial Insurance');
 *
 * // Validate before sending
 * const validation = validateLeadData(ghlContact);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 *   return;
 * }
 *
 * // Create contact in GHL
 * const api = new GoHighLevelAPI();
 * const existingContact = await api.searchContact(ghlContact.email);
 *
 * let contactId;
 * if (existingContact.found) {
 *   contactId = existingContact.contact.id;
 *   await api.updateContact(contactId, ghlContact);
 * } else {
 *   const newContact = await api.createContact(ghlContact);
 *   contactId = newContact.contactId;
 * }
 *
 * // Create opportunity
 * const ghlOpportunity = mapReplyToGHLOpportunity(enrichedLead, contactId, 'pipeline_xyz123');
 * await api.createOpportunity(ghlOpportunity);
 *
 * // Add note with reply
 * await api.addNote(contactId, {
 *   body: `Reply received: "${enrichedLead.replyBody}"\nSentiment: ${enrichedLead.sentiment}`
 * });
 */
