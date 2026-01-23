# Nurture Sequence Automation Directive

**Version:** 1.0.0
**Last Updated:** January 2026
**Framework:** DOE (Directive Orchestration Execution)
**Purpose:** Automate email and SMS follow-up sequences for leads who don't convert immediately, using GoHighLevel workflows to nurture based on pipeline stage and sentiment

---

## Objective Statement

Create and deploy automated nurture sequences that keep leads engaged throughout the sales cycle. This directive covers follow-up automation for leads at different pipeline stages (replied but not qualified, qualified but not booked, booked but no-show, closed lost) using both email and SMS channels via GoHighLevel. The goal is to maximize conversion rates by providing timely, relevant touchpoints without manual intervention.

---

## Input Specifications

### Lead State Data (from GoHighLevel)

**Contact Data with Pipeline Context:**
```json
{
  "contactId": "contact_xyz123",
  "email": "john.smith@company.com",
  "phone": "+13125551234",
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "ABC Insurance Corp",
  "pipelineStage": "replied",
  "opportunityId": "opp_abc789",
  "lastActivity": "2026-01-15T10:30:00Z",
  "daysSinceLastActivity": 3,
  "sentiment": "neutral",
  "vertical": "commercial-insurance",
  "qualityScore": 75,
  "tags": ["commercial-insurance", "cold-outreach", "replied"],
  "customFields": {
    "lead_temperature": "warm",
    "original_reply": "Tell me more about your services",
    "campaign_name": "Insurance-Jan-2026"
  }
}
```

### Trigger Conditions

Nurture sequences are triggered by:

1. **Time-Based Triggers**
   - No activity for X days in current stage
   - Scheduled re-engagement (monthly for cold leads)
   - Pre-meeting reminders (24 hours, 1 hour before)

2. **Stage Change Triggers**
   - Lead moves to specific stage (replied, qualified, etc.)
   - Lead stays in stage beyond threshold (7 days in "qualified")
   - Lead moves to "closed lost" (long-term nurture)

3. **Activity-Based Triggers**
   - No response to last outreach after 3 days
   - Calendar invite sent but not accepted (48 hours)
   - Meeting booked but not confirmed (24 hours before)
   - No-show for scheduled meeting

### Pipeline Stage Definitions

**Replied but Not Qualified**
- Lead responded to outreach but sentiment is neutral
- No clear buying intent yet
- Goal: Warm them up, provide value, move to qualified

**Qualified but Not Booked**
- Lead expressed interest but hasn't scheduled meeting
- Showed positive sentiment but didn't take action
- Goal: Push for meeting, overcome objections

**Booked but No-Show**
- Meeting was scheduled but lead didn't attend
- Shows interest but low commitment level
- Goal: Reschedule, understand barriers

**Closed Lost**
- Lead said "not interested" or disqualified
- Not ready now but might be in future
- Goal: Long-term nurture (monthly), stay top of mind

---

## Step-by-Step Process

### Phase 1: Sequence Configuration (One-Time Setup)

#### 1.1 GoHighLevel Workflow Creation

For each nurture sequence:

1. **Navigate to Automations → Workflows**
2. **Create New Workflow** with trigger condition
3. **Set Trigger Type:**
   - "Opportunity Stage Changed" for stage-based
   - "Contact Tag Added" for activity-based
   - "Wait" node for time-based delays
4. **Configure Workflow Settings:**
   - Name: "Nurture - [Stage Name]"
   - Trigger: Specific stage or tag
   - Enrollment: Allow re-enrollment if conditions met again

#### 1.2 Template Storage

All email and SMS templates stored in:
- GoHighLevel: Email Templates section
- Codebase: `executions/utils/nurture-sequences.js` for reference
- Templates include merge fields: `{{contact.firstName}}`, `{{contact.companyName}}`, etc.

### Phase 2: Sequence Implementation by Stage

#### 2.1 Sequence: Replied but Not Qualified

**Trigger:** Lead replied to cold outreach with neutral sentiment, been in "Replied" stage for 2+ days

**Goal:** Provide value, build trust, move to qualified

**Channel Strategy:** Email-first, SMS if no response after 7 days

**Sequence Flow:**

**Day 0: Value-Add Email (Educational)**
- **Subject:** "Resource for {{contact.companyName}}"
- **Content:** Industry-specific guide, checklist, or case study
- **CTA:** Soft ask - "Would this be helpful for your team?"
- **Timing:** Send 2 days after initial reply

