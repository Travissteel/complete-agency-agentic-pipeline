# GoHighLevel CRM Integration Directive

**Version:** 1.0.0
**Last Updated:** January 2026
**Framework:** DOE (Directive Orchestration Execution)
**Purpose:** Sync cold outreach leads and campaign replies into GoHighLevel CRM for pipeline management and client handoff

---

## Objective Statement

Automatically sync qualified leads from cold email campaigns (Instantly.ai/SmartLead) into GoHighLevel CRM, create contacts and opportunities, manage pipeline stages based on engagement level, and enable two-way communication via SMS and phone. This directive establishes GoHighLevel as the central CRM for agency lead management and white-labeled client delivery.

---

## Input Specifications

### Lead Data Format (from Instantly/SmartLead Webhooks)

**Positive Reply Webhook Payload:**
```json
{
  "eventType": "reply",
  "campaignId": "camp_abc123",
  "leadEmail": "john.smith@company.com",
  "leadName": "John Smith",
  "timestamp": "2026-01-19T14:30:00Z",
  "replyBody": "Yes, I'd be interested in learning more. Can you send me some information?",
  "replySubject": "Re: Insurance optimization for ABC Corp",
  "sentiment": "positive",
  "threadId": "thread_xyz789",
  "companyName": "ABC Insurance Corp",
  "jobTitle": "VP of Operations",
  "phone": "+13125551234",
  "website": "https://abcinsurance.com",
  "qualityScore": 85,
  "vertical": "commercial-insurance"
}
```

### Pipeline Structure

GoHighLevel pipeline stages for sales process:

1. **Lead** - Initial contact created, no engagement yet
2. **Contacted** - First email sent in campaign
3. **Replied** - Lead responded to outreach (any sentiment)
4. **Qualified** - Positive reply, expressed interest
5. **Booked** - Meeting scheduled via AI receptionist or calendar link
6. **Closed Won** - Deal signed, became client
7. **Closed Lost** - Not interested, out of budget, or disqualified

**Stage Transitions:**
- Auto-move from "Lead" → "Contacted" when email campaign starts
- Auto-move from "Contacted" → "Replied" on any reply webhook
- Auto-move from "Replied" → "Qualified" on positive sentiment reply
- Auto-move from "Qualified" → "Booked" when calendar event created
- Manual transition to "Closed Won" or "Closed Lost" by sales team

### Custom Field Mappings

**Contact Custom Fields:**
- `lead_source` - "Cold Email - [Vertical]"
- `campaign_name` - Original campaign name
- `quality_score` - Lead quality score (0-100)
- `sentiment` - Reply sentiment (positive, neutral, negative)
- `original_reply` - Full text of initial reply
- `company_size` - Employee count range
- `vertical` - Industry vertical
- `enrichment_date` - When lead was enriched

**Opportunity Custom Fields:**
- `estimated_value` - Projected deal size (calculated by vertical)
- `lead_temperature` - Hot, Warm, Cold
- `next_action` - Required follow-up action
- `ai_notes` - AI-generated summary of conversation

---

## Step-by-Step Process

### Phase 1: Initial Setup (One-Time Configuration)

#### 1.1 GoHighLevel Account Setup

1. **Create Location/Sub-Account**
   - For white-label: Create sub-account per client
   - For agency internal: Use single location
   - Configure location timezone, business hours

2. **Configure Custom Fields**
   - Navigate to Settings → Custom Fields
   - Create all contact custom fields listed above
   - Create all opportunity custom fields
   - Set field types (text, number, dropdown, etc.)

3. **Create Sales Pipeline**
   - Navigate to Opportunities → Pipelines
   - Create new pipeline: "Cold Outreach Pipeline"
   - Add stages as defined above
   - Set default probabilities:
     - Lead: 10%
     - Contacted: 15%
     - Replied: 25%
     - Qualified: 50%
     - Booked: 75%
     - Closed Won: 100%
     - Closed Lost: 0%

4. **API Authentication**
   - Navigate to Settings → API Keys
   - Generate new API key with scopes:
     - `contacts.write`
     - `contacts.read`
     - `opportunities.write`
     - `conversations.write`
     - `conversations/message.write`
     - `calendars.read`
     - `workflows.execute`
   - Store API key securely in `.env` file
   - Get Location ID from URL or API

