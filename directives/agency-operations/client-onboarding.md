# Client Onboarding SOP

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Systematize the onboarding process for new AI automation clients (1-man agency)

---

## Onboarding Overview

**Objective:** Transform signed contract into launched automation within 2-4 weeks while building client confidence and setting clear expectations.

**Success Criteria:**
- Client understands what's being built and why
- All required access and information collected
- Timeline and milestones agreed upon
- First automation deployed and working
- Client trained and comfortable using the system

---

## Onboarding Timeline by Package

### STARTER Package (2 weeks)
- **Week 1:** Discovery, access collection, build Phase 1
- **Week 2:** Testing, refinement, training, launch

### GROWTH Package (4 weeks)
- **Week 1-2:** Discovery, access collection, build core workflows
- **Week 3:** Integration testing and refinement
- **Week 4:** Training, documentation, launch

### ENTERPRISE Package (8 weeks)
- **Week 1-2:** Deep discovery, architecture planning, access collection
- **Week 3-5:** Build and integrate all workflows
- **Week 6-7:** Testing, optimization, training
- **Week 8:** Launch, monitoring, handoff

---

## Phase 1: Contract to Kickoff (Days 1-3)

### Day 1: Contract Signed

#### Immediate Actions (within 1 hour)
1. **Send Welcome Email**

```
Subject: Welcome to [Agency Name] - Let's Get Started!

Hey [Name],

Excited to start building your AI automation system!

I've attached your welcome packet with:
- Kickoff call agenda (scheduled for [date/time])
- Information checklist (please fill out before kickoff)
- Access request form
- Project timeline

Before our kickoff call, please:
1. Complete the information checklist
2. Grant preliminary access to [specific tools]
3. Review the timeline and flag any conflicts

See you on [kickoff date]!

Best,
Travis

P.S. - If anything's unclear, just reply to this email. I'm here to help.
```

2. **Create Project Folder Structure**
```
clients/
└── [client-name]/
    ├── 1-discovery/
    │   ├── intake-form.md
    │   ├── process-maps/
    │   └── requirements.md
    ├── 2-build/
    │   ├── code/
    │   └── documentation/
    ├── 3-testing/
    │   └── test-results/
    ├── 4-launch/
    │   ├── training-materials/
    │   └── handoff-docs/
    └── project-tracker.md
```

3. **Set Up Communication Channels**
- Add client to Slack workspace (or create dedicated channel)
- Schedule kickoff call in Calendly
- Add project to task management system

4. **Process First Payment**
- Invoice 50% setup fee via Stripe/PayPal
- Confirm receipt and thank client

#### Send Information Checklist

Create Google Form or Typeform with:

**Company Information**
- Legal business name
- Primary contact details
- Team members involved in project
- Current tech stack (list all tools)
- Existing automation or AI tools

**Process Documentation**
- Current workflow descriptions
- Pain points and bottlenecks
- Volume metrics (leads/day, tickets/week, etc.)
- Success metrics (what does "working" look like?)

**Tool Access Requests**
- CRM credentials (read-only to start)
- Email/calendar API access
- Relevant SaaS tool admin access
- Database access if applicable
- Example data (anonymized if needed)

**Timeline Constraints**
- Hard deadlines or events
- Team availability for training
- Blackout periods (vacation, busy season)

---

## Phase 2: Kickoff Call (Day 3-5)

### Pre-Call Preparation (30 mins before)
- [ ] Review completed information checklist
- [ ] Research client's industry and competitors
- [ ] Prepare workflow diagram templates
- [ ] Test screen sharing and recording setup
- [ ] Have contract and timeline ready to share

### Kickoff Call Agenda (60 minutes)

#### 1. Introductions & Agenda Review (5 mins)
```
Thanks for making time, [Name].

Here's what we'll cover today:
1. Walk through your current process in detail
2. Confirm what we're building and why
3. Map out the timeline and milestones
4. Assign action items for both of us
5. Set communication cadence

By the end, we'll both know exactly what happens next.

Ready to dive in?
```

#### 2. Process Deep-Dive (25 mins)
**For each workflow being automated:**

