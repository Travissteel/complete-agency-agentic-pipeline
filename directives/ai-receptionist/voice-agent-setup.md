# AI Receptionist Voice Agent Setup Directive

**Version:** 2.0.0
**Last Updated:** January 2026
**Framework:** Directive Orchestration Execution (DOE)
**Platform:** GoHighLevel (Primary - White-Labelable) | Vapi.ai & Retell.ai (Secondary Alternatives)

---

## Objective Statement

Deploy an AI-powered voice receptionist that qualifies inbound and outbound calls across commercial insurance, commercial real estate, and recruitment verticals. The voice agent will:

1. Answer incoming calls with professional greetings
2. Qualify leads using vertical-specific question sets
3. Book calendar appointments directly into CRM
4. Handle common objections with scripted responses
5. Escalate to human agents when necessary
6. Log all call data (transcripts, sentiment, outcomes) to CRM

**Target Outcome:** 70%+ of inbound calls handled end-to-end by AI with zero human intervention; 40%+ outbound call-to-booking conversion rate.

---

## Input Specifications

### Required Environment Variables

```bash
# Platform Selection (choose one)
VOICE_PLATFORM=gohighlevel  # Options: gohighlevel, vapi, retell

# GoHighLevel Configuration (PRIMARY - White-labelable)
GHL_API_KEY=your_ghl_api_key
GHL_LOCATION_ID=your_ghl_location_id
GHL_PHONE_NUMBER=+1234567890  # Your GHL phone number

# Vapi.ai Configuration (SECONDARY OPTION)
VAPI_API_KEY=your_vapi_private_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PHONE_NUMBER=+1234567890  # Your Vapi phone number

# Retell.ai Configuration (SECONDARY OPTION)
RETELL_API_KEY=your_retell_api_key
RETELL_PHONE_NUMBER=+1234567890  # Your Retell phone number

# Calendar Integration
CALENDAR_ID=your_calendar_id  # GoHighLevel calendar ID
CALENDAR_TIMEZONE=America/Chicago  # Adjust per business location

# Webhook Endpoints
WEBHOOK_BASE_URL=https://your-domain.com/webhooks
```

### Call Flow Inputs

**Inbound Call:**
- Caller phone number (auto-captured by voice platform)
- Business phone number (identifies which vertical/company)
- Time of day (affects greeting)

**Outbound Call:**
- Contact ID from CRM (pulls lead context)
- Call reason (follow-up, qualification, booking)
- Previous interaction history (from CRM notes)

## Platform Comparison

### GoHighLevel (PRIMARY - Recommended)

**Why GoHighLevel is Primary:**
- **White-Label Capability:** Can rebrand for client agencies
- **All-in-One Platform:** CRM, voice AI, calendar, SMS in one system
- **Cost-Effective:** No per-minute AI voice fees (included in platform)
- **Native Integration:** Seamless with existing GHL CRM workflows

**Limitations:**
- AI voice quality slightly lower than specialized platforms
- Less customization of voice personality
- May require more prompt engineering for complex flows

**Use When:**
- White-labeling for agency clients
- Budget-conscious implementations
- Need tight CRM integration

---

### Vapi.ai (SECONDARY OPTION)

**Advantages:**
- Superior AI voice quality and naturalness
- Advanced interruption handling
- Extensive customization options
- Better for complex conversational flows

**Limitations:**
- Separate platform (requires integration)
- Per-minute usage costs
- Cannot white-label

**Use When:**
- Voice quality is critical
- Complex conversation flows needed
- Budget allows premium pricing

---

### Retell.ai (SECONDARY OPTION)

**Advantages:**
- Low latency (<800ms response time)
- Good voice quality
- Simple API

**Limitations:**
- Separate platform (requires integration)
- Per-minute usage costs
- Less mature than Vapi

**Use When:**
- Low latency is critical
- Alternative to Vapi needed
- Simpler use cases

---

## Call Flow Design

### 1. GREETING (First 10 seconds)

