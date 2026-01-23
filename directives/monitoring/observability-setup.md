# Observability Setup Directive

**Version:** 1.0.0
**Last Updated:** January 2026
**Module:** Monitoring & Observability
**Framework:** DOE (Directive Orchestration Execution)

---

## Objective Statement

Establish comprehensive monitoring, alerting, and reporting infrastructure for the AI Agency Pipeline to provide real-time visibility into system performance, enable proactive issue resolution, and deliver actionable insights for business optimization.

---

## Input Specifications

### Required Environment Variables

```env
# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#agency-alerts
SLACK_DAILY_REPORT_CHANNEL=#agency-reports
SLACK_ERROR_CHANNEL=#agency-errors

# Database (for metrics storage)
DATABASE_URL=postgresql://user:password@localhost:5432/agency_pipeline
REDIS_URL=redis://localhost:6379

# Monitoring Configuration
MONITORING_INTERVAL=300000  # 5 minutes in milliseconds
DAILY_REPORT_TIME=09:00     # Time to send daily report (UTC)
WEEKLY_REPORT_DAY=1         # Monday = 1, Sunday = 7
```

### Data Sources

The monitoring system collects metrics from:

1. **Lead Generation Module** (`executions/scrapers/`)
   - Apify scraper runs and results
   - Lead enrichment success/failure rates
   - Data quality scores

2. **Outreach Module** (`executions/integrations/instantly-api.js`, `smartlead-api.js`)
   - Email send rates
   - Open rates and click rates
   - Reply rates and sentiment
   - Bounce rates and spam complaints

3. **CRM Module** (`executions/integrations/gohighlevel-api.js`)
   - Contact creation rates
   - Pipeline stage distribution
   - Deal velocity and conversion rates
   - Task completion rates

4. **Booking Module** (`executions/integrations/calendar-api.js`, `voice-agent-api.js`)
   - Booking request volume
   - Successful bookings vs. failures
   - No-show rates
   - AI receptionist call metrics

---

## Process

### Step 1: Metrics Collection

**Execution:** `executions/utils/metrics-collector.js`

The metrics collector queries each module's execution layer to gather performance data:

```javascript
// Metrics Collection Functions
getLeadGenMetrics()      // Scrape volumes, enrichment rates
getOutreachMetrics()     // Email performance stats
getCRMMetrics()          // Pipeline health indicators
getBookingMetrics()      // Calendar and call stats
```

**Collection Frequency:** Every 5 minutes (configurable via `MONITORING_INTERVAL`)

**Storage:** Metrics stored in Redis for real-time access and PostgreSQL for historical analysis

### Step 2: Real-Time Alerting

**Execution:** `executions/integrations/slack-notifications.js`

Alert conditions trigger immediate Slack notifications:

| Alert Type | Condition | Severity | Channel |
|------------|-----------|----------|---------|
| High Error Rate | >5% errors in 15min window | CRITICAL | #agency-errors |
| Outreach Throttle | Email send rate drops >30% | WARNING | #agency-alerts |
| Booking Failure | Calendar API fails 3x in row | CRITICAL | #agency-errors |
| Low Conversion | Lead-to-booking rate <2% | WARNING | #agency-alerts |
| API Quota Warning | Any API >80% of daily quota | WARNING | #agency-alerts |
| System Health | Service downtime detected | CRITICAL | #agency-errors |

**Alert Functions:**
```javascript
sendAlert(channel, message, severity)       // Generic alert
notifyOnError(errorData)                   // Automatic error notifications
notifyOnBooking(bookingData)               // Booking confirmations
```

### Step 3: Daily Reporting

**Execution:** Automated daily summary sent at 9:00 AM (configurable)

**Report Contents:**
- **Yesterday's Performance:**
  - Total leads generated
  - Emails sent, opened, replied
  - Contacts created in CRM
  - Bookings scheduled
  - Revenue attributed (if available)

- **Key Metrics:**
  - Lead enrichment success rate
  - Email open rate / reply rate
  - Lead-to-opportunity conversion rate
  - Opportunity-to-booking conversion rate
  - Average time from lead to booking

- **Health Indicators:**
  - System uptime percentage
  - API error rates by service
  - Queue depths and processing times

**Format:** Slack message with formatted blocks for easy scanning

### Step 4: Weekly Reporting

**Execution:** Automated weekly summary sent Monday 9:00 AM (configurable)

**Report Contents:**
- **7-Day Trends:**
  - Week-over-week growth/decline
  - Pipeline velocity changes
  - Conversion rate trends

- **Top Performers:**
  - Best performing outreach campaigns
  - Highest converting lead sources
  - Most effective nurture sequences

