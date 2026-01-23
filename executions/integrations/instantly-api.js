/**
 * Instantly.ai API Integration
 *
 * Wrapper for Instantly.ai cold email platform API.
 * Handles campaign creation, lead upload, statistics, and webhook processing.
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * API Documentation: https://developer.instantly.ai/
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;
const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

/**
 * Instantly API Client Class
 */
class InstantlyAPI {
    constructor(apiKey = INSTANTLY_API_KEY) {
        if (!apiKey) {
            throw new Error('INSTANTLY_API_KEY is required. Set it in your .env file.');
        }

        this.apiKey = apiKey;
        this.baseURL = INSTANTLY_BASE_URL;

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
                timezone = 'America/Chicago'
            } = campaignConfig;

            // Validate required fields
            if (!name) {
                throw new Error('Campaign name is required');
            }

            if (!senderEmails || senderEmails.length === 0) {
                throw new Error('At least one sender email is required');
            }

            const payload = {
                campaign_name: name,
                sender_accounts: senderEmails,
                daily_limit_per_account: dailyLimit,
                schedule: schedule,
                track_opens: trackOpens,
                track_clicks: trackClicks,
                timezone: timezone,
                status: 'paused' // Always create as paused, activate manually
            };

            console.log(`Creating campaign: ${name}`);
            const response = await this.client.post('/campaign/create', payload);

