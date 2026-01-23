# Cold Outreach Email Campaign Directive

**Version:** 1.0.0
**Last Updated:** January 2026
**Framework:** DOE (Directive Orchestration Execution)
**Purpose:** Automate multi-channel cold email campaigns using Instantly.ai and SmartLead

---

## Objective Statement

Create and manage automated cold email campaigns for B2B lead generation across target verticals (commercial insurance, commercial real estate, recruitment firms). This directive outlines the complete process from enriched lead intake to campaign deployment and response management.

---

## Input Specifications

### Lead Format (from lead-enrichment.js)

**Instantly Format:**
```json
{
  "email": "john.smith@company.com",
  "firstName": "John",
  "lastName": "Smith",
  "companyName": "ABC Insurance Corp",
  "customField1": "VP of Operations",
  "customField2": "50-200",
  "customField3": "Chicago, IL",
  "customField4": "commercial-insurance",
  "customField5": "+13125551234",
  "customField6": "https://abcinsurance.com",
  "tags": "commercial-insurance,LinkedIn + Google Maps,score:85"
}
```

**SmartLead Format:**
```json
{
  "Email": "john.smith@company.com",
  "First Name": "John",
  "Last Name": "Smith",
  "Company": "ABC Insurance Corp",
  "Industry": "commercial-insurance",
  "Location": "Chicago, IL",
  "Phone": "+13125551234",
  "Website": "https://abcinsurance.com",
  "Job Title": "VP of Operations",
  "Company Size": "50-200",
  "Lead Source": "LinkedIn + Google Maps",
  "Quality Score": 85
}
```

### Campaign Parameters