**Objective:** Establish professionalism and set expectations.

#### Inbound Call Greeting:
```
"Hi, thanks for calling [Company Name]. This is [AI Name], your virtual assistant.
I'm here to help you get connected with the right person or schedule a time to chat.
Can I start by getting your name?"
```

#### Outbound Call Greeting:
```
"Hi [First Name], this is [AI Name] calling from [Company Name].
We spoke [time reference] about [topic]. Is now still a good time to chat for a few minutes?"
```

**Escalation Rule:** If caller immediately requests human, transfer without qualification.

---

### 2. QUALIFICATION (30-90 seconds)

Ask vertical-specific questions to determine lead quality and intent.

#### Commercial Insurance Qualification Questions:

1. **Business Context:**
   - "What type of business do you operate?" (capture industry)
   - "How many employees do you have?" (capture company size)
   - "Are you currently working with an insurance broker?"

2. **Pain Point Discovery:**
   - "What's prompting you to look at insurance options right now?"
   - "Are you seeing your renewal coming up soon, or is there a specific coverage concern?"

3. **Decision Authority:**
   - "Are you the one who makes decisions about insurance for the business?"
   - "If not, who should I also include in our conversation?"

4. **Timeline:**
   - "When are you looking to have a new policy in place?"
   - "Is this for an upcoming renewal or a new coverage need?"

**Qualification Score:**
- Decision-maker + renewal within 90 days + 10+ employees = HOT (book immediately)
- Decision-maker + 6-12 month timeline = WARM (book exploratory call)
- Non-decision-maker or no timeline = COLD (capture info, send resources)

---

#### Commercial Real Estate Qualification Questions:

1. **Property Context:**
   - "Are you looking to lease space or do you own property you're managing?"
   - "What type of property? Office, retail, industrial, multifamily?"
   - "How many units or square feet are we talking about?"

2. **Pain Point Discovery:**
   - "What's the biggest challenge you're facing with [leasing/property management] right now?"
   - "How long does it typically take to fill a vacancy?"

3. **Decision Authority:**
   - "Are you the property owner, or do you manage properties for someone else?"
   - "Do you work with a management company currently?"

4. **Timeline:**
   - "Do you have any vacancies right now that you're trying to fill?"
   - "When would you like to have a solution in place?"

**Qualification Score:**
- Owner/Manager + active vacancy + 5+ units = HOT
- Owner/Manager + proactive interest = WARM
- Tenant or no vacancy = COLD

---

#### Recruitment Firm Qualification Questions:

1. **Business Context:**
   - "What industries do you recruit for primarily?"
   - "How many recruiters are on your team?"
   - "Do you use an ATS system currently? Which one?"

2. **Pain Point Discovery:**
   - "What's the biggest bottleneck in your recruiting process right now?"
   - "How many requisitions are you typically working on at once?"
   - "How much time does your team spend on initial candidate sourcing?"

3. **Decision Authority:**
   - "Are you the one who evaluates new recruiting technology?"
   - "Who else would need to be involved in that decision?"

4. **Timeline:**
   - "Are you actively looking to improve your recruiting process this quarter?"
   - "Do you have budget allocated for recruiting tools in 2026?"

**Qualification Score:**
- Decision-maker + active hiring pain + 3+ recruiters = HOT
- Decision-maker + exploring solutions = WARM
- Individual contributor or no pain = COLD

---

### 3. OBJECTION HANDLING

Common objections and scripted responses:

#### "I'm not interested."
**Response:**
```
"I totally understand. Just so I don't waste your time in the future, can I ask —
is it that [insurance/properties/recruiting] isn't a priority right now,
or is there something specific that's not a fit?"
```
**Goal:** Uncover real reason or confirm disqualification.

---

#### "I already have someone for this."
**Response:**
```
"That's great — most of our clients were already working with someone when we met.
The reason they switched is [benefit specific to vertical].
Would it make sense to see if we could offer something better,
or are you locked into a long-term contract?"
```
**Goal:** Test satisfaction and flexibility.