#### 1.2 Webhook Configuration

1. **Set Up Incoming Webhooks**
   - Create webhook endpoint in n8n or custom server
   - Route: `/webhooks/gohighlevel/inbound`
   - Handle events: contact.created, opportunity.updated, calendar.booked

2. **Configure Outbound Webhooks**
   - In GoHighLevel: Settings → Webhooks
   - Add webhook URL for opportunity stage changes
   - Enable events: opportunity stage change, contact tag added

### Phase 2: Lead Sync Workflow

#### 2.1 New Lead Creation (from Cold Outreach)

**Trigger:** Instantly/SmartLead webhook for positive reply

**Process:**

1. **Receive Webhook**
   - Parse incoming webhook payload
   - Extract lead email, name, company, reply text
   - Validate required fields present

2. **Check for Existing Contact**
   - Use API: `searchContact(email)` or `searchContact(phone)`
   - If contact exists: Update existing record
   - If contact doesn't exist: Create new contact

3. **Create/Update Contact**
   - Use API: `createContact()` or `updateContact(contactId)`
   - Map webhook fields to GHL contact schema
   - Include custom fields (quality score, sentiment, etc.)
   - Add tags: `[vertical]`, `cold-outreach`, `replied`
   - Set source: "Cold Email Campaign"

4. **Create Opportunity**
   - Use API: `createOpportunity()`
   - Link opportunity to contact
   - Set pipeline stage based on engagement:
     - No reply yet: "Contacted"
     - Replied (any sentiment): "Replied"
     - Positive reply: "Qualified"
   - Set opportunity name: `[Company Name] - [Vertical] Deal`
   - Set estimated value (based on vertical averages):
     - Commercial Insurance: $5,000
     - Commercial Real Estate: $3,000
     - Recruitment: $4,000

5. **Add Initial Note**
   - Use API: `addNote()`
   - Note type: "Reply Received"
   - Content: Full reply text + AI sentiment analysis
   - Timestamp: Reply received time

6. **Trigger Follow-up Workflow**
   - Use API: `triggerWorkflow()`
   - Workflow ID: "New Qualified Lead Workflow"
   - Actions:
     - Send Slack notification to sales team
     - Assign to sales rep (round-robin or by vertical)
     - Create task: "Review reply and respond within 2 hours"

#### 2.2 Opportunity Stage Management

**Stage Update Triggers:**

1. **Lead → Contacted**
   - Trigger: Campaign email sent (from Instantly webhook)
   - Action: Update opportunity stage if exists

2. **Contacted → Replied**
   - Trigger: Any reply received
   - Action: Update stage, add reply as note

3. **Replied → Qualified**
   - Trigger: Positive sentiment reply detected
   - Action: Update stage, trigger sales assignment workflow

4. **Qualified → Booked**
   - Trigger: Calendar event created in GHL calendar
   - Action: Update stage, send confirmation SMS to lead

5. **Booked → Closed Won/Lost**
   - Trigger: Manual update by sales rep after meeting
   - Action: Update stage, trigger client onboarding or suppression workflow

### Phase 3: Two-Way Communication

#### 3.1 SMS Integration

**Use Cases:**
- Send booking confirmation when meeting scheduled
- Send reminders 1 hour before meeting
- Follow up after no-shows
- Re-engage cold leads after 30 days

**Process:**

1. **Send SMS**
   - Use API: `sendSMS(contactId, message)`
   - Check if contact has valid phone number
   - Use pre-approved SMS templates (TCPA compliance)
   - Log SMS in conversation history

2. **Receive SMS Reply**
   - GHL webhook: `conversation.message.received`
   - Parse incoming message
   - Route to appropriate workflow:
     - Booking confirmation: Update opportunity stage
     - Question: Create task for sales rep to respond
     - Opt-out: Add "do-not-contact" tag, remove from campaigns

#### 3.2 AI Receptionist Integration (Future)

