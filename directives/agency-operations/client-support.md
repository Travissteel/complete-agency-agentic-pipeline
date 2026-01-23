# Client Support SOP

**Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Define support tiers, SLAs, and processes for ongoing client success (1-man agency)

---

## Support Philosophy

**Core Principles:**
1. **Proactive over reactive:** Catch issues before clients report them
2. **Fast response:** Acknowledge quickly even if resolution takes time
3. **Clear expectations:** Clients know what's included vs. billable
4. **Continuous value:** Regular check-ins show ongoing ROI
5. **Upsell naturally:** Support reveals opportunities for expansion

---

## Support Tiers

### STARTER Support (Included in $500/month)

**Monthly Hours Included:** 5 hours
**Response Time SLA:** 48 hours (business days)
**Resolution Time SLA:** 5 business days for non-critical issues
**Support Channels:** Email, Slack

**Included Services:**
- Bug fixes (production issues)
- Performance monitoring
- Monthly health check
- Email/Slack support
- Minor configuration changes (<30 mins each)

**NOT Included:**
- New feature development
- Major workflow changes
- Additional integrations
- Training beyond initial onboarding
- Emergency/weekend support

**Best for:** Single automation with stable requirements

---

### GROWTH Support (Included in $1,200/month)

**Monthly Hours Included:** 10 hours
**Response Time SLA:** 24 hours (business days)
**Resolution Time SLA:** 3 business days for non-critical issues
**Support Channels:** Email, Slack, scheduled calls

**Included Services:**
- Everything in STARTER
- Priority support queue
- Bi-weekly optimization calls (30 mins)
- Monthly performance report
- Minor enhancements (within hour bank)
- Quarterly roadmap planning
- Business hours phone support

**NOT Included:**
- Major new features (requires project quote)
- Additional AI agents
- Emergency/weekend support (available as add-on)

**Best for:** Multi-workflow automations requiring regular optimization

---

### ENTERPRISE Support (Included in $2,500/month)

**Monthly Hours Included:** 20 hours
**Response Time SLA:** 4 hours (business days), 24 hours (weekends)
**Resolution Time SLA:** Same-day for critical issues
**Support Channels:** Email, Slack, phone, video calls

**Included Services:**
- Everything in GROWTH
- Dedicated support priority (top of queue)
- Weekly check-in calls (30 mins)
- Custom monthly reporting
- Proactive optimization recommendations
- After-hours emergency support (critical issues only)
- Quarterly strategy sessions (1 hour)
- Unlimited minor tweaks (within hour bank)

**NOT Included:**
- Massive architecture overhauls (requires separate project)

**Best for:** Business-critical automation requiring high availability and continuous optimization

---

## Support Tier Comparison

| Feature | STARTER | GROWTH | ENTERPRISE |
|---------|---------|--------|------------|
| **Monthly Hours** | 5 | 10 | 20 |
| **Response Time** | 48 hrs | 24 hrs | 4 hrs |
| **Email/Slack** | ✅ | ✅ | ✅ |
| **Phone Support** | ❌ | Business hours | 24/7 critical |
| **Monthly Health Check** | ✅ | ✅ | ✅ |
| **Performance Reports** | Quarterly | Monthly | Weekly |
| **Optimization Calls** | On-demand | Bi-weekly | Weekly |
| **Emergency Support** | ❌ | Add-on | ✅ |
| **Roadmap Planning** | ❌ | Quarterly | Monthly |
| **Priority Queue** | Standard | Priority | Dedicated |

---

## Response Time SLAs

### Severity Levels

**Critical (P0):**
- **Definition:** System completely down; core business process broken
- **Examples:** AI agent not responding, all leads going unprocessed, integration completely failed
- **Response SLA:**
  - STARTER: 4 hours
  - GROWTH: 2 hours
  - ENTERPRISE: 1 hour (business hours), 4 hours (after hours)
