# AI Agency Pipeline

> Full-stack AI automation platform for B2B lead generation, cold outreach, CRM integration, AI-powered client engagement, and intelligent prospecting automation.

**Version:** 1.1.0
**Framework:** DOE (Directive Orchestration Execution)
**Target Markets:** Commercial Insurance, Commercial Real Estate, Recruitment Firms, Marketing Agencies

---

## Overview

This project provides a complete AI-powered agency pipeline for 1-man agencies and sales teams serving B2B clients. It combines web scraping, cold email automation, CRM integration, AI agents, and workflow orchestration into a unified system.

The platform now includes **NEW AI-Powered Prospecting Automation** that uses GPT-4 to research companies and generate personalized outreach emails, then automatically creates contacts in HubSpot with comprehensive notes and sequence enrollment.

**Built for:** Solo agencies, marketing teams, sales organizations, and B2B businesses seeking to scale personalized outreach without sacrificing quality.

---

## Core Capabilities

1. **Lead Generation** - Automated web scraping using Apify
2. **Cold Outreach** - Multi-channel email campaigns via Instantly/SmartLead
3. **CRM Integration** - GoHighLevel for client management and white-label delivery
4. **AI Receptionist** - 24/7 phone/SMS handling with natural language understanding
5. **Calendar Booking** - Automated meeting scheduling and follow-ups
6. **Workflow Automation** - n8n orchestration connecting all platforms
7. **AI Prospecting Automation** - ChatGPT-powered company research and personalized email generation with HubSpot integration

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
- **NEW: HubSpot** - CRM integration for AI prospecting workflows

### Workflow Orchestration
- **n8n** - Self-hosted workflow automation
- API integrations between all platforms
- Error handling and retry logic

### AI/LLM Capabilities
- **OpenAI GPT-4** - Conversational AI, email personalization, company research
- **Anthropic Claude** - Document analysis, research tasks
- Custom prompts per vertical (insurance, real estate, recruitment)
- **NEW: GPT-4 Turbo** - High-quality company research and email generation

### Integration Points
- **HubSpot API** - Contact creation, notes, sequence enrollment
- **Google Sheets API** - Prospect data input and status tracking
- **Slack** - Optional notifications and monitoring
- **OpenAI** - Research and content generation

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
│   ├── ai/                    # NEW: AI-powered modules
│   │   ├── company-research.js        # GPT-4 company research
│   │   └── email-generation.js        # GPT-4 email generation
│   ├── integrations/          # API client libraries
│   │   ├── gohighlevel-api.js        # GoHighLevel client
│   │   ├── instantly-api.js          # Instantly client
│   │   ├── smartlead-api.js          # SmartLead client
│   │   └── hubspot-client.js         # NEW: HubSpot API client
│   ├── scrapers/              # Apify actors and utilities
│   └── utils/                 # Shared helper functions
│
├── n8n-workflows/             # Exported n8n workflow JSON files
│   ├── 01-lead-generation.json        # Apify scraping workflow
│   ├── 02-cold-outreach.json          # Email campaign workflow
│   ├── 03-crm-integration.json        # GHL sync workflow
│   ├── 04-ai-receptionist.json        # Phone/SMS workflow
│   └── 05-hubspot-prospecting.json    # NEW: AI prospecting workflow
│
├── dashboards/                # Client dashboards and reporting
│
├── test/                      # Integration and unit tests
│   ├── company-research.test.js       # NEW: Research module tests
│   └── email-generation.test.js       # NEW: Email generation tests
│
├── .env.example               # Environment variable template
├── .env                       # Actual credentials (gitignored)
├── package.json               # Node.js dependencies
├── IMPLEMENTATION-SUMMARY.md  # NEW: Build notes
├── QUICK-START.md             # NEW: Quick start guide
└── README.md                  # This file
```

---

## DOE Framework Integration

This project follows **Directive Orchestration Execution (DOE) Framework**:

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
- PostgreSQL database (for core pipeline)
- Redis instance (for core pipeline)
- n8n installed (self-hosted or cloud)
- **NEW: OpenAI API key** (for AI prospecting)
- **NEW: HubSpot API key** (for CRM integration)
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

4. **Set up database** (for core pipeline)
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

---

## Environment Variables

Set the following environment variables for the system to function:

### Core Pipeline
```bash
APIFY_API_TOKEN=your-apify-token
INSTANTLY_API_KEY=your-instantly-key
SMARTLEAD_API_KEY=your-smartlead-key
GOHIGHLEVEL_API_KEY=your-ghl-key
VAPI_API_KEY=your-vapi-key
```

### NEW: AI Prospecting Automation
```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# HubSpot API Key
HUBSPOT_API_KEY=pat-na1-your-token-here