- **Campaign Name:** `[Vertical]-[Month]-[Year]` (e.g., "Insurance-Jan-2026")
- **Daily Send Limit:** 50 emails per inbox (to maintain deliverability)
- **Follow-up Intervals:** Day 3, Day 7, Day 14
- **Sending Schedule:** Mon-Fri, 8:00 AM - 5:00 PM (recipient's timezone)
- **Minimum Quality Score:** 50 (configurable per campaign)

---

## Step-by-Step Process

### Phase 1: Campaign Setup

1. **Select Target Vertical**
   - Commercial Insurance
   - Commercial Real Estate
   - Recruitment Firms

2. **Load Enriched Leads**
   - Import from Apify Key-Value Store (`instantly_export.json` or `smartlead_export.json`)
   - Filter by quality score threshold (default: 50+)
   - Segment by company size, location, or industry sub-vertical

3. **Choose Email Platform**
   - **Primary:** Instantly.ai (better analytics, easier UI)
   - **Backup:** SmartLead (alternative if Instantly has issues)
   - **Hybrid:** Split campaigns across both for A/B testing

4. **Configure Campaign Settings**
   - Set daily sending limits per inbox
   - Configure sending schedule (timezone-aware)
   - Set up tracking domain (for link tracking)
   - Enable reply detection and auto-pause on replies

### Phase 2: Email Sequence Creation

#### 3-Step Email Sequence Structure

**Email 1: Initial Outreach (Day 0)**
- **Goal:** Introduce value proposition, spark curiosity
- **Length:** 80-120 words
- **CTA:** Soft ask (question or resource offer)
- **Personalization:** First name, company, industry-specific pain point

**Email 2: Value Follow-up (Day 3)**
- **Goal:** Provide social proof or case study
- **Length:** 60-100 words
- **CTA:** Direct ask for 15-minute call
- **Personalization:** Reference specific company challenge

**Email 3: Final Follow-up (Day 7)**
- **Goal:** Breakup email, create FOMO
- **Length:** 40-60 words
- **CTA:** "Is this a priority?" or "Should I close your file?"
- **Personalization:** Acknowledge lack of response

**Optional Email 4: Long-term Nurture (Day 14)**
- Only for high-quality leads (score 80+)
- Provide valuable resource with no ask
- Keep door open for future conversations

### Phase 3: Campaign Deployment

#### Using Instantly.ai

1. **Create Campaign**
   - Use API: `createCampaign()`
   - Set campaign name, sending schedule, limits

2. **Upload Leads**
   - Use API: `uploadLeads(campaignId, leads)`
   - Leads automatically enter sequence

3. **Configure Email Steps**
   - Add email templates with merge tags
   - Set follow-up intervals
   - Enable A/B testing for subject lines

4. **Activate Campaign**
   - Review settings checklist
   - Start campaign (gradual ramp-up recommended)

#### Using SmartLead

1. **Create Campaign**
   - Use API: `createCampaign()`
   - Configure sender rotation and limits

2. **Import Leads**
   - Use API: `uploadLeads(campaignId, leads)`
   - Map CSV columns to SmartLead fields

3. **Set Up Sequence**
   - Add email variants for A/B testing
   - Configure conditional logic (if replied, stop sequence)

4. **Launch Campaign**
   - Enable warmup mode for new senders
   - Monitor first 24 hours for issues

### Phase 4: Response Management

1. **Reply Detection**
   - Both platforms auto-detect replies
   - Leads automatically removed from sequence on reply

2. **Categorize Responses**
   - **Positive Interest:** Forward to client CRM (GoHighLevel)
   - **Not Interested:** Mark as "Cold" and suppress from future campaigns
   - **Out of Office:** Pause and retry after return date
   - **Bounce/Invalid:** Remove from list, update quality score

3. **Webhook Integration**
   - Set up webhook endpoint in n8n
   - Receive real-time reply notifications
   - Trigger CRM updates and follow-up workflows

4. **AI Reply Analysis (Optional)**
   - Use OpenAI/Claude to analyze reply sentiment
   - Automatically categorize intent
   - Generate suggested responses for client

### Phase 5: Campaign Monitoring

1. **Daily Metrics Check**
   - Open rate (target: 40%+)
   - Reply rate (target: 2-5%)
   - Bounce rate (target: <5%)
   - Unsubscribe rate (target: <1%)

2. **Weekly Optimization**
   - Pause underperforming email variants
   - Test new subject lines
   - Adjust sending volume based on engagement

3. **Monthly Reporting**
   - Generate campaign summary
   - Calculate ROI metrics
   - Provide recommendations for next cycle

---

## Email Sequence Templates

### Commercial Insurance Vertical

**Subject Line Variants:**
- "Quick question about {{companyName}}'s insurance strategy"
- "Risk assessment for {{companyName}}"
- "{{firstName}}, thought of you"

**Email 1: Initial Outreach**
```
Hi {{firstName}},

I noticed {{companyName}} is in {{industry}} — I'm reaching out because we help companies like yours reduce insurance costs by 15-30% while improving coverage.

We recently worked with [similar company] to streamline their commercial policy and they saved $87K annually.

Would you be open to a quick 15-minute call to see if we could do something similar for {{companyName}}?

Best,
[Your Name]

P.S. No pressure if now isn't the right time. Happy to send over a quick audit checklist you can use internally.
```

**Email 2: Value Follow-up (Day 3)**
```
{{firstName}},

Following up on my last note about insurance optimization for {{companyName}}.

Quick case study: We helped a {{companySize}} {{industry}} company renegotiate their GL policy and cut premiums by 22% — same coverage, better pricing.

Want to explore what's possible? [Book 15 mins here]

Thanks,
[Your Name]
```

**Email 3: Breakup Email (Day 7)**
```
{{firstName}},

I know you're busy, so I'll make this quick.

Should I close {{companyName}}'s file, or is insurance cost optimization still on your radar for 2026?

Just let me know and I'll follow up accordingly.

Best,
[Your Name]
```

---

### Commercial Real Estate Vertical

**Subject Line Variants:**
- "Tenant screening automation for {{companyName}}"
- "{{firstName}} — reducing vacancy time by 40%"
- "Property management question"

**Email 1: Initial Outreach**
```
Hi {{firstName}},

I saw {{companyName}} manages properties in {{location}} — we help CRE firms like yours cut vacancy time by 30-40% using AI-powered tenant screening and lead routing.

One of our clients (similar portfolio size to yours) filled 12 units in 3 weeks using our system vs. their usual 8-week average.

Would you be interested in seeing how this could work for {{companyName}}?

Best,
[Your Name]

P.S. No sales pitch — I can walk you through the system in 15 minutes and you can decide if it's a fit.
```

**Email 2: Value Follow-up (Day 3)**
```
{{firstName}},

Quick follow-up on tenant screening automation for {{companyName}}.

Here's what our CRE clients love:
- Auto-qualify leads from Zillow, Apartments.com, etc.
- AI screening calls (so you don't waste time on unqualified renters)
- Instant application routing to your system

Want a 15-min demo? [Calendar link]

Thanks,
[Your Name]
```

**Email 3: Breakup Email (Day 7)**
```
{{firstName}},

Last note from me — just want to make sure this didn't get buried.

Is tenant screening/vacancy reduction still something {{companyName}} is looking to improve this quarter?

If not, no worries. If yes, let's find 15 minutes to chat.

Best,
[Your Name]
```

---

### Recruitment Firms Vertical

**Subject Line Variants:**
- "Candidate sourcing automation for {{companyName}}"
- "{{firstName}} — filling reqs 50% faster"
- "Quick question about your recruiting stack"

**Email 1: Initial Outreach**
```
Hi {{firstName}},

I noticed {{companyName}} specializes in {{industry}} recruiting — we help firms like yours fill reqs 40-50% faster by automating candidate sourcing and initial screening.

One recruiter we work with went from 15 hours/week on manual LinkedIn outreach to fully automated multi-channel sequences (LinkedIn + email + SMS).

Would you be open to seeing how this could scale {{companyName}}'s placements?

Best,
[Your Name]

P.S. We integrate with any ATS (Bullhorn, Jobvite, Greenhouse, etc.) so there's no tech disruption.
```

**Email 2: Value Follow-up (Day 3)**
```
{{firstName}},

Following up about candidate sourcing automation for {{companyName}}.

What our recruiting clients get:
- Auto-scrape LinkedIn for ideal candidates
- Multi-touch sequences (email + SMS + InMail)
- Pre-screening AI calls to qualify interest
- CRM sync so everything flows to your ATS

Interested in a quick walkthrough? [Book here]

Thanks,
[Your Name]
```

**Email 3: Breakup Email (Day 7)**
```
{{firstName}},

I'll keep this short — is recruiting automation still on {{companyName}}'s roadmap for Q1?

If yes, let's connect for 15 mins. If not, I'll stop bothering you. 😊

Either way, appreciate your time.

Best,
[Your Name]
```

---

## Personalization Variables

### Core Variables (All Verticals)
- `{{firstName}}` - Lead's first name
- `{{lastName}}` - Lead's last name
- `{{companyName}}` - Company name
- `{{industry}}` - Industry/vertical
- `{{location}}` - City, State
- `{{companySize}}` - Employee count range
- `{{jobTitle}}` - Lead's position
- `{{website}}` - Company website

### Advanced Variables (Conditional)
- `{{phone}}` - Phone number (for SMS follow-ups)
- `{{linkedinProfile}}` - LinkedIn URL
- `{{googleRating}}` - Google review score
- `{{qualityScore}}` - Lead quality score (internal)

### Dynamic Content Rules
- If `qualityScore` > 80: Add premium CTA (e.g., "VIP consultation")
- If `companySize` < 50: Emphasize cost savings
- If `companySize` > 200: Emphasize scalability and enterprise features
- If `googleRating` < 3.5: Mention reputation management

---

## A/B Testing Strategy

### Subject Line Testing
- **Variant A:** Question-based (e.g., "Quick question about {{companyName}}")
- **Variant B:** Benefit-driven (e.g., "Reduce costs by 30% at {{companyName}}")
- **Variant C:** Personalized (e.g., "{{firstName}}, thought of you")

**Testing Protocol:**
- Split traffic 33/33/33
- Run for minimum 100 sends per variant
- Winner = highest open rate + reply rate combined score
- Implement winner for remaining campaign

### Email Body Testing
- **Variant A:** Case study-focused
- **Variant B:** Problem-solution format
- **Variant C:** Question-based (Socratic method)

**Testing Protocol:**
- Split after subject line winner is determined
- Test on 200+ leads per variant
- Winner = highest positive reply rate
- Scale winner to full campaign

### Call-to-Action Testing
- **CTA A:** Calendar link (direct booking)
- **CTA B:** Reply-based (question to start conversation)
- **CTA C:** Resource offer (lead magnet, audit, etc.)

---

## Error Handling & Edge Cases

### Common Issues

**1. High Bounce Rate (>10%)**
- **Diagnosis:** Bad email list quality
- **Solution:** Re-run email validation, increase quality score threshold
- **Prevention:** Ensure MX record validation in enrichment phase

**2. Low Open Rate (<20%)**
- **Diagnosis:** Spam folder placement or poor subject lines
- **Solution:** Review sender reputation, test subject line variants
- **Prevention:** Warm up domains properly, avoid spam trigger words

**3. High Unsubscribe Rate (>2%)**
- **Diagnosis:** Messaging not resonating or wrong target audience
- **Solution:** Pause campaign, review ICP (Ideal Customer Profile), refine messaging
- **Prevention:** Better lead qualification, vertical-specific messaging

**4. Zero Replies**
- **Diagnosis:** Multiple possible causes (bad list, poor messaging, wrong timing)
- **Solution:** Send test batch (50 leads), analyze metrics, adjust before scaling
- **Prevention:** Always pilot campaigns before full deployment

**5. API Rate Limits**
- **Diagnosis:** Too many API calls in short time
- **Solution:** Implement exponential backoff, queue requests
- **Prevention:** Batch operations, respect platform rate limits

### Self-Annealing Notes

**Learnings from Previous Campaigns:**
- Insurance vertical: "Risk assessment" subject lines outperform "cost savings" by 18%
- Real estate vertical: Mentioning "vacancy time" gets 2x more replies than "automation"
- Recruitment vertical: Recruiters respond better to LinkedIn than email for initial outreach
- Sending time: 9-11 AM (recipient's timezone) gets 35% higher open rates than afternoon sends
- Follow-up timing: Day 3 follow-up has 80% reply rate of Day 7 follow-up (don't wait too long)

**Common Mistakes to Avoid:**
- Don't use ALL CAPS in subject lines (spam filter trigger)
- Don't include attachments in first email (deliverability killer)
- Don't send on weekends (50% lower open rates)
- Don't use "Free" or "Guaranteed" in messaging (spam words)
- Don't send to role-based emails (info@, contact@, etc.) — low conversion

**Best Practices:**
- Always warm up new sending domains for 2-3 weeks before cold campaigns
- Keep email length under 150 words for highest reply rate
- Use plain text emails (no HTML) for better deliverability
- Include unsubscribe link (CAN-SPAM compliance + improves sender reputation)
- Monitor sender reputation weekly (use tools like Mail Tester, Sender Score)

---

## Definition of Done

A cold outreach campaign is considered **complete and successful** when:

✅ **Campaign Setup:**
- [ ] Campaign created in Instantly or SmartLead
- [ ] Enriched leads uploaded (minimum 100 leads)
- [ ] Email sequence configured (3-4 emails with correct intervals)
- [ ] Personalization variables mapped correctly
- [ ] Sending schedule configured (timezone-aware)
- [ ] Daily send limits set (50 per inbox)

✅ **Quality Assurance:**
- [ ] Test emails sent to internal addresses (verify formatting)
- [ ] Merge tags rendering correctly (no `{{missing}}` tags)
- [ ] Links working and tracked properly
- [ ] Unsubscribe link functional
- [ ] Reply detection enabled and tested

✅ **Integration:**
- [ ] Webhook endpoint configured for reply notifications
- [ ] n8n workflow triggered successfully on test reply
- [ ] CRM (GoHighLevel) receiving positive replies
- [ ] Negative replies suppressed from future campaigns

✅ **Monitoring:**
- [ ] Campaign metrics dashboard accessible
- [ ] Daily open/reply/bounce rates within acceptable ranges
- [ ] Alert system configured for anomalies (>10% bounce rate)
- [ ] Weekly reporting scheduled

✅ **Performance Targets (Week 1):**
- [ ] Open rate: >30%
- [ ] Reply rate: >1.5%
- [ ] Bounce rate: <5%
- [ ] Unsubscribe rate: <1%
- [ ] Positive replies routed to CRM: >50% of total replies

✅ **Documentation:**
- [ ] Campaign parameters logged for analysis
- [ ] A/B test results documented
- [ ] Any learnings added to self-annealing notes
- [ ] Next campaign recommendations provided

---

## Integration with Other Directives

### Upstream Dependencies
- **Lead Generation Directive** → Provides enriched lead data
- **Lead Enrichment Process** → Ensures email validation and quality scoring

### Downstream Workflows
- **CRM Integration Directive** → Syncs positive replies to GoHighLevel
- **Nurture Sequences Directive** → Long-term follow-up for non-responders
- **AI Receptionist Directive** → Handles phone calls from interested leads
- **Calendar Booking Directive** → Automated meeting scheduling from positive replies

---

## Platform-Specific Notes

### Instantly.ai
- **Pros:** Better UI, superior analytics, easier A/B testing
- **Cons:** Slightly more expensive, fewer native integrations
- **Best For:** Campaigns requiring detailed analytics and optimization

### SmartLead
- **Pros:** Better email deliverability, more aggressive sending options
- **Cons:** UI less intuitive, limited reporting
- **Best For:** High-volume campaigns, backup platform for Instantly

### Hybrid Approach
- Use both platforms for different verticals
- Split test campaigns across platforms to compare performance
- Use SmartLead as failover if Instantly has downtime

---

## Compliance & Best Practices

### CAN-SPAM Compliance
- ✅ Include physical mailing address in footer
- ✅ Provide clear unsubscribe mechanism
- ✅ Honor unsubscribe requests within 10 business days
- ✅ Don't use deceptive subject lines
- ✅ Identify message as an advertisement (if applicable)

### GDPR Considerations (for EU leads)
- Obtain explicit consent before emailing (or rely on legitimate interest for B2B)
- Provide clear privacy policy
- Allow data deletion requests
- Document legal basis for processing

### Deliverability Best Practices
- Warm up new domains gradually (start with 10-20 emails/day)
- Maintain sender reputation (monitor Sender Score)
- Use SPF, DKIM, and DMARC records
- Avoid spam trigger words and ALL CAPS
- Keep bounce rate below 5%

---

## Troubleshooting Guide

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Emails not sending | API credentials invalid | Re-authenticate API connection |
| High bounce rate | Bad email list | Re-validate emails, increase quality threshold |
| Low open rate | Spam folder placement | Check sender reputation, warm up domain |
| No replies | Poor messaging or wrong audience | A/B test new copy, refine ICP |
| API errors | Rate limit hit | Implement retry logic with exponential backoff |
| Duplicate leads | Improper deduplication | Re-run enrichment with correct dedupe settings |
| Wrong personalization | Mapping error | Review merge tag configuration |

---

## Version History

- **v1.0.0** (Jan 2026): Initial directive created with 3-vertical template structure
- Self-annealing updates will be appended here as campaigns run and learnings accumulate

---

**Next Steps After Campaign Launch:**
1. Monitor first 48 hours closely for anomalies
2. A/B test results available after 100 sends per variant
3. Week 1 performance report due (see Definition of Done)
4. Optimization recommendations for Week 2+

**For execution code, see:**
- `executions/integrations/instantly-api.js`
- `executions/integrations/smartlead-api.js`
- `executions/utils/email-templates.js`