1. "Walk me through [process] step-by-step, from trigger to completion."
2. "Who's involved at each step?"
3. "What tools/systems are touched?"
4. "Where does it typically break down?"
5. "What data needs to flow between steps?"

**Document in real-time:**
- Create workflow diagram in Miro/Lucidchart (share screen)
- Note decision points and business rules
- Capture edge cases and exceptions
- Record current vs. desired state

#### 3. Solution Alignment (15 mins)
```
Based on what you've shared, here's what I'm going to build:

[Describe automation architecture]

This will handle [X, Y, Z] automatically, and alert you when [exception cases].

From your team's perspective, it'll work like this:
[Describe user experience]

Does this match your expectations? Any concerns or adjustments?
```

**Get explicit agreement on:**
- What's IN SCOPE for this phase
- What's OUT OF SCOPE (parking lot for future)
- Success criteria (how we measure if it worked)

#### 4. Timeline & Milestones (10 mins)
Share screen with project timeline:

**Example (STARTER Package):**
```
Week 1:
- [Mon-Wed] Build core automation logic
- [Thu] Client reviews initial build
- [Fri] Incorporate feedback

Week 2:
- [Mon-Tue] Final testing and refinement
- [Wed] Training session (1 hour)
- [Thu] Soft launch (parallel run with old process)
- [Fri] Full cutover and monitoring

Weekly check-ins: Every Wednesday at 10am
```

**Get commitment on:**
- Milestone review dates
- Client responsibilities and deadlines
- Launch date

#### 5. Access & Requirements (5 mins)
Review access needed:

- [ ] CRM API credentials
- [ ] Email/calendar OAuth
- [ ] Webhook endpoints (if applicable)
- [ ] Example data sets
- [ ] Any compliance/security requirements

**Assign homework:**
```
By end of this week, I need:
1. [Specific access items]
2. [Sample data]
3. [Approval from stakeholder X]

Can you get those to me by [specific date]?
```

#### 6. Communication Cadence (5 mins)
Set expectations:

**Regular touchpoints:**
- Weekly check-in calls (30 mins, same day/time)
- Slack for quick questions (response within 4 hours during business hours)
- Email for formal updates/approvals

**Escalation process:**
- Urgent issues: Text me at [your number]
- Blocker that stops progress: Call directly

**Update frequency:**
- Daily: Slack update on progress
- Weekly: Call + written summary of completed work
- Milestone: Demo + review session

```
I'll keep you updated daily via Slack, and we'll have our weekly call every [day] at [time].

If something's urgent, call or text me. Otherwise, Slack is fastest.

Sound good?
```

---

## Phase 3: Discovery & Build (Weeks 1-2)

### Week 1: Deep Discovery & Build Foundation

#### Client Responsibilities
- [ ] Grant all required access by Day 3
- [ ] Provide sample data by Day 5
- [ ] Review initial build by end of Week 1
- [ ] Answer clarifying questions within 24 hours

#### Your Responsibilities

**Daily Updates (End of each day via Slack):**
```
End of Day Update - [Date]

✅ Completed today:
- [Specific task 1]
- [Specific task 2]

🚧 In progress:
- [Current task]

⏭️ Tomorrow's plan:
- [Next task]

🚨 Blockers: [None / Specific issue]
```

**Deliverables:**
- [ ] Workflow architecture diagram finalized
- [ ] Data flow maps completed
- [ ] Core automation logic built
- [ ] Integration with primary tools working
- [ ] Initial testing with sample data

**Weekly Check-in (End of Week 1):**

Agenda:
1. Demo what's been built so far
2. Walkthrough test results with sample data
3. Gather feedback and adjust
4. Confirm Week 2 priorities
5. Address any concerns

---

### Week 2: Testing, Refinement, Training

#### Client Responsibilities
- [ ] Test automation in staging environment
- [ ] Provide feedback on user experience
- [ ] Attend training session
- [ ] Prepare team for soft launch

#### Your Responsibilities

**Testing Phase:**
- [ ] Run automation with real-world scenarios
- [ ] Test edge cases and failure modes
- [ ] Validate data accuracy
- [ ] Optimize performance
- [ ] Add error handling and alerts

**Training Session (60 mins):**