**Day 3: Social Proof Email**
- **Subject:** "How [Similar Company] solved [pain point]"
- **Content:** Customer success story relevant to their vertical
- **CTA:** "Want to see if we can do something similar?"
- **Timing:** 3 days after first nurture email

**Day 7: SMS Follow-up (If No Email Response)**
- **Content:** "Hi {{contact.firstName}}, it's [Your Name] from [Agency]. I sent you a resource about [topic]. Did you get a chance to check it out? Happy to answer any questions."
- **Character Limit:** 160 characters max
- **Timing:** Only send if no email opened in past 7 days

**Day 10: Final Email (Question-Based)**
- **Subject:** "Quick question, {{contact.firstName}}"
- **Content:** Ask about their specific challenge, show genuine interest
- **CTA:** "If you're open to chatting for 10 mins, here's my calendar"
- **Timing:** 10 days after initial reply

**Exit Conditions:**
- Lead replies → Move to "Qualified" stage
- Lead books meeting → Move to "Booked" stage
- Lead unsubscribes → Add to suppression list
- No response after 14 days → Pause sequence, move to long-term nurture

#### 2.2 Sequence: Qualified but Not Booked

**Trigger:** Lead is in "Qualified" stage for 3+ days without booking meeting

**Goal:** Overcome objections, make booking easy, secure commitment

**Channel Strategy:** Multi-channel (Email + SMS)

**Sequence Flow:**

**Day 0: Calendar Reminder Email**
- **Subject:** "Ready to connect, {{contact.firstName}}?"
- **Content:** Remind them you're available, show calendar availability
- **CTA:** "Pick a time that works for you: [Calendar Link]"
- **Timing:** 3 days after moving to qualified stage

**Day 2: SMS Nudge**
- **Content:** "Hi {{contact.firstName}}, saw you were interested in [service]. I have a few open slots this week - would 15 mins work for a quick chat? [Calendar Link]"
- **Character Limit:** 160 characters
- **Timing:** 2 days after calendar email if not opened

**Day 4: Objection-Handling Email**
- **Subject:** "Is this the right time?"
- **Content:** Address common objections (timing, budget, fit)
- **CTA:** "If now's not the right time, when should I follow up?"
- **Timing:** 4 days after first email

**Day 7: Final Push (Scarcity/FOMO)**
- **Subject:** "Closing {{contact.companyName}}'s file"
- **Content:** Breakup-style email, create urgency
- **CTA:** "Last chance to schedule - respond if still interested"
- **Timing:** 7 days after first email

**Exit Conditions:**
- Meeting booked → Move to "Booked" stage, start pre-meeting sequence
- Lead says "not interested" → Move to "Closed Lost"
- No response after 10 days → Move to "Closed Lost" or long-term nurture

#### 2.3 Sequence: Booked but No-Show

**Trigger:** Calendar event passed but lead didn't join meeting (no-show status)

**Goal:** Reschedule meeting, understand what happened, maintain relationship

**Channel Strategy:** Immediate SMS, followed by email

**Sequence Flow:**

**Day 0 (1 hour after missed meeting): SMS**
- **Content:** "Hi {{contact.firstName}}, we had a meeting scheduled for [time] but I didn't see you join. Everything okay? If you need to reschedule, here's my calendar: [Link]"
- **Character Limit:** 160 characters
- **Timing:** 1 hour after scheduled meeting end time

**Day 1: Follow-up Email**
- **Subject:** "Did we miss each other?"
- **Content:** Friendly, non-judgmental tone. Acknowledge they're busy.
- **CTA:** "If you're still interested, let's find a better time: [Calendar Link]"
- **Timing:** 1 day after no-show

**Day 3: SMS Check-In**
- **Content:** "{{contact.firstName}}, just checking - are you still looking to improve [pain point] at {{contact.companyName}}? Happy to reschedule if timing works better next week."
- **Timing:** 3 days after no-show

**Day 7: Final Attempt Email**
- **Subject:** "Should I follow up later?"
- **Content:** Ask if now is not the right time, offer to reconnect in 30/60/90 days
- **CTA:** "Reply with when I should circle back"
- **Timing:** 7 days after no-show

**Exit Conditions:**
- Meeting rescheduled → Back to "Booked" stage
- Lead says "not interested" → Move to "Closed Lost"
- No response after 10 days → Move to "Closed Lost" with tag "no-show-unresponsive"