- **Resolution SLA:**
  - STARTER: 24 hours
  - GROWTH: 12 hours
  - ENTERPRISE: 4 hours

**High (P1):**
- **Definition:** Major functionality degraded; workaround available
- **Examples:** AI agent slow, some leads delayed, integration intermittently failing
- **Response SLA:**
  - STARTER: 24 hours
  - GROWTH: 8 hours
  - ENTERPRISE: 2 hours
- **Resolution SLA:**
  - STARTER: 3 business days
  - GROWTH: 2 business days
  - ENTERPRISE: 1 business day

**Medium (P2):**
- **Definition:** Minor issue; limited impact
- **Examples:** Formatting error, delayed notification, cosmetic bug
- **Response SLA:**
  - STARTER: 48 hours
  - GROWTH: 24 hours
  - ENTERPRISE: 4 hours
- **Resolution SLA:**
  - STARTER: 5 business days
  - GROWTH: 3 business days
  - ENTERPRISE: 2 business days

**Low (P3):**
- **Definition:** Enhancement request or minor annoyance
- **Examples:** Feature request, "nice-to-have" improvement, documentation update
- **Response SLA:**
  - STARTER: 5 business days
  - GROWTH: 3 business days
  - ENTERPRISE: 24 hours
- **Resolution SLA:**
  - STARTER: Next monthly maintenance window
  - GROWTH: Next bi-weekly optimization call
  - ENTERPRISE: Next weekly check-in or sooner if hours available

---

## Issue Escalation Process

### Client-Reported Issues

**Step 1: Client Reports Issue**
- Via Slack, email, or phone (tier-dependent)
- Client describes problem and impact

**Step 2: Initial Response (within SLA)**
```
Hey [Name],

Got your message about [issue]. I'm looking into it now.

Quick questions to help diagnose:
1. [Specific question]
2. [Specific question]
3. When did this start?

I'll have an update for you by [specific time].

- Travis
```

**Step 3: Diagnosis (1-2 hours)**
- Review logs and monitoring
- Reproduce issue if possible
- Identify root cause
- Determine severity level

**Step 4: Update Client with Findings**
```
Update on [issue]:

🔍 What's happening: [Clear explanation]
🛠️ What I'm doing: [Action plan]
⏱️ ETA for fix: [Realistic timeline]

I'll keep you posted every [frequency] until it's resolved.

Let me know if you have questions!

- Travis
```

**Step 5: Implement Fix**
- Fix issue in staging first
- Test thoroughly
- Deploy to production
- Monitor for 24-48 hours

**Step 6: Confirm Resolution**
```
Issue resolved!

✅ What was fixed: [Description]
📊 Verification: [How you know it's working]
🛡️ Prevention: [What I did to prevent recurrence]

Please confirm everything looks good on your end.

- Travis
```

**Step 7: Post-Mortem (for P0/P1 issues)**
- Document root cause
- Update monitoring to catch earlier next time
- Share learnings with client

---

### Proactive Issue Detection

**Daily Monitoring Routine (30 mins each morning):**

**For each active client:**
- [ ] Check error logs (last 24 hours)
- [ ] Review system health dashboard
- [ ] Verify key metrics within normal range
- [ ] Confirm critical workflows ran successfully
- [ ] Check API rate limits and usage

**If anomaly detected:**
```
Subject: Heads up - [System] Update

Hey [Name],

I noticed [specific metric/behavior] this morning during my routine check.

It's not causing any issues yet, but I wanted to give you a heads up. I'm investigating and will have it resolved before it becomes a problem.

Will update you by EOD.

- Travis
```

**Weekly Proactive Check-in (GROWTH and ENTERPRISE only):**
```
Subject: [Client Name] - Weekly Health Report

Hey [Name],

Quick weekly update on your automation:

📊 This Week's Stats:
- [Metric 1]: [Number] (vs. [baseline])
- [Metric 2]: [Number] (vs. [baseline])
- Uptime: [%]
- Errors: [Number]

✅ All systems running smoothly!

💡 Observation: [Any insights or patterns noticed]

🎯 Next Steps: [Any optimizations planned]

Let me know if you have questions!

- Travis
```