**Agenda:**
1. **Overview (5 mins):** What the automation does and why
2. **How It Works (15 mins):** Behind-the-scenes walkthrough
3. **Using the System (20 mins):** Client's day-to-day interaction
4. **Troubleshooting (10 mins):** Common issues and fixes
5. **Q&A (10 mins):** Open questions

**Record the training session** and share link afterward.

**Create Training Documentation:**
- Quick-start guide (1-page)
- Step-by-step user manual
- Troubleshooting FAQ
- Video walkthrough (Loom)

---

## Phase 4: Launch (Week 2, Days 3-5)

### Pre-Launch Checklist

**Technical Readiness:**
- [ ] All integrations tested and working
- [ ] Error handling and logging in place
- [ ] Monitoring and alerts configured
- [ ] Backup/rollback plan documented
- [ ] Performance benchmarks met

**Client Readiness:**
- [ ] Training completed
- [ ] Documentation delivered
- [ ] Support expectations set
- [ ] Team members briefed
- [ ] Parallel run plan agreed upon

**Communications Ready:**
- [ ] Launch announcement drafted
- [ ] Support contact info confirmed
- [ ] Escalation path documented

### Launch Approach: Soft Launch (Recommended)

**Day 1-2: Parallel Run**
- Automation runs alongside old process
- Compare outputs for accuracy
- Identify any discrepancies
- Build client confidence

**Day 3: Gradual Cutover**
- Start with 25% of volume through automation
- Monitor closely for issues
- Increase to 50% if stable

**Day 4-5: Full Cutover**
- Move 100% to automation
- Old process on standby for 48 hours
- Monitor actively

**Launch Day Communication:**
```
Subject: [Automation Name] is LIVE!

Hey [Name],

We're officially live with your [automation description]!

Here's what's happening now:
- [Specific functionality]
- [What it's handling automatically]
- [Where you can see it working]

For the next 48 hours, I'll be monitoring closely to ensure everything runs smoothly.

If you notice ANYTHING unusual:
- Slack me immediately (fastest)
- Or call/text: [your number]

Otherwise, sit back and enjoy the time savings!

Best,
Travis

---
Quick links:
- Training video: [link]
- User guide: [link]
- Support: [Slack channel]
```

---

## Phase 5: Post-Launch Support (Days 30-60)

### Week 1 Post-Launch: Intensive Monitoring

**Your Responsibilities:**
- [ ] Check system health daily
- [ ] Review logs for errors or anomalies
- [ ] Proactively reach out to client
- [ ] Address any bugs within 24 hours
- [ ] Gather feedback on user experience

**Client Check-in (Day 3 post-launch):**
```
Subject: How's [automation] working so far?

Hey [Name],

Quick check-in - we're now 3 days into having [automation] live.

How's it going? Any surprises (good or bad)?

I'm seeing [X volume] processed with [Y% success rate] on my end. Everything looks healthy, but wanted to get your perspective.

Let me know if anything needs tweaking!

Best,
Travis
```

### Week 2-4 Post-Launch: Optimization

**Bi-weekly optimization call:**
- Review performance metrics
- Discuss any friction points
- Identify enhancement opportunities
- Plan next phase (if multi-phase project)

**Deliverables:**
- Performance report (metrics vs. baseline)
- Recommended optimizations
- Updated documentation if changes made

---

## Onboarding Checklist (Master)

### Contract Signed (Day 1)
- [ ] Welcome email sent
- [ ] Project folder created
- [ ] Slack channel set up
- [ ] Information checklist sent
- [ ] Kickoff call scheduled
- [ ] First invoice sent and paid

### Pre-Kickoff (Days 1-3)
- [ ] Information checklist received
- [ ] Preliminary access granted
- [ ] Initial research completed
- [ ] Kickoff agenda prepared

### Kickoff Call (Day 3-5)
- [ ] Process deep-dive completed
- [ ] Workflow diagrams created
- [ ] Solution alignment confirmed
- [ ] Timeline agreed upon
- [ ] Communication cadence set
- [ ] Call recorded and notes sent

### Discovery & Build (Week 1)
- [ ] All access credentials received
- [ ] Sample data received
- [ ] Architecture finalized
- [ ] Core build completed
- [ ] Initial testing done
- [ ] Daily updates sent
- [ ] Weekly check-in held

