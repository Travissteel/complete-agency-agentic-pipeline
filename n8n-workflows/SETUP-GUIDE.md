# n8n Workflow Setup Guide

## Quick Start

This guide will help you import and configure the agency pipeline n8n workflows.

---

## Prerequisites

1. **n8n Instance**: Running n8n (self-hosted or cloud)
2. **API Credentials**: Access to all integrated services
3. **Webhook URLs**: Endpoints for external systems to call

---

## Installation Steps

### 1. Import Workflows

In your n8n instance:

1. Navigate to **Workflows** → **Import from File**
2. Import each workflow in order:
   - `01-lead-ingestion.json`
   - `02-reply-processing.json`
   - `03-booking-management.json`
   - `04-daily-operations.json`
3. Activate each workflow after configuration

### 2. Configure Credentials

Set up these credential types in n8n:

#### Apify API
- **Type**: Apify API
- **Credential Name**: `apify-api-key`
- **API Token**: Your Apify API token

#### GoHighLevel API
- **Type**: GoHighLevel API
- **Credential Name**: `ghl-api-key`
- **API Key**: Your GHL API key
- **Location ID**: Your GHL location ID

#### Instantly API
- **Type**: HTTP Header Auth
- **Credential Name**: `instantly-api-key`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_INSTANTLY_API_KEY`

#### SmartLead API (Optional)
- **Type**: HTTP Header Auth
- **Credential Name**: `smartlead-api-key`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_SMARTLEAD_API_KEY`

#### OpenAI API
- **Type**: OpenAI API
- **Credential Name**: `openai-api-key`
- **API Key**: Your OpenAI API key

#### Slack Webhook
- **Type**: Slack API
- **Credential Name**: `slack-webhook`
- **Webhook URL**: Your Slack webhook URL

#### SMTP (Email Sending)
- **Type**: SMTP
- **Credential Name**: `smtp-config`
- **Host**: Your SMTP host
- **Port**: 587 (or your port)
- **User**: Your email
- **Password**: Your email password

### 3. Set Environment Variables

In your n8n instance, configure these environment variables:

```bash
# Apify
APIFY_API_TOKEN=your_token_here

# GoHighLevel
GHL_API_KEY=your_api_key_here
GHL_PIPELINE_ID=your_pipeline_id
GHL_STAGE_MEETING_SCHEDULED=stage_id_here
GHL_STAGE_MEETING_UPDATED=stage_id_here
GHL_STAGE_MEETING_CANCELLED=stage_id_here

# Instantly
INSTANTLY_API_KEY=your_api_key_here
INSTANTLY_CAMPAIGN_ID=your_campaign_id_here
INSTANTLY_FOLLOWUP_CAMPAIGN_ID=your_followup_campaign_id

# SmartLead (Optional)
SMARTLEAD_API_KEY=your_api_key_here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Slack
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Calendar
CALENDAR_BOOKING_LINK=your_calendly_or_cal_link
CALENDAR_WEBHOOK_SECRET=your_webhook_secret

# Internal Webhooks
AI_RECEPTIONIST_WEBHOOK=https://your-n8n.com/webhook/ai-receptionist
NURTURE_WORKFLOW_WEBHOOK=https://your-n8n.com/webhook/nurture

# Reporting
REPORT_EMAIL_RECIPIENTS=team@company.com,manager@company.com
```

### 4. Configure External Webhooks

Get the webhook URLs from each n8n workflow and configure them in external systems:

#### Apify → n8n (Workflow 01)
1. In n8n workflow **01-lead-ingestion**, copy the webhook URL
2. In Apify, go to your scraper's **Integrations** → **Webhooks**
3. Add webhook with event type: **Run succeeded**
4. URL: `https://your-n8n-instance.com/webhook/apify-webhook`

#### Instantly → n8n (Workflow 02)
1. In n8n workflow **02-reply-processing**, copy the webhook URL
2. In Instantly, go to **Settings** → **Webhooks**
3. Add webhook for event: **Reply received**
4. URL: `https://your-n8n-instance.com/webhook/email-reply`

#### Calendar → n8n (Workflow 03)
1. In n8n workflow **03-booking-management**, copy the webhook URL
2. In your calendar app (Calendly/Cal.com):
   - Calendly: **Settings** → **Webhooks** → **Add Webhook**
   - Cal.com: **Settings** → **Developer** → **Webhooks**
3. Subscribe to events: **invitee.created**, **invitee.canceled**
4. URL: `https://your-n8n-instance.com/webhook/calendar-webhook`

---

## Testing Each Workflow

### Test 01: Lead Ingestion

**Manual Test:**
1. In n8n, open workflow **01-lead-ingestion**
2. Click **Execute Workflow** (manual trigger)
3. Provide test data:
```json
{
  "datasetId": "test_dataset_id"
}
```

**Live Test:**
1. Run an Apify scraper
2. Check n8n execution log
3. Verify leads appear in Instantly and GHL

**Expected Result:**
- Leads validated and cleaned
- GHL contacts created
- Instantly campaign populated
- Slack notification sent

### Test 02: Reply Processing

**Manual Test:**
1. In n8n, open workflow **02-reply-processing**
2. Click **Execute Workflow**
3. Provide test data:
```json
{
  "messageId": "test123",
  "from": {
    "email": "test@example.com",
    "name": "Test User"
  },
  "subject": "Re: Your outreach",
  "body": "Yes, I'm interested in learning more!",
  "source": "instantly"
}
```