- **Action Items:**
  - Underperforming areas requiring attention
  - Optimization opportunities
  - Recommended workflow adjustments

**Format:** Comprehensive Slack message with charts/graphs (via Slack Block Kit)

### Step 5: Dashboard Visualization

**Execution:** `dashboards/pipeline-dashboard.html`

A simple, auto-refreshing HTML dashboard displaying:

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  AI AGENCY PIPELINE - LIVE DASHBOARD            │
├─────────────────────────────────────────────────┤
│  Lead Generation  │  Outreach  │  CRM  │ Booking│
├─────────────────────────────────────────────────┤
│  • Scraped: 1,234 │ Sent: 500  │ Opp: 45│ Call:12│
│  • Enriched: 987  │ Open: 45%  │ Won: 8 │ Book:7 │
│  • Quality: 89%   │ Reply: 12% │ Lost:3 │ NoSh:1 │
└─────────────────────────────────────────────────┘
```

**Features:**
- Auto-refresh every 5 minutes
- Color-coded status (green/yellow/red based on thresholds)
- Click-through to detailed metrics
- Responsive design for mobile viewing

**Hosting:** Can be served via any static file server (Vercel, Netlify, or localhost)

---

## Key Metrics by Module

### Lead Generation
- `leads_scraped_total` - Total leads scraped (last 24h)
- `leads_enriched_total` - Successfully enriched leads
- `enrichment_success_rate` - % of leads successfully enriched
- `data_quality_score` - Average quality score (0-100)
- `scraper_errors_total` - Failed scraper runs

### Cold Outreach
- `emails_sent_total` - Total emails sent
- `emails_delivered_total` - Successfully delivered
- `email_open_rate` - % of delivered emails opened
- `email_click_rate` - % of opened emails clicked
- `email_reply_rate` - % of delivered emails replied
- `email_bounce_rate` - % of emails bounced
- `spam_complaint_rate` - % marked as spam

### CRM Integration
- `contacts_created_total` - New contacts added
- `opportunities_created_total` - New opportunities
- `opportunities_won_total` - Closed-won deals
- `opportunities_lost_total` - Closed-lost deals
- `pipeline_value_total` - Total value in pipeline ($)
- `avg_deal_cycle_days` - Average time to close

### Booking System
- `booking_requests_total` - Total booking attempts
- `bookings_confirmed_total` - Successfully scheduled
- `bookings_completed_total` - Meetings that occurred
- `bookings_noshow_total` - No-show appointments
- `ai_calls_total` - Total AI receptionist calls
- `ai_calls_qualified_total` - Calls that qualified

---

## Alert Conditions and Thresholds

### Critical Alerts (Immediate Action Required)

```javascript
// Error Rate Spike
if (errorRate > 0.05 && windowMinutes === 15) {
  sendAlert('#agency-errors', 'Critical: Error rate >5% in last 15min', 'CRITICAL');
}

// Service Downtime
if (serviceHealth === 'DOWN') {
  sendAlert('#agency-errors', `CRITICAL: ${serviceName} is DOWN`, 'CRITICAL');
}

// Booking System Failure
if (consecutiveBookingFailures >= 3) {
  sendAlert('#agency-errors', 'Calendar API failing - bookings affected', 'CRITICAL');
}

// API Quota Exhaustion
if (apiUsagePercent > 95) {
  sendAlert('#agency-errors', `${apiName} quota at ${apiUsagePercent}% - URGENT`, 'CRITICAL');
}
```

### Warning Alerts (Monitor Closely)

```javascript
// Outreach Performance Drop
if (emailSendRate < previousAverage * 0.7) {
  sendAlert('#agency-alerts', 'Email send rate down 30% from average', 'WARNING');
}

// Low Conversion Rate
if (leadToBookingRate < 0.02 && leadsCount > 100) {
  sendAlert('#agency-alerts', 'Lead-to-booking conversion <2%', 'WARNING');
}

// API Quota Warning
if (apiUsagePercent > 80) {
  sendAlert('#agency-alerts', `${apiName} at ${apiUsagePercent}% of quota`, 'WARNING');
}

