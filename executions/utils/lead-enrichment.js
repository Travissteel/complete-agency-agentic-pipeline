/**
 * Lead Enrichment Utility
 *
 * Enriches, validates, deduplicates, and formats leads for cold outreach platforms.
 * Handles data from LinkedIn and Google Maps scrapers.
 *
 * @version 1.0.0
 * @requires apify
 * @requires dns (Node.js built-in)
 * @requires validator
 */

const Apify = require('apify');
const dns = require('dns').promises;
const validator = require('validator');
const crypto = require('crypto');

/**
 * Main enrichment function
 * Processes scraped leads and prepares them for outreach platforms
 */
async function enrichLeads(options = {}) {
    const {
        linkedinDatasetId = null,
        googleMapsDatasetId = null,
        minQualityScore = 50,
        exportFormat = 'instantly', // 'instantly', 'smartlead', or 'both'
        deduplicateBy = ['email', 'domain'], // Array of fields to deduplicate by
        enrichmentLevel = 'standard' // 'basic', 'standard', or 'advanced'
    } = options;

    console.log('Starting lead enrichment process...');
    console.log(`Export format: ${exportFormat}`);
    console.log(`Minimum quality score: ${minQualityScore}`);

    // Load scraped data from datasets
    const linkedinLeads = linkedinDatasetId
        ? await loadDataset(linkedinDatasetId)
        : [];

    const googleMapsLeads = googleMapsDatasetId
        ? await loadDataset(googleMapsDatasetId)
        : [];

    console.log(`Loaded ${linkedinLeads.length} LinkedIn leads`);
    console.log(`Loaded ${googleMapsLeads.length} Google Maps leads`);

    // Merge and match leads from both sources
    const mergedLeads = await mergeLeads(linkedinLeads, googleMapsLeads);
    console.log(`Merged into ${mergedLeads.length} unique leads`);

    // Enrich leads with additional data
    const enrichedLeads = [];
    for (const lead of mergedLeads) {
        const enriched = await enrichSingleLead(lead, enrichmentLevel);
        if (enriched) {
            enrichedLeads.push(enriched);
        }
    }

    console.log(`Successfully enriched ${enrichedLeads.length} leads`);

    // Validate email addresses
    const validatedLeads = await validateLeads(enrichedLeads);
    console.log(`${validatedLeads.length} leads passed validation`);

    // Calculate quality scores
    const scoredLeads = validatedLeads.map(lead => ({
        ...lead,
        qualityScore: calculateQualityScore(lead)
    }));

    // Filter by minimum quality score
    const qualifiedLeads = scoredLeads.filter(
        lead => lead.qualityScore >= minQualityScore
    );
    console.log(`${qualifiedLeads.length} leads meet quality threshold`);

    // Deduplicate leads
    const uniqueLeads = deduplicateLeads(qualifiedLeads, deduplicateBy);
    console.log(`${uniqueLeads.length} leads after deduplication`);

    // Format for export platforms
    const formattedLeads = {
        instantly: exportFormat === 'instantly' || exportFormat === 'both'
            ? formatForInstantly(uniqueLeads)
            : null,
        smartlead: exportFormat === 'smartlead' || exportFormat === 'both'
            ? formatForSmartlead(uniqueLeads)
            : null
    };

    // Save to key-value store
    await saveResults(formattedLeads, uniqueLeads);

    // Generate summary report
    const report = generateReport(linkedinLeads, googleMapsLeads, uniqueLeads);
    console.log('\n=== ENRICHMENT REPORT ===');
    console.log(JSON.stringify(report, null, 2));

    return {
        leads: uniqueLeads,
        formatted: formattedLeads,
        report
    };
}

/**
 * Load data from Apify dataset
 */
async function loadDataset(datasetId) {
    try {
        const dataset = await Apify.openDataset(datasetId);
        const { items } = await dataset.getData();
        return items;
    } catch (error) {
        console.error(`Error loading dataset ${datasetId}: ${error.message}`);
        return [];
    }
}

/**
 * Merge leads from LinkedIn and Google Maps sources
 * Match by company name, domain, or phone number
 */