---

#### "Can you send me information?"
**Response:**
```
"Absolutely. I can send you some info, but it'll make a lot more sense
if we jump on a quick 15-minute call first so I can tailor it to your situation.
Does [Day] at [Time] work, or is [Alternative Day/Time] better?"
```
**Goal:** Push for meeting before sending materials (higher conversion).

---

#### "I need to talk to my partner/boss first."
**Response:**
```
"That makes total sense. Would it be helpful if I schedule a call for both of you together?
That way we can answer questions in real-time and see if it's a fit.
What's their availability like this week?"
```
**Goal:** Book multi-person meeting to control process.

---

#### "How much does this cost?"
**Response:**
```
"Great question. Our pricing depends on [variables specific to vertical].
The best way to get an accurate quote is to spend 15 minutes understanding your needs.
I have [Day] at [Time] open — does that work?"
```
**Goal:** Avoid quoting price before value is established.

---

#### "I'm too busy right now."
**Response:**
```
"I completely get it. That's actually why I'm calling —
we help [vertical benefit, e.g., 'cut down the time you spend on X by 40%'].
Even just 15 minutes now could save you hours down the road.
How about we do a super quick call on [Day] at [Time]?"
```
**Goal:** Position call as time-saver, not time-waster.

---

### 4. BOOKING (30-60 seconds)

**Objective:** Secure calendar commitment with confirmation.

#### Booking Script:
```
"Perfect, let me get you on the calendar. I have [Day, Date] at [Time] [Timezone].
Does that work for you?"

[If YES]:
"Great. You'll receive a calendar invite at [Email] with a Zoom link.
We'll cover [agenda items]. Sound good?"

[If NO]:
"No problem. What's your availability like [Alternative Day/Time Options]?"
```

**Booking Data to Capture:**
- Contact Name
- Email Address
- Phone Number
- Company Name
- Preferred Date/Time
- Meeting Type (qualification call, demo, consultation)
- Any specific topics to cover

**CRM Integration:**
- Create/update contact record
- Create opportunity (if qualified HOT)
- Add tags: `ai-call-booked`, `[vertical]`, `[quality-score]`
- Add note with call summary
- Trigger email confirmation workflow

---

### 5. CONFIRMATION & CLOSE (15 seconds)

#### Confirmation Script:
```
"You're all set for [Day, Date] at [Time]. You'll get a calendar invite
and a reminder text 30 minutes before. If anything changes,
just reply to that text and we'll reschedule.

Is there anything else I can help with today?"
```

**Post-Call Actions:**
1. Send calendar invite via CRM
2. Send confirmation SMS
3. Schedule reminder SMS (30 mins before meeting)
4. Add call transcript to contact notes
5. Tag contact based on outcome

---

## Escalation Conditions (Transfer to Human)

The AI agent should transfer to a human agent when:

1. **Explicit Request:** Caller says "I want to talk to a person" or "Can I speak to someone?"
2. **High-Value Hot Lead:** Qualification score = HOT AND deal size >$10K
3. **Complex Technical Questions:** Questions beyond scripted responses (e.g., specific policy details)
4. **Angry/Frustrated Caller:** Sentiment analysis detects negative emotion escalating
5. **No-Progress Loop:** Same objection repeated 3+ times without resolution
6. **Existing Customer:** CRM tag shows existing client (not a new lead)
7. **VIP/Priority Contact:** CRM tag shows VIP or high-priority status

### Escalation Script:
```
"Let me connect you with one of our specialists who can help with that.
Please hold for just a moment."
```

**Technical Escalation:**
- Play hold music
- Transfer call to designated phone number
- Log escalation reason in CRM
- Send Slack notification to sales team

---

## Voice Agent Configuration

### GoHighLevel Conversation AI Settings (PRIMARY)

**Voice Selection:**
- **Insurance:** Professional female voice (confident, authoritative tone)
- **Real Estate:** Friendly male voice (approachable, energetic tone)
- **Recruitment:** Neutral voice (efficient, clear tone)