            console.log(`Campaign created successfully: ${response.data.campaign_id}`);
            return {
                success: true,
                campaignId: response.data.campaign_id,
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
     * @param {boolean} skipValidation - Skip email validation (default: false)
     * @returns {Promise<Object>} Upload result with success/failure counts
     */
    async uploadLeads(campaignId, leads, skipValidation = false) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            if (!leads || leads.length === 0) {
                throw new Error('Leads array cannot be empty');
            }

            console.log(`Uploading ${leads.length} leads to campaign ${campaignId}`);

            // Instantly has a batch limit of 1000 leads per request
            const BATCH_SIZE = 1000;
            const batches = this.chunkArray(leads, BATCH_SIZE);

            let totalUploaded = 0;
            let totalFailed = 0;
            const results = [];

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} leads)`);

                try {
                    const payload = {
                        campaign_id: campaignId,
                        leads: batch,
                        skip_validation: skipValidation
                    };

                    const response = await this.client.post('/campaign/leads/add', payload);

                    const uploaded = response.data.uploaded || batch.length;
                    const failed = response.data.failed || 0;

                    totalUploaded += uploaded;
                    totalFailed += failed;

                    results.push({
                        batch: i + 1,
                        uploaded,
                        failed,
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

            const response = await this.client.get(`/campaign/stats/${campaignId}`);

            const stats = response.data;

            return {
                success: true,
                campaignId,
                stats: {
                    totalLeads: stats.total_leads || 0,
                    emailsSent: stats.emails_sent || 0,
                    opens: stats.opens || 0,
                    openRate: stats.open_rate || 0,
                    clicks: stats.clicks || 0,
                    clickRate: stats.click_rate || 0,
                    replies: stats.replies || 0,
                    replyRate: stats.reply_rate || 0,
                    bounces: stats.bounces || 0,
                    bounceRate: stats.bounce_rate || 0,
                    unsubscribes: stats.unsubscribes || 0,
                    unsubscribeRate: stats.unsubscribe_rate || 0,
                    positiveReplies: stats.positive_replies || 0,
                    negativeReplies: stats.negative_replies || 0,
                    neutralReplies: stats.neutral_replies || 0
                },
                raw: stats
            };

        } catch (error) {
            console.error('Error fetching campaign stats:', error.message);
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

            const response = await this.client.post('/campaign/pause', {
                campaign_id: campaignId
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

            const response = await this.client.post('/campaign/resume', {
                campaign_id: campaignId
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
     * Get campaign replies
     *
     * @param {string} campaignId - Campaign ID
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} Array of replies
     */
    async getCampaignReplies(campaignId, filters = {}) {
        try {
            if (!campaignId) {
                throw new Error('Campaign ID is required');
            }

            const {
                sentiment = null, // 'positive', 'negative', 'neutral'
                limit = 100,
                offset = 0
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

            const response = await this.client.get('/campaign/replies', { params });

            const replies = response.data.replies || [];

            return {
                success: true,
                campaignId,
                total: response.data.total || 0,
                replies: replies.map(reply => ({
                    replyId: reply.id,
                    leadEmail: reply.lead_email,
                    leadName: reply.lead_name,
                    subject: reply.subject,
                    body: reply.body,
                    sentiment: reply.sentiment,
                    timestamp: reply.timestamp,
                    threadId: reply.thread_id
                })),
                raw: response.data
            };

        } catch (error) {
            console.error('Error fetching campaign replies:', error.message);
            throw error;
        }
    }

    /**
     * Process webhook payload from Instantly
     *
     * Webhook events include: reply, bounce, unsubscribe, open, click
     *
     * @param {Object} webhookPayload - Webhook payload from Instantly
     * @returns {Object} Processed webhook data
     */
    async handleWebhook(webhookPayload) {
        try {
            const {
                event_type,
                campaign_id,
                lead_email,
                lead_name,
                timestamp,
                data
            } = webhookPayload;

            console.log(`Processing webhook: ${event_type} for ${lead_email}`);

            let processedData = {
                eventType: event_type,
                campaignId: campaign_id,
                leadEmail: lead_email,
                leadName: lead_name,
                timestamp: timestamp || new Date().toISOString()
            };

            // Process based on event type
            switch (event_type) {
                case 'reply':
                    processedData.replyBody = data.reply_body;
                    processedData.replySubject = data.reply_subject;
                    processedData.sentiment = data.sentiment;
                    processedData.threadId = data.thread_id;
                    break;

                case 'bounce':
                    processedData.bounceType = data.bounce_type; // hard, soft
                    processedData.bounceReason = data.bounce_reason;
                    break;

                case 'unsubscribe':
                    processedData.unsubscribeReason = data.reason;
                    break;

                case 'open':
                    processedData.openCount = data.open_count;
                    processedData.userAgent = data.user_agent;
                    processedData.ipAddress = data.ip_address;
                    break;

                case 'click':
                    processedData.clickedUrl = data.url;
                    processedData.clickCount = data.click_count;
                    break;

                default:
                    console.warn(`Unknown webhook event type: ${event_type}`);
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

            const response = await this.client.delete(`/campaign/${campaignId}`);

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

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Get default sending schedule (Mon-Fri, 8am-5pm)
     */
    getDefaultSchedule() {
        return {
            monday: { enabled: true, start: '08:00', end: '17:00' },
            tuesday: { enabled: true, start: '08:00', end: '17:00' },
            wednesday: { enabled: true, start: '08:00', end: '17:00' },
            thursday: { enabled: true, start: '08:00', end: '17:00' },
            friday: { enabled: true, start: '08:00', end: '17:00' },
            saturday: { enabled: false, start: '08:00', end: '17:00' },
            sunday: { enabled: false, start: '08:00', end: '17:00' }
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
            if (status === 401) {
                throw new Error('Invalid API key. Check your INSTANTLY_API_KEY in .env');
            } else if (status === 429) {
                // Rate limit - implement retry with exponential backoff
                console.warn('Rate limit hit. Retrying with exponential backoff...');
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (status === 404) {
                throw new Error('Campaign not found. Check campaign ID.');
            } else if (status >= 500) {
                throw new Error('Instantly.ai server error. Please try again later.');
            }

            throw new Error(data.message || `API error: ${status}`);

        } else if (error.request) {
            // Request made but no response received
            console.error('No response from Instantly API:', error.message);
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

module.exports = InstantlyAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Create campaign and upload leads
 *
 * const InstantlyAPI = require('./instantly-api');
 * const api = new InstantlyAPI();
 *
 * // Create campaign
 * const campaign = await api.createCampaign({
 *   name: 'Insurance-Jan-2026',
 *   senderEmails: ['sender1@yourdomain.com', 'sender2@yourdomain.com'],
 *   dailyLimit: 50,
 *   timezone: 'America/Chicago'
 * });
 *
 * // Upload leads
 * const leads = [
 *   {
 *     email: 'john@example.com',
 *     firstName: 'John',
 *     lastName: 'Smith',
 *     companyName: 'ABC Corp',
 *     customField1: 'VP of Operations'
 *   }
 * ];
 *
 * await api.uploadLeads(campaign.campaignId, leads);
 *
 * // Get stats
 * const stats = await api.getCampaignStats(campaign.campaignId);
 * console.log(stats);
 */