async function mergeLeads(linkedinLeads, googleMapsLeads) {
    const merged = [];
    const processedDomains = new Set();

    // Process LinkedIn leads first (usually have better decision maker info)
    for (const linkedinLead of linkedinLeads) {
        const domain = extractDomain(linkedinLead.website || linkedinLead.companyUrl);

        // Try to find matching Google Maps entry
        let matchingGoogleLead = null;
        if (domain) {
            matchingGoogleLead = googleMapsLeads.find(gmLead => {
                const gmDomain = extractDomain(gmLead.website);
                return gmDomain === domain;
            });
        }

        // If no domain match, try fuzzy name match
        if (!matchingGoogleLead && linkedinLead.companyName) {
            matchingGoogleLead = googleMapsLeads.find(gmLead =>
                fuzzyMatch(linkedinLead.companyName, gmLead.name)
            );
        }

        // Merge data from both sources
        const mergedLead = {
            ...linkedinLead,
            phone: matchingGoogleLead?.phone || linkedinLead.phone,
            address: matchingGoogleLead?.address || linkedinLead.location,
            googleRating: matchingGoogleLead?.rating,
            reviewCount: matchingGoogleLead?.reviewCount,
            googleMapsUrl: matchingGoogleLead?.googleMapsUrl,
            leadSource: matchingGoogleLead ? 'LinkedIn + Google Maps' : 'LinkedIn',
            enrichmentDate: new Date().toISOString()
        };

        merged.push(mergedLead);
        if (domain) processedDomains.add(domain);
    }

    // Add remaining Google Maps leads that weren't matched
    for (const googleLead of googleMapsLeads) {
        const domain = extractDomain(googleLead.website);
        if (!domain || !processedDomains.has(domain)) {
            merged.push({
                ...googleLead,
                companyName: googleLead.name,
                leadSource: 'Google Maps',
                enrichmentDate: new Date().toISOString()
            });
        }
    }

    return merged;
}

/**
 * Enrich single lead with additional data
 */
async function enrichSingleLead(lead, enrichmentLevel) {
    try {
        const enriched = { ...lead };

        // Extract domain from website
        const domain = extractDomain(lead.website);
        enriched.domain = domain;

        // Basic enrichment - always performed
        if (enrichmentLevel === 'basic' || enrichmentLevel === 'standard' || enrichmentLevel === 'advanced') {
            // Infer email if not present
            if (!enriched.email && enriched.firstName && enriched.lastName && domain) {
                enriched.email = inferEmail(enriched.firstName, enriched.lastName, domain);
                enriched.emailInferred = true;
            }

            // Parse company size
            enriched.companySizeRange = parseCompanySize(enriched.companySize || enriched.employeeCount);

            // Extract first and last name if only full name available
            if (!enriched.firstName && enriched.fullName) {
                const nameParts = enriched.fullName.split(' ');
                enriched.firstName = nameParts[0];
                enriched.lastName = nameParts.slice(1).join(' ');
            }
        }

        // Standard enrichment - includes validation
        if (enrichmentLevel === 'standard' || enrichmentLevel === 'advanced') {
            // Validate domain has MX records
            if (domain) {
                enriched.domainHasMX = await checkMXRecords(domain);
            }

            // Clean and standardize phone number
            if (enriched.phone) {
                enriched.phone = standardizePhoneNumber(enriched.phone);
            }

            // Standardize location
            if (enriched.location || enriched.address) {
                enriched.standardizedLocation = standardizeLocation(
                    enriched.location || enriched.address
                );
            }
        }

        // Advanced enrichment - additional data lookups
        if (enrichmentLevel === 'advanced') {
            // Could add: social profile lookups, company data APIs, etc.
            // This is a placeholder for future enhancements
        }

        return enriched;

    } catch (error) {
        console.error(`Error enriching lead: ${error.message}`);
        return lead; // Return original if enrichment fails
    }
}

/**
 * Validate leads (email format, domain, etc.)
 */
async function validateLeads(leads) {
    const validated = [];

    for (const lead of leads) {
        let isValid = true;
        const validationErrors = [];

        // Check if email exists
        if (!lead.email) {
            validationErrors.push('missing_email');
            isValid = false;
        }

        // Validate email format
        if (lead.email && !validator.isEmail(lead.email)) {
            validationErrors.push('invalid_email_format');
            isValid = false;
        }

        // Check for disposable email domains
        if (lead.email && isDisposableEmail(lead.email)) {
            validationErrors.push('disposable_email');
            isValid = false;
        }

        // Check for role-based emails
        if (lead.email && isRoleBasedEmail(lead.email)) {
            validationErrors.push('role_based_email');
            // Don't mark as invalid, but flag it
        }

        // Validate required fields
        if (!lead.companyName && !lead.name) {
            validationErrors.push('missing_company_name');
            isValid = false;
        }

        if (!lead.firstName || !lead.lastName) {
            validationErrors.push('missing_name');
        }

        // Add validation results to lead
        lead.validationStatus = isValid ? 'valid' : 'invalid';
        lead.validationErrors = validationErrors;

        // Only include valid leads (but keep validation errors for debugging)
        if (isValid) {
            validated.push(lead);
        }
    }

    return validated;
}

/**
 * Calculate quality score for lead (0-100)
 */
