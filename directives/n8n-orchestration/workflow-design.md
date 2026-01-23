# n8n Orchestration Workflow Design

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Runtime orchestration connecting all agency pipeline modules

---

## Objective Statement

Design and implement n8n workflows that orchestrate the complete lead-to-booking pipeline, connecting Apify scraping, email outreach (Instantly/SmartLead), GHL CRM, nurture sequences, AI receptionist, and calendar booking into a cohesive automated system.

---

## Workflow Architecture Overview

The n8n orchestration layer acts as the **central nervous system** of the agency pipeline, connecting discrete modules into end-to-end automation flows.

### Architecture Principles

1. **Event-Driven**: Workflows trigger on webhooks and scheduled events
2. **Modular**: Each workflow handles a specific pipeline stage
3. **Fault-Tolerant**: Error handling and retry logic at each critical node
4. **Observable**: Logging and notifications for monitoring
5. **Scalable**: Designed to handle high volumes with rate limiting

### System Flow Diagram

```
Apify Scraper
    ↓ (webhook)
[01-lead-ingestion.json]
    ↓
Instantly/SmartLead + GHL CRM
    ↓ (webhook on reply)
[02-reply-processing.json]
    ↓
AI Receptionist / Nurture Sequence
    ↓ (webhook on booking)
[03-booking-management.json]
    ↓
Calendar + GHL Pipeline Update

(+ Daily maintenance)
[04-daily-operations.json]
```

---

## Required Workflows

### 1. Lead Ingestion Workflow (`01-lead-ingestion.json`)

**Purpose**: Process scraped leads from Apify and inject into outreach systems

**Trigger**:
- Apify webhook (scrape run completed)
- Manual trigger for testing

**Process Flow**:
1. Receive webhook from Apify with dataset ID
2. Fetch complete lead dataset from Apify
3. Validate and enrich lead data (email validation, company lookup)
4. Filter out duplicates (check against GHL)
5. Format for Instantly/SmartLead CSV upload
6. Create bulk upload to email outreach platform
7. Create/update contacts in GHL CRM with "Cold Outreach" tag
8. Send success notification to Slack/email

**Error Handling**:
- API rate limits: Implement exponential backoff
- Invalid data: Log to error dataset, continue processing valid records
- Duplicate leads: Update existing records instead of failing
- Webhook timeout: Queue for retry (max 3 attempts)

**Definition of Done**:
- Leads successfully imported to outreach platform
- GHL contacts created with proper tags
- Success notification sent
- Error logs captured for failed records

---

### 2. Reply Processing Workflow (`02-reply-processing.json`)

**Purpose**: Analyze incoming email replies and route to appropriate next action

**Trigger**:
- Instantly webhook (reply received)
- SmartLead webhook (reply received)
- Manual trigger for testing

**Process Flow**:
1. Receive reply webhook with email content
2. Analyze sentiment with AI (positive/neutral/negative/out-of-office)
3. Extract intent (interested/not-interested/needs-info/book-meeting)
4. Update GHL contact with reply data and sentiment
5. Route based on intent:
   - **Interested**: Move to "Qualified" stage, trigger AI receptionist call
   - **Needs Info**: Add to nurture sequence, send info packet
   - **Book Meeting**: Send calendar link via SMS/email
   - **Not Interested**: Mark as "Closed Lost", remove from sequences
   - **Out of Office**: Snooze for 1 week, re-engage later
6. Log interaction to GHL timeline
7. Send notification to sales team for high-intent replies

**Error Handling**:
- AI analysis failure: Default to manual review queue
- GHL API error: Retry with exponential backoff
- Unknown intent: Route to manual review
- Duplicate processing: Check processed flag before executing

**Definition of Done**:
- Reply analyzed and categorized
- GHL contact updated with proper stage
- Appropriate next action triggered
- Sales team notified if high-intent

---

### 3. Booking Management Workflow (`03-booking-management.json`)