**Speech Settings:**
- Use GHL's default speech rate (optimized for clarity)
- Enable punctuation-based pausing for natural flow

**Conversation Flow:**
- Use GHL's Conversation AI builder for call flows
- Configure question nodes for qualification
- Set up decision trees for objection handling
- Enable call forwarding for escalations

**CRM Integration:**
- Auto-create contacts on inbound calls
- Auto-tag based on conversation outcome
- Add call notes with transcript
- Trigger workflows for booking confirmations

**Transcription:**
- Real-time transcription via GHL
- Save full transcript to contact notes
- Track conversation sentiment

---

### Vapi.ai Assistant Settings (SECONDARY OPTION)

**Voice Selection:**
- **Insurance:** Professional female voice (e.g., "Rachel" - ElevenLabs)
- **Real Estate:** Friendly male voice (e.g., "Alex" - ElevenLabs)
- **Recruitment:** Neutral voice (e.g., "Sam" - ElevenLabs)

**Speech Settings:**
- Speed: 1.1x (slightly faster than natural)
- Pitch: Neutral
- Stability: 0.8 (slightly variable for naturalness)

**Interruption Handling:**
- `allow_interruptions: true` (caller can speak over AI)
- `interruption_threshold: 0.5` (medium sensitivity)

**Background Noise Reduction:**
- Enabled (handles calls from noisy environments)

**Transcription:**
- Real-time transcription via Deepgram Nova-2
- Save full transcript to CRM after call

---

### Retell.ai Assistant Settings (SECONDARY OPTION)

**Voice Selection:**
- Use Retell's optimized voices for low latency
- **Insurance:** Professional female voice
- **Real Estate:** Friendly male voice
- **Recruitment:** Neutral voice

**Speech Settings:**
- Default speed for optimal latency
- Enable end-of-turn detection

**Transcription:**
- Real-time transcription enabled
- Save to CRM via webhook

---

## Success Metrics (Definition of Done)

### Call Quality Metrics:
- **Call Completion Rate:** 85%+ of calls reach booking or clear disposition
- **Average Call Duration:** 2-4 minutes (optimal for qualification)
- **Transfer Rate:** <15% of calls escalated to human
- **Booking Rate:** 40%+ of qualified leads book meeting

### Data Quality Metrics:
- **Contact Capture Rate:** 95%+ of calls capture name, email, phone
- **Qualification Completion:** 80%+ of calls complete full question set
- **CRM Sync Rate:** 100% of calls logged to CRM within 60 seconds

### Business Impact Metrics:
- **Cost per Lead:** 70% lower than human receptionist
- **Response Time:** <10 seconds for inbound calls (vs. 2-3 minutes human average)
- **After-Hours Coverage:** 24/7 availability (vs. business hours only)

---

## Testing Protocol

Before deployment, test:

1. **Happy Path:** Call goes smoothly, lead qualifies, books meeting
2. **Objection Handling:** Test all 6+ objection scripts
3. **Escalation Triggers:** Trigger each escalation condition
4. **CRM Integration:** Verify contact creation, tagging, notes
5. **Calendar Integration:** Verify booking creates event in CRM calendar
6. **Edge Cases:** No answer, voicemail, wrong number, spam call

**Test Checklist:**
- [ ] Inbound call greeting plays correctly
- [ ] Outbound call personalizes with CRM data
- [ ] Qualification questions flow logically
- [ ] Objection scripts trigger appropriately
- [ ] Booking captures all required fields
- [ ] Calendar invite sends immediately
- [ ] Confirmation SMS arrives
- [ ] Reminder SMS sends 30 mins before
- [ ] Call transcript saves to CRM
- [ ] Tags and notes apply correctly
- [ ] Escalation transfer works smoothly
- [ ] No dropped calls or technical errors

---

## Implementation Checklist

