# Monitoring & Observability System

This monitoring system provides comprehensive real-time visibility into the AI Agency Pipeline's performance across all modules.

## Overview

The monitoring system consists of four main components:

1. **Directive** (`observability-setup.md`) - The natural language SOP defining what to monitor and when to alert
2. **Slack Integration** (`slack-notifications.js`) - Handles all Slack communication
3. **Metrics Collector** (`metrics-collector.js`) - Aggregates data from all pipeline modules
4. **Dashboard** (`pipeline-dashboard.html`) - Visual representation of key metrics

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and set the following:

```bash
# Slack Configuration (Required)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#agency-alerts
SLACK_DAILY_REPORT_CHANNEL=#agency-reports
SLACK_ERROR_CHANNEL=#agency-errors

# Monitoring Settings (Optional)
MONITORING_INTERVAL=300000          # 5 minutes
DAILY_REPORT_TIME=09:00            # 9 AM UTC
WEEKLY_REPORT_DAY=1                # Monday
```

### 2. Install Dependencies

```bash
cd c:\Users\travi\agency-pipeline
npm install axios dotenv
```

### 3. Test the System

```bash
# Run the test suite
node tests/test-monitoring.js
```

### 4. View the Dashboard

Open `dashboards/pipeline-dashboard.html` in any web browser. The dashboard will:
- Display mock data by default (set `USE_MOCK_DATA = false` when API is ready)
- Auto-refresh every 5 minutes
- Show color-coded metrics (green = good, yellow = warning, red = critical)

## File Locations

```
agency-pipeline/
├── directives/monitoring/
│   ├── observability-setup.md     # DOE directive (SOP)
│   └── README.md                  # This file
├── executions/integrations/
│   └── slack-notifications.js     # Slack API wrapper
├── executions/utils/
│   └── metrics-collector.js       # Metrics aggregator
├── dashboards/
│   └── pipeline-dashboard.html    # Live dashboard
└── tests/
    └── test-monitoring.js         # Test suite
```

## Usage Examples

### Sending Alerts

```javascript
const SlackNotifications = require('./executions/integrations/slack-notifications');
const slack = new SlackNotifications();

// Send a simple alert
await slack.sendAlert(
    '#agency-alerts',
    'High error rate detected in lead generation',
    'CRITICAL',
    { errorRate: '8%', threshold: '5%' }
);

// Send error notification
await slack.notifyOnError({
    error: 'API timeout',
    module: 'lead-generation',
    stack: error.stack,
    context: { scraper: 'Google Maps' }
});

// Send booking notification
await slack.notifyOnBooking({
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '+1-555-0123',
    appointmentTime: '2026-01-24T14:00:00Z',
    calendarType: 'Discovery Call',
    source: 'AI Receptionist'
});
```

### Collecting Metrics

```javascript
const MetricsCollector = require('./executions/utils/metrics-collector');
const collector = new MetricsCollector();

// Get metrics by module
const leadGenMetrics = await collector.getLeadGenMetrics();
const outreachMetrics = await collector.getOutreachMetrics();
const crmMetrics = await collector.getCRMMetrics();
const bookingMetrics = await collector.getBookingMetrics();

// Generate reports
const dailyReport = await collector.generateDailyReport();
const weeklyReport = await collector.generateWeeklyReport();
```

### Sending Reports

```javascript
const slack = new SlackNotifications();
const collector = new MetricsCollector();

// Generate and send daily report
const report = await collector.generateDailyReport();
await slack.sendDailyReport({
    leadGen: report.leadGen,
    outreach: report.outreach,
    crm: report.crm,
    booking: report.booking
});

// Generate and send weekly report
const weeklyReport = await collector.generateWeeklyReport();
await slack.sendWeeklyReport(weeklyReport);
```

## Key Metrics Tracked

### Lead Generation
- Leads scraped (total count)
- Leads enriched (successfully processed)
- Enrichment success rate (%)
- Data quality score (0-100)
- Scraper error count

### Cold Outreach
- Emails sent/delivered
- Open rate (%)
- Click rate (%)
- Reply rate (%)
- Bounce rate (%)
- Spam complaints

### CRM Integration
- Contacts created
- Opportunities created/won/lost
- Pipeline value ($)
- Average deal cycle (days)
- Conversion rates

### Booking System
- Booking requests/confirmed/completed
- No-show rate (%)
- AI call volume
- Qualified call rate (%)

## Alert Conditions

### Critical Alerts (Immediate Action)
- Error rate > 5% in 15-minute window
- Service downtime detected
- Calendar API failing (3 consecutive failures)
- API quota > 95%

### Warning Alerts (Monitor Closely)
- Email send rate drops > 30%
- Lead-to-booking conversion < 2%
- API quota > 80%
- Data quality score < 70

## Automation

### Schedule Daily Reports
Use cron or N8N to trigger daily reports:

```bash
# Cron example (9 AM daily)
0 9 * * * node /path/to/send-daily-report.js
```

