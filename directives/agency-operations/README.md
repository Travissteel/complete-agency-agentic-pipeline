# Agency Operations Directives

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Complete operational playbook for running a 1-man AI automation agency

---

## Overview

This directory contains the complete set of SOPs (Standard Operating Procedures) and tools for running an AI automation agency serving B2B clients in commercial insurance, commercial real estate, and recruitment verticals.

These directives follow the **DOE (Directive Orchestration Execution) Framework**, providing natural language instructions that guide consistent, repeatable business processes.

---

## Directory Contents

### 1. Client Acquisition SOP
**File:** `client-acquisition.md`
**Size:** ~15KB
**Purpose:** Systematic approach to acquiring new clients

**Covers:**
- Target market profiles (commercial insurance, CRE, recruitment)
- Lead generation channels (warm network, LinkedIn, partnerships, cold email)
- Cold outreach sequences (5-email campaign templates)
- Discovery call script (30-min structure)
- Pricing tiers (STARTER, GROWTH, ENTERPRISE)
- Proposal template structure
- Objection handling
- Lead tracking metrics

**When to use:**
- Planning outreach campaigns
- Conducting discovery calls
- Creating proposals
- Handling pricing objections
- Tracking sales pipeline

---

### 2. Client Onboarding SOP
**File:** `client-onboarding.md`
**Size:** ~21KB
**Purpose:** Transform signed contracts into launched automations

**Covers:**
- Onboarding timeline by package (2-8 weeks)
- Contract-to-kickoff process (Days 1-3)
- Kickoff call agenda and templates
- Discovery & build phases
- Testing and training procedures
- Launch approach (soft launch → full cutover)
- Post-launch support (Days 1-60)
- Platform access setup guides (GHL, Instantly, CRMs)
- Communication templates
- Red flags and mitigation strategies

**When to use:**
- Immediately after contract signing
- Planning project timelines
- Conducting kickoff calls
- Managing client expectations
- Transitioning to support

---

### 3. Service Delivery SOP
**File:** `service-delivery.md`
**Size:** ~20KB
**Purpose:** Define delivery standards, timelines, and quality processes

**Covers:**
- Delivery timelines by service type (agents, workflows, integrations, dashboards)
- Quality checkpoints (6-stage verification)
- Client communication cadence (daily updates, weekly calls, milestone reviews)
- Milestone tracking system
- Handoff procedures (build → support, agency → client)
- Scope management and change request process
- Risk management
- Performance metrics
- Continuous improvement framework

**When to use:**
- Planning project delivery
- Conducting quality reviews
- Communicating with clients during build
- Managing scope changes
- Transitioning projects to support

---

### 4. Client Support SOP
**File:** `client-support.md`
**Size:** ~23KB
**Purpose:** Define support tiers, SLAs, and ongoing client success

**Covers:**
- Support tiers (STARTER, GROWTH, ENTERPRISE)
- Response time SLAs by severity (P0-P3)
- Issue escalation process
- Proactive monitoring routines
- Monthly reporting templates
- Hour bank management
- Renewal and upsell triggers
- Support request categories (included vs. billable)
- Communication templates
- Offboarding process

**When to use:**
- Setting client support expectations
- Responding to support requests
- Managing monthly hour banks
- Proactive client monitoring
- Planning renewals and upsells

---

### 5. Pricing Calculator
**File:** `pricing-calculator.js`
**Size:** ~18KB
**Type:** JavaScript utility
**Purpose:** Calculate project pricing with ROI analysis

**Features:**
- Package pricing (STARTER, GROWTH, ENTERPRISE)
- A la carte service pricing
- Complexity multipliers (security, legacy systems, real-time, multi-language)
- Volume discounts (6-month, 12-month prepay, referrals)
- ROI calculation (time savings → dollar savings)
- Formatted proposal generation
- 5 pre-built examples

**Usage:**
```bash
# Run all examples
node pricing-calculator.js

# Use programmatically
const pricing = require('./pricing-calculator.js');
const proposal = pricing.generateProposal('GROWTH', {
  customDashboard: true,
  integrations: ['simple', 'complex']
}, {
  hoursPerWeekSaved: 15,
  hourlyRate: 60
}, 'prepay12Months');

console.log(pricing.formatProposal(proposal));
```

**When to use:**
- Creating client proposals
- Calculating custom quotes
- Demonstrating ROI to prospects
- Planning pricing strategy

---

## Quick Start Guide

### For New Agency Launch

**Week 1: Acquisition**
1. Read `client-acquisition.md`
2. Create warm network outreach list (50 contacts)
3. Send personalized messages using templates
4. Set up LinkedIn content calendar
5. Configure Instantly for cold email

**Week 2-3: First Clients**
1. Conduct discovery calls using script
2. Use `pricing-calculator.js` to generate quotes
3. Send proposals using template structure
4. Sign first 3 clients

**Week 4+: Delivery**
1. Follow `client-onboarding.md` for each new client
2. Use `service-delivery.md` during build phase
3. Transition to `client-support.md` post-launch
4. Track metrics and optimize

---

### For Ongoing Operations

**Daily:**
- Monitor client systems (30 mins)
- Respond to support requests (per SLA)
- Update project progress (Slack updates)

**Weekly:**
- Client check-in calls (30 mins each)
- Review project milestones
- Send outreach campaigns (50 emails)
- Post LinkedIn content (3x/week)

**Monthly:**
- Generate performance reports
- Conduct optimization calls
- Review hour bank usage
- Plan renewals and upsells

**Quarterly:**
- Strategic planning sessions (ENTERPRISE)
- Update SOPs based on learnings
- Analyze metrics and trends

---

## File Sizes & Stats

| File | Size | Lines | Sections |
|------|------|-------|----------|
| client-acquisition.md | 15KB | ~650 | 11 |
| client-onboarding.md | 21KB | ~900 | 10 |
| service-delivery.md | 20KB | ~850 | 12 |
| client-support.md | 23KB | ~950 | 13 |
| pricing-calculator.js | 18KB | ~700 | 5 examples |
| **TOTAL** | **97KB** | **~4,050** | **51** |

---

## Integration with DOE Framework

These agency operations directives are **meta-level directives** - they guide YOUR operations, not the technical implementations you build for clients.

**Structure:**
- **Directives (these files):** Natural language SOPs for agency operations
- **Executions (your work):** Technical code/automation for clients

**Self-Annealing:**
- Update these SOPs after each client engagement
- Document what worked and what didn't
- Refine templates based on real-world feedback
- Build reusable components to speed up delivery

---

## Customization Guide

These SOPs are designed for a 1-man agency but can be adapted:

**Scaling to 2-5 people:**
- Add role definitions (sales, delivery, support)
- Define handoff procedures between team members
- Adjust hour bank limits for team capacity

**Specializing in one vertical:**
- Deep-dive on that vertical's pain points
- Create vertical-specific case studies
- Adjust pricing for industry norms

**Adding new services:**
- Define delivery timeline
- Create quality checkpoints
- Update pricing calculator
- Add to package tiers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release - complete agency operations framework |

---

## Next Steps

1. **Read all 5 documents** to understand full agency lifecycle
2. **Test pricing calculator** with real prospect scenarios
3. **Customize templates** with your agency name and branding
4. **Launch first outreach campaign** using acquisition SOP
5. **Sign first client** and follow onboarding → delivery → support SOPs
6. **Refine SOPs** based on real-world learnings (self-annealing)

---

## Support

For questions or improvements to these SOPs:
- Review after each client engagement
- Document edge cases and solutions
- Update templates with better language
- Share learnings across files

**Living Documents:** These SOPs should evolve with your agency. Update them regularly!