**Purpose**: Handle calendar bookings and synchronize with CRM pipeline

**Trigger**:
- Calendar webhook (booking created)
- Calendar webhook (booking updated)
- Calendar webhook (booking cancelled)
- Manual trigger for testing

**Process Flow**:
1. Receive booking webhook with event details
2. Identify booking type (new/update/cancel)
3. **For New Bookings**:
   - Update GHL contact to "Meeting Scheduled" stage
   - Send confirmation email with meeting details
   - Send confirmation SMS 24 hours before
   - Create preparation task for sales rep
   - Add to daily meeting digest
4. **For Updated Bookings**:
   - Update GHL opportunity with new time
   - Send updated confirmation to both parties
   - Update sales rep's calendar
5. **For Cancelled Bookings**:
   - Move GHL contact to "Meeting Cancelled" stage
   - Send cancellation confirmation
   - Trigger re-engagement sequence (48 hours later)
   - Notify sales rep
6. Log all actions to GHL timeline

**Error Handling**:
- GHL update failure: Queue for retry
- Email/SMS send failure: Log and alert admin
- Timezone mismatch: Validate and convert to contact's timezone
- Duplicate webhooks: Implement idempotency check

**Definition of Done**:
- GHL pipeline reflects current booking status
- Confirmations/reminders sent successfully
- Sales rep notified of changes
- Timeline logged in CRM

---

### 4. Daily Operations Workflow (`04-daily-operations.json`)

**Purpose**: Automated maintenance and reporting for pipeline health

**Trigger**:
- Cron schedule: Daily at 8:00 AM EST
- Manual trigger for testing

**Process Flow**:
1. **Stale Lead Detection**:
   - Query GHL for leads in "Contacted" stage > 7 days
   - Trigger follow-up sequence in Instantly
   - Update contact with "Follow-up Scheduled" note
2. **Pipeline Health Check**:
   - Count leads in each stage
   - Calculate conversion rates (contacted → replied → booked)
   - Identify bottlenecks (stages with > 100 leads)
3. **Data Quality Audit**:
   - Find contacts missing phone/email
   - Identify duplicate records
   - Flag incomplete lead data
4. **Daily Report Generation**:
   - Compile metrics: new leads, replies, bookings, revenue
   - Generate CSV export of yesterday's activity
   - Create visual dashboard summary
   - Send to Slack channel and email digest
5. **Cleanup Tasks**:
   - Archive contacts marked "Closed Lost" > 30 days
   - Clear temporary data from previous day
   - Prune old logs (keep last 90 days)

**Error Handling**:
- GHL query timeout: Retry with smaller batch size
- Report generation failure: Send error alert to admin
- Cleanup script errors: Log but don't block report
- Missing data: Use placeholder values and flag for review

**Definition of Done**:
- Daily report delivered to stakeholders
- Stale leads re-engaged
- Data quality issues flagged
- Cleanup tasks completed

---

## Cross-Workflow Error Handling Strategy

### Global Error Handling Principles

1. **Retry Logic**: All API calls use exponential backoff (1s, 2s, 4s, 8s)
2. **Dead Letter Queue**: Failed items after max retries go to error log
3. **Alerting**: Critical failures trigger Slack/email notifications
4. **Graceful Degradation**: Non-critical failures log but don't stop workflow
5. **Idempotency**: All workflows check for duplicate processing

### Error Notification Thresholds

- **Warning**: Single item failures (< 5% of batch)
- **Alert**: Batch failures (> 5% of items)
- **Critical**: Complete workflow failure or API downtime

### Monitoring & Observability

Each workflow includes:
- Execution time tracking
- Success/failure counts
- Error logs with stack traces
- Performance metrics (items/second)

---

## Technical Implementation Notes

### n8n Node Types Used