### Testing & Training (Week 2)
- [ ] Refinements based on feedback
- [ ] Edge case testing completed
- [ ] Training session delivered
- [ ] Documentation created
- [ ] Soft launch plan confirmed

### Launch (Week 2, Days 3-5)
- [ ] Pre-launch checklist complete
- [ ] Parallel run executed
- [ ] Full cutover completed
- [ ] Launch announcement sent
- [ ] Monitoring in place

### Post-Launch (Days 30-60)
- [ ] Day 3 check-in completed
- [ ] Week 1 intensive monitoring done
- [ ] Optimization call held
- [ ] Performance report delivered
- [ ] Final invoice sent (remaining 50%)

---

## Required Information to Collect

### Business Context
1. **Company overview:** Size, structure, key personnel
2. **Current process documentation:** Written SOPs, videos, screenshots
3. **Volume metrics:** How many [leads/deals/tickets] per day/week/month?
4. **Success metrics:** What defines a "good" outcome?
5. **Timeline constraints:** Hard deadlines, busy seasons, planned events

### Technical Details
6. **Current tech stack:** CRM, email, project management, etc.
7. **Integration requirements:** What systems need to connect?
8. **Data sources:** Where does data currently live?
9. **User roles:** Who will use the automation? What permissions?
10. **Security/compliance:** Industry regulations, data handling requirements

### Process Specifics
11. **Trigger events:** What starts the automated workflow?
12. **Decision logic:** Business rules, conditional branching
13. **Exception handling:** What happens when something goes wrong?
14. **Human touchpoints:** Where does human judgment still apply?
15. **Output requirements:** Format, destination, frequency

### Sample Data
16. **Real examples:** Actual leads, tickets, deals (anonymized if needed)
17. **Edge cases:** Unusual scenarios that have happened
18. **Expected variations:** Different formats, sources, types

---

## Platform Access Setup Guide

### GHL (Go High Level)
**Access needed:**
- Agency admin access (or sub-account admin)
- API key (Settings → Integrations → API)

**Setup steps:**
1. Client creates sub-account for testing
2. Client generates API key with appropriate scopes
3. Client shares API key via secure method (1Password share link)

**Testing:**
- Create test contact
- Trigger test workflow
- Verify webhook delivery

---

### Instantly (Email Automation)
**Access needed:**
- Account admin access
- API key (Settings → API)

**Setup steps:**
1. Client adds you as team member OR shares API key
2. Client provides list of email accounts in use
3. Client shares campaign templates/sequences

**Testing:**
- Send test campaign to your email
- Verify tracking and reporting

---

### Zapier/Make
**Access needed:**
- Shared workspace OR transfer of specific Zaps

**Setup steps:**
1. Client invites you to workspace
2. Review existing Zaps for conflicts
3. Document any dependencies

---

### CRM (HubSpot, Salesforce, Pipedrive, etc.)
**Access needed:**
- API credentials with read/write permissions
- Sandbox environment (if available)

**Setup steps:**
1. Client creates dedicated API user (not personal account)
2. Client grants minimum required permissions
3. Client provides schema/field documentation

**Testing:**
- CRUD operations in sandbox
- Verify field mappings
- Test error handling

---

### Calendar (Google, Outlook)
**Access needed:**
- OAuth app credentials
- Calendar access permissions

**Setup steps:**
1. Client approves OAuth consent screen
2. Test read/write to calendar
3. Verify timezone handling

---

## Kickoff Call Agenda Template

**Project:** [Project Name]
**Client:** [Client Name]
**Date:** [Date]
**Duration:** 60 minutes

---

### 1. Welcome & Agenda (5 mins)
- Introductions
- Review agenda
- Set expectations for call outcome

### 2. Process Deep-Dive (25 mins)
**Current State:**
- Walk through current workflow step-by-step
- Identify pain points and inefficiencies
- Document tools and systems in use

**Desired State:**
- What does success look like?
- Key metrics to improve
- Must-have vs. nice-to-have features

**Edge Cases:**
- Unusual scenarios to handle
- Failure modes and fallbacks
- Compliance or security considerations

### 3. Solution Review (15 mins)
- Present proposed automation architecture
- Walkthrough user experience
- Confirm scope (in/out)
- Align on success criteria