**Live Test:**
1. Reply to an outreach email
2. Check n8n execution log
3. Verify GHL contact updated with sentiment

**Expected Result:**
- AI analyzes sentiment
- Contact routed based on intent
- GHL updated with reply data
- Appropriate action triggered

### Test 03: Booking Management

**Manual Test:**
1. In n8n, open workflow **03-booking-management**
2. Click **Execute Workflow**
3. Provide test data:
```json
{
  "eventId": "evt_test123",
  "type": "created",
  "attendee": {
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+1234567890"
  },
  "startTime": "2026-01-25T14:00:00Z",
  "timezone": "America/New_York"
}
```

**Live Test:**
1. Book a test meeting via calendar link
2. Check n8n execution log
3. Verify confirmation email sent

**Expected Result:**
- GHL opportunity created
- Contact moved to "Meeting Scheduled"
- Confirmation email sent
- Reminder scheduled

### Test 04: Daily Operations

**Manual Test:**
1. In n8n, open workflow **04-daily-operations**
2. Click **Execute Workflow** (manual trigger)
3. Cron will run automatically daily at 8am EST

**Expected Result:**
- Stale leads detected and re-engaged
- Daily report generated
- CSV report sent to Slack and email
- Old contacts archived

---

## Monitoring & Troubleshooting

### Check Workflow Executions

1. Go to **Executions** in n8n sidebar
2. Filter by workflow name
3. Click on execution to see detailed logs

### Common Issues

#### Issue: Webhook not triggering
**Solution:**
- Check webhook URL is correct in external system
- Verify webhook is active in n8n
- Test with manual trigger first

#### Issue: API authentication failed
**Solution:**
- Verify credentials are set correctly
- Check API keys haven't expired
- Test API keys with external tools (Postman)

#### Issue: No data flowing between nodes
**Solution:**
- Check node connections (arrows between nodes)
- Verify data format matches expected input
- Add **Code** node to log data: `console.log($input.all())`

#### Issue: GHL custom fields not updating
**Solution:**
- Verify custom field IDs match your GHL account
- Check field types match (text, date, number)
- Update field IDs in workflow code nodes

### Performance Optimization

**For High Volume:**
1. Enable **Execution Mode**: Webhook responses should return immediately
2. Use **Queue Mode** for n8n (requires Redis)
3. Adjust **Batch Size** in code nodes (process 100 items at a time)
4. Add **Rate Limiting** nodes before API calls

**For Better Reliability:**
1. Enable **Retry on Fail** for all API nodes (set to 2-3 retries)
2. Add **Error Trigger** nodes to catch failures
3. Set up **Monitoring Webhooks** to external alerting (PagerDuty, etc.)

---

## Customization Guide

### Modify AI Sentiment Analysis

In workflow **02-reply-processing**, node **AI Sentiment Analysis**:

```javascript
// Adjust temperature for more/less creative responses
"temperature": 0.3  // Lower = more deterministic

// Add custom intents
"intent": "interested|not-interested|needs-info|book-meeting|pricing-question|unclear"

// Add custom sentiment categories
"sentiment": "positive|neutral|negative|out-of-office|angry|excited"
```

### Change Follow-up Timing

In workflow **04-daily-operations**, node **Find Stale Leads**:

```javascript
// Change from 7 days to 5 days
"fieldValue": "={{ $now.minus({ days: 5 }).toISO() }}"
```

### Add New Routing Logic

In workflow **02-reply-processing**, add new branch in **Route by Intent** node:

1. Click **Add Routing Rule**
2. Set condition: `{{ $json.analysis.intent }} equals pricing-question`
3. Connect to new **Send Pricing Sheet** node

### Customize Daily Report

In workflow **04-daily-operations**, node **Generate Daily Report**:

```javascript
// Add custom metrics
metrics.customMetrics = {
  highValueLeads: contacts.filter(c => c.customFields?.company_size > 100).length,
  urgentFollowUps: contacts.filter(c => c.tags?.includes('urgent')).length
};
```

---

## Maintenance Schedule

### Daily
- Review execution logs for errors
- Check Slack notifications for anomalies

### Weekly
- Review conversion rate trends
- Audit data quality issues
- Update follow-up templates if needed

### Monthly
- Review API usage and costs
- Optimize slow workflows
- Update AI prompts based on performance
- Archive old execution logs

---

## Support & Resources

### Documentation
- [n8n Documentation](https://docs.n8n.io)
- [GoHighLevel API Docs](https://highlevel.stoplight.io)
- [Instantly API Docs](https://developer.instantly.ai)
- [Apify API Docs](https://docs.apify.com/api/v2)

### Community
- n8n Community Forum
- n8n Discord Server
- Stack Overflow (tag: n8n)

### Escalation
If workflows fail consistently:
1. Check n8n system status
2. Verify all external APIs are operational
3. Review recent changes to integrations
4. Contact support for integrated services

---

## Version History

- **v1.0** (2026-01-23): Initial release with 4 core workflows
  - Lead ingestion from Apify
  - Reply processing with AI analysis
  - Booking management
  - Daily operations & reporting

---

**Next Steps:**
1. Import all workflows
2. Configure credentials
3. Set environment variables
4. Test each workflow manually
5. Configure external webhooks
6. Monitor first 24 hours closely
7. Optimize based on volume and performance

For questions or issues, refer to the main directive: `directives/n8n-orchestration/workflow-design.md`
