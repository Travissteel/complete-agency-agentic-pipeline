# AI Agency Pipeline

> Full-stack AI automation platform for B2B lead generation, cold outreach, CRM integration, and AI-powered client engagement.

**Version:** 1.0.0
**Framework:** DOE (Directive Orchestration Execution)
**Target Markets:** Commercial Insurance, Commercial Real Estate, Recruitment Firms

---

## Overview

This project provides a complete AI-powered agency pipeline for 1-man agencies serving B2B clients. It combines web scraping, cold email automation, CRM integration, AI agents, and workflow orchestration into a unified system.

### Core Capabilities

1. **Lead Generation** - Automated web scraping using Apify
2. **Cold Outreach** - Multi-channel email campaigns via Instantly/SmartLead
3. **CRM Integration** - GoHighLevel for client management and white-label delivery
4. **AI Receptionist** - 24/7 phone/SMS handling with natural language understanding
5. **Workflow Automation** - n8n orchestration connecting all platforms
6. **Calendar Booking** - Automated meeting scheduling and follow-ups

---

## Technology Stack

### Lead Generation & Scraping
- **Apify** - Actor-based web scraping platform
- **Custom scrapers** - Industry-specific lead collection

### Cold Outreach
- **Instantly.ai** - Primary cold email platform
- **SmartLead** - Alternative/backup email platform
- Multi-inbox rotation for deliverability

### CRM & Client Delivery
- **GoHighLevel** - All-in-one CRM platform
- White-label client portals
- AI-powered phone/SMS receptionist
- Funnel and landing page builder

### Workflow Orchestration
- **n8n** - Self-hosted workflow automation
- API integrations between all platforms
- Error handling and retry logic

### AI/LLM Capabilities
- **OpenAI GPT-4** - Conversational AI, email personalization
- **Anthropic Claude** - Document analysis, research tasks
- Custom prompts per vertical (insurance, real estate, recruitment)

### Infrastructure
- **Node.js** - Runtime environment
- **PostgreSQL** - Relational database
- **Redis** - Caching and queue management
- **Docker** - Container orchestration

---

## Project Structure

