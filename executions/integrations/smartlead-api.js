/**
 * SmartLead API Integration
 *
 * Wrapper for SmartLead cold email platform API.
 * Handles campaign creation, lead upload, statistics, and reply management.
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * API Documentation: https://api.smartlead.ai/docs
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const SMARTLEAD_API_KEY = process.env.SMARTLEAD_API_KEY;
const SMARTLEAD_BASE_URL = 'https://api.smartlead.ai/api/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

/**
 * SmartLead API Client Class
 */
class SmartLeadAPI {
    constructor(apiKey = SMARTLEAD_API_KEY) {
        if (!apiKey) {
            throw new Error('SMARTLEAD_API_KEY is required. Set it in your .env file.');
        }

        this.apiKey = apiKey;
        this.baseURL = SMARTLEAD_BASE_URL;

        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 30000 // 30 second timeout
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        );
    }

    /**
     * Create a new campaign
     *
     * @param {Object} campaignConfig - Campaign configuration
     * @param {string} campaignConfig.name - Campaign name
     * @param {string[]} campaignConfig.senderEmails - Array of sender email addresses
     * @param {number} campaignConfig.dailyLimit - Daily send limit per sender (default: 50)
     * @param {Object} campaignConfig.schedule - Sending schedule configuration
     * @param {boolean} campaignConfig.trackOpens - Enable open tracking (default: true)
     * @param {boolean} campaignConfig.trackClicks - Enable click tracking (default: true)
     * @returns {Promise<Object>} Campaign object with ID
     */
    async createCampaign(campaignConfig) {
        try {
            const {
                name,
                senderEmails = [],
                dailyLimit = 50,
                schedule = this.getDefaultSchedule(),
                trackOpens = true,
                trackClicks = true,
                timezone = 'America/Chicago',
                replyToEmail = null
            } = campaignConfig;

            // Validate required fields
            if (!name) {
                throw new Error('Campaign name is required');
            }

            if (!senderEmails || senderEmails.length === 0) {
                throw new Error('At least one sender email is required');
            }

            const payload = {
                name: name,
                client_id: await this.getDefaultClientId(),
                sender_emails: senderEmails,
                daily_limit: dailyLimit,
                schedule: schedule,
                track_settings: {
                    open_tracking: trackOpens,
                    click_tracking: trackClicks
                },
                timezone: timezone,
                reply_to: replyToEmail || senderEmails[0], // Default to first sender
                status: 'draft' // Create as draft, activate manually
            };

            console.log(`Creating campaign: ${name}`);
            const response = await this.client.post('/campaigns', payload);

            console.log(`Campaign created successfully: ${response.data.id}`);
            return {
                success: true,
                campaignId: response.data.id,
                campaignName: name,
                data: response.data
            };

        } catch (error) {
            console.error('Error creating campaign:', error.message);
            throw error;
        }
    }

    /**
     * Upload leads to a campaign
     *
     * @param {string} campaignId - Campaign ID
     * @param {Array<Object>} leads - Array of lead objects
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result with success/failure counts
     */
    async uploadLeads(campaignId, leads, options = {}) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            if (!leads || leads.length === 0) {
                throw new Error('Leads array cannot be empty');
            }

            const {
                listName = `Import_${new Date().toISOString().split('T')[0]}`,
                skipDuplicates = true,
                skipValidation = false
            } = options;

            console.log(`Uploading ${leads.length} leads to campaign ${campaignId}`);

            // SmartLead has a batch limit of 500 leads per request
            const BATCH_SIZE = 500;
            const batches = this.chunkArray(leads, BATCH_SIZE);

            let totalUploaded = 0;
            let totalFailed = 0;
            const results = [];

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} leads)`);

                try {
                    // Format leads for SmartLead
                    const formattedLeads = batch.map(lead => ({
                        email: lead.Email || lead.email,
                        first_name: lead['First Name'] || lead.firstName || '',
                        last_name: lead['Last Name'] || lead.lastName || '',
                        company_name: lead.Company || lead.companyName || '',
                        custom_fields: {
                            industry: lead.Industry || lead.industry || '',
                            location: lead.Location || lead.location || '',
                            phone: lead.Phone || lead.phone || '',
                            website: lead.Website || lead.website || '',
                            job_title: lead['Job Title'] || lead.jobTitle || '',
                            company_size: lead['Company Size'] || lead.companySize || '',
                            lead_source: lead['Lead Source'] || lead.leadSource || '',
                            quality_score: lead['Quality Score'] || lead.qualityScore || 0
                        }
                    }));

                    const payload = {
                        campaign_id: campaignId,
                        leads: formattedLeads,
                        settings: {
                            ignore_global_block_list: false,
                            ignore_unsubscribe_list: false,
                            ignore_duplicate: skipDuplicates,
                            skip_validation: skipValidation
                        }
                    };

                    const response = await this.client.post('/campaigns/leads', payload);

                    const uploaded = response.data.success_count || batch.length;
                    const failed = response.data.failed_count || 0;

                    totalUploaded += uploaded;
                    totalFailed += failed;

                    results.push({
                        batch: i + 1,
                        uploaded,
                        failed,
                        duplicates: response.data.duplicate_count || 0,
                        invalid: response.data.invalid_count || 0,
                        errors: response.data.errors || []
                    });

                    // Rate limiting: wait between batches
                    if (i < batches.length - 1) {
                        await this.sleep(1000); // 1 second delay
                    }

                } catch (error) {
                    console.error(`Error uploading batch ${i + 1}:`, error.message);
                    totalFailed += batch.length;
                    results.push({
                        batch: i + 1,
                        uploaded: 0,
                        failed: batch.length,
                        error: error.message
                    });
                }
            }

            console.log(`Upload complete: ${totalUploaded} uploaded, ${totalFailed} failed`);

            return {
                success: totalUploaded > 0,
                campaignId,
                totalLeads: leads.length,
                uploaded: totalUploaded,
                failed: totalFailed,
                batches: results
            };

        } catch (error) {
            console.error('Error uploading leads:', error.message);
            throw error;
        }
    }

    /**
     * Get campaign statistics
     *
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Campaign statistics
     */
    async getCampaignStats(campaignId) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            console.log(`Fetching stats for campaign: ${campaignId}`);

            const response = await this.client.get(`/campaigns/${campaignId}/analytics`);

            const analytics = response.data;

            // Calculate rates
            const totalSent = analytics.sent || 0;
            const openRate = totalSent > 0 ? ((analytics.opens || 0) / totalSent * 100).toFixed(2) : 0;
            const clickRate = totalSent > 0 ? ((analytics.clicks || 0) / totalSent * 100).toFixed(2) : 0;
            const replyRate = totalSent > 0 ? ((analytics.replies || 0) / totalSent * 100).toFixed(2) : 0;
            const bounceRate = totalSent > 0 ? ((analytics.bounces || 0) / totalSent * 100).toFixed(2) : 0;

            return {
                success: true,
                campaignId,
                stats: {
                    totalLeads: analytics.total_leads || 0,
                    emailsSent: totalSent,
                    opens: analytics.opens || 0,
                    openRate: parseFloat(openRate),
                    uniqueOpens: analytics.unique_opens || 0,
                    clicks: analytics.clicks || 0,
                    clickRate: parseFloat(clickRate),
                    uniqueClicks: analytics.unique_clicks || 0,
                    replies: analytics.replies || 0,
                    replyRate: parseFloat(replyRate),
                    positiveReplies: analytics.positive_replies || 0,
                    negativeReplies: analytics.negative_replies || 0,
                    neutralReplies: analytics.neutral_replies || 0,
                    bounces: analytics.bounces || 0,
                    bounceRate: parseFloat(bounceRate),
                    hardBounces: analytics.hard_bounces || 0,
                    softBounces: analytics.soft_bounces || 0,
                    unsubscribes: analytics.unsubscribes || 0,
                    unsubscribeRate: totalSent > 0 ? ((analytics.unsubscribes || 0) / totalSent * 100).toFixed(2) : 0,
                    outOfOffice: analytics.out_of_office || 0
                },
                raw: analytics
            };

        } catch (error) {
            console.error('Error fetching campaign stats:', error.message);
            throw error;
        }
    }

    /**
     * Get lead replies from a campaign
     *
     * @param {string} campaignId - Campaign ID
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} Array of replies
     */
    async getLeadReplies(campaignId, filters = {}) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            const {
                sentiment = null, // 'positive', 'negative', 'neutral'
                limit = 100,
                offset = 0,
                startDate = null,
                endDate = null
            } = filters;

            console.log(`Fetching replies for campaign: ${campaignId}`);

            const params = {
                campaign_id: campaignId,
                limit,
                offset
            };

            if (sentiment) {
                params.sentiment = sentiment;
            }

            if (startDate) {
                params.start_date = startDate;
            }

            if (endDate) {
                params.end_date = endDate;
            }

            const response = await this.client.get('/campaigns/replies', { params });

            const replies = response.data.replies || [];

            return {
                success: true,
                campaignId,
                total: response.data.total || 0,
                replies: replies.map(reply => ({
                    replyId: reply.id,
                    leadEmail: reply.lead_email,
                    leadName: `${reply.first_name || ''} ${reply.last_name || ''}`.trim(),
                    subject: reply.subject,
                    body: reply.body,
                    htmlBody: reply.html_body,
                    sentiment: reply.sentiment,
                    timestamp: reply.received_at,
                    threadId: reply.thread_id,
                    sequenceStep: reply.sequence_step,
                    isAutoReply: reply.is_auto_reply || false
                })),
                raw: response.data
            };

        } catch (error) {
            console.error('Error fetching lead replies:', error.message);
            throw error;
        }
    }

    /**
     * Pause a campaign
     *
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Result of pause operation
     */
    async pauseCampaign(campaignId) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            console.log(`Pausing campaign: ${campaignId}`);

            const response = await this.client.patch(`/campaigns/${campaignId}`, {
                status: 'paused'
            });

            console.log(`Campaign paused successfully: ${campaignId}`);

            return {
                success: true,
                campaignId,
                status: 'paused',
                data: response.data
            };

        } catch (error) {
            console.error('Error pausing campaign:', error.message);
            throw error;
        }
    }

    /**
     * Resume a paused campaign
     *
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Result of resume operation
     */
    async resumeCampaign(campaignId) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            console.log(`Resuming campaign: ${campaignId}`);

            const response = await this.client.patch(`/campaigns/${campaignId}`, {
                status: 'active'
            });

            console.log(`Campaign resumed successfully: ${campaignId}`);

            return {
                success: true,
                campaignId,
                status: 'active',
                data: response.data
            };

        } catch (error) {
            console.error('Error resuming campaign:', error.message);
            throw error;
        }
    }

    /**
     * Delete a campaign
     *
     * @param {string} campaignId - Campaign ID
     * @returns {Promise<Object>} Result of delete operation
     */
    async deleteCampaign(campaignId) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            console.log(`Deleting campaign: ${campaignId}`);

            const response = await this.client.delete(`/campaigns/${campaignId}`);

            console.log(`Campaign deleted successfully: ${campaignId}`);

            return {
                success: true,
                campaignId,
                data: response.data
            };

        } catch (error) {
            console.error('Error deleting campaign:', error.message);
            throw error;
        }
    }

    /**
     * Mark a lead reply as positive/negative/neutral
     *
     * @param {string} replyId - Reply ID
     * @param {string} sentiment - 'positive', 'negative', or 'neutral'
     * @returns {Promise<Object>} Result of update operation
     */
    async updateReplySentiment(replyId, sentiment) {
        try {
            if (!replyId) {
                throw new Error('Reply ID is required');
            }

            if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
                throw new Error('Sentiment must be positive, negative, or neutral');
            }

            console.log(`Updating reply ${replyId} sentiment to: ${sentiment}`);

            const response = await this.client.patch(`/replies/${replyId}`, {
                sentiment: sentiment
            });

            return {
                success: true,
                replyId,
                sentiment,
                data: response.data
            };

        } catch (error) {
            console.error('Error updating reply sentiment:', error.message);
            throw error;
        }
    }

    /**
     * Get warmup status for sender accounts
     *
     * @returns {Promise<Object>} Warmup status for all connected accounts
     */
    async getWarmupStatus() {
        try {
            console.log('Fetching warmup status for sender accounts...');

            const response = await this.client.get('/warmup/status');

            const accounts = response.data.accounts || [];

            return {
                success: true,
                accounts: accounts.map(account => ({
                    email: account.email,
                    warmupEnabled: account.warmup_enabled,
                    warmupStatus: account.warmup_status, // 'warming', 'warmed', 'paused'
                    dailySendLimit: account.daily_send_limit,
                    currentReputation: account.reputation_score,
                    daysWarming: account.days_warming,
                    lastActivity: account.last_activity
                })),
                raw: response.data
            };

        } catch (error) {
            console.error('Error fetching warmup status:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Get default client ID (required for SmartLead API)
     * In production, this should be stored in environment variables
     */
    async getDefaultClientId() {
        // If you have multiple clients, store this in .env
        return process.env.SMARTLEAD_CLIENT_ID || 'default';
    }

    /**
     * Get default sending schedule (Mon-Fri, 8am-5pm)
     */
    getDefaultSchedule() {
        return {
            timezone: 'America/Chicago',
            days: {
                monday: { active: true, start_time: '08:00', end_time: '17:00' },
                tuesday: { active: true, start_time: '08:00', end_time: '17:00' },
                wednesday: { active: true, start_time: '08:00', end_time: '17:00' },
                thursday: { active: true, start_time: '08:00', end_time: '17:00' },
                friday: { active: true, start_time: '08:00', end_time: '17:00' },
                saturday: { active: false, start_time: '08:00', end_time: '17:00' },
                sunday: { active: false, start_time: '08:00', end_time: '17:00' }
            }
        };
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
            if (status === 401 || status === 403) {
                throw new Error('Invalid API key. Check your SMARTLEAD_API_KEY in .env');
            } else if (status === 429) {
                // Rate limit - implement retry with exponential backoff
                console.warn('Rate limit hit. Retrying with exponential backoff...');
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (status === 404) {
                throw new Error('Resource not found. Check campaign ID or endpoint.');
            } else if (status >= 500) {
                throw new Error('SmartLead server error. Please try again later.');
            }

            throw new Error(data.message || `API error: ${status}`);

        } else if (error.request) {
            // Request made but no response received
            console.error('No response from SmartLead API:', error.message);
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
     * Split array into chunks
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
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

module.exports = SmartLeadAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Create campaign and upload leads
 *
 * const SmartLeadAPI = require('./smartlead-api');
 * const api = new SmartLeadAPI();
 *
 * // Create campaign
 * const campaign = await api.createCampaign({
 *   name: 'RealEstate-Jan-2026',
 *   senderEmails: ['sender1@yourdomain.com', 'sender2@yourdomain.com'],
 *   dailyLimit: 50,
 *   timezone: 'America/Chicago'
 * });
 *
 * // Upload leads
 * const leads = [
 *   {
 *     Email: 'john@example.com',
 *     'First Name': 'John',
 *     'Last Name': 'Smith',
 *     Company: 'ABC Corp',
 *     Industry: 'commercial-real-estate'
 *   }
 * ];
 *
 * await api.uploadLeads(campaign.campaignId, leads);
 *
 * // Get replies
 * const replies = await api.getLeadReplies(campaign.campaignId, {
 *   sentiment: 'positive',
 *   limit: 50
 * });
 * console.log(replies);
 *
 * // Get warmup status
 * const warmup = await api.getWarmupStatus();
 * console.log(warmup);
 */