---

## Monthly Reporting

### STARTER Tier: Quarterly Report

**Sent:** Last week of every 3rd month
**Format:** Email with PDF attached

**Contents:**
1. **Executive Summary:** High-level performance overview
2. **Key Metrics:** Volume processed, success rate, time saved
3. **System Health:** Uptime, errors, performance
4. **Recommendations:** Optimization opportunities
5. **Next Quarter:** Proposed enhancements

---

### GROWTH Tier: Monthly Report

**Sent:** First week of each month (covering previous month)
**Format:** Email with interactive dashboard link + PDF

**Contents:**
1. **Executive Summary:** Month-over-month comparison
2. **Performance Metrics:** Detailed breakdown by workflow
3. **ROI Analysis:** Time/cost saved vs. investment
4. **Incidents:** Any issues and resolutions
5. **Optimizations Implemented:** What was improved
6. **Recommendations:** Next month's priorities

---

### ENTERPRISE Tier: Weekly + Monthly Reports

**Weekly Report (Email):**
```
Subject: [Client Name] - Week of [Date] Summary

Hey [Name],

Week in review:

📈 Activity:
- [Workflow 1]: [Volume] processed ([change] vs. last week)
- [Workflow 2]: [Volume] processed ([change] vs. last week)

✅ Wins:
- [Notable success or improvement]

⚠️ Issues Resolved:
- [Any problems that came up and were fixed]

🔧 Optimizations:
- [Any tweaks made this week]

📅 Next Week:
- [Planned work or focus area]

See you on our weekly call!

- Travis
```

**Monthly Report (Detailed):**
- Full analytics dashboard
- ROI calculation
- Trend analysis
- Strategic recommendations
- Roadmap update

---

## Support Request Categories

### Included in Monthly Hours

**Bug Fixes:**
- Functionality not working as designed
- Errors or failures in production
- Data integrity issues
- Integration breakages

**Performance Optimization:**
- Speed improvements
- Efficiency tuning
- Resource usage optimization

**Minor Configuration Changes:**
- Adjusting thresholds or rules
- Updating notification recipients
- Modifying simple business logic
- UI tweaks (text, colors, layout)

**Monitoring & Maintenance:**
- Log reviews
- Health checks
- Security patches
- Dependency updates

**Consultation:**
- Strategy calls
- Roadmap planning
- Process improvement recommendations

---

### Billable (Beyond Monthly Hours)

**New Feature Development:**
- Adding net-new functionality
- Building additional workflows
- Creating new integrations
- Developing new AI agents

**Major Refactoring:**
- Architecture changes
- Technology stack upgrades
- Database migrations
- Significant UI redesigns

**Training:**
- Additional training sessions beyond onboarding
- Team onboarding for new hires
- Custom documentation requests

**Data Work:**
- Large data migrations
- Custom reporting beyond standard dashboards
- Historical data analysis

**Emergency Support (STARTER/GROWTH only):**
- After-hours or weekend support
- Same-day turnaround requests

---

## Hour Bank Management

### Tracking Hours

**For each support request:**
1. Log start time when work begins
2. Track time in 15-minute increments
3. Note task description
4. Log end time when complete
5. Update client hour bank

**Hour Tracking Sheet (per client):**

| Date | Task | Time | Running Total | Notes |
|------|------|------|---------------|-------|
| 1/15 | Investigated email sync issue | 1.5h | 1.5h | Bug fix - included |
| 1/18 | Monthly health check | 0.5h | 2h | Routine maintenance |
| 1/22 | Added new field to CRM sync | 1h | 3h | Minor config change |

---

### When Hours Are Depleted