function calculateQualityScore(lead) {
    let score = 0;

    // Email presence and validation (40 points)
    if (lead.email && lead.validationStatus === 'valid') {
        score += 40;
        if (!lead.emailInferred) score += 10; // Bonus for actual email
        if (!lead.validationErrors.includes('role_based_email')) score += 5;
    }

    // Company information (20 points)
    if (lead.companyName || lead.name) score += 10;
    if (lead.website || lead.domain) score += 10;

    // Contact information (15 points)
    if (lead.phone) score += 10;
    if (lead.firstName && lead.lastName) score += 5;

    // Engagement signals (15 points)
    if (lead.googleRating && lead.googleRating >= 4.0) score += 8;
    if (lead.reviewCount && lead.reviewCount >= 10) score += 7;

    // LinkedIn signals (10 points)
    if (lead.linkedinProfile) score += 5;
    if (lead.recentActivity && lead.recentActivity.length > 0) score += 5;

    // Data quality (extra points)
    if (lead.leadSource === 'LinkedIn + Google Maps') score += 5; // Bonus for merged data
    if (lead.domainHasMX) score += 5; // Domain has valid MX records

    return Math.min(Math.round(score), 100); // Cap at 100
}

/**
 * Deduplicate leads based on specified fields
 */
function deduplicateLeads(leads, deduplicateBy) {
    const seen = new Map();
    const unique = [];

    for (const lead of leads) {
        // Create composite key from specified fields
        const keyParts = deduplicateBy
            .map(field => {
                if (field === 'domain') {
                    return extractDomain(lead.website || lead.domain);
                }
                return lead[field];
            })
            .filter(Boolean);

        const key = keyParts.join('::').toLowerCase();

        if (!key) {
            // If no key can be generated, include the lead
            unique.push(lead);
            continue;
        }

        if (!seen.has(key)) {
            seen.set(key, true);
            unique.push(lead);
        } else {
            console.log(`Duplicate found: ${lead.email || lead.companyName}`);
        }
    }

    return unique;
}

/**
 * Format leads for Instantly.ai
 */
function formatForInstantly(leads) {
    return leads.map(lead => ({
        email: lead.email,
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        companyName: lead.companyName || lead.name || '',
        customField1: lead.jobTitle || '',
        customField2: lead.companySizeRange || '',
        customField3: lead.standardizedLocation || lead.location || '',
        customField4: lead.industry || lead.vertical || '',
        customField5: lead.phone || '',
        customField6: lead.website || '',
        tags: [
            lead.vertical,
            lead.leadSource,
            `score:${lead.qualityScore}`
        ].filter(Boolean).join(',')
    }));
}

/**
 * Format leads for SmartLead
 */
function formatForSmartlead(leads) {
    return leads.map(lead => ({
        Email: lead.email,
        'First Name': lead.firstName || '',
        'Last Name': lead.lastName || '',
        Company: lead.companyName || lead.name || '',
        Industry: lead.industry || lead.vertical || '',
        Location: lead.standardizedLocation || lead.location || '',
        Phone: lead.phone || '',
        Website: lead.website || '',
        'Job Title': lead.jobTitle || '',
        'Company Size': lead.companySizeRange || '',
        'Lead Source': lead.leadSource,
        'Quality Score': lead.qualityScore,
        'LinkedIn Profile': lead.linkedinProfile || '',
        'Google Rating': lead.googleRating || ''
    }));
}

/**
 * Save results to Apify Key-Value Store
 */
async function saveResults(formattedLeads, rawLeads) {
    const kvStore = await Apify.openKeyValueStore();

    // Save formatted leads
    if (formattedLeads.instantly) {
        await kvStore.setValue('instantly_export.json', formattedLeads.instantly);
        await kvStore.setValue('instantly_export.csv', convertToCSV(formattedLeads.instantly));
    }

    if (formattedLeads.smartlead) {
        await kvStore.setValue('smartlead_export.json', formattedLeads.smartlead);
        await kvStore.setValue('smartlead_export.csv', convertToCSV(formattedLeads.smartlead));
    }

    // Save raw enriched leads
    await kvStore.setValue('enriched_leads.json', rawLeads);

    console.log('Results saved to Key-Value Store');
}

/**
 * Generate enrichment report
 */
