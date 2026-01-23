/**
 * Metrics Collector Utility
 *
 * Collects performance metrics from all modules of the AI Agency Pipeline:
 * - Lead Generation (Apify scrapers, enrichment)
 * - Cold Outreach (Instantly, Smartlead)
 * - CRM Integration (GoHighLevel)
 * - Booking System (Calendar, Voice Agent)
 *
 * Provides aggregated data for monitoring, alerting, and reporting.
 *
 * @version 1.0.0
 * @requires dotenv
 */

require('dotenv').config();

// Import integration APIs
const GoHighLevelAPI = require('../integrations/gohighlevel-api');
const InstantlyAPI = require('../integrations/instantly-api');
const SmartleadAPI = require('../integrations/smartlead-api');
const CalendarAPI = require('../integrations/calendar-api');
const VoiceAgentAPI = require('../integrations/voice-agent-api');

/**
 * Metrics Collector Class
 */
class MetricsCollector {
    constructor() {
        // Initialize API clients (with error handling)
        try {
            this.ghlClient = new GoHighLevelAPI();
        } catch (e) {
            console.warn('[MetricsCollector] GHL client initialization failed:', e.message);
            this.ghlClient = null;
        }

        try {
            this.instantlyClient = new InstantlyAPI();
        } catch (e) {
            console.warn('[MetricsCollector] Instantly client initialization failed:', e.message);
            this.instantlyClient = null;
        }

        try {
            this.smartleadClient = new SmartleadAPI();
        } catch (e) {
            console.warn('[MetricsCollector] Smartlead client initialization failed:', e.message);
            this.smartleadClient = null;
        }

        try {
            this.calendarClient = new CalendarAPI();
        } catch (e) {
            console.warn('[MetricsCollector] Calendar client initialization failed:', e.message);
            this.calendarClient = null;
        }

        try {
            this.voiceClient = new VoiceAgentAPI();
        } catch (e) {
            console.warn('[MetricsCollector] Voice client initialization failed:', e.message);
            this.voiceClient = null;
        }

        // Cache for metrics (5-minute TTL)
        this.cache = {};
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    // ========================================================================
    // LEAD GENERATION METRICS
    // ========================================================================

    /**
     * Get lead generation metrics
     *
     * @param {Object} options - Query options
     * @param {Date} options.startDate - Start date for metrics (default: 24h ago)
     * @param {Date} options.endDate - End date for metrics (default: now)
     * @returns {Promise<Object>} Lead gen metrics
     */
    async getLeadGenMetrics(options = {}) {
        const cacheKey = 'leadGen';
        if (this._isCacheValid(cacheKey)) {
            return this.cache[cacheKey].data;
        }

        const startDate = options.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = options.endDate || new Date();

        try {
            // Mock data structure - replace with actual data source queries
            // In production, this would query Apify API, database, or log aggregator
            const metrics = {
                leadsScraped: await this._getScrapedLeadsCount(startDate, endDate),
                leadsEnriched: await this._getEnrichedLeadsCount(startDate, endDate),
                enrichmentRate: 0,
                qualityScore: await this._getDataQualityScore(startDate, endDate),
                scraperErrors: await this._getScraperErrorCount(startDate, endDate),
                avgEnrichmentTime: await this._getAvgEnrichmentTime(startDate, endDate),
                topSources: await this._getTopLeadSources(startDate, endDate)
            };

            // Calculate enrichment rate
            if (metrics.leadsScraped > 0) {
                metrics.enrichmentRate = Math.round(
                    (metrics.leadsEnriched / metrics.leadsScraped) * 100
                );
            }

            this._setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('[MetricsCollector] Failed to get lead gen metrics:', error.message);
            return this._getDefaultLeadGenMetrics();
        }
    }

    /**
     * Get count of scraped leads
     * @private
     */
    async _getScrapedLeadsCount(startDate, endDate) {
        // TODO: Query Apify API or database
        // Example: SELECT COUNT(*) FROM leads WHERE created_at BETWEEN startDate AND endDate
        return 0; // Placeholder
    }

    /**
     * Get count of enriched leads
     * @private
     */
    async _getEnrichedLeadsCount(startDate, endDate) {
        // TODO: Query enrichment service or database
        // Example: SELECT COUNT(*) FROM leads WHERE enriched_at BETWEEN startDate AND endDate
        return 0; // Placeholder
    }

    /**
     * Get data quality score (0-100)
     * @private
     */
    async _getDataQualityScore(startDate, endDate) {
        // TODO: Calculate based on completeness of lead data
        // Example: Average of (fields_filled / total_fields) * 100
        return 85; // Placeholder
    }

    /**
     * Get scraper error count
     * @private
     */
    async _getScraperErrorCount(startDate, endDate) {
        // TODO: Query error logs or Apify runs
        return 0; // Placeholder
    }

    /**
     * Get average enrichment time in seconds
     * @private
     */
    async _getAvgEnrichmentTime(startDate, endDate) {
        // TODO: Calculate from enrichment logs
        return 2.5; // Placeholder
    }

    /**
     * Get top lead sources
     * @private
     */
    async _getTopLeadSources(startDate, endDate) {
        // TODO: Query database for source breakdown
        return [
            { source: 'Google Maps', count: 150 },
            { source: 'LinkedIn', count: 85 },
            { source: 'Yellow Pages', count: 42 }
        ];
    }

    /**
     * Default lead gen metrics (fallback)
     * @private
     */
    _getDefaultLeadGenMetrics() {
        return {
            leadsScraped: 0,
            leadsEnriched: 0,
            enrichmentRate: 0,
            qualityScore: 0,
            scraperErrors: 0,
            avgEnrichmentTime: 0,
            topSources: []
        };
    }

    // ========================================================================
    // OUTREACH METRICS
    // ========================================================================

    /**
     * Get outreach metrics from Instantly and Smartlead
     *
     * @param {Object} options - Query options
     * @param {Date} options.startDate - Start date
     * @param {Date} options.endDate - End date
     * @returns {Promise<Object>} Outreach metrics
     */
    async getOutreachMetrics(options = {}) {
        const cacheKey = 'outreach';
        if (this._isCacheValid(cacheKey)) {
            return this.cache[cacheKey].data;
        }

        const startDate = options.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = options.endDate || new Date();

        try {
            const metrics = {
                emailsSent: 0,
                emailsDelivered: 0,
                emailsOpened: 0,
                emailsClicked: 0,
                emailsReplied: 0,
                emailsBounced: 0,
                spamComplaints: 0,
                openRate: 0,
                clickRate: 0,
                replyRate: 0,
                bounceRate: 0,
                activeCampaigns: 0,
                topCampaigns: []
            };

            // Get Instantly metrics
            if (this.instantlyClient) {
                try {
                    const instantlyData = await this._getInstantlyMetrics(startDate, endDate);
                    this._mergeMetrics(metrics, instantlyData);
                } catch (error) {
                    console.error('[MetricsCollector] Instantly metrics failed:', error.message);
                }
            }

            // Get Smartlead metrics
            if (this.smartleadClient) {
                try {
                    const smartleadData = await this._getSmartleadMetrics(startDate, endDate);
                    this._mergeMetrics(metrics, smartleadData);
                } catch (error) {
                    console.error('[MetricsCollector] Smartlead metrics failed:', error.message);
                }
            }

            // Calculate rates
            if (metrics.emailsDelivered > 0) {
                metrics.openRate = Math.round((metrics.emailsOpened / metrics.emailsDelivered) * 100);
                metrics.replyRate = Math.round((metrics.emailsReplied / metrics.emailsDelivered) * 100);
            }
            if (metrics.emailsSent > 0) {
                metrics.bounceRate = Math.round((metrics.emailsBounced / metrics.emailsSent) * 100);
            }
            if (metrics.emailsOpened > 0) {
                metrics.clickRate = Math.round((metrics.emailsClicked / metrics.emailsOpened) * 100);
            }

            this._setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('[MetricsCollector] Failed to get outreach metrics:', error.message);
            return this._getDefaultOutreachMetrics();
        }
    }

    /**
     * Get metrics from Instantly
     * @private
     */
    async _getInstantlyMetrics(startDate, endDate) {
        // TODO: Query Instantly API for campaign analytics
        // Example: instantlyClient.getAnalytics({ startDate, endDate })
        return {
            emailsSent: 0,
            emailsDelivered: 0,
            emailsOpened: 0,
            emailsReplied: 0
        };
    }

    /**
     * Get metrics from Smartlead
     * @private
     */
    async _getSmartleadMetrics(startDate, endDate) {
        // TODO: Query Smartlead API for campaign analytics
        return {
            emailsSent: 0,
            emailsDelivered: 0,
            emailsOpened: 0,
            emailsReplied: 0
        };
    }

    /**
     * Merge metrics from multiple sources
     * @private
     */
    _mergeMetrics(target, source) {
        for (const key in source) {
            if (typeof source[key] === 'number' && typeof target[key] === 'number') {
                target[key] += source[key];
            }
        }
    }

    /**
     * Default outreach metrics (fallback)
     * @private
     */
    _getDefaultOutreachMetrics() {
        return {
            emailsSent: 0,
            emailsDelivered: 0,
            emailsOpened: 0,
            emailsClicked: 0,
            emailsReplied: 0,
            emailsBounced: 0,
            spamComplaints: 0,
            openRate: 0,
            clickRate: 0,
            replyRate: 0,
            bounceRate: 0,
            activeCampaigns: 0,
            topCampaigns: []
        };
    }

    // ========================================================================
    // CRM METRICS
    // ========================================================================

    /**
     * Get CRM metrics from GoHighLevel
     *
     * @param {Object} options - Query options
     * @param {Date} options.startDate - Start date
     * @param {Date} options.endDate - End date
     * @returns {Promise<Object>} CRM metrics
     */
    async getCRMMetrics(options = {}) {
        const cacheKey = 'crm';
        if (this._isCacheValid(cacheKey)) {
            return this.cache[cacheKey].data;
        }

        const startDate = options.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = options.endDate || new Date();

        try {
            const metrics = {
                contactsCreated: 0,
                opportunitiesCreated: 0,
                opportunitiesWon: 0,
                opportunitiesLost: 0,
                pipelineValue: 0,
                wonValue: 0,
                avgDealCycleDays: 0,
                conversionRate: 0,
                stageDistribution: {},
                topPipelines: []
            };

            if (this.ghlClient) {
                // TODO: Query GHL API for contacts and opportunities
                // Example implementations:

                // Get contacts created in date range
                // const contacts = await ghlClient.searchContacts({
                //   dateAdded: { from: startDate, to: endDate }
                // });
                // metrics.contactsCreated = contacts.length;

                // Get opportunities in date range
                // const opportunities = await ghlClient.getOpportunities({
                //   dateRange: { from: startDate, to: endDate }
                // });

                // Calculate metrics from opportunities
                // metrics.opportunitiesCreated = opportunities.length;
                // metrics.opportunitiesWon = opportunities.filter(o => o.status === 'won').length;
                // metrics.pipelineValue = opportunities.reduce((sum, o) => sum + o.value, 0);
            }

            this._setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('[MetricsCollector] Failed to get CRM metrics:', error.message);
            return this._getDefaultCRMMetrics();
        }
    }

    /**
     * Default CRM metrics (fallback)
     * @private
     */
    _getDefaultCRMMetrics() {
        return {
            contactsCreated: 0,
            opportunitiesCreated: 0,
            opportunitiesWon: 0,
            opportunitiesLost: 0,
            pipelineValue: 0,
            wonValue: 0,
            avgDealCycleDays: 0,
            conversionRate: 0,
            stageDistribution: {},
            topPipelines: []
        };
    }

    // ========================================================================
    // BOOKING METRICS
    // ========================================================================

    /**
     * Get booking metrics from Calendar and Voice Agent
     *
     * @param {Object} options - Query options
     * @param {Date} options.startDate - Start date
     * @param {Date} options.endDate - End date
     * @returns {Promise<Object>} Booking metrics
     */
    async getBookingMetrics(options = {}) {
        const cacheKey = 'booking';
        if (this._isCacheValid(cacheKey)) {
            return this.cache[cacheKey].data;
        }

        const startDate = options.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = options.endDate || new Date();

        try {
            const metrics = {
                bookingRequests: 0,
                bookingsConfirmed: 0,
                bookingsCompleted: 0,
                bookingsCancelled: 0,
                noShows: 0,
                aiCalls: 0,
                aiCallsQualified: 0,
                avgCallDuration: 0,
                bookingRate: 0,
                showRate: 0,
                topBookingTypes: []
            };

            // Get calendar booking data
            if (this.calendarClient) {
                // TODO: Query Calendar API
                // const bookings = await calendarClient.getEvents({ startDate, endDate });
                // Process booking data
            }

            // Get voice agent call data
            if (this.voiceClient) {
                // TODO: Query Voice Agent API (Vapi)
                // const calls = await voiceClient.getCalls({ startDate, endDate });
                // metrics.aiCalls = calls.length;
                // metrics.aiCallsQualified = calls.filter(c => c.outcome === 'qualified').length;
            }

            // Calculate rates
            if (metrics.bookingRequests > 0) {
                metrics.bookingRate = Math.round(
                    (metrics.bookingsConfirmed / metrics.bookingRequests) * 100
                );
            }
            if (metrics.bookingsConfirmed > 0) {
                metrics.showRate = Math.round(
                    (metrics.bookingsCompleted / metrics.bookingsConfirmed) * 100
                );
            }

            this._setCache(cacheKey, metrics);
            return metrics;
        } catch (error) {
            console.error('[MetricsCollector] Failed to get booking metrics:', error.message);
            return this._getDefaultBookingMetrics();
        }
    }

    /**
     * Default booking metrics (fallback)
     * @private
     */
    _getDefaultBookingMetrics() {
        return {
            bookingRequests: 0,
            bookingsConfirmed: 0,
            bookingsCompleted: 0,
            bookingsCancelled: 0,
            noShows: 0,
            aiCalls: 0,
            aiCallsQualified: 0,
            avgCallDuration: 0,
            bookingRate: 0,
            showRate: 0,
            topBookingTypes: []
        };
    }

    // ========================================================================
    // AGGREGATED REPORTS
    // ========================================================================

    /**
     * Generate daily report with all metrics
     *
     * @returns {Promise<Object>} Complete daily metrics
     */
    async generateDailyReport() {
        console.log('[MetricsCollector] Generating daily report...');

        const [leadGen, outreach, crm, booking] = await Promise.all([
            this.getLeadGenMetrics(),
            this.getOutreachMetrics(),
            this.getCRMMetrics(),
            this.getBookingMetrics()
        ]);

        const report = {
            reportType: 'daily',
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            },
            leadGen,
            outreach,
            crm,
            booking,
            uptime: '99.9%', // TODO: Get from monitoring service
            summary: this._generateSummary({ leadGen, outreach, crm, booking })
        };

        console.log('[MetricsCollector] Daily report generated successfully');
        return report;
    }