#### 2.4 Sequence: Closed Lost (Long-Term Nurture)

**Trigger:** Opportunity moved to "Closed Lost" stage (not interested, bad timing, out of budget)

**Goal:** Stay top-of-mind, re-engage when timing is better, maintain relationship

**Channel Strategy:** Email-only, low frequency (monthly)

**Sequence Flow:**

**Month 1: Value-First Email**
- **Subject:** "Thought of you - [Industry Insight]"
- **Content:** Share valuable industry report, trend, or news (no sales pitch)
- **CTA:** None - pure value add
- **Timing:** 30 days after closed lost

**Month 2: Check-In Email**
- **Subject:** "Quick check-in, {{contact.firstName}}"
- **Content:** Ask how things are going, if priorities have changed
- **CTA:** "If [pain point] becomes a priority, I'm here"
- **Timing:** 60 days after closed lost

**Month 3: Resource Email**
- **Subject:** "[Vertical] checklist for Q2"
- **Content:** Seasonal or timely resource relevant to their business
- **CTA:** Soft offer to help if needed
- **Timing:** 90 days after closed lost

**Month 6+: Quarterly Check-Ins**
- **Subject:** "Still thinking of {{contact.companyName}}"
- **Content:** Brief update on your offerings, new case study
- **CTA:** "Let me know if timing is better now"
- **Timing:** Every 90 days indefinitely

**Exit Conditions:**
- Lead replies with interest → Move back to "Qualified" stage
- Lead unsubscribes → Remove from all nurture
- Lead changes company (detected via enrichment) → Update record, continue nurture at new company

### Phase 3: Template Personalization

#### 3.1 Merge Field Variables

**Standard Variables:**
- `{{contact.firstName}}` - First name
- `{{contact.lastName}}` - Last name
- `{{contact.companyName}}` - Company name
- `{{contact.email}}` - Email address
- `{{contact.phone}}` - Phone number
- `{{opportunity.name}}` - Opportunity name
- `{{opportunity.stage}}` - Current stage

**Custom Variables:**
- `{{contact.customField.vertical}}` - Industry vertical
- `{{contact.customField.lead_temperature}}` - Hot/Warm/Cold
- `{{contact.customField.original_reply}}` - Their initial reply
- `{{contact.customField.quality_score}}` - Lead quality (0-100)
- `{{user.firstName}}` - Assigned sales rep name
- `{{user.email}}` - Sales rep email
- `{{user.calendarLink}}` - Personal calendar link

#### 3.2 Dynamic Content Rules

**By Vertical:**
- Commercial Insurance: Emphasize risk reduction, cost savings
- Commercial Real Estate: Focus on vacancy reduction, tenant quality
- Recruitment: Highlight time savings, placement volume

**By Lead Temperature:**
- Hot (replied within 24 hours): More aggressive CTA, shorter sequence
- Warm (replied 2-7 days): Standard sequence
- Cold (no reply >7 days): Longer sequence, more value-first content

**By Company Size:**
- Small (10-50 employees): Emphasize simplicity, ease of implementation
- Medium (50-200): Focus on scalability, ROI
- Large (200+): Highlight enterprise features, integration capabilities

### Phase 4: SMS Best Practices

#### 4.1 Timing Guidelines