**Integration Points:**
- When lead calls agency number (from email signature)
- AI answers, qualifies caller, books meeting
- AI creates calendar event in GHL
- Auto-updates opportunity stage to "Booked"
- Sends confirmation SMS via GHL

### Phase 4: Pipeline Reporting & Analytics

#### 4.1 Daily Metrics

**Track via GHL Reporting Dashboard:**
- New leads added (by vertical)
- Opportunity stage distribution
- Average time in each stage
- Conversion rates (stage to stage)
- Total pipeline value
- Closed Won revenue (MTD, QTD, YTD)

#### 4.2 Weekly Review

**Generate Reports:**
- Use API: `getOpportunities(filters)` to pull data
- Calculate metrics:
  - Reply rate → Qualified rate
  - Qualified → Booked rate
  - Booked → Closed Won rate
- Identify bottlenecks (stages with longest dwell time)
- Flag stale opportunities (>14 days in stage)

#### 4.3 Client White-Label Dashboards

**For Agency Clients:**
- Create read-only GHL sub-account
- Share pipeline view with client
- Automated weekly email report:
  - Leads generated this week
  - Meetings booked
  - Deals closed
  - Next week's scheduled meetings

---

## API Function Reference

### Contact Management

**createContact(contactData)**
```javascript
{
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@company.com",
  phone: "+13125551234",
  companyName: "ABC Insurance Corp",
  customFields: {
    lead_source: "Cold Email - Commercial Insurance",
    quality_score: 85,
    vertical: "commercial-insurance"
  },
  tags: ["commercial-insurance", "cold-outreach", "replied"]
}
```

**updateContact(contactId, updates)**
- Partial update, only include changed fields
- Use to update sentiment, add tags, etc.

**getContact(contactId)** or **searchContact(email/phone)**
- Retrieve existing contact to avoid duplicates
- Returns null if not found

### Opportunity Management

**createOpportunity(opportunityData)**
```javascript
{
  contactId: "contact_xyz123",
  pipelineId: "pipeline_abc",
  pipelineStage: "qualified",
  name: "ABC Insurance Corp - Commercial Insurance Deal",
  status: "open",
  monetaryValue: 5000,
  customFields: {
    estimated_value: 5000,
    lead_temperature: "hot",
    next_action: "Schedule discovery call"
  }
}
```

**updateOpportunityStage(opportunityId, newStage)**
- Move opportunity through pipeline
- Triggers stage change webhooks

**getOpportunity(opportunityId)**
- Retrieve current opportunity details

### Notes & Activity

**addNote(contactId, noteData)**
```javascript
{
  contactId: "contact_xyz123",
  body: "Replied with interest in insurance audit. Sentiment: Positive",
  userId: "user_abc" // Optional: assign to specific user
}
```

**addTask(contactId, taskData)**
```javascript
{
  contactId: "contact_xyz123",
  title: "Follow up on positive reply",
  dueDate: "2026-01-20T10:00:00Z",
  assignedTo: "user_abc"
}
```

### Communication

**sendSMS(contactId, message)**
```javascript
{
  contactId: "contact_xyz123",
  message: "Hi John, this is Sarah from [Agency]. Thanks for your interest! I've sent you a calendar link to book a quick call. Let me know if you have any questions.",
  type: "SMS"
}
```

**getConversations(contactId)**
- Retrieve SMS/email conversation history
- Returns array of messages with timestamps

### Workflow Automation

**triggerWorkflow(workflowId, contactId)**
- Manually trigger a workflow for a contact
- Use for: sales assignment, follow-up sequences, notifications

**getCalendarEvents(locationId, filters)**
- Check for upcoming meetings
- Use to update opportunity stages when meetings booked

---

## Sentiment-to-Stage Mapping

### Positive Sentiment
- **Keywords:** "interested", "yes", "tell me more", "send info", "schedule", "call me"
- **Action:** Move to "Qualified" stage
- **Follow-up:** Assign to sales rep, create task, send calendar link

### Neutral Sentiment
- **Keywords:** "not sure", "maybe", "tell me more first", "what does it cost"
- **Action:** Keep in "Replied" stage
- **Follow-up:** Send additional info via automated workflow, follow up in 3 days