**Phase 1: Setup (Day 1-2)**
- [ ] Set VOICE_PLATFORM=gohighlevel in .env
- [ ] Configure voice agent in GoHighLevel Conversation AI
- [ ] Set up phone number in GHL
- [ ] Configure webhook endpoints (if using secondary platforms)
- [ ] Test basic inbound/outbound calls

**Phase 2: CRM Integration (Day 3-4)**
- [ ] Configure GHL Conversation AI workflows
- [ ] Test contact creation on call completion
- [ ] Test opportunity creation for hot leads
- [ ] Test tagging and notes automation
- [ ] Test calendar booking integration

**Phase 3: Script Configuration (Day 5-6)**
- [ ] Upload vertical-specific scripts to GHL Conversation Builder
- [ ] Configure qualification question flows
- [ ] Configure objection handling decision trees
- [ ] Configure escalation rules and call forwarding
- [ ] Test all conversation paths

**Phase 4: Testing & Refinement (Day 7-10)**
- [ ] Run 20+ test calls per vertical
- [ ] Validate CRM data accuracy
- [ ] Validate calendar bookings
- [ ] Refine scripts based on test feedback
- [ ] Document edge cases and handling

**Phase 5: Soft Launch (Day 11-14)**
- [ ] Deploy to 10% of inbound call volume
- [ ] Monitor call quality metrics
- [ ] Monitor CRM data quality
- [ ] Gather user feedback
- [ ] Make iterative improvements

**Phase 6: Full Deployment (Day 15+)**
- [ ] Scale to 100% of call volume
- [ ] Monitor ongoing performance
- [ ] Weekly script optimization
- [ ] A/B test greeting variants
- [ ] Expand to additional verticals

---

## Self-Annealing (Continuous Improvement)

### Learning from Errors:

**Error Scenario:** AI agent fails to handle specific objection
**Self-Annealing Action:**
1. Review call transcript to identify exact phrasing
2. Add new objection script to voice agent configuration
3. Update this directive with new objection handling
4. Test new script with similar scenario

**Error Scenario:** Booking rate drops below 40%
**Self-Annealing Action:**
1. Analyze last 100 call transcripts
2. Identify common drop-off points
3. A/B test alternative scripts at drop-off points
4. Update directive with winning script variant

**Error Scenario:** High transfer rate (>20%)
**Self-Annealing Action:**
1. Review escalation reasons in CRM
2. Identify most common transfer triggers
3. Create new scripts to handle those triggers
4. Reduce reliance on human escalation

---

## Platform Failover Strategy

Since GoHighLevel is the PRIMARY platform:

1. **Primary:** GoHighLevel Conversation AI (default for all clients)
2. **Fallback 1:** Vapi.ai (if GHL experiences issues or voice quality is critical)
3. **Fallback 2:** Retell.ai (if both GHL and Vapi are unavailable)

**Failover Trigger Conditions:**
- Platform uptime <95%
- Call quality issues (e.g., latency >3 seconds)
- API errors >5% of calls
- Client-specific requirements (e.g., premium voice quality needed)

**Platform Selection Logic:**
```
IF white_label_required OR budget_conscious:
  USE GoHighLevel
ELSE IF voice_quality_critical OR complex_flows:
  USE Vapi.ai
ELSE IF low_latency_critical:
  USE Retell.ai
ELSE:
  DEFAULT to GoHighLevel
```

---

## Version History

- **v2.0.0** (January 2026): Updated to GoHighLevel as primary platform with Vapi/Retell as alternatives
- **v1.0.0** (January 2026): Initial directive with Vapi.ai primary, 3 vertical support
- **v2.1.0** (TBD): Add additional verticals (legal services, financial planning)
- **v2.2.0** (TBD): Add multilingual support (Spanish, Mandarin)

---

## Related Directives

- `calendar-booking/calendar-sync.md` - Calendar integration logic
- `crm-integration/contact-management.md` - CRM data flow
- `nurture-sequences/follow-up-automation.md` - Post-call nurture sequences

---

**This directive enables autonomous voice agent deployment with clear success criteria and self-improvement protocols.**
