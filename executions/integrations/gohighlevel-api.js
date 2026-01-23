/**
 * GoHighLevel API Integration
 *
 * Wrapper for GoHighLevel CRM API.
 * Handles contact management, opportunity tracking, SMS communication, and webhooks.
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * API Documentation: https://highlevel.stoplight.io/docs/integrations/
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds
const RATE_LIMIT_PER_MINUTE = 100;

/**
 * GoHighLevel API Client Class
 */
class GoHighLevelAPI {
    constructor(apiKey = GHL_API_KEY, locationId = GHL_LOCATION_ID) {
        if (!apiKey) {
            throw new Error('GHL_API_KEY is required. Set it in your .env file.');
        }

        if (!locationId) {
            throw new Error('GHL_LOCATION_ID is required. Set it in your .env file.');
        }

        this.apiKey = apiKey;
        this.locationId = locationId;
        this.baseURL = GHL_BASE_URL;

        // Rate limiting state
        this.requestQueue = [];
        this.requestCount = 0;
        this.lastResetTime = Date.now();

        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Version': '2021-07-28', // GHL API version
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        );
    }

    // ========================================================================
    // CONTACT MANAGEMENT
    // ========================================================================

    /**
     * Create a new contact
     *
     * @param {Object} contactData - Contact information
     * @param {string} contactData.firstName - Contact's first name
     * @param {string} contactData.lastName - Contact's last name
     * @param {string} contactData.email - Contact's email address
     * @param {string} contactData.phone - Contact's phone number (E.164 format)
     * @param {string} contactData.companyName - Company name
     * @param {Object} contactData.customFields - Custom field key-value pairs
     * @param {string[]} contactData.tags - Array of tags to apply
     * @param {string} contactData.source - Lead source attribution
     * @returns {Promise<Object>} Created contact object
     */
    async createContact(contactData) {
        try {
            const {
                firstName,
                lastName,
                email,
                phone = null,
                companyName = null,
                customFields = {},
                tags = [],
                source = 'Cold Email Campaign',
                address = null,
                city = null,
                state = null,
                postalCode = null,
                website = null
            } = contactData;

            // Validate required fields
            if (!firstName || !lastName) {
                throw new Error('firstName and lastName are required');
            }

            if (!email && !phone) {
                throw new Error('Either email or phone is required');
            }

            const payload = {
                locationId: this.locationId,
                firstName: firstName,
                lastName: lastName,
                name: `${firstName} ${lastName}`,
                email: email || undefined,
                phone: phone || undefined,
                companyName: companyName || undefined,
                source: source,
                tags: tags,
                customField: customFields,
                address1: address || undefined,
                city: city || undefined,
                state: state || undefined,
                postalCode: postalCode || undefined,
                website: website || undefined
            };

            console.log(`Creating contact: ${firstName} ${lastName} (${email})`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post('/contacts/', payload)
            );

            console.log(`Contact created successfully: ${response.data.contact.id}`);

            return {
                success: true,
                contactId: response.data.contact.id,
                contact: response.data.contact,
                message: 'Contact created successfully'
            };

        } catch (error) {
            console.error('Error creating contact:', error.message);
            throw error;
        }
    }

    /**
     * Update an existing contact
     *
     * @param {string} contactId - Contact ID to update
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated contact object
     */
    async updateContact(contactId, updates) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            console.log(`Updating contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.put(`/contacts/${contactId}`, {
                    locationId: this.locationId,
                    ...updates
                })
            );

            console.log(`Contact updated successfully: ${contactId}`);

            return {
                success: true,
                contactId: contactId,
                contact: response.data.contact,
                message: 'Contact updated successfully'
            };

        } catch (error) {
            console.error('Error updating contact:', error.message);
            throw error;
        }
    }

    /**
     * Get contact by ID
     *
     * @param {string} contactId - Contact ID
     * @returns {Promise<Object>} Contact object
     */
    async getContact(contactId) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            console.log(`Fetching contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.get(`/contacts/${contactId}`)
            );

            return {
                success: true,
                contact: response.data.contact
            };

        } catch (error) {
            console.error('Error fetching contact:', error.message);
            throw error;
        }
    }

    /**
     * Search for contact by email or phone
     *
     * @param {string} query - Email address or phone number to search
     * @returns {Promise<Object>} Contact object if found, null if not found
     */
    async searchContact(query) {
        try {
            if (!query) {
                throw new Error('Search query is required');
            }

            console.log(`Searching for contact: ${query}`);

            // Search by email or phone
            const response = await this.rateLimitedRequest(() =>
                this.client.get('/contacts/search', {
                    params: {
                        locationId: this.locationId,
                        query: query
                    }
                })
            );

            const contacts = response.data.contacts || [];

            if (contacts.length === 0) {
                console.log('No contact found');
                return {
                    success: true,
                    found: false,
                    contact: null
                };
            }

            // Return first matching contact
            console.log(`Contact found: ${contacts[0].id}`);
            return {
                success: true,
                found: true,
                contact: contacts[0]
            };

        } catch (error) {
            console.error('Error searching contact:', error.message);
            throw error;
        }
    }

    /**
     * Add tags to a contact
     *
     * @param {string} contactId - Contact ID
     * @param {string[]} tags - Array of tags to add
     * @returns {Promise<Object>} Result
     */
    async addTags(contactId, tags) {
        try {
            if (!contactId || !tags || tags.length === 0) {
                throw new Error('Contact ID and tags array are required');
            }

            console.log(`Adding tags to contact ${contactId}: ${tags.join(', ')}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post(`/contacts/${contactId}/tags`, {
                    tags: tags
                })
            );

            console.log('Tags added successfully');

            return {
                success: true,
                contactId: contactId,
                tags: tags,
                message: 'Tags added successfully'
            };

        } catch (error) {
            console.error('Error adding tags:', error.message);
            throw error;
        }
    }

    /**
     * Remove tags from a contact
     *
     * @param {string} contactId - Contact ID
     * @param {string[]} tags - Array of tags to remove
     * @returns {Promise<Object>} Result
     */
    async removeTags(contactId, tags) {
        try {
            if (!contactId || !tags || tags.length === 0) {
                throw new Error('Contact ID and tags array are required');
            }

            console.log(`Removing tags from contact ${contactId}: ${tags.join(', ')}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.delete(`/contacts/${contactId}/tags`, {
                    data: { tags: tags }
                })
            );

            console.log('Tags removed successfully');

            return {
                success: true,
                contactId: contactId,
                tags: tags,
                message: 'Tags removed successfully'
            };

        } catch (error) {
            console.error('Error removing tags:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // OPPORTUNITY MANAGEMENT
    // ========================================================================

    /**
     * Create a new opportunity
     *
     * @param {Object} opportunityData - Opportunity information
     * @param {string} opportunityData.contactId - Contact ID to link opportunity to
     * @param {string} opportunityData.pipelineId - Pipeline ID
     * @param {string} opportunityData.pipelineStageId - Pipeline stage ID
     * @param {string} opportunityData.name - Opportunity name
     * @param {number} opportunityData.monetaryValue - Deal value in cents
     * @param {string} opportunityData.status - Status: 'open', 'won', 'lost', 'abandoned'
     * @returns {Promise<Object>} Created opportunity object
     */
    async createOpportunity(opportunityData) {
        try {
            const {
                contactId,
                pipelineId,
                pipelineStageId,
                name,
                monetaryValue = 0,
                status = 'open',
                customFields = {}
            } = opportunityData;

            // Validate required fields
            if (!contactId) {
                throw new Error('contactId is required');
            }

            if (!pipelineId || !pipelineStageId) {
                throw new Error('pipelineId and pipelineStageId are required');
            }

            if (!name) {
                throw new Error('Opportunity name is required');
            }

            const payload = {
                locationId: this.locationId,
                contactId: contactId,
                pipelineId: pipelineId,
                pipelineStageId: pipelineStageId,
                name: name,
                monetaryValue: monetaryValue,
                status: status,
                customFields: customFields
            };

            console.log(`Creating opportunity: ${name} for contact ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post('/opportunities/', payload)
            );

            console.log(`Opportunity created successfully: ${response.data.opportunity.id}`);

            return {
                success: true,
                opportunityId: response.data.opportunity.id,
                opportunity: response.data.opportunity,
                message: 'Opportunity created successfully'
            };

        } catch (error) {
            console.error('Error creating opportunity:', error.message);
            throw error;
        }
    }

    /**
     * Update opportunity stage
     *
     * @param {string} opportunityId - Opportunity ID
     * @param {string} newStageId - New pipeline stage ID
     * @returns {Promise<Object>} Updated opportunity object
     */
    async updateOpportunityStage(opportunityId, newStageId) {
        try {
            if (!opportunityId || !newStageId) {
                throw new Error('Opportunity ID and new stage ID are required');
            }

            console.log(`Updating opportunity ${opportunityId} to stage ${newStageId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.put(`/opportunities/${opportunityId}`, {
                    pipelineStageId: newStageId
                })
            );

            console.log('Opportunity stage updated successfully');

            return {
                success: true,
                opportunityId: opportunityId,
                opportunity: response.data.opportunity,
                message: 'Opportunity stage updated successfully'
            };

        } catch (error) {
            console.error('Error updating opportunity stage:', error.message);
            throw error;
        }
    }

    /**
     * Get opportunity by ID
     *
     * @param {string} opportunityId - Opportunity ID
     * @returns {Promise<Object>} Opportunity object
     */
    async getOpportunity(opportunityId) {
        try {
            if (!opportunityId) {
                throw new Error('Opportunity ID is required');
            }

            console.log(`Fetching opportunity: ${opportunityId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.get(`/opportunities/${opportunityId}`)
            );

            return {
                success: true,
                opportunity: response.data.opportunity
            };

        } catch (error) {
            console.error('Error fetching opportunity:', error.message);
            throw error;
        }
    }

    /**
     * Get all opportunities with filters
     *
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Array of opportunities
     */
    async getOpportunities(filters = {}) {
        try {
            const {
                pipelineId = null,
                pipelineStageId = null,
                status = null,
                limit = 100,
                offset = 0
            } = filters;

            console.log('Fetching opportunities with filters');

            const params = {
                locationId: this.locationId,
                limit: limit,
                offset: offset
            };

            if (pipelineId) params.pipelineId = pipelineId;
            if (pipelineStageId) params.pipelineStageId = pipelineStageId;
            if (status) params.status = status;

            const response = await this.rateLimitedRequest(() =>
                this.client.get('/opportunities/', { params })
            );

            const opportunities = response.data.opportunities || [];

            return {
                success: true,
                total: opportunities.length,
                opportunities: opportunities
            };

        } catch (error) {
            console.error('Error fetching opportunities:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // NOTES & TASKS
    // ========================================================================

    /**
     * Add a note to a contact
     *
     * @param {string} contactId - Contact ID
     * @param {Object} noteData - Note information
     * @param {string} noteData.body - Note content
     * @param {string} noteData.userId - User ID (optional)
     * @returns {Promise<Object>} Created note object
     */
    async addNote(contactId, noteData) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            const { body, userId = null } = noteData;

            if (!body) {
                throw new Error('Note body is required');
            }

            const payload = {
                contactId: contactId,
                body: body,
                userId: userId
            };

            console.log(`Adding note to contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post(`/contacts/${contactId}/notes`, payload)
            );

            console.log('Note added successfully');

            return {
                success: true,
                noteId: response.data.note?.id,
                note: response.data.note,
                message: 'Note added successfully'
            };

        } catch (error) {
            console.error('Error adding note:', error.message);
            throw error;
        }
    }

    /**
     * Add a task to a contact
     *
     * @param {string} contactId - Contact ID
     * @param {Object} taskData - Task information
     * @param {string} taskData.title - Task title
     * @param {string} taskData.dueDate - Due date (ISO 8601)
     * @param {string} taskData.assignedTo - User ID to assign to
     * @returns {Promise<Object>} Created task object
     */
    async addTask(contactId, taskData) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            const {
                title,
                body = '',
                dueDate,
                assignedTo = null,
                completed = false
            } = taskData;

            if (!title) {
                throw new Error('Task title is required');
            }

            const payload = {
                contactId: contactId,
                title: title,
                body: body,
                dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default: 24 hours
                assignedTo: assignedTo,
                completed: completed
            };

            console.log(`Adding task to contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post(`/contacts/${contactId}/tasks`, payload)
            );

            console.log('Task added successfully');

            return {
                success: true,
                taskId: response.data.task?.id,
                task: response.data.task,
                message: 'Task added successfully'
            };

        } catch (error) {
            console.error('Error adding task:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // COMMUNICATION (SMS)
    // ========================================================================

    /**
     * Send SMS to a contact
     *
     * @param {string} contactId - Contact ID
     * @param {string} message - SMS message text
     * @returns {Promise<Object>} Sent message object
     */
    async sendSMS(contactId, message) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            if (!message) {
                throw new Error('Message text is required');
            }

            // Get contact to retrieve phone number
            const contactResponse = await this.getContact(contactId);
            const phone = contactResponse.contact.phone;

            if (!phone) {
                throw new Error('Contact does not have a phone number');
            }

            const payload = {
                type: 'SMS',
                contactId: contactId,
                message: message
            };

            console.log(`Sending SMS to contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post('/conversations/messages', payload)
            );

            console.log('SMS sent successfully');

            return {
                success: true,
                messageId: response.data.messageId,
                contactId: contactId,
                message: 'SMS sent successfully'
            };

        } catch (error) {
            console.error('Error sending SMS:', error.message);
            throw error;
        }
    }

    /**
     * Get conversation history for a contact
     *
     * @param {string} contactId - Contact ID
     * @param {number} limit - Number of messages to retrieve
     * @returns {Promise<Object>} Array of messages
     */
    async getConversations(contactId, limit = 50) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            console.log(`Fetching conversations for contact: ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.get(`/conversations/${contactId}/messages`, {
                    params: { limit: limit }
                })
            );

            const messages = response.data.messages || [];

            return {
                success: true,
                contactId: contactId,
                total: messages.length,
                messages: messages
            };

        } catch (error) {
            console.error('Error fetching conversations:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // WORKFLOW AUTOMATION
    // ========================================================================

    /**
     * Trigger a workflow for a contact
     *
     * @param {string} workflowId - Workflow ID
     * @param {string} contactId - Contact ID to trigger workflow for
     * @returns {Promise<Object>} Result
     */
    async triggerWorkflow(workflowId, contactId) {
        try {
            if (!workflowId || !contactId) {
                throw new Error('Workflow ID and Contact ID are required');
            }

            console.log(`Triggering workflow ${workflowId} for contact ${contactId}`);

            const response = await this.rateLimitedRequest(() =>
                this.client.post(`/workflows/${workflowId}/trigger`, {
                    contactId: contactId
                })
            );

            console.log('Workflow triggered successfully');

            return {
                success: true,
                workflowId: workflowId,
                contactId: contactId,
                message: 'Workflow triggered successfully'
            };

        } catch (error) {
            console.error('Error triggering workflow:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // WEBHOOK HANDLING
    // ========================================================================

    /**
     * Process webhook payload from GoHighLevel
     *
     * Webhook events include: contact.created, opportunity.stage_change,
     * conversation.message.received, calendar.event.booked
     *
     * @param {Object} webhookPayload - Webhook payload from GHL
     * @returns {Object} Processed webhook data
     */
    async handleWebhook(webhookPayload) {
        try {
            const {
                type,
                locationId,
                contactId,
                opportunityId,
                timestamp,
                data
            } = webhookPayload;

            console.log(`Processing webhook: ${type} for location ${locationId}`);

            let processedData = {
                eventType: type,
                locationId: locationId,
                contactId: contactId,
                opportunityId: opportunityId,
                timestamp: timestamp || new Date().toISOString()
            };

            // Process based on event type
            switch (type) {
                case 'contact.created':
                    processedData.contact = data.contact;
                    processedData.action = 'Contact created in GHL';
                    break;

                case 'opportunity.stage_change':
                    processedData.opportunityId = data.opportunityId;
                    processedData.oldStage = data.oldStage;
                    processedData.newStage = data.newStage;
                    processedData.action = 'Opportunity stage changed';
                    break;

                case 'conversation.message.received':
                    processedData.messageId = data.messageId;
                    processedData.messageType = data.type; // SMS, Email, etc.
                    processedData.messageBody = data.body;
                    processedData.from = data.from;
                    processedData.action = 'Message received from contact';
                    break;

                case 'calendar.event.booked':
                    processedData.eventId = data.eventId;
                    processedData.calendarId = data.calendarId;
                    processedData.startTime = data.startTime;
                    processedData.endTime = data.endTime;
                    processedData.action = 'Calendar event booked';
                    break;

                default:
                    console.warn(`Unknown webhook event type: ${type}`);
                    processedData.action = 'Unknown event type';
            }

            return {
                success: true,
                processed: processedData,
                raw: webhookPayload
            };

        } catch (error) {
            console.error('Error processing webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: webhookPayload
            };
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Rate-limited request wrapper
     * Ensures we don't exceed 100 requests per minute
     */
    async rateLimitedRequest(requestFn) {
        const now = Date.now();
        const timeSinceReset = now - this.lastResetTime;

        // Reset counter every minute
        if (timeSinceReset >= 60000) {
            this.requestCount = 0;
            this.lastResetTime = now;
        }

        // If we've hit the rate limit, wait until the next minute
        if (this.requestCount >= RATE_LIMIT_PER_MINUTE) {
            const waitTime = 60000 - timeSinceReset;
            console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
            await this.sleep(waitTime);
            this.requestCount = 0;
            this.lastResetTime = Date.now();
        }

        // Execute request
        this.requestCount++;
        return await requestFn();
    }

    /**
     * Handle API errors with retry logic
     */
    async handleError(error) {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            console.error(`API Error ${status}:`, data.message || data);

            // Handle specific error codes
            if (status === 401) {
                throw new Error('Invalid API key. Check your GHL_API_KEY in .env');
            } else if (status === 429) {
                // Rate limit - implement retry with exponential backoff
                console.warn('Rate limit hit. Retrying with exponential backoff...');
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (status === 404) {
                throw new Error('Resource not found. Check ID or endpoint.');
            } else if (status === 400) {
                throw new Error(`Bad request: ${data.message || JSON.stringify(data)}`);
            } else if (status >= 500) {
                throw new Error('GoHighLevel server error. Please try again later.');
            }

            throw new Error(data.message || `API error: ${status}`);

        } else if (error.request) {
            // Request made but no response received
            console.error('No response from GoHighLevel API:', error.message);
            throw new Error('Network error. Please check your internet connection.');

        } else {
            // Error setting up the request
            console.error('Request setup error:', error.message);
            throw error;
        }
    }

    /**
     * Retry logic with exponential backoff
     */
    async retryWithBackoff(fn, retries = MAX_RETRIES) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error; // Last retry, throw error

                const delay = RETRY_DELAY * Math.pow(2, i); // Exponential backoff
                console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
                await this.sleep(delay);
            }
        }
    }

    /**
     * Sleep helper for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = GoHighLevelAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Create contact and opportunity from cold email reply
 *
 * const GoHighLevelAPI = require('./gohighlevel-api');
 * const api = new GoHighLevelAPI();
 *
 * // Search for existing contact first
 * const existingContact = await api.searchContact('john@company.com');
 *
 * let contactId;
 * if (existingContact.found) {
 *   contactId = existingContact.contact.id;
 *   console.log('Contact already exists, using existing ID');
 * } else {
 *   // Create new contact
 *   const contact = await api.createContact({
 *     firstName: 'John',
 *     lastName: 'Smith',
 *     email: 'john@company.com',
 *     phone: '+13125551234',
 *     companyName: 'ABC Corp',
 *     customFields: {
 *       lead_source: 'Cold Email - Commercial Insurance',
 *       quality_score: 85,
 *       sentiment: 'positive'
 *     },
 *     tags: ['commercial-insurance', 'cold-outreach', 'replied']
 *   });
 *   contactId = contact.contactId;
 * }
 *
 * // Create opportunity
 * const opportunity = await api.createOpportunity({
 *   contactId: contactId,
 *   pipelineId: 'pipeline_abc123',
 *   pipelineStageId: 'stage_qualified',
 *   name: 'ABC Corp - Commercial Insurance Deal',
 *   monetaryValue: 500000, // $5000 in cents
 *   status: 'open'
 * });
 *
 * // Add note with reply text
 * await api.addNote(contactId, {
 *   body: 'Replied with positive interest: "Yes, I\'d like to learn more about insurance optimization."'
 * });
 *
 * // Send confirmation SMS
 * await api.sendSMS(contactId, 'Hi John, thanks for your interest! I\'ll send you a calendar link shortly.');
 *
 * // Trigger follow-up workflow
 * await api.triggerWorkflow('workflow_sales_assignment', contactId);
 */