### Negative Sentiment
- **Keywords:** "not interested", "remove me", "unsubscribe", "stop emailing"
- **Action:** Move to "Closed Lost" stage
- **Follow-up:** Add "not-interested" tag, suppress from future campaigns

### Out of Office
- **Keywords:** "out of office", "on vacation", "currently unavailable"
- **Action:** Keep in "Contacted" stage
- **Follow-up:** Pause campaign, retry after return date

---

## Error Handling & Edge Cases

### Common Issues

**1. Duplicate Contact Creation**
- **Diagnosis:** Same email added multiple times from different campaigns
- **Solution:** Always search before create, use email as unique identifier
- **Prevention:** Implement robust deduplication in mapper utility

**2. API Rate Limits (100 requests/minute)**
- **Diagnosis:** Too many sync operations in short time
- **Solution:** Implement request queue with exponential backoff
- **Prevention:** Batch operations where possible, cache contact lookups

**3. Invalid Phone Numbers**
- **Diagnosis:** Phone number format not E.164 compliant
- **Solution:** Standardize phone numbers before sending to GHL
- **Prevention:** Use phone validation in lead enrichment phase

**4. Missing Required Fields**
- **Diagnosis:** Webhook payload missing firstName, lastName, or email
- **Solution:** Use fallbacks (parse from full name, use company name)
- **Prevention:** Validate webhook payloads before processing

**5. Webhook Delivery Failures**
- **Diagnosis:** GHL webhook endpoint unreachable or timeout
- **Solution:** Implement retry logic (3 attempts with exponential backoff)
- **Prevention:** Use reliable hosting, set up monitoring alerts

**6. OAuth Token Expiration**
- **Diagnosis:** API key revoked or expired (for OAuth-based auth)
- **Solution:** Implement token refresh logic
- **Prevention:** Use long-lived API keys for server-to-server, monitor token expiry

### Self-Annealing Notes

**Learnings from Integration Testing:**
- GoHighLevel requires `locationId` for all API calls - must be stored in env
- Contact search by email is case-insensitive, but phone search requires exact E.164 format
- Custom fields must be created in UI before API will accept them (throws error otherwise)
- Pipeline stages are location-specific - cannot share across locations
- SMS requires opt-in for compliance - don't auto-send without consent
- Workflow triggers are async - may take 5-10 seconds to execute

**Common Mistakes to Avoid:**
- Don't create opportunities without a contact (will fail validation)
- Don't send SMS after 9pm local time (TCPA violation)
- Don't update contact without checking if field exists (throws error)
- Don't use HTML in notes (renders as plain text anyway)
- Don't hardcode pipeline/stage IDs (they change per location)

**Best Practices:**
- Always include `source` field for contact attribution
- Use tags liberally for segmentation and filtering
- Set opportunity monetary values for accurate pipeline reporting
- Add notes for all significant events (replies, calls, meetings)
- Use workflows for repetitive tasks (assignment, notifications)
- Implement idempotency keys for webhook processing (prevent duplicate creates)

---

## Definition of Done

A GoHighLevel CRM integration is considered **complete and successful** when:

✅ **Configuration:**
- [ ] GoHighLevel location/sub-account created
- [ ] Sales pipeline created with all stages
- [ ] Custom fields configured (contact + opportunity)
- [ ] API key generated and stored in `.env`
- [ ] Location ID retrieved and stored
- [ ] Webhooks configured (inbound and outbound)

✅ **API Integration:**
- [ ] `gohighlevel-api.js` implemented with all functions
- [ ] OAuth/API key authentication working
- [ ] Rate limiting handled with exponential backoff
- [ ] Error handling for all API calls
- [ ] Webhook handler implemented and tested

✅ **Lead Sync:**
- [ ] Positive reply webhook triggers contact creation
- [ ] Duplicate detection working (search before create)
- [ ] Contact custom fields mapped correctly
- [ ] Opportunity auto-created and linked to contact
- [ ] Initial note added with reply text
- [ ] Tags applied correctly

✅ **Stage Automation:**
- [ ] Stage transitions triggered by webhooks
- [ ] Sentiment-based stage mapping working
- [ ] Manual stage updates possible via API
- [ ] Stage change webhooks firing correctly