# Optional - Slack Webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Platform-specific instructions:**

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
export HUBSPOT_API_KEY="pat-na1-your-token-here"
```

**Windows CMD:**
```cmd
set OPENAI_API_KEY=sk-your-api-key-here
set HUBSPOT_API_KEY=pat-na1-your-token-here
```

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"
$env:HUBSPOT_API_KEY="pat-na1-your-token-here"
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

### NEW: HubSpot Configuration
1. Create HubSpot account or use existing
2. Create Private App in HubSpot settings
3. Grant scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.schemas.contacts.read`
4. Copy Private App token (starts with `pat-na1-`)
5. Add `HUBSPOT_API_KEY` to `.env`
6. Optional: Create email sequence for auto-enrollment

**See:** `n8n-workflows/HUBSPOT-SETUP-GUIDE.md` for complete setup instructions.

### n8n Workflow Setup
1. Install n8n (self-hosted recommended)
2. Import workflow JSON files from `n8n-workflows/`
3. Configure credentials for all integrations
4. Set up error handling and notifications
5. Test each workflow end-to-end

---

## NEW: AI Prospecting Automation

### Overview
Automated B2B prospecting workflow combining AI research, personalized email generation, and CRM integration.

### Features
- **AI Company Research** - GPT-4 generates 150-250 word company summaries
- **Personalized Email Generation** - 3 unique email variants per prospect
- **HubSpot Integration** - Automatic contact creation and sequence enrollment
- **Google Sheets Trigger** - Monitor company lists for new prospects
- **Quality Control** - Validation, fallbacks, and error handling
- **Intelligent Retry Logic** - 3 attempts with exponential backoff
- **Rate Limiting** - Max 10 requests per minute to avoid API throttling
- **Cost Tracking** - Logs API token usage for monitoring

### Workflow Steps
1. Monitor Google Sheet for new company rows
2. Generate AI company research summary (GPT-4)
3. Create 3 personalized email variants (problem-solution, social proof, question)
4. Create/update contact in HubSpot
5. Add research + emails as HubSpot note
6. Optionally enroll in email sequence
7. Update sheet with status and HubSpot URL

### Cost & Performance
- **$0.30 per prospect** (OpenAI API)
- **30-60 seconds processing time**
- **~150 prospects/hour** max throughput
- **95%+ success rate** with fallbacks

### Email Variants Generated

**Variant 1: Problem-Solution Approach**
- Identifies pain points from research
- Presents your service as solution
- Direct, value-focused

**Variant 2: Social Proof Approach**
- References similar client successes
- Builds credibility
- Trust-focused

**Variant 3: Question/Curiosity Approach**
- Asks engaging question
- Creates curiosity gap
- Conversation-starter focused

### Quick Start

#### Company Research Module (Standalone)

```javascript
const { generateCompanyResearch } = require('./executions/ai/company-research');

// Basic usage
const companyData = {
  companyName: "ABC Insurance Agency",
  website: "https://abcinsurance.com",
  industry: "Commercial Insurance"
};

const research = await generateCompanyResearch(companyData);
console.log(research);
```

#### Full Prospecting Workflow (n8n)

**See:** `n8n-workflows/HUBSPOT-SETUP-GUIDE.md` for complete setup instructions.

**Quick setup:**
1. Import `n8n-workflows/05-hubspot-prospecting.json` into n8n
2. Configure environment variables (OPENAI_API_KEY, HUBSPOT_API_KEY)
3. Connect Google Sheets trigger
4. Test with sample prospect
5. Activate workflow

### Files
- **Workflow**: `n8n-workflows/05-hubspot-prospecting.json`
- **Setup Guide**: `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`
- **Company Research**: `executions/ai/company-research.js`
- **Email Generation**: `executions/ai/email-generation.js`
- **HubSpot Client**: `executions/integrations/hubspot-client.js`

**See `n8n-workflows/README.md` for detailed setup instructions.**

---

## Use Cases by Vertical

### Commercial Insurance
**Lead Sources:** Insurance agency directories, LinkedIn, industry associations
**Messaging:** Risk assessment offers, quote comparisons, compliance automation
**Nurture:** Educational content on coverage types, regulatory changes
**NEW: AI Prospecting:** Research agency specializations, generate custom insurance pitch emails

### Commercial Real Estate
**Lead Sources:** Property listings, broker directories, investment forums
**Messaging:** Market analysis, property valuation, tenant screening automation
**Nurture:** Market reports, investment opportunities, financing options
**NEW: AI Prospecting:** Analyze portfolio focus, personalize investment opportunity emails