    /**
     * Generate weekly report with trends
     *
     * @returns {Promise<Object>} Complete weekly metrics with trends
     */
    async generateWeeklyReport() {
        console.log('[MetricsCollector] Generating weekly report...');

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // Get current week and previous week metrics
        const [currentWeek, previousWeek] = await Promise.all([
            this._getAllMetrics({ startDate: weekAgo, endDate: new Date() }),
            this._getAllMetrics({ startDate: twoWeeksAgo, endDate: weekAgo })
        ]);

        const report = {
            reportType: 'weekly',
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: weekAgo.toISOString(),
                end: new Date().toISOString()
            },
            ...currentWeek,
            weeklyTrends: this._calculateTrends(currentWeek, previousWeek),
            topPerformers: this._identifyTopPerformers(currentWeek),
            actionItems: this._generateActionItems(currentWeek, previousWeek)
        };

        console.log('[MetricsCollector] Weekly report generated successfully');
        return report;
    }

    /**
     * Get all metrics for a date range
     * @private
     */
    async _getAllMetrics(options) {
        const [leadGen, outreach, crm, booking] = await Promise.all([
            this.getLeadGenMetrics(options),
            this.getOutreachMetrics(options),
            this.getCRMMetrics(options),
            this.getBookingMetrics(options)
        ]);

        return { leadGen, outreach, crm, booking };
    }

    /**
     * Calculate week-over-week trends
     * @private
     */
    _calculateTrends(current, previous) {
        const calculateChange = (curr, prev) => {
            if (prev === 0) return curr > 0 ? '+100%' : '0%';
            const change = ((curr - prev) / prev) * 100;
            return `${change > 0 ? '+' : ''}${Math.round(change)}%`;
        };

        return {
            leadsChange: calculateChange(
                current.leadGen.leadsScraped,
                previous.leadGen.leadsScraped
            ),
            emailsChange: calculateChange(
                current.outreach.emailsSent,
                previous.outreach.emailsSent
            ),
            bookingsChange: calculateChange(
                current.booking.bookingsConfirmed,
                previous.booking.bookingsConfirmed
            ),
            revenueChange: calculateChange(
                current.crm.wonValue,
                previous.crm.wonValue
            )
        };
    }

    /**
     * Identify top performers
     * @private
     */
    _identifyTopPerformers(metrics) {
        const performers = [];

        if (metrics.outreach.openRate > 40) {
            performers.push(`Outstanding email open rate: ${metrics.outreach.openRate}%`);
        }
        if (metrics.outreach.replyRate > 10) {
            performers.push(`Excellent reply rate: ${metrics.outreach.replyRate}%`);
        }
        if (metrics.booking.bookingRate > 15) {
            performers.push(`Strong booking conversion: ${metrics.booking.bookingRate}%`);
        }

        return performers.length > 0 ? performers : ['Solid performance across all metrics'];
    }

    /**
     * Generate action items based on metrics
     * @private
     */
    _generateActionItems(current, previous) {
        const items = [];

        // Low outreach performance
        if (current.outreach.openRate < 30) {
            items.push('Low open rate - consider subject line optimization');
        }
        if (current.outreach.replyRate < 5) {
            items.push('Low reply rate - review email copy and targeting');
        }

        // Low booking rate
        if (current.booking.bookingRate < 10 && current.booking.bookingRequests > 10) {
            items.push('Booking rate below target - review calendar availability and CTAs');
        }

        // High no-show rate
        if (current.booking.noShows / current.booking.bookingsConfirmed > 0.15) {
            items.push('High no-show rate - implement reminder sequences');
        }

        return items;
    }

    /**
     * Generate summary text
     * @private
     */
    _generateSummary(metrics) {
        const totalLeads = metrics.leadGen.leadsScraped;
        const totalEmails = metrics.outreach.emailsSent;
        const totalBookings = metrics.booking.bookingsConfirmed;

        return {
            totalLeads,
            totalEmails,
            totalBookings,
            avgConversionRate: totalLeads > 0
                ? Math.round((totalBookings / totalLeads) * 100)
                : 0
        };
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    /**
     * Check if cached data is still valid
     * @private
     */
    _isCacheValid(key) {
        if (!this.cache[key]) return false;
        const age = Date.now() - this.cache[key].timestamp;
        return age < this.cacheTTL;
    }

    /**
     * Set cache for a key
     * @private
     */
    _setCache(key, data) {
        this.cache[key] = {
            data,
            timestamp: Date.now()
        };
    }

    /**
     * Clear all cached metrics
     */
    clearCache() {
        this.cache = {};
        console.log('[MetricsCollector] Cache cleared');
    }
}

// ========================================================================
// EXPORTS
// ========================================================================

module.exports = MetricsCollector;

// Example usage (if run directly)
if (require.main === module) {
    const collector = new MetricsCollector();

    collector.generateDailyReport()
        .then(report => {
            console.log('\n===== DAILY REPORT =====');
            console.log(JSON.stringify(report, null, 2));
        })
        .catch(err => console.error('Failed to generate report:', err));
}