**75% Used (proactive alert):**
```
Subject: [Client Name] - Support Hours Update

Hey [Name],

Heads up - we've used 7.5 of your 10 monthly support hours so far this month.

Remaining: 2.5 hours

If you're planning any requests, want to make sure you're aware. If we go over, additional time is billed at $150/hour (or we can upgrade your tier for more included hours).

Let me know if you have questions!

- Travis
```

**100% Used (before doing additional work):**
```
Subject: [Client Name] - Support Hours Depleted

Hey [Name],

We've used all 10 of your monthly support hours for [month].

For [new request], I have two options:

1. **Bill hourly:** $150/hour (estimated [X] hours = $[total])
2. **Add to next month:** I can tackle this when your hours refresh on [date]
3. **Upgrade tier:** Move to ENTERPRISE for $2,500/month (20 hours included + priority support)

Which would you prefer?

- Travis
```

---

### Rollover Policy

**STARTER:** No rollover (use it or lose it)

**GROWTH:** Up to 5 hours rollover to next month (max bank of 15 hours)

**ENTERPRISE:** Up to 10 hours rollover to next month (max bank of 30 hours)

**Why rollover limits?**
- Prevents massive "debt" accumulation
- Encourages regular engagement
- Ensures predictable workload

---

## Renewal & Upsell Triggers

### Proactive Renewal Management

**60 Days Before Annual Renewal:**
- Schedule strategy call
- Review year's performance and ROI
- Discuss expansion opportunities
- Present renewal options (current tier vs. upgrade)

**30 Days Before Monthly Contract End:**
- Check in on satisfaction
- Address any concerns
- Confirm intent to continue

---

### Upsell Indicators

Watch for these signals during support:

**Signal: Client consistently uses all monthly hours**
- **Action:** Suggest tier upgrade
- **Script:** "I noticed you've been maxing out your monthly hours for the last 3 months. Want to explore upgrading to [next tier]? You'd get [X more hours] plus [additional benefits]."

**Signal: Client requests emergency support multiple times (STARTER/GROWTH)**
- **Action:** Suggest ENTERPRISE tier
- **Script:** "Since you've needed after-hours support [X times] in the last [period], it might make sense to move to ENTERPRISE tier. That includes 24/7 emergency support vs. paying $300/hour each time."

**Signal: Client asks about new features/workflows**
- **Action:** Propose Phase 2 project
- **Script:** "That's a great idea! Would be roughly [X weeks] to build. Want me to put together a proposal for Phase 2?"

**Signal: Client mentions pain point in adjacent area**
- **Action:** Suggest complementary automation
- **Script:** "Sounds like [new area] could use automation too. I actually built something similar for [other client]. Want to explore that?"

**Signal: Client references scaling challenges**
- **Action:** Position automation as enabler
- **Script:** "If you're planning to scale [X], we should look at automating [Y] now before it becomes a bottleneck. Want to map that out?"

---

### Renewal Email Template (30 days out)

```
Subject: [Client Name] - Renewal Coming Up

Hey [Name],

Your [current tier] plan renews on [date] - just wanted to give you a heads up!

Quick recap of the last [period]:
- ✅ [Metric]: [Performance]
- ✅ [Metric]: [Performance]
- ✅ [Time/cost saved]: [Amount]

Options for renewal:
1. **Continue as-is:** $[current price]/month
2. **Upgrade to [next tier]:** $[new price]/month (get [additional benefits])
3. **Annual prepay:** $[discounted price] (save 15%)

Let me know which works best, and I'll send over the updated agreement.

Thanks for being an awesome client!

- Travis

P.S. - If there's anything we should improve, I'm all ears.
```

---

## Issue Troubleshooting Guide

### Common Issues & Resolutions

**Issue: AI Agent Not Responding**

**Diagnosis Steps:**
1. Check API key validity
2. Verify rate limits not exceeded
3. Review error logs for specific failures
4. Test with simple input

**Common Causes:**
- API key expired or revoked
- Rate limit hit
- Upstream service outage
- Input format changed