- **Webhook**: Receive triggers from external systems
- **HTTP Request**: Call external APIs (Apify, GHL, Instantly)
- **Code**: Custom JavaScript for complex logic
- **If/Switch**: Conditional routing
- **Set**: Data transformation
- **Error Trigger**: Catch and handle errors
- **Cron**: Schedule-based triggers
- **Slack/Email**: Notifications

### Data Format Standards

All workflows use consistent data formats:

```json
{
  "lead": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "title": "string",
    "source": "apify|manual|referral",
    "tags": ["array", "of", "strings"]
  },
  "metadata": {
    "workflowId": "string",
    "processedAt": "ISO8601 timestamp",
    "version": "1.0"
  }
}
```

### Environment Variables Required

All workflows reference these n8n credentials:
- `APIFY_API_TOKEN`
- `GHL_API_KEY`
- `INSTANTLY_API_KEY`
- `SMARTLEAD_API_KEY`
- `SLACK_WEBHOOK_URL`
- `CALENDAR_WEBHOOK_SECRET`

---

## Workflow Interconnections

### Data Flow Between Workflows

1. **Lead Ingestion → Reply Processing**:
   - Lead ID passed via GHL contact custom field
   - Campaign tracking via UTM parameters

2. **Reply Processing → Booking Management**:
   - Contact stage triggers calendar link send
   - Booking creates opportunity in GHL

3. **All Workflows → Daily Operations**:
   - Execution logs feed into health check
   - Error counts tracked for reporting

### Shared Functions

Create n8n workflow templates for reusable logic:
- Lead validation (email format, required fields)
- GHL contact upsert (create or update)
- Error notification formatting
- Retry with exponential backoff

---

## Testing & Validation

### Pre-Deployment Checklist

- [ ] All webhook URLs configured in external systems
- [ ] Environment variables set in n8n instance
- [ ] Test data prepared for each workflow
- [ ] Error handling tested with invalid data
- [ ] Rate limits configured for API calls
- [ ] Notifications routed to test channels

### Test Cases Per Workflow

**01-lead-ingestion.json**:
- Valid lead batch (10 leads)
- Duplicate lead detection
- Invalid email format handling
- API timeout simulation

**02-reply-processing.json**:
- Positive sentiment reply
- Negative sentiment reply
- Out-of-office auto-reply
- Unknown intent edge case

**03-booking-management.json**:
- New booking creation
- Booking time change
- Booking cancellation
- Duplicate webhook prevention

**04-daily-operations.json**:
- Stale lead detection accuracy
- Report generation completeness
- Error handling for missing data
- Cleanup without data loss

---

## Definition of Done

### Deliverables Checklist

- [x] Directive document created (`workflow-design.md`)
- [ ] `01-lead-ingestion.json` workflow created and tested
- [ ] `02-reply-processing.json` workflow created and tested
- [ ] `03-booking-management.json` workflow created and tested
- [ ] `04-daily-operations.json` workflow created and tested
- [ ] All workflows importable to n8n instance
- [ ] Environment variables documented
- [ ] Webhook URLs configured in external systems
- [ ] Test execution logs captured
- [ ] Error handling verified with edge cases

### Success Criteria

1. **Functional**: All workflows execute without errors on test data
2. **Integrated**: Workflows successfully trigger each other
3. **Resilient**: Error handling prevents cascading failures
4. **Observable**: Logs and notifications provide visibility
5. **Documented**: Clear setup instructions for deployment

### Handoff Requirements

Package includes:
- 4 workflow JSON files (importable to n8n)
- Environment variable template (`.env.example`)
- Setup guide (quick start instructions)
- Test data samples for each workflow
- Troubleshooting guide for common issues

---

## Future Enhancements

Potential additions for v2.0:
- A/B testing framework for email variants
- Predictive lead scoring with ML model
- Multi-language support for international outreach
- Advanced attribution tracking (multi-touch)
- White-label reporting for client dashboards

---

**Status**: Directive complete, workflows in development
**Next Step**: Implement workflow JSON files with full node configurations