✅ **Communication:**
- [ ] SMS sending functional
- [ ] SMS replies processed via webhook
- [ ] Conversation history visible in GHL
- [ ] Calendar event integration working

✅ **Testing:**
- [ ] Test contact created successfully
- [ ] Test opportunity created and updated
- [ ] Test note and task added
- [ ] Test SMS sent and received
- [ ] Test webhook processing (positive, neutral, negative replies)
- [ ] Test duplicate prevention (same email twice)

✅ **Monitoring:**
- [ ] Pipeline dashboard accessible
- [ ] Metrics tracked (conversion rates, stage times)
- [ ] Error logging implemented
- [ ] Alert notifications configured

✅ **Documentation:**
- [ ] All API functions documented in code
- [ ] Environment variables documented in README
- [ ] Self-annealing notes updated with learnings
- [ ] White-label setup guide created (if applicable)

---

## Integration with Other Directives

### Upstream Dependencies
- **Cold Outreach Directive** → Provides reply webhooks to sync
- **Lead Enrichment Process** → Provides quality scores and data

### Downstream Workflows
- **AI Receptionist Directive** → Syncs call outcomes and bookings to GHL
- **Calendar Booking Directive** → Creates GHL calendar events, updates stages
- **Nurture Sequences Directive** → Uses GHL tags for segmentation
- **Client Reporting Directive** → Pulls GHL data for white-label reports

---

## White-Label Configuration

### For Agency Clients (Multi-Tenant Setup)

**Location Structure:**
- Agency account: Master account
- Client 1: Sub-account with white-labeled branding
- Client 2: Sub-account with white-labeled branding
- Each client sees only their leads/opportunities

**Branding Customization:**
- Company logo and colors
- Custom domain for SMS sender ID
- Branded email templates
- Custom pipeline stages (if client requests)

**Data Isolation:**
- Each sub-account has separate API key
- Webhook endpoints route by location ID
- No cross-contamination of leads

**Reporting:**
- Client-facing dashboard (limited permissions)
- Automated weekly reports via email
- Export capability for client's data only

---

## Compliance & Security

### Data Privacy
- Store API keys in `.env` file, never commit to git
- Use HTTPS for all webhook endpoints
- Encrypt sensitive data in transit and at rest
- Implement access controls (RBAC) for team members

### SMS Compliance (TCPA)
- Only send SMS to contacts who provided phone number voluntarily
- Include opt-out instructions in first SMS
- Honor opt-out requests immediately
- Don't send SMS before 8am or after 9pm (recipient's timezone)

### Email Compliance (CAN-SPAM)
- Include physical address in email footer
- Provide unsubscribe mechanism
- Sync unsubscribes from GHL back to email platform

---

## Troubleshooting Guide

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Contact not created | Missing required fields | Ensure firstName, lastName, email present |
| Opportunity creation fails | Contact doesn't exist | Create contact first, then opportunity |
| SMS not sending | Invalid phone format | Convert to E.164 format (+1XXXXXXXXXX) |
| API 429 error | Rate limit exceeded | Implement request queue with delays |
| Webhook not received | Endpoint unreachable | Check firewall, verify URL, test with curl |
| Duplicate contacts | No search before create | Use `searchContact()` before `createContact()` |
| Custom field error | Field doesn't exist in GHL | Create custom field in GHL UI first |
| Stage update fails | Invalid stage ID | Use `getPipeline()` to get correct stage IDs |

---

## Version History

- **v1.0.0** (Jan 2026): Initial directive created with full pipeline automation
- Self-annealing updates will be appended here as integration runs and learnings accumulate

---

**Next Steps After Integration:**
1. Test with 5-10 sample leads from Instantly webhook
2. Verify contact creation, opportunity linking, stage transitions
3. Validate SMS sending and conversation tracking
4. Monitor for 48 hours, fix any edge cases
5. Scale to production with full campaign volume

**For execution code, see:**
- `executions/integrations/gohighlevel-api.js`
- `executions/utils/lead-to-ghl-mapper.js`
