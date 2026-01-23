/**
 * Slack Notifications Integration
 *
 * Handles all Slack communication for the AI Agency Pipeline including:
 * - Real-time alerts for errors and critical events
 * - Daily and weekly performance reports
 * - Booking notifications
 * - Custom formatted messages with Slack Block Kit
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * API Documentation: https://api.slack.com/messaging/webhooks
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#agency-alerts';
const SLACK_DAILY_REPORT_CHANNEL = process.env.SLACK_DAILY_REPORT_CHANNEL || '#agency-reports';
const SLACK_ERROR_CHANNEL = process.env.SLACK_ERROR_CHANNEL || '#agency-errors';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // milliseconds

/**
 * Slack Notifications Client Class
 */
class SlackNotifications {
    constructor(webhookUrl = SLACK_WEBHOOK_URL, botToken = SLACK_BOT_TOKEN) {
        this.webhookUrl = webhookUrl;
        this.botToken = botToken;

        // Configure axios instance for Slack API
        if (botToken) {
            this.client = axios.create({
                baseURL: 'https://slack.com/api',
                headers: {
                    'Authorization': `Bearer ${this.botToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
        }
    }

    // ========================================================================
    // CORE MESSAGING FUNCTIONS
    // ========================================================================

    /**
     * Send a message via webhook (simple, no token required)
     *
     * @param {string} text - Plain text message
     * @param {Array} blocks - Optional Slack Block Kit blocks
     * @param {string} webhookUrl - Override default webhook URL
     * @returns {Promise<Object>} Response from Slack
     */
    async sendWebhook(text, blocks = null, webhookUrl = this.webhookUrl) {
        if (!webhookUrl) {
            throw new Error('SLACK_WEBHOOK_URL is required. Set it in your .env file.');
        }

        const payload = {
            text: text,
            ...(blocks && { blocks })
        };

        try {
            const response = await axios.post(webhookUrl, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`[Slack Webhook] Message sent: ${text.substring(0, 50)}...`);
            return response.data;
        } catch (error) {
            console.error('[Slack Webhook] Failed to send:', error.message);
            throw error;
        }
    }

    /**
     * Send a message to a specific channel (requires bot token)
     *
     * @param {string} channel - Channel name or ID (#channel or C1234567890)
     * @param {string} text - Plain text message
     * @param {Array} blocks - Optional Slack Block Kit blocks
     * @returns {Promise<Object>} Response from Slack
     */
    async sendMessage(channel, text, blocks = null) {
        if (!this.botToken) {
            console.warn('[Slack] Bot token not configured, falling back to webhook');
            return this.sendWebhook(text, blocks);
        }

        const payload = {
            channel: channel,
            text: text,
            ...(blocks && { blocks })
        };

        try {
            const response = await this.client.post('/chat.postMessage', payload);

            if (!response.data.ok) {
                throw new Error(response.data.error || 'Unknown Slack API error');
            }

            console.log(`[Slack] Message sent to ${channel}: ${text.substring(0, 50)}...`);
            return response.data;
        } catch (error) {
            console.error(`[Slack] Failed to send to ${channel}:`, error.message);
            throw error;
        }
    }

    /**
     * Retry logic wrapper for sending messages
     *
     * @param {Function} sendFunction - Function to execute
     * @param {number} retries - Number of retries remaining
     * @returns {Promise<Object>} Result of send function
     */
    async sendWithRetry(sendFunction, retries = MAX_RETRIES) {
        try {
            return await sendFunction();
        } catch (error) {
            if (retries > 0) {
                console.log(`[Slack] Retrying... (${retries} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return this.sendWithRetry(sendFunction, retries - 1);
            }
            throw error;
        }
    }

    // ========================================================================
    // ALERT FUNCTIONS
    // ========================================================================

    /**
     * Send an alert with severity level
     *
     * @param {string} channel - Target channel
     * @param {string} message - Alert message
     * @param {string} severity - 'CRITICAL', 'WARNING', 'INFO'
     * @param {Object} metadata - Additional context (optional)
     * @returns {Promise<Object>} Slack response
     */
    async sendAlert(channel, message, severity = 'INFO', metadata = {}) {
        const severityConfig = {
            CRITICAL: { emoji: '🚨', color: '#FF0000' },
            WARNING: { emoji: '⚠️', color: '#FFA500' },
            INFO: { emoji: 'ℹ️', color: '#0088CC' }
        };

        const config = severityConfig[severity] || severityConfig.INFO;
        const timestamp = new Date().toISOString();

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `${config.emoji} ${severity} Alert`,
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${message}*`
                }
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `*Time:* ${timestamp}`
                    }
                ]
            }
        ];

        // Add metadata fields if provided
        if (Object.keys(metadata).length > 0) {
            const fields = Object.entries(metadata).map(([key, value]) => ({
                type: 'mrkdwn',
                text: `*${key}:* ${value}`
            }));

            blocks.push({
                type: 'section',
                fields: fields
            });
        }

        return this.sendWithRetry(() => this.sendMessage(channel, message, blocks));
    }

    /**
     * Send error notification with stack trace
     *
     * @param {Object} errorData - Error information
     * @param {string} errorData.error - Error message
     * @param {string} errorData.module - Module where error occurred
     * @param {string} errorData.stack - Stack trace (optional)
     * @param {Object} errorData.context - Additional context (optional)
     * @returns {Promise<Object>} Slack response
     */
    async notifyOnError(errorData) {
        const { error, module, stack, context = {} } = errorData;
        const timestamp = new Date().toISOString();

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🚨 System Error Detected',
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Module:*\n${module}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Time:*\n${timestamp}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Error Message:*\n\`\`\`${error}\`\`\``
                }
            }
        ];

        // Add stack trace if available
        if (stack) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Stack Trace:*\n\`\`\`${stack.substring(0, 500)}\`\`\``
                }
            });
        }

        // Add context if provided
        if (Object.keys(context).length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2)}\`\`\``
                }
            });
        }

        return this.sendWithRetry(() =>
            this.sendMessage(SLACK_ERROR_CHANNEL, `Error in ${module}: ${error}`, blocks)
        );
    }

    /**
     * Send booking notification
     *
     * @param {Object} bookingData - Booking information
     * @param {string} bookingData.contactName - Contact's name
     * @param {string} bookingData.contactEmail - Contact's email
     * @param {string} bookingData.contactPhone - Contact's phone
     * @param {string} bookingData.appointmentTime - Appointment date/time
     * @param {string} bookingData.calendarType - Type of appointment
     * @param {string} bookingData.source - How booking was made
     * @returns {Promise<Object>} Slack response
     */
    async notifyOnBooking(bookingData) {
        const {
            contactName,
            contactEmail,
            contactPhone,
            appointmentTime,
            calendarType = 'Discovery Call',
            source = 'AI Receptionist'
        } = bookingData;

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '📅 New Booking Confirmed!',
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Contact:*\n${contactName}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Type:*\n${calendarType}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Email:*\n${contactEmail}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Phone:*\n${contactPhone || 'N/A'}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Time:*\n${appointmentTime}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Source:*\n${source}`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: '✅ Calendar invitation sent | CRM updated'
                    }
                ]
            }
        ];

        return this.sendWithRetry(() =>
            this.sendMessage(SLACK_CHANNEL, `New booking: ${contactName} - ${appointmentTime}`, blocks)
        );
    }

    // ========================================================================
    // REPORTING FUNCTIONS
    // ========================================================================

    /**
     * Send daily performance report
     *
     * @param {Object} metrics - Daily metrics from metrics-collector
     * @param {Object} metrics.leadGen - Lead generation stats
     * @param {Object} metrics.outreach - Outreach stats
     * @param {Object} metrics.crm - CRM stats
     * @param {Object} metrics.booking - Booking stats
     * @returns {Promise<Object>} Slack response
     */
    async sendDailyReport(metrics) {
        const {
            leadGen = {},
            outreach = {},
            crm = {},
            booking = {}
        } = metrics;

        const today = new Date().toLocaleDateString();

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `📊 Daily Report - ${today}`,
                    emoji: true
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🎯 Lead Generation*'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Scraped:*\n${leadGen.leadsScraped || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Enriched:*\n${leadGen.leadsEnriched || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Success Rate:*\n${leadGen.enrichmentRate || 0}%`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Quality Score:*\n${leadGen.qualityScore || 0}/100`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*📧 Outreach Performance*'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Sent:*\n${outreach.emailsSent || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Delivered:*\n${outreach.emailsDelivered || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Open Rate:*\n${outreach.openRate || 0}%`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Reply Rate:*\n${outreach.replyRate || 0}%`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🔄 CRM Activity*'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Contacts Created:*\n${crm.contactsCreated || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Opportunities:*\n${crm.opportunitiesCreated || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Won:*\n${crm.opportunitiesWon || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Pipeline Value:*\n$${crm.pipelineValue || 0}`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*📅 Booking Stats*'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Booked:*\n${booking.bookingsConfirmed || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Completed:*\n${booking.bookingsCompleted || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*No-Shows:*\n${booking.noShows || 0}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*AI Calls:*\n${booking.aiCalls || 0}`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `📈 System uptime: ${metrics.uptime || '99.9%'} | Last updated: ${new Date().toLocaleTimeString()}`
                    }
                ]
            }
        ];

        return this.sendWithRetry(() =>
            this.sendMessage(SLACK_DAILY_REPORT_CHANNEL, `Daily Report - ${today}`, blocks)
        );
    }

    /**
     * Send weekly performance report
     *
     * @param {Object} metrics - Weekly metrics from metrics-collector
     * @param {Object} metrics.weeklyTrends - Week-over-week comparisons
     * @param {Array} metrics.topPerformers - Best performing elements
     * @param {Array} metrics.actionItems - Recommended actions
     * @returns {Promise<Object>} Slack response
     */
    async sendWeeklyReport(metrics) {
        const {
            weeklyTrends = {},
            topPerformers = [],
            actionItems = [],
            summary = {}
        } = metrics;

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const dateRange = `${weekStart.toLocaleDateString()} - ${new Date().toLocaleDateString()}`;

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `📊 Weekly Report - ${dateRange}`,
                    emoji: true
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*📈 Week-over-Week Trends*'
                },
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Leads:*\n${weeklyTrends.leadsChange || '+0%'} ${this._getTrendEmoji(weeklyTrends.leadsChange)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Emails Sent:*\n${weeklyTrends.emailsChange || '+0%'} ${this._getTrendEmoji(weeklyTrends.emailsChange)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Bookings:*\n${weeklyTrends.bookingsChange || '+0%'} ${this._getTrendEmoji(weeklyTrends.bookingsChange)}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Revenue:*\n${weeklyTrends.revenueChange || '+0%'} ${this._getTrendEmoji(weeklyTrends.revenueChange)}`
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*🏆 Top Performers*\n' +
                          (topPerformers.length > 0
                            ? topPerformers.map((p, i) => `${i + 1}. ${p}`).join('\n')
                            : 'No data available')
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*⚠️ Action Items*\n' +
                          (actionItems.length > 0
                            ? actionItems.map(item => `• ${item}`).join('\n')
                            : 'All systems performing optimally ✅')
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*📊 7-Day Summary*\n` +
                          `Total Leads: ${summary.totalLeads || 0}\n` +
                          `Total Emails: ${summary.totalEmails || 0}\n` +
                          `Total Bookings: ${summary.totalBookings || 0}\n` +
                          `Avg Conversion Rate: ${summary.avgConversionRate || 0}%`
                }
            }
        ];

        return this.sendWithRetry(() =>
            this.sendMessage(SLACK_DAILY_REPORT_CHANNEL, `Weekly Report - ${dateRange}`, blocks)
        );
    }

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Get emoji for trend direction
     *
     * @param {string} change - Change percentage (e.g., '+15%', '-5%')
     * @returns {string} Emoji representing trend
     */
    _getTrendEmoji(change) {
        if (!change) return '➖';
        const value = parseFloat(change);
        if (value > 0) return '📈';
        if (value < 0) return '📉';
        return '➖';
    }

    /**
     * Format error for Slack display
     *
     * @param {Error} error - JavaScript Error object
     * @returns {Object} Formatted error data
     */
    formatError(error) {
        return {
            error: error.message || 'Unknown error',
            module: error.module || 'Unknown module',
            stack: error.stack || '',
            context: error.context || {}
        };
    }

    /**
     * Test Slack connection
     *
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            await this.sendAlert(
                SLACK_CHANNEL,
                'Slack integration test - connection successful!',
                'INFO',
                { test: true, timestamp: new Date().toISOString() }
            );
            console.log('[Slack] Connection test successful!');
            return true;
        } catch (error) {
            console.error('[Slack] Connection test failed:', error.message);
            return false;
        }
    }
}

// ========================================================================
// EXPORTS
// ========================================================================

module.exports = SlackNotifications;

// Example usage (if run directly)
if (require.main === module) {
    const slack = new SlackNotifications();

    // Test connection
    slack.testConnection()
        .then(() => console.log('✅ Slack integration ready'))
        .catch(err => console.error('❌ Slack integration failed:', err));
}