### Schedule Weekly Reports
```bash
# Cron example (Monday 9 AM)
0 9 * * 1 node /path/to/send-weekly-report.js
```

### Continuous Monitoring
Run the metrics collector on an interval:

```javascript
setInterval(async () => {
    const collector = new MetricsCollector();
    const metrics = await collector.generateDailyReport();

    // Check alert conditions
    if (metrics.outreach.openRate < 30) {
        const slack = new SlackNotifications();
        await slack.sendAlert(
            '#agency-alerts',
            'Low email open rate detected',
            'WARNING',
            { openRate: metrics.outreach.openRate + '%' }
        );
    }
}, 5 * 60 * 1000); // Every 5 minutes
```

## Customization

### Adding New Metrics

1. **Add collection function** in `metrics-collector.js`:
```javascript
async getCustomMetrics() {
    // Your data collection logic
    return { metric1: value1, metric2: value2 };
}
```

2. **Update report generation** to include new metrics:
```javascript
const customMetrics = await this.getCustomMetrics();
report.custom = customMetrics;
```

3. **Add to Slack report** in `slack-notifications.js`:
```javascript
{
    type: 'section',
    text: {
        type: 'mrkdwn',
        text: `*Custom Metrics*\nMetric 1: ${metrics.custom.metric1}`
    }
}
```

### Adding New Alert Conditions

In your monitoring script:

```javascript
const collector = new MetricsCollector();
const slack = new SlackNotifications();
const metrics = await collector.generateDailyReport();

// Custom alert condition
if (metrics.custom.someValue > threshold) {
    await slack.sendAlert(
        '#agency-alerts',
        'Custom threshold exceeded',
        'WARNING',
        { value: metrics.custom.someValue, threshold }
    );
}
```

## Dashboard Customization

### Connect to Real API

In `pipeline-dashboard.html`, update the configuration:

```javascript
const API_ENDPOINT = 'https://your-api.com/metrics'; // Your actual endpoint
const USE_MOCK_DATA = false; // Disable mock data
```

### Change Refresh Interval

```javascript
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes instead of 5
```

### Modify Color Thresholds

```javascript
// In applyColorCoding function
if (data.outreach.openRate >= 50) { // Changed from 40
    openRate.className = 'metric-value good';
}
```

## Troubleshooting

### Slack Messages Not Sending

1. **Check webhook URL**: Verify `SLACK_WEBHOOK_URL` in `.env`
2. **Test connection**: Run `node tests/test-monitoring.js`
3. **Check permissions**: Ensure bot has `chat:write` scope
4. **Review logs**: Look for error messages in console

### Metrics Not Updating

1. **Check API clients**: Ensure all integration APIs are initialized
2. **Verify credentials**: Check `.env` file has all required API keys
3. **Clear cache**: Call `collector.clearCache()` to force refresh
4. **Check database connection**: Verify DATABASE_URL and REDIS_URL

### Dashboard Not Loading

1. **Open browser console**: Check for JavaScript errors
2. **Verify mock data**: Set `USE_MOCK_DATA = true` for testing
3. **Check API endpoint**: Ensure URL is correct if using real API
4. **Test locally**: Open directly from file system first

## Integration with Other Systems

### Prometheus/Grafana

Export metrics in Prometheus format:

```javascript
const metrics = await collector.generateDailyReport();
const prometheusFormat = `
# HELP leads_scraped Total leads scraped
# TYPE leads_scraped counter
leads_scraped ${metrics.leadGen.leadsScraped}
`;
```

### PagerDuty

Integrate critical alerts:

```javascript
if (errorRate > 0.05) {
    // Send to both Slack and PagerDuty
    await slack.sendAlert(channel, message, 'CRITICAL', metadata);
    await pagerduty.triggerIncident(message, metadata);
}
```

### Datadog

Send custom metrics:

```javascript
const StatsD = require('node-dogstatsd').StatsD;
const dogstatsd = new StatsD();

dogstatsd.gauge('agency.leads.scraped', metrics.leadGen.leadsScraped);
dogstatsd.gauge('agency.emails.sent', metrics.outreach.emailsSent);
```

## Best Practices

1. **Alert Fatigue**: Start with conservative thresholds and adjust based on actual performance
2. **Report Timing**: Schedule reports for times when team is likely to review them
3. **Data Retention**: Archive old metrics to prevent database bloat
4. **Testing**: Always test alerts in a dedicated test channel first
5. **Documentation**: Update the directive (`observability-setup.md`) when adding new metrics

## Support

For issues or questions:
1. Check the directive: `directives/monitoring/observability-setup.md`
2. Review test output: `node tests/test-monitoring.js`
3. Check system logs for error messages
4. Verify all environment variables are set correctly

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial monitoring system implementation |

---

**Built with the DOE Framework** - Separating directives (SOPs) from executions (code) for maximum flexibility and maintainability.