```
agency-pipeline/
├── .claude/                    # DOE Framework orchestration
│   ├── CLAUDE.md              # Orchestrator instructions
│   └── agents/                # Subagent definitions
│       ├── coder.md           # Implementation agent
│       ├── tester.md          # Validation agent
│       └── stuck.md           # Human escalation agent
│
├── directives/                # Natural language SOPs (DOE Directives)
│   ├── lead-generation/       # Apify scraping workflows
│   ├── cold-outreach/         # Email campaign SOPs
│   ├── crm-integration/       # GHL integration guides
│   ├── nurture-sequences/     # Follow-up automation
│   ├── ai-receptionist/       # Phone/SMS agent protocols
│   └── calendar-booking/      # Meeting scheduling flows
│
├── executions/                # Deterministic code (DOE Executions)
│   ├── scrapers/              # Apify actors and utilities
│   ├── integrations/          # API client libraries
│   └── utils/                 # Shared helper functions
│
├── n8n-workflows/             # Exported n8n workflow JSON files
│
├── dashboards/                # Client dashboards and reporting
│
├── tests/                     # Integration and unit tests
│
├── .env.example               # Environment variable template
├── .env                       # Actual credentials (gitignored)
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

---

## DOE Framework Integration

This project follows **Nick Saraev's Directive Orchestration Execution (DOE) Framework**:

- **Directives** (`.md` files in `directives/`) = Natural language instructions
- **Executions** (code in `executions/`) = Deterministic implementations
- **Orchestrator** (Claude Code via `.claude/CLAUDE.md`) = Master coordinator
- **Subagents** (coder, tester, stuck) = Specialized task handlers

### Self-Annealing
When workflows encounter errors, agents document learnings and update directives automatically, making the system more resilient over time.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance
- n8n installed (self-hosted or cloud)
- API keys for all platforms (see `.env.example`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agency-pipeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

4. **Set up database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

---

## Platform Setup Guides

### Apify Configuration
1. Create Apify account at https://apify.com
2. Generate API token from settings
3. Add `APIFY_API_TOKEN` to `.env`
4. Deploy custom actors to Apify platform
5. Configure proxy settings for scraping

### Instantly/SmartLead Setup
1. Connect email inboxes (minimum 3-5 for rotation)
2. Warm up domains for 2-3 weeks before campaigns
3. Configure tracking domains
4. Set up campaign templates
5. Add API credentials to `.env`

### GoHighLevel Configuration
1. Create agency account or sub-account
2. Configure location settings
3. Set up AI receptionist phone number via Twilio
4. Import funnel templates
5. Configure webhook endpoints for n8n integration
6. Add GHL API key to `.env`

### n8n Workflow Setup
1. Install n8n (self-hosted recommended)
2. Import workflow JSON files from `n8n-workflows/`
3. Configure credentials for all integrations
4. Set up error handling and notifications
5. Test each workflow end-to-end

---

## Use Cases by Vertical

### Commercial Insurance
**Lead Sources:** Insurance agency directories, LinkedIn, industry associations
**Messaging:** Risk assessment offers, quote comparisons, compliance automation
**Nurture:** Educational content on coverage types, regulatory changes

### Commercial Real Estate
**Lead Sources:** Property listings, broker directories, investment forums
**Messaging:** Market analysis, property valuation, tenant screening automation
**Nurture:** Market reports, investment opportunities, financing options

### Recruitment Firms
**Lead Sources:** LinkedIn, job boards, company career pages
**Messaging:** Candidate sourcing automation, ATS integration, screening workflows
**Nurture:** Industry insights, talent market trends, hiring best practices

---

## Workflow Examples

### End-to-End Lead Generation Pipeline

1. **Scraping** - Apify actor runs daily, extracts leads from target sources
2. **Enrichment** - Data validated, emails verified, company info added
3. **CRM Sync** - Leads pushed to GoHighLevel with tags and custom fields
4. **Outreach** - Instantly campaign triggered with personalized messaging
5. **Engagement** - Replies monitored, interested leads flagged
6. **Qualification** - AI receptionist calls warm leads, qualifies interest
7. **Booking** - Qualified prospects offered calendar link via SMS
8. **Handoff** - Booked meetings synced to client calendar with lead context

### AI Receptionist Flow

1. **Inbound Call** - Twilio forwards to n8n webhook
2. **AI Processing** - OpenAI transcribes, analyzes intent
3. **Response** - Claude generates contextual response
4. **Action** - Books meeting, sends info, or routes to human
5. **CRM Update** - Interaction logged in GoHighLevel
6. **Follow-up** - Automated SMS/email based on outcome

---

## Development

### Running Tests
```bash
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
```

### Linting & Formatting
```bash
npm run lint            # Check code style
npm run format          # Auto-format code
```

### Building for Production
```bash
npm run build           # Compile TypeScript
npm run start           # Start production server
```

---

## Deployment

### Cloud Deployment (Modal, AWS, etc.)
1. Export executions to cloud functions
2. Set up environment variables in cloud platform
3. Configure webhook endpoints
4. Set up monitoring and logging
5. Test all integrations end-to-end

### Client Handoff Options
- **Managed Service** - You host/maintain, client pays retainer
- **No-Code Wrapper** - Package as n8n/Dify workflow with GUI
- **GitHub Codespaces** - One-click environment for technical clients
- **White-Label GHL** - Deliver via GoHighLevel sub-account

---

## Monitoring & Observability

### Key Metrics
- Leads scraped per day
- Email deliverability rate
- Reply rate and engagement
- AI receptionist call volume
- Meeting booking conversion rate
- Client satisfaction scores

### Alerting
- Slack notifications for errors
- Daily summary reports
- Weekly performance dashboards
- Monthly analytics for clients

---

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate API keys regularly** - Especially for client-facing services
3. **Validate webhook signatures** - Prevent unauthorized access
4. **Encrypt sensitive data** - Use environment encryption keys
5. **Implement rate limiting** - Protect against API abuse
6. **Log access patterns** - Monitor for suspicious activity

---

## Support & Resources

### Documentation
- Platform API docs linked in each integration
- Directive files contain step-by-step workflows
- Test files demonstrate usage patterns

### Community
- DOE Framework: [Nick Saraev's Documentation]
- n8n Community: https://community.n8n.io
- GoHighLevel Community: https://www.facebook.com/groups/gohighlevel

### Contact
For questions, issues, or feature requests, create an issue in the repository.

---

## License

Proprietary - All Rights Reserved

This codebase is for internal agency use only. Clients receive licensed access to workflows, not source code.

---

## Roadmap

### Q1 2026
- [ ] Complete core integrations (Apify, Instantly, GHL)
- [ ] Build first 3 vertical-specific workflows
- [ ] Deploy AI receptionist for pilot clients
- [ ] Establish monitoring and alerting

### Q2 2026
- [ ] Add SmartLead as backup email platform
- [ ] Implement advanced lead enrichment
- [ ] Build client reporting dashboards
- [ ] Scale to 10+ active clients

### Q3 2026
- [ ] Cloudify battle-tested workflows
- [ ] Create no-code client interfaces
- [ ] Expand to 5+ verticals
- [ ] Launch white-label partner program

---

**Built with the DOE Framework for resilient, scalable AI automation.**