### 4. Timeline & Milestones (10 mins)
- Week-by-week breakdown
- Milestone review dates
- Launch date
- Client responsibilities and deadlines

### 5. Logistics & Next Steps (5 mins)
- Access and credentials needed
- Communication cadence (Slack, email, calls)
- Weekly check-in scheduling
- Immediate action items for both parties

---

**Action Items:**

**Client:**
- [ ] Provide [specific access] by [date]
- [ ] Share [specific data] by [date]
- [ ] Review [deliverable] by [date]

**Agency:**
- [ ] Build [component] by [date]
- [ ] Send [documentation] by [date]
- [ ] Schedule [next call] for [date]

---

## Expectations Setting Framework

### What Clients Should Expect

**Communication:**
- Daily Slack updates on progress
- Weekly 30-min check-in calls
- 4-hour response time to questions (business hours)
- Proactive alerts if timeline shifts

**Timeline:**
- STARTER: 2 weeks from kickoff to launch
- GROWTH: 4 weeks from kickoff to launch
- ENTERPRISE: 8 weeks from kickoff to launch
- Delays only if client-side blockers

**Deliverables:**
- Working automation (not just documentation)
- Training session and materials
- Ongoing support during onboarding period
- Performance monitoring post-launch

### What You Expect from Clients

**Responsiveness:**
- 24-hour turnaround on approvals
- Same-day response to blocking questions
- Attendance at scheduled calls

**Access:**
- Full credentials within 3 days of kickoff
- Sample data provided promptly
- Introduction to key stakeholders

**Engagement:**
- Feedback on builds within 48 hours
- Attendance at training
- Testing in staging before launch approval

**Set This in Kickoff:**
```
To hit our timeline, I'll need quick turnaround from your team on a few things:

- When I ask for feedback on a build, ideally within 24-48 hours
- If I'm blocked on access or a decision, same-day response
- Attendance at our weekly calls

I'll hold up my end with daily updates and staying on schedule. Does that work for you?
```

---

## Onboarding Red Flags

Watch for these warning signs and address immediately:

**🚩 Slow Access Provisioning**
- If access takes >5 days, escalate: "We're now [X days] past kickoff and still waiting on [access]. This will delay our launch by [Y days]. Can we prioritize this?"

**🚩 Scope Creep in Discovery**
- If client keeps adding requirements: "That's a great idea! Let's add it to the parking lot for Phase 2. For this phase, we agreed on [original scope]. Want to revisit scope and timeline?"

**🚩 Unresponsive Stakeholder**
- If client goes dark: "Haven't heard from you in [X days]. Just want to make sure everything's okay. Should we pause the project or continue based on our last conversation?"

**🚩 Unrealistic Expectations**
- If client expects magic: "I want to make sure we're aligned. This automation will handle [X, Y, Z], but [A, B, C] will still require human judgment. Is that what you were expecting?"

**🚩 Payment Delays**
- If second payment is late: "I've paused work until we get the final payment sorted. Can we get that processed this week so we can finish strong?"

---

## Success Metrics

### Onboarding is successful when:
- ✅ Client understands what was built and how to use it
- ✅ Automation is live and processing real data
- ✅ Client has training materials and support access
- ✅ Timeline was met (or delays were communicated early)
- ✅ Client expresses satisfaction (testimonial-worthy)
- ✅ Opportunity for upsell or Phase 2 identified

### Onboarding metrics to track:
| Metric | Target |
|--------|--------|
| Time to first access granted | <3 days |
| Time to kickoff call | <5 days |
| Kickoff → Launch (STARTER) | 14 days |
| Client response time | <24 hours |
| On-time launch % | >80% |
| Post-launch issue rate | <10% |
| Client satisfaction (1-10) | 8+ |

---

## Definition of Done

This onboarding SOP is complete when:
- ✅ All phases documented with timelines and responsibilities
- ✅ Checklist created for tracking progress
- ✅ Communication templates ready to use
- ✅ Access setup guides for common platforms
- ✅ Training materials framework established
- ✅ Red flags and mitigation strategies defined

**Next Steps:** Use this SOP for first 3 client onboardings and refine based on real-world learnings.