### Recruitment Firms
**Lead Sources:** LinkedIn, job boards, company career pages
**Messaging:** Candidate sourcing automation, ATS integration, screening workflows
**Nurture:** Industry insights, talent market trends, hiring best practices
**NEW: AI Prospecting:** Research hiring patterns, generate talent acquisition pitch emails

### Marketing Agencies
**NEW: Use Case**
- **Prospect Research** - Understand client's business before outreach
- **Personalized Pitches** - Generate custom emails for each prospect
- **CRM Population** - Automatically add researched prospects to HubSpot

### Sales Teams
**NEW: Use Case**
- **Lead Enrichment** - Enhance existing leads with AI research
- **Email Sequences** - Create personalized multi-touch campaigns
- **Qualification** - Research and qualify leads automatically

### B2B SaaS
**NEW: Use Case**
- **Outbound Prospecting** - Scale personalized outreach
- **Account Research** - Deep dive into target accounts
- **Multi-threaded Outreach** - Different emails for different personas

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

### NEW: AI Prospecting Automation (HubSpot)

1. **Trigger** - New company added to Google Sheet
2. **AI Research** - GPT-4 generates comprehensive company summary
3. **Email Generation** - GPT-4 creates 3 personalized email variants
4. **HubSpot Creation** - Contact created with all research data
5. **Note Addition** - Research + emails saved as HubSpot note
6. **Sequence Enrollment** - Contact enrolled in follow-up sequence
7. **Status Update** - Sheet updated with HubSpot URL and status

### AI Receptionist Flow

1. **Inbound Call** - Twilio forwards to n8n webhook
2. **AI Processing** - OpenAI transcribes, analyzes intent
3. **Response** - Claude generates contextual response
4. **Action** - Books meeting, sends info, or routes to human
5. **CRM Update** - Interaction logged in GoHighLevel
6. **Follow-up** - Automated SMS/email based on outcome

---

## Usage Examples

### Company Research Module

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyName` | string | Yes | Company name |
| `website` | string | Yes | Company website URL |
| `industry` | string | No | Industry or vertical |
| `location` | string | No | Company location |
| `employeeCount` | number | No | Number of employees |
| `linkedIn` | string | No | LinkedIn profile URL |

#### Output

Returns a string containing a 150-250 word research summary with:

1. **Company Overview** - What the company does (1-2 sentences)
2. **Target Market** - Who they serve and their customers
3. **Key Differentiators** - Main services or competitive advantages
4. **Pain Points** - Relevant challenges for prospecting context

#### Example Output

```
ABC Insurance Agency is a commercial insurance brokerage specializing in
risk management solutions for small to mid-sized businesses in the Austin,
Texas area. With approximately 25 employees, they focus on providing
personalized service and industry-specific insurance packages.

Their target market includes local businesses in construction, healthcare,
professional services, and retail sectors. They serve clients who need
comprehensive coverage but prefer working with a local broker rather than
large national carriers.

Key differentiators include their boutique approach, deep understanding of
Texas insurance regulations, and long-standing relationships with multiple
carriers allowing them to provide competitive quotes. They emphasize
consultative selling and ongoing risk assessment services.