// Data Quality Decline
if (dataQualityScore < 70) {
  sendAlert('#agency-alerts', 'Lead quality score dropped below 70', 'WARNING');
}
```

---

## Report Schedule

### Daily Report
- **Time:** 9:00 AM UTC (configurable via `DAILY_REPORT_TIME`)
- **Channel:** `SLACK_DAILY_REPORT_CHANNEL` (#agency-reports)
- **Frequency:** Every day
- **Content:** Previous 24-hour metrics summary

### Weekly Report
- **Day:** Monday (configurable via `WEEKLY_REPORT_DAY`)
- **Time:** 9:00 AM UTC
- **Channel:** `SLACK_DAILY_REPORT_CHANNEL` (#agency-reports)
- **Frequency:** Once per week
- **Content:** 7-day trends, insights, and recommendations

### Custom Reports (On-Demand)
```javascript
// Generate custom report for date range
generateCustomReport({
  startDate: '2026-01-01',
  endDate: '2026-01-15',
  modules: ['lead-gen', 'outreach', 'crm'],
  format: 'json' | 'slack' | 'csv'
});
```

---

## Self-Annealing Guidelines

As the monitoring system runs in production, it should learn and adapt:

### Common Issues & Solutions

**Issue:** Too many false-positive alerts
**Solution:** Adjust alert thresholds based on baseline performance
**Update:** Modify threshold constants in `slack-notifications.js`

**Issue:** Missing critical alerts
**Solution:** Add new alert conditions based on discovered failure modes
**Update:** Add new alerting logic to `slack-notifications.js`

**Issue:** Metrics collection too slow
**Solution:** Implement caching or reduce collection frequency
**Update:** Modify `MONITORING_INTERVAL` or add Redis caching

**Issue:** Dashboard not updating
**Solution:** Check API connectivity and refresh mechanism
**Update:** Add error handling to dashboard fetch logic

### Continuous Improvement

- **Week 1-2:** Establish baselines for all metrics
- **Week 3-4:** Fine-tune alert thresholds based on observed patterns
- **Month 2:** Add predictive alerts (e.g., "likely to hit quota by 3pm")
- **Month 3+:** Implement ML-based anomaly detection for advanced alerting

---

## Definition of Done

The observability system is considered complete when:

### ✅ Functional Requirements
- [ ] All four files created and tested:
  - `directives/monitoring/observability-setup.md` (this file)
  - `executions/integrations/slack-notifications.js`
  - `executions/utils/metrics-collector.js`
  - `dashboards/pipeline-dashboard.html`

- [ ] Slack integration working:
  - [ ] Test alert sent successfully
  - [ ] Daily report generates without errors
  - [ ] Weekly report generates without errors
  - [ ] All alert types trigger correctly

- [ ] Metrics collection functional:
  - [ ] Can collect metrics from all 4 modules
  - [ ] Data stored in Redis and PostgreSQL
  - [ ] Historical data queryable

- [ ] Dashboard operational:
  - [ ] HTML file renders correctly
  - [ ] Auto-refresh works (5min interval)
  - [ ] All metrics display accurately
  - [ ] Responsive on mobile devices

### ✅ Documentation Requirements
- [ ] All code functions have JSDoc comments
- [ ] README includes setup instructions
- [ ] Environment variables documented in `.env.example`
- [ ] Example alert outputs provided

### ✅ Testing Requirements
- [ ] Manual test: Send test alert to Slack
- [ ] Manual test: Generate sample daily report
- [ ] Manual test: Dashboard displays dummy data
- [ ] Verify no errors in console/logs

### ✅ Integration Requirements
- [ ] Metrics collector successfully queries all existing modules
- [ ] Slack webhooks and bot token working
- [ ] Database connections established
- [ ] All dependencies installed (`package.json` updated if needed)

---

## Error Handling & Edge Cases

### Slack API Failures
- Implement retry logic with exponential backoff
- Fall back to logging if Slack unavailable
- Queue messages for later delivery if persistent failure

### Database Connection Issues
- Cache metrics in memory temporarily
- Retry connection with backoff
- Alert to error channel if DB down >5min

### Missing Metrics
- Return null/undefined for unavailable metrics
- Display "N/A" in dashboard
- Log warning but don't crash system

### Timezone Handling
- All timestamps stored in UTC
- Convert to user's timezone for display
- Respect `TIMEZONE` environment variable

---

## Future Enhancements

### Phase 2 (Month 2-3)
- [ ] Add Prometheus/Grafana integration for advanced visualization
- [ ] Implement webhook endpoints for external monitoring tools
- [ ] Add cost tracking per module (API spend)
- [ ] Client-specific dashboards (multi-tenant support)

### Phase 3 (Month 4+)
- [ ] Predictive analytics (forecast quota usage, booking volume)
- [ ] Automated optimization recommendations via AI
- [ ] Integration with PagerDuty for on-call rotation
- [ ] Mobile app for monitoring on-the-go

---

## Related Directives

- `directives/lead-generation/scraping-workflow.md` - Lead gen metrics source
- `directives/cold-outreach/instantly-campaign.md` - Outreach metrics source
- `directives/crm-integration/ghl-sync.md` - CRM metrics source
- `directives/calendar-booking/scheduling-workflow.md` - Booking metrics source

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial directive created |

---

**End of Directive**