function generateReport(linkedinLeads, googleMapsLeads, finalLeads) {
    const report = {
        summary: {
            linkedinLeadsInput: linkedinLeads.length,
            googleMapsLeadsInput: googleMapsLeads.length,
            finalLeadsOutput: finalLeads.length,
            deduplicationRate: `${(((linkedinLeads.length + googleMapsLeads.length - finalLeads.length) / (linkedinLeads.length + googleMapsLeads.length)) * 100).toFixed(1)}%`
        },
        validation: {
            totalValidated: finalLeads.length,
            emailValidationPassRate: `${((finalLeads.filter(l => l.email && l.validationStatus === 'valid').length / finalLeads.length) * 100).toFixed(1)}%`,
            inferredEmails: finalLeads.filter(l => l.emailInferred).length,
            roleBasedEmails: finalLeads.filter(l => l.validationErrors?.includes('role_based_email')).length
        },
        quality: {
            averageQualityScore: Math.round(
                finalLeads.reduce((sum, l) => sum + l.qualityScore, 0) / finalLeads.length
            ),
            highQuality: finalLeads.filter(l => l.qualityScore >= 80).length,
            mediumQuality: finalLeads.filter(l => l.qualityScore >= 50 && l.qualityScore < 80).length,
            lowQuality: finalLeads.filter(l => l.qualityScore < 50).length
        },
        sources: {
            linkedinOnly: finalLeads.filter(l => l.leadSource === 'LinkedIn').length,
            googleMapsOnly: finalLeads.filter(l => l.leadSource === 'Google Maps').length,
            merged: finalLeads.filter(l => l.leadSource === 'LinkedIn + Google Maps').length
        },
        verticals: countByField(finalLeads, 'vertical'),
        timestamp: new Date().toISOString()
    };

    return report;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL or email
 */
function extractDomain(urlOrEmail) {
    if (!urlOrEmail) return null;

    try {
        // If it's an email, extract domain part
        if (urlOrEmail.includes('@')) {
            return urlOrEmail.split('@')[1].toLowerCase();
        }

        // If it's a URL, parse it
        const url = new URL(urlOrEmail.startsWith('http') ? urlOrEmail : `https://${urlOrEmail}`);
        return url.hostname.replace('www.', '').toLowerCase();
    } catch (error) {
        return null;
    }
}

/**
 * Infer email address from name and domain
 */
function inferEmail(firstName, lastName, domain) {
    if (!firstName || !lastName || !domain) return null;

    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');

    // Try common patterns (firstname.lastname is most common in B2B)
    const patterns = [
        `${cleanFirst}.${cleanLast}@${domain}`,
        `${cleanFirst}${cleanLast}@${domain}`,
        `${cleanFirst[0]}${cleanLast}@${domain}`,
        `${cleanFirst}_${cleanLast}@${domain}`
    ];

    return patterns[0]; // Return most common pattern
}

/**
 * Check if domain has MX records
 */
async function checkMXRecords(domain) {
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Check if email is from a disposable provider
 */
function isDisposableEmail(email) {
    const disposableDomains = [
        'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
        'throwaway.email', 'temp-mail.org', 'getnada.com'
    ];

    const domain = extractDomain(email);
    return domain ? disposableDomains.includes(domain) : false;
}

/**
 * Check if email is role-based (info@, contact@, etc.)
 */
function isRoleBasedEmail(email) {
    const rolePrefixes = [
        'info', 'contact', 'sales', 'support', 'admin', 'hello',
        'help', 'service', 'team', 'office', 'general', 'inquiries'
    ];

    const prefix = email.split('@')[0].toLowerCase();
    return rolePrefixes.includes(prefix);
}

/**
 * Parse company size into standardized range
 */
function parseCompanySize(sizeStr) {
    if (!sizeStr) return null;

    const str = String(sizeStr).toLowerCase();

    // Try to extract numbers
    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
        return `${numbers[0]}-${numbers[1]}`;
    } else if (numbers && numbers.length === 1) {
        const num = parseInt(numbers[0]);
        if (num < 10) return '1-10';
        if (num < 50) return '10-50';
        if (num < 200) return '50-200';
        if (num < 500) return '200-500';
        return '500+';
    }

    return sizeStr;
}

/**
 * Standardize phone number to E.164 format
 */
function standardizePhoneNumber(phone) {
    if (!phone) return null;

    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
        return `+1${digits}`;
    } else if (digits.length === 11 && digits[0] === '1') {
        return `+${digits}`;
    }

    return phone;
}

/**
 * Standardize location (City, State format)
 */
function standardizeLocation(location) {
    if (!location) return null;

    // Extract city and state with regex
    const match = location.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
    if (match) {
        return `${match[1].trim()}, ${match[2]}`;
    }

    return location;
}

/**
 * Fuzzy match two strings (for company name matching)
 */
function fuzzyMatch(str1, str2, threshold = 0.8) {
    if (!str1 || !str2) return false;

    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Simple Levenshtein distance-based similarity
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escape values with commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Count occurrences by field
 */
function countByField(items, field) {
    const counts = {};
    for (const item of items) {
        const value = item[field] || 'unknown';
        counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    enrichLeads,
    enrichSingleLead,
    validateLeads,
    calculateQualityScore,
    deduplicateLeads,
    formatForInstantly,
    formatForSmartlead,
    extractDomain,
    inferEmail,
    checkMXRecords,
    isDisposableEmail,
    isRoleBasedEmail
};

// If running directly (not imported)
if (require.main === module) {
    Apify.main(async () => {
        const input = await Apify.getInput();
        await enrichLeads(input);
    });
}