**Best Times to Send SMS:**
- Weekdays: 9 AM - 7 PM (recipient's timezone)
- Avoid: Before 8 AM, after 8 PM, weekends (unless B2C)
- Optimal: 10 AM - 12 PM, 2 PM - 4 PM

**Frequency Limits:**
- Maximum 2 SMS per week during active nurture
- Minimum 3 days between SMS messages
- No SMS if lead has not responded to last 2 messages

#### 4.2 Character Limits & Formatting

**Technical Limits:**
- 160 characters = 1 SMS segment (no additional cost)
- 161-306 characters = 2 segments (doubled cost)
- Emojis count as 2 characters

**Best Practices:**
- Keep under 160 characters when possible
- Use short links (Bitly, GoHighLevel short links)
- Avoid emojis in B2B SMS
- Include name/company for context
- Always include opt-out language in first SMS

**Example SMS Structure:**
```
Hi [Name], it's [Your Name] from [Company]. [Value prop in 1 sentence]. [CTA with link]. Reply STOP to opt out.
```

#### 4.3 Compliance (TCPA)

**Required Elements:**
- First SMS must include: "Reply STOP to opt out"
- Honor opt-out immediately (within seconds)
- Don't send SMS to leads who didn't provide phone number
- Document consent (they provided number on form/email)
- Time restrictions: 8 AM - 9 PM local time only

### Phase 5: Email Best Practices

#### 5.1 Subject Line Guidelines

**For Nurture Emails:**
- Keep under 50 characters
- Use personalization (first name, company name)
- Avoid spam words (free, guaranteed, act now)
- Question-based subject lines perform well in nurture
- Use "Re:" prefix for follow-ups (maintains thread context)

**Examples by Stage:**
- Replied: "Resource for {{contact.companyName}}"
- Qualified: "Ready to connect, {{contact.firstName}}?"
- No-Show: "Did we miss each other?"
- Closed Lost: "Thought of you - [Industry Insight]"

#### 5.2 Email Length & Format

**Optimal Length:**
- Nurture emails: 80-150 words
- Value-add emails: 150-250 words (if providing resource)
- Long-term nurture: 50-100 words (shorter = better)

**Formatting:**
- Use plain text (better deliverability than HTML)
- Short paragraphs (2-3 sentences max)
- Bullet points for lists
- Single clear CTA (don't give multiple options)
- Include signature with contact info

#### 5.3 Personalization Requirements

**Minimum Personalization:**
- First name in greeting
- Company name at least once in body
- Relevant pain point for their vertical

**Advanced Personalization:**
- Reference their original reply text
- Mention specific company challenge (from research)
- Include relevant case study (similar company size/industry)
- Timing-based content (seasonal, quarterly goals)

### Phase 6: Monitoring & Optimization

#### 6.1 Key Metrics to Track

**Per Sequence:**
- Enrollment count (how many entered sequence)
- Completion rate (how many finished full sequence)
- Exit rate by stage (where do leads drop off)
- Response rate (emails opened, SMS replied)
- Conversion rate (moved to next pipeline stage)
- Unsubscribe rate (should be <0.5% for nurture)

**Per Channel:**
- Email open rate (target: 30%+ for nurture)
- Email click rate (target: 5%+)
- SMS reply rate (target: 10%+)
- SMS opt-out rate (target: <1%)

**By Vertical:**
- Which vertical has highest conversion from nurture
- Which stage has longest dwell time
- Which sequence type performs best

#### 6.2 A/B Testing Strategy

**Test Variables:**
- Subject line variants (personalized vs. generic)
- Email length (short vs. long)
- CTA type (calendar link vs. reply-to-schedule)
- Send timing (morning vs. afternoon)
- Channel order (email-first vs. SMS-first)

**Testing Protocol:**
- Split leads 50/50 into variant A and B
- Run for minimum 100 leads per variant
- Winner = highest conversion rate to next stage
- Implement winner, test new variant vs. winner

#### 6.3 Self-Annealing Triggers

**When to Update Sequence:**
- Open rate drops below 20% → Test new subject lines
- Reply rate drops below 2% → Revise email content
- Unsubscribe rate exceeds 1% → Email too frequent or irrelevant
- No conversions after 50+ leads → Redesign entire sequence

---

## Template Library

### Email Templates by Stage

#### Replied but Not Qualified

**Email 1: Value-Add (Day 0)**
```
Subject: Resource for {{contact.companyName}}

Hi {{contact.firstName}},

Thanks for getting back to me about [service]. I wanted to share something that might be helpful for {{contact.companyName}}.

[Insert vertical-specific resource]:
- Insurance: 5-point cost reduction checklist
- Real Estate: Tenant screening best practices guide
- Recruitment: Candidate sourcing ROI calculator

No strings attached — just thought it might be useful as you evaluate your options.

If you'd like to discuss how we could specifically help {{contact.companyName}}, I'm happy to jump on a quick call. Here's my calendar: [Link]

Best,
[Your Name]

P.S. If this isn't relevant right now, just let me know and I'll follow up later.
```

**Email 2: Social Proof (Day 3)**
```
Subject: How [Similar Company] solved [pain point]

{{contact.firstName}},

Quick follow-up — I wanted to share a recent win that might be relevant to {{contact.companyName}}.

We worked with [Similar Company - same vertical, size] who was struggling with [specific pain point]. Within 90 days:
- [Specific metric improvement 1]
- [Specific metric improvement 2]
- [Specific metric improvement 3]

The approach was surprisingly straightforward — happy to walk you through what we did if you're curious.

Would a 15-minute call work for you this week? [Calendar Link]

Thanks,
[Your Name]
```

**Email 3: Question-Based (Day 10)**
```
Subject: Quick question, {{contact.firstName}}

{{contact.firstName}},

I know you mentioned [reference their original reply] — I'm curious where that stands now?

We've helped a few {{contact.customField.vertical}} companies tackle this exact challenge, so if it's still on your radar, I'd love to chat.

If not, no worries at all. Just let me know when (if ever) makes sense to reconnect.

Best,
[Your Name]
```

#### Qualified but Not Booked

**Email 1: Calendar Reminder (Day 0)**
```
Subject: Ready to connect, {{contact.firstName}}?

Hi {{contact.firstName}},

Thanks for expressing interest in [service] for {{contact.companyName}}!

I have a few open slots this week if you'd like to do a quick 15-minute call to discuss:
- Your specific situation with [pain point]
- What similar companies have implemented
- Whether our approach would be a fit

Here's my calendar: [Calendar Link]

Pick a time that works for you — looking forward to connecting.

Best,
[Your Name]
```

**Email 2: Objection-Handling (Day 4)**
```
Subject: Is this the right time?

{{contact.firstName}},

I haven't heard back about scheduling a call — which usually means one of three things:

1. Now's not the right time (totally understandable)
2. You're not sure if this is the right fit (happy to clarify)
3. My emails are landing in your spam folder (whoops)

If it's #1, just let me know when I should follow up (next month, next quarter, etc.).

If it's #2, reply with your biggest question and I'll give you a straight answer.

If it's #3... well, at least you're reading this now. 😊

Either way, I'm here if you need me.

Best,
[Your Name]
```

**Email 3: Final Push (Day 7)**
```
Subject: Closing {{contact.companyName}}'s file

{{contact.firstName}},

Last note from me — I'm closing out files for leads I haven't connected with.

If [pain point] is still something you want to address at {{contact.companyName}}, let me know and I'll keep your file open.

If not, no worries at all. I'll stop reaching out.

Just reply "yes" or "not now" and I'll know what to do.

Best,
[Your Name]
```

#### Booked but No-Show

**Email 1: Follow-up (Day 1)**
```
Subject: Did we miss each other?

Hi {{contact.firstName}},

We had a call scheduled for [time] yesterday, but I didn't see you join. No worries — I know things come up!

If you're still interested in discussing [service] for {{contact.companyName}}, I'd be happy to reschedule.

Here's my calendar: [Calendar Link]

If timing isn't great right now, just let me know when I should follow up instead.

Thanks,
[Your Name]
```

**Email 2: Final Attempt (Day 7)**
```
Subject: Should I follow up later?

{{contact.firstName}},

Just wanted to check in one more time about rescheduling our call.

If now's not the right time, that's completely fine. Would it make more sense for me to reach back out in:
- 30 days?
- 60 days?
- 90 days?

Just reply with your preference and I'll follow up then.

If you're no longer interested, that's okay too — just let me know so I'm not bothering you.

Best,
[Your Name]
```

#### Closed Lost (Long-Term Nurture)

**Email 1: Value-First (Month 1)**
```
Subject: Thought of you - {{contact.customField.vertical}} trends

Hi {{contact.firstName}},

I know we talked a while back and timing wasn't right for {{contact.companyName}} — no problem at all.

I came across this [industry report/article/insight] about {{contact.customField.vertical}} and thought of you: [Link to resource]

Key takeaways:
- [Insight 1]
- [Insight 2]
- [Insight 3]

No sales pitch here — just wanted to share something potentially useful.

If your priorities shift and you want to revisit [service], I'm here. Otherwise, hope this is helpful!

Best,
[Your Name}
```

**Email 2: Check-In (Month 2)**
```
Subject: Quick check-in, {{contact.firstName}}

{{contact.firstName}},

Hope things are going well at {{contact.companyName}}.

I wanted to check in and see if [pain point we discussed] is still on your radar for this year.

If so, I'd love to reconnect and see if we can help. If not, totally understand — I'll keep you on my list for quarterly check-ins.

Either way, hope business is great!

Best,
[Your Name]
```

### SMS Templates by Stage

#### Replied but Not Qualified

**SMS 1 (Day 7):**
```
Hi {{contact.firstName}}, it's [Your Name] from [Agency]. I sent you a resource about [topic]. Did you get a chance to check it out? Happy to answer any questions.
```

#### Qualified but Not Booked

**SMS 1 (Day 2):**
```
Hi {{contact.firstName}}, saw you were interested in [service]. I have a few open slots this week - would 15 mins work for a quick chat? [Calendar Link]
```

**SMS 2 (Day 7):**
```
{{contact.firstName}}, just checking - are you still looking to improve [pain point] at {{contact.companyName}}? Happy to reschedule if timing works better next week.
```

#### Booked but No-Show

**SMS 1 (1 hour after missed meeting):**
```
Hi {{contact.firstName}}, we had a meeting scheduled for [time] but I didn't see you join. Everything okay? If you need to reschedule, here's my calendar: [Link]
```

**SMS 2 (Day 3):**
```
{{contact.firstName}}, just checking - are you still looking to improve [pain point]? Happy to reschedule for next week if that works better.
```

---

## Error Handling & Edge Cases

### Common Issues

**1. Lead Stuck in Nurture Loop**
- **Diagnosis:** Lead keeps entering same sequence due to automation error
- **Solution:** Add "Already in Nurture" tag check before enrollment
- **Prevention:** Use GHL workflow enrollment rules (enroll once, or re-enroll after X days)

**2. SMS Delivery Failures**
- **Diagnosis:** Invalid phone number or carrier blocking
- **Solution:** Remove lead from SMS sequence, email-only nurture
- **Prevention:** Validate phone numbers during enrichment (E.164 format)

**3. Email Open Tracking Not Working**
- **Diagnosis:** Recipient has email tracking disabled (Apple Mail Privacy)
- **Solution:** Use click tracking and reply tracking instead
- **Prevention:** Track engagement holistically (opens + clicks + replies)

**4. Leads Getting Too Many Messages**
- **Diagnosis:** Lead is in multiple nurture sequences simultaneously
- **Solution:** Create global frequency cap (max 2 emails per week total)
- **Prevention:** Use GHL workflow filters to check "last email sent date"

**5. Unsubscribe Rate Spikes**
- **Diagnosis:** Nurture sequence too aggressive or irrelevant
- **Solution:** Pause sequence, audit content, reduce frequency
- **Prevention:** Monitor unsubscribe rate weekly, test before scaling

**6. No Conversions from Nurture**
- **Diagnosis:** Sequence not compelling or targeting wrong leads
- **Solution:** A/B test new content, offer, timing
- **Prevention:** Only enroll qualified leads (quality score >50)

### Self-Annealing Notes

**Learnings from Nurture Campaigns:**
- Neutral sentiment leads convert at 15% vs. 50% for positive sentiment — prioritize accordingly
- SMS response rates drop 30% if sent after 5 PM
- "Breakup" emails (final attempt) get 40% higher reply rate than standard follow-ups
- Leads who no-show once have 60% no-show rate on reschedule — set expectations better
- Long-term nurture (closed lost) has 8% reactivation rate over 12 months — worth maintaining
- Email-only nurture has 22% conversion rate, email+SMS has 34% — multi-channel wins

**Common Mistakes to Avoid:**
- Don't send SMS to every lead — only those with validated phone numbers
- Don't use same nurture sequence for all verticals (personalize by industry)
- Don't let leads sit in "qualified" stage >7 days without active nurture
- Don't send more than 2 emails per week per lead (causes unsubscribes)
- Don't forget to honor unsubscribe requests immediately (compliance issue)

**Best Practices:**
- Space emails 3-5 days apart for optimal engagement
- Use SMS sparingly (2 max per sequence)
- Always provide value before asking (give before you get)
- Reference previous conversations/emails (maintain context)
- Make opting out easy (reduces spam complaints)
- Test subject lines aggressively (biggest impact on open rates)
- Keep sequences short (3-4 touchpoints max before pausing)

---

## Definition of Done

A nurture sequence automation is considered **complete and successful** when:

✅ **Configuration:**
- [ ] GoHighLevel workflows created for each sequence type
- [ ] Email templates loaded into GHL template library
- [ ] SMS templates configured with merge fields
- [ ] Trigger conditions defined and tested
- [ ] Enrollment rules set (prevent duplicates)
- [ ] Frequency caps implemented (global limits)

✅ **Stage-Specific Sequences:**
- [ ] "Replied but Not Qualified" sequence deployed
- [ ] "Qualified but Not Booked" sequence deployed
- [ ] "Booked but No-Show" sequence deployed
- [ ] "Closed Lost" long-term nurture deployed
- [ ] Exit conditions working (auto-remove on conversion)

✅ **Templates:**
- [ ] Email templates personalized by vertical
- [ ] SMS templates under 160 characters
- [ ] All merge fields tested and rendering correctly
- [ ] Links working (calendar, resources)
- [ ] Unsubscribe links functional

✅ **Compliance:**
- [ ] SMS includes opt-out language (first message)
- [ ] Email includes unsubscribe link (all messages)
- [ ] Send time restrictions configured (8 AM - 9 PM local)
- [ ] Frequency caps prevent over-messaging

✅ **Testing:**
- [ ] Test contact enrolled in each sequence
- [ ] Email delivery confirmed
- [ ] SMS delivery confirmed (valid phone)
- [ ] Merge fields rendering correctly
- [ ] Exit conditions trigger properly
- [ ] No duplicate enrollments

✅ **Monitoring:**
- [ ] Metrics dashboard configured (open, reply, conversion rates)
- [ ] Weekly review process established
- [ ] A/B testing plan documented
- [ ] Alert thresholds set (unsubscribe rate >1%)

✅ **Integration:**
- [ ] Sequences triggered by pipeline stage changes
- [ ] Lead activity updates GHL contact record
- [ ] Conversions from nurture update opportunity stage
- [ ] Unsubscribes sync to email platform suppression list

✅ **Documentation:**
- [ ] Sequence flow diagrams created
- [ ] Template usage guide written
- [ ] Self-annealing notes section populated
- [ ] Troubleshooting guide completed

---

## Integration with Other Directives

### Upstream Dependencies
- **CRM Integration Directive** → Provides pipeline stage data, triggers sequences
- **Cold Outreach Directive** → Initial engagement creates leads for nurture
- **Lead Enrichment Process** → Quality scores determine nurture eligibility

### Downstream Workflows
- **Calendar Booking Directive** → Nurture conversions create calendar events
- **AI Receptionist Directive** → Phone calls from nurture leads get routed
- **Client Reporting Directive** → Nurture metrics included in reports

---

## Performance Benchmarks

### Expected Conversion Rates (by Sequence)

| Sequence Type | Entry Count | Avg Time in Sequence | Conversion to Next Stage |
|---------------|-------------|----------------------|--------------------------|
| Replied but Not Qualified | 100 | 10 days | 15-25% → Qualified |
| Qualified but Not Booked | 100 | 7 days | 30-40% → Booked |
| Booked but No-Show | 100 | 5 days | 20-30% → Rescheduled |
| Closed Lost | 100 | 90+ days | 5-10% → Re-Qualified |

### Channel Performance

| Channel | Open/View Rate | Response Rate | Cost per Touch |
|---------|----------------|---------------|----------------|
| Email | 30-40% | 2-5% | ~$0.01 |
| SMS | 95%+ | 10-15% | ~$0.02 |
| Multi-Channel | 70%+ | 8-12% | ~$0.03 |

---

## Troubleshooting Guide

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Low open rates (<20%) | Subject lines not compelling | A/B test new subject line variants |
| High unsubscribe rate (>1%) | Too frequent or irrelevant content | Reduce frequency, personalize better |
| SMS not delivering | Invalid phone format | Validate E.164 format (+1XXXXXXXXXX) |
| Duplicate enrollments | Missing enrollment filters | Add "Already in Nurture" tag check |
| No conversions | Sequence not resonating | Test new content, offer, timing |
| Leads stuck in sequence | Exit conditions not working | Check workflow logic, test manually |
| Merge fields not rendering | Field mapping incorrect | Verify custom field names in GHL |

---

## Version History

- **v1.0.0** (Jan 2026): Initial directive created with 4 stage-specific sequences
- Self-annealing updates will be appended here as sequences run and learnings accumulate

---

**Next Steps After Deployment:**
1. Enroll 10 test leads per sequence type
2. Monitor first 48 hours for delivery issues
3. Track engagement metrics for Week 1
4. A/B test subject lines (Week 2)
5. Optimize based on conversion data (Week 3+)

**For execution code, see:**
- `executions/utils/nurture-sequences.js`
- `executions/integrations/gohighlevel-api.js` (for workflow triggers)