**Resolution:**
- Refresh API credentials
- Implement rate limit backoff
- Switch to backup service if available
- Update input parser

**Prevention:**
- Monitor API key expiration
- Track rate limit usage
- Set up uptime monitoring for dependencies

---

**Issue: Data Not Syncing Between Systems**

**Diagnosis Steps:**
1. Check integration authentication
2. Verify webhook delivery
3. Review field mappings
4. Test with manual trigger

**Common Causes:**
- OAuth token expired
- Webhook endpoint changed
- Field name changed in destination system
- Data validation failing

**Resolution:**
- Re-authenticate integration
- Update webhook URL
- Remap fields
- Adjust validation rules

**Prevention:**
- Auto-refresh OAuth tokens before expiration
- Monitor webhook health
- Version control field mappings
- Add data validation logging

---

**Issue: Performance Degradation**

**Diagnosis Steps:**
1. Compare current vs. baseline metrics
2. Review recent changes
3. Check resource utilization
4. Profile slow operations

**Common Causes:**
- Data volume increased
- External API slowdown
- Inefficient query or logic
- Resource constraints

**Resolution:**
- Optimize database queries
- Add caching layer
- Batch operations
- Scale resources

**Prevention:**
- Monitor performance trends
- Set alerts for slowdowns
- Regular performance reviews
- Capacity planning

---

## Client Communication Templates

### Acknowledging Support Request

```
Subject: Re: [Client's Subject]

Hey [Name],

Got your request - looking into [issue] now.

I'll have an update for you by [specific time/date].

Quick question to help troubleshoot: [relevant question]?

- Travis
```

---

### Issue Update (Still Working)

```
Subject: Update on [Issue]

Hey [Name],

Quick update:

🔍 Found the issue: [Clear explanation]
🛠️ Working on: [What you're doing]
⏱️ ETA: [Realistic timeline]

Will update you again by [time] or sooner if resolved.

- Travis
```

---

### Issue Resolved

```
Subject: [Issue] - RESOLVED

Hey [Name],

Good news - [issue] is resolved!

✅ What was wrong: [Explanation]
✅ What I fixed: [Actions taken]
✅ Testing: [Verification performed]

Should be working normally now. Let me know if you see any other issues!

- Travis

P.S. - To prevent this in the future, I [preventive measure].
```

---

### Exceeding Monthly Hours

```
Subject: [Task] - Hour Bank Status

Hey [Name],

Quick heads up - [requested task] will take approximately [X] hours.

You currently have [Y] hours remaining in your monthly bank.

Options:
1. Use remaining hours now, bill extra [Z] hours at $150/hour (total: $[amount])
2. Wait until [next month] when hours refresh
3. Upgrade to [higher tier] for [benefits]

Which would you prefer?

- Travis
```

---

### Proactive Optimization Suggestion

```
Subject: Optimization Idea for [System]

Hey [Name],

I noticed [pattern/metric] while reviewing your system.

I think we could [specific improvement] which would [benefit].

Estimated effort: [X] hours ([within/outside] your monthly bank)

Want me to tackle this?

- Travis
```

---

## Support Tools & Systems

### Required Monitoring Tools

**For all clients:**
- **Error tracking:** Sentry, Rollbar, or CloudWatch
- **Uptime monitoring:** UptimeRobot or Pingdom
- **Log aggregation:** Logtail, Papertrail, or CloudWatch Logs
- **Performance monitoring:** New Relic, Datadog, or custom dashboard

**Setup checklist per client:**
- [ ] Error tracking integrated
- [ ] Uptime checks configured (5-min intervals)
- [ ] Critical alerts routed to your phone/Slack
- [ ] Weekly summary emails configured
- [ ] Performance baselines established

---

### Support Ticketing (Lightweight)

**For 1-man agency, keep it simple:**