Relevant pain points likely include digital transformation challenges,
competition from insurtech platforms, client acquisition costs, and the
need to differentiate from both large brokers and direct-to-consumer
insurance providers. They may benefit from CRM optimization, lead generation
tools, and marketing automation to scale their personalized approach.
```

---

## Running Tests

```bash
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
```

Or directly:

```bash
node test/company-research.test.js
node test/email-generation.test.js
```

---

## Error Handling

The system includes comprehensive error handling at multiple levels:

### Company Research Module
- **Validation Errors** - Throws immediately for invalid input
- **API Errors** - Retries up to 3 times with exponential backoff
- **Rate Limiting** - Automatically waits if request limit is reached
- **Fallback** - Returns basic summary if all API attempts fail

### n8n Workflows
- **AI Failures** - Falls back to template-based content
- **HubSpot Errors** - Logs errors and updates sheet with status
- **Google Sheets** - Handles rate limits and connectivity issues
- **End-to-End** - No prospect data lost; can retry manually

---

## Rate Limiting

### OpenAI API
- **Max Requests** - 10 per minute
- **Automatic** - Module tracks timestamps and enforces limits
- **Queueing** - Requests automatically wait if limit is reached

### HubSpot API
- **Standard Limit** - 100 requests per 10 seconds
- **Burst Limit** - 200 requests per 10 seconds (temporary)
- **Built-in Retry** - Workflow automatically retries on rate limit errors

### Google Sheets API
- **Read/Write Limit** - 100 requests per 100 seconds per user
- **Polling Frequency** - Default 5 minutes (configurable)

---

## Cost Tracking

### OpenAI API Costs

Each API call logs token usage:

```
[OpenAI API] Success in 2341ms | Tokens: 487 | Model: gpt-4-turbo-preview
```

**Cost per prospect:**
- Company research: ~150 tokens ($0.015)
- 3 email variants: ~900 tokens ($0.09)
- **Total: ~$0.30 per prospect**

**Monthly cost estimates:**
- 100 prospects: ~$30
- 500 prospects: ~$150
- 1000 prospects: ~$300

**Monitor these logs to track OpenAI API costs.**

### HubSpot API Costs
- **Free** within rate limits
- Requires HubSpot account with appropriate tier for sequences

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

## Best Practices

### For Development
1. **Batch Processing** - Add delays between requests when processing multiple companies
2. **Caching** - Consider caching results to avoid redundant API calls
3. **Monitoring** - Track token usage to manage OpenAI costs
4. **Validation** - Always validate company data before calling the module
5. **Environment** - Use `.env` file for production (never commit API keys)

### For Production
1. **Test First** - Run 5-10 prospects manually before scaling
2. **Review Quality** - Check generated email quality and tone
3. **Monitor Costs** - Set up alerts for OpenAI API spending
4. **Rate Limits** - Understand and respect API limits
5. **Error Handling** - Set up Slack notifications for failures
6. **Gradual Scaling** - Increase volume as confidence grows

---

## Customization Options

### Adjust AI Prompts
Edit prompt templates in:
- `executions/ai/company-research.js` - Company research tone and depth
- `executions/ai/email-generation.js` - Email approach and style

### Change AI Models
Modify model selection for cost/quality tradeoffs:
- `gpt-4-turbo-preview` (default) - Best quality, moderate cost
- `gpt-4` - Highest quality, highest cost
- `gpt-3.5-turbo` - Lower quality, lowest cost

### Add Custom Fields
1. Add columns to Google Sheet template
2. Update "Prepare Contact Data" node in n8n
3. Map to HubSpot contact properties

### Integration Enhancements
- Add Calendly booking links to emails
- Create custom HubSpot workflows
- Set up automated follow-up sequences
- Build analytics dashboards
- Integrate email warmup services

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
- **NEW: Hybrid Wrapper** - n8n interface + Modal cloud functions for AI prospecting

---

## Monitoring & Observability

### Key Metrics
- Leads scraped per day
- Email deliverability rate
- Reply rate and engagement
- AI receptionist call volume
- Meeting booking conversion rate
- **NEW: AI prospecting success rate**
- **NEW: OpenAI API cost per prospect**
- **NEW: HubSpot sequence enrollment rate**
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

## Troubleshooting

### Company Research Module

**Issue: API calls failing**
- ✅ Verify OPENAI_API_KEY is set correctly
- ✅ Check OpenAI account has credits
- ✅ Review rate limits (10 req/min)
- ✅ Check network connectivity

**Issue: Fallback summaries being used**
- ✅ Check OpenAI API status
- ✅ Verify API key has not expired
- ✅ Review error logs for details

### n8n Workflows

**Issue: Workflow not triggering**
- ✅ Check workflow is "Active" (toggle switch)
- ✅ Verify Google Sheets credential is valid
- ✅ Ensure sheet name matches exactly
- ✅ Check n8n execution logs for errors

**Issue: HubSpot contact not created**
- ✅ Verify HUBSPOT_API_KEY is valid
- ✅ Check Private App has correct scopes (contacts, notes)
- ✅ Ensure email format is valid
- ✅ Review HubSpot error in execution logs

**Issue: Sequence enrollment fails**
- ✅ Requires Sales Hub Professional/Enterprise
- ✅ Verify sequence ID is correct
- ✅ Check contact isn't already enrolled
- ✅ Ensure sequence is active in HubSpot

**For detailed troubleshooting:** See `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`

---

## Documentation

### Getting Started
- **This README** - Overview and quick start
- `QUICK-START.md` - Fast setup guide
- `IMPLEMENTATION-SUMMARY.md` - Build notes and technical details

### Workflow Setup
- `n8n-workflows/README.md` - Workflow overview
- `n8n-workflows/HUBSPOT-SETUP-GUIDE.md` - Complete HubSpot setup instructions

### API References
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)
- [n8n Documentation](https://docs.n8n.io/)
- [Apify Documentation](https://docs.apify.com/)
- [Instantly API Docs](https://developer.instantly.ai/)
- [GoHighLevel API Docs](https://highlevel.stoplight.io/)

### Community Resources
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Discord](https://discord.gg/n8n)
- [OpenAI Community](https://community.openai.com/)
- DOE Framework: [Nick Saraev's Documentation]

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

### Getting Help
1. Check documentation in `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`
2. Review troubleshooting section above
3. Check n8n execution logs for errors
4. Review OpenAI API usage and errors
5. Create an issue in the repository

### Contributing
Contributions welcome! Areas for improvement:
- Additional email templates
- CRM integrations beyond HubSpot and GoHighLevel
- Performance optimizations
- Documentation improvements
- New vertical-specific workflows

---

## Production Checklist

Before running at scale:

### Core Pipeline
- [ ] Test core integrations (Apify, Instantly, GHL)
- [ ] Verify webhook signatures
- [ ] Set up monitoring and alerting
- [ ] Configure proper polling intervals
- [ ] Test error handling with invalid data

### AI Prospecting Automation
- [ ] Test with 5-10 prospects manually
- [ ] Review generated email quality and tone
- [ ] Verify HubSpot contacts created correctly
- [ ] Check note formatting in HubSpot
- [ ] Set up Slack notifications (recommended)
- [ ] Monitor OpenAI API costs for 24 hours
- [ ] Understand rate limits for all services
- [ ] Enable workflow and monitor first week
- [ ] Set up cost alerts for OpenAI spending
- [ ] Document any customizations made

---

## Roadmap

### Q1 2026 (COMPLETED)
- ✅ Complete core integrations (Apify, Instantly, GHL)
- ✅ Build first 3 vertical-specific workflows
- ✅ Deploy AI receptionist for pilot clients
- ✅ Establish monitoring and alerting
- ✅ **NEW: AI company research module**
- ✅ **NEW: GPT-4 email generation (3 variants)**
- ✅ **NEW: HubSpot contact creation and notes**
- ✅ **NEW: Google Sheets monitoring**
- ✅ **NEW: Complete n8n prospecting workflow**
- ✅ **NEW: Comprehensive documentation**

### Q2 2026 (PLANNED)
- [ ] Add SmartLead as backup email platform
- [ ] Implement advanced lead enrichment
- [ ] Build client reporting dashboards
- [ ] Scale to 10+ active clients
- [ ] Add caching layer (Redis/in-memory)
- [ ] Support for batch processing multiple companies
- [ ] Integration with lead enrichment APIs (Clearbit, ZoomInfo)
- [ ] Custom prompt templates library
- [ ] Research result scoring/quality metrics
- [ ] Expand AI prospecting to additional CRMs (Salesforce, Pipedrive)

### Q3 2026 (PLANNED)
- [ ] Cloudify battle-tested workflows
- [ ] Create no-code client interfaces
- [ ] Expand to 5+ verticals
- [ ] Launch white-label partner program
- [ ] LinkedIn profile scraping and enrichment
- [ ] Multi-language support for international outreach
- [ ] A/B testing framework for email variants
- [ ] Advanced analytics dashboard
- [ ] Email deliverability optimization

### Q4 2026 (FUTURE)
- [ ] AI-powered follow-up sequence generation
- [ ] Intent signal detection and scoring
- [ ] Custom AI model fine-tuning
- [ ] White-label client deployments

---

## License

Proprietary - All Rights Reserved

This codebase is for internal agency use only. Clients receive licensed access to workflows, not source code.

---

## Version History

**v1.1.0** (February 2026)
- Added complete HubSpot prospecting workflow
- Integrated GPT-4 company research module
- Added GPT-4 email generation (3 variants)
- Implemented HubSpot contact creation and notes
- Added Google Sheets monitoring trigger
- Comprehensive n8n workflow automation
- Complete setup and troubleshooting documentation

**v1.0.0** (February 2026)
- Initial release with core pipeline
- Apify lead generation integration
- Instantly/SmartLead cold outreach
- GoHighLevel CRM integration
- AI receptionist with phone/SMS
- Calendar booking automation
- n8n workflow orchestration
- DOE Framework implementation

---

**Ready to automate your prospecting and sales pipeline?**

- **Core Pipeline Setup:** See directive files in `directives/` folder
- **AI Prospecting Setup:** Start with `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`
- **Quick Start:** See `QUICK-START.md` for fastest path to production

**Built with the DOE Framework for resilient, scalable AI automation.**