**Option 1: Dedicated Slack Channel per Client**
- Create #[client-name]-support
- All requests go there
- Use threads for tracking
- Pin resolved items

**Option 2: Shared Inbox (Help Scout, Front)**
- support@[youragency].com
- Tag by client and priority
- SLA tracking built-in
- Client self-service portal

**Option 3: Simple Spreadsheet**
- Google Sheet with columns: Date, Client, Issue, Priority, Status, Hours, Notes
- Update in real-time
- Share with client (optional)

---

## Monthly Support Workflow

### Week 1: Performance Review & Reporting

**For each client:**
- [ ] Pull previous month's metrics
- [ ] Generate performance report
- [ ] Identify trends or anomalies
- [ ] Draft recommendations
- [ ] Send report by Day 5

---

### Week 2: Proactive Maintenance

**For each client:**
- [ ] Review error logs for patterns
- [ ] Update dependencies (security patches)
- [ ] Optimize slow queries or workflows
- [ ] Document any changes made

---

### Week 3: Client Check-ins

**For each client:**
- [ ] GROWTH/ENTERPRISE: Schedule and hold check-in calls
- [ ] STARTER: Email check-in
- [ ] Discuss any open issues
- [ ] Gather feedback
- [ ] Identify upsell opportunities

---

### Week 4: Planning & Optimization

**For each client:**
- [ ] Review hour bank usage
- [ ] Plan next month's priorities
- [ ] Update roadmaps (GROWTH/ENTERPRISE)
- [ ] Implement quick wins from backlog

---

## Success Metrics

### Support Quality Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| First response time | Within SLA 95%+ | Track time from request to first reply |
| Resolution time | Within SLA 90%+ | Track time from request to closure |
| Client satisfaction | 8+ / 10 | Monthly survey |
| Proactive vs. reactive issues | 70% proactive | Log issue source |
| Hour bank utilization | 60-80% | Monthly usage reports |
| Renewal rate | 90%+ | Track renewals vs. cancellations |

### Monthly Support Review

**Self-assessment questions:**
1. Did I meet all SLAs this month?
2. Were clients surprised by any issues (should have been proactive)?
3. Did I communicate updates clearly and frequently?
4. Are clients getting value from their monthly hours?
5. What can I automate to be more efficient?

---

## Offboarding Process

If a client decides to end service:

**Step 1: Exit Interview**
- Understand why they're leaving
- Ask what could have been better
- Confirm if decision is final

**Step 2: Knowledge Transfer**
- Provide full technical documentation
- Export all data and credentials
- Offer 1-hour handoff call
- 30-day support window (billable hourly)

**Step 3: System Handoff**
- Transfer code repositories
- Document all integrations
- Provide admin access to all tools
- Remove your access after transition

**Step 4: Final Invoice**
- Bill for any remaining work
- Prorate monthly fee if applicable
- Process final payment

**Step 5: Stay in Touch**
- Send gracious goodbye email
- Offer to help if they return
- Ask for testimonial/feedback
- Add to alumni network

**Offboarding Email Template:**
```
Subject: [Client Name] - Transition Plan

Hey [Name],

Understood - I'll make the transition as smooth as possible.

Here's the plan:
1. [Date]: Handoff call (1 hour - on me)
2. [Date]: Full documentation delivered
3. [Date]: Access transferred, final invoice sent
4. [Date]: My access removed, transition complete

You'll have 30 days of billable support if questions come up ($150/hour).

Thanks for trusting me with [project]. If circumstances change, I'm just an email away.

Best,
Travis

---
Handoff call: [Calendly link]
```

---

## Definition of Done

This support SOP is complete when:
- ✅ Support tiers clearly defined with pricing and SLAs
- ✅ Response and resolution processes documented
- ✅ Hour bank management system established
- ✅ Monthly reporting templates created
- ✅ Renewal and upsell triggers identified
- ✅ Communication templates ready to use

**Next Steps:** Implement monitoring for first 3 clients and test support workflow end-to-end.
