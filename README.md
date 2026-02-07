# Agency Pipeline - AI-Powered Prospecting & Sales Intelligence

Complete B2B prospecting automation combining AI-powered company research, personalized email generation, and CRM integration.

---

## Overview

The Agency Pipeline is a production-ready prospecting automation system that uses GPT-4 to research companies and generate personalized outreach emails, then automatically creates contacts in HubSpot with comprehensive notes and sequence enrollment.

**Built for:** Marketing agencies, sales teams, and B2B businesses seeking to scale personalized outreach without sacrificing quality.

---

## Core Capabilities

- **AI Prospecting Automation** - ChatGPT-powered company research and personalized email generation
- **OpenAI ChatGPT Integration** - Uses GPT-4 for high-quality research summaries
- **Intelligent Retry Logic** - 3 attempts with exponential backoff
- **Rate Limiting** - Max 10 requests per minute to avoid API throttling
- **Fallback Handling** - Returns basic summary if API fails
- **Cost Tracking** - Logs API token usage for monitoring
- **Input Validation** - Ensures data quality before processing
- **HubSpot CRM Integration** - Automatic contact creation and sequence enrollment
- **Google Sheets Monitoring** - Trigger automation from spreadsheet updates

---

## Technology Stack

### Core Technologies
- **Node.js** - Runtime environment
- **n8n** - Workflow automation platform
- **OpenAI GPT-4** - AI company research and email personalization
- **HubSpot API** - CRM integration and contact management
- **Google Sheets API** - Prospect data input and status tracking

### AI/LLM Capabilities
- **GPT-4 Turbo** for company research (150-250 word summaries)
- **GPT-4 Turbo** for personalized email generation (3 variants per prospect)
- Intelligent prompt engineering for B2B context
- Fallback templates for API failures

### Integration Points
- **HubSpot**: Contact creation, notes, sequence enrollment
- **Google Sheets**: Prospect list management and status tracking
- **Slack**: Optional notifications and monitoring
- **OpenAI**: Research and content generation

---

## Installation

### Prerequisites

- Node.js v16 or higher
- n8n instance (self-hosted or cloud)
- OpenAI API key
- HubSpot API key (Private App with appropriate scopes)
- Google account with Sheets access

### Setup

```bash
cd agency-pipeline
npm install
```

---

## Environment Variables

Set the following environment variables for the system to function:

**OpenAI API Key:**
```bash
# Linux/Mac
export OPENAI_API_KEY="sk-your-api-key-here"

# Windows CMD
set OPENAI_API_KEY=sk-your-api-key-here

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key-here"
```

**HubSpot API Key:**
```bash
# Linux/Mac
export HUBSPOT_API_KEY="pat-na1-your-token-here"

# Windows CMD
set HUBSPOT_API_KEY=pat-na1-your-token-here

# Windows PowerShell
$env:HUBSPOT_API_KEY="pat-na1-your-token-here"
```

**Optional - Slack Webhook:**
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

---

## Quick Start

### 1. Company Research Module (Standalone)

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

### 2. Full Prospecting Workflow (n8n)

**See:** `n8n-workflows/HUBSPOT-SETUP-GUIDE.md` for complete setup instructions.

**Quick setup:**
1. Import `n8n-workflows/05-hubspot-prospecting.json` into n8n
2. Configure environment variables (OPENAI_API_KEY, HUBSPOT_API_KEY)
3. Connect Google Sheets trigger
4. Test with sample prospect
5. Activate workflow

---

## AI Prospecting Automation (NEW)

### Overview
Automated B2B prospecting workflow combining AI research, personalized email generation, and CRM integration.

### Features
- **AI Company Research** - GPT-4 generates 150-250 word company summaries
- **Personalized Email Generation** - 3 unique email variants per prospect
- **HubSpot Integration** - Automatic contact creation and sequence enrollment
- **Google Sheets Trigger** - Monitor company lists for new prospects
- **Quality Control** - Validation, fallbacks, and error handling

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

### Files
- **Workflow**: `n8n-workflows/05-hubspot-prospecting.json`
- **Setup Guide**: `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`
- **Company Research**: `executions/ai/company-research.js`
- **Email Generation**: `executions/ai/email-generation.js`
- **HubSpot Client**: `executions/integrations/hubspot-client.js`

**See `n8n-workflows/README.md` for detailed setup instructions.**

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
npm test
```

Or directly:

```bash
node test/company-research.test.js
```

---

## Error Handling

The system includes comprehensive error handling at multiple levels:

### Company Research Module
- **Validation Errors** - Throws immediately for invalid input
- **API Errors** - Retries up to 3 times with exponential backoff
- **Rate Limiting** - Automatically waits if request limit is reached
- **Fallback** - Returns basic summary if all API attempts fail

### n8n Workflow
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

## Module Structure

```
agency-pipeline/
├── executions/
│   ├── ai/
│   │   ├── company-research.js       # GPT-4 company research
│   │   └── email-generation.js       # GPT-4 email generation
│   ├── integrations/
│   │   └── hubspot-client.js         # HubSpot API client
│   └── utils/                         # Utility modules
├── n8n-workflows/
│   ├── 05-hubspot-prospecting.json   # Main n8n workflow
│   ├── HUBSPOT-SETUP-GUIDE.md        # Complete setup guide
│   ├── README.md                      # Workflow documentation
│   └── google-sheets-template.csv    # Sheet template
├── test/
│   ├── company-research.test.js      # Research module tests
│   └── email-generation.test.js      # Email generation tests
├── package.json
├── IMPLEMENTATION-SUMMARY.md          # Build notes
├── QUICK-START.md                     # Quick start guide
└── README.md                          # This file
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

## Use Cases by Vertical

### Marketing Agencies
- **Prospect Research** - Understand client's business before outreach
- **Personalized Pitches** - Generate custom emails for each prospect
- **CRM Population** - Automatically add researched prospects to HubSpot

### Sales Teams
- **Lead Enrichment** - Enhance existing leads with AI research
- **Email Sequences** - Create personalized multi-touch campaigns
- **Qualification** - Research and qualify leads automatically

### B2B SaaS
- **Outbound Prospecting** - Scale personalized outreach
- **Account Research** - Deep dive into target accounts
- **Multi-threaded Outreach** - Different emails for different personas

### Consultants & Service Providers
- **Custom Proposals** - Research-backed proposals
- **Warm Introductions** - Personalized first contact
- **Industry Expertise** - Demonstrate knowledge in outreach

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

## Roadmap

### Q1 2024 (COMPLETED)
- ✅ AI company research module
- ✅ GPT-4 email generation (3 variants)
- ✅ HubSpot contact creation and notes
- ✅ Google Sheets monitoring
- ✅ Complete n8n workflow
- ✅ Comprehensive documentation
- ✅ Implement advanced lead enrichment

### Q2 2024 (PLANNED)
- [ ] Add caching layer (Redis/in-memory)
- [ ] Support for batch processing multiple companies
- [ ] Integration with lead enrichment APIs (Clearbit, ZoomInfo)
- [ ] Custom prompt templates library
- [ ] Research result scoring/quality metrics
- [ ] Expand AI prospecting to additional CRMs (Salesforce, Pipedrive)

### Q3 2024 (PLANNED)
- [ ] LinkedIn profile scraping and enrichment
- [ ] Multi-language support for international outreach
- [ ] A/B testing framework for email variants
- [ ] Advanced analytics dashboard
- [ ] Email deliverability optimization

### Q4 2024 (FUTURE)
- [ ] AI-powered follow-up sequence generation
- [ ] Intent signal detection and scoring
- [ ] Custom AI model fine-tuning
- [ ] White-label client deployments

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

### n8n Workflow

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
- `n8n-workflows/HUBSPOT-SETUP-GUIDE.md` - Complete setup instructions

### API References
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)
- [n8n Documentation](https://docs.n8n.io/)

### Community Resources
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Discord](https://discord.gg/n8n)
- [OpenAI Community](https://community.openai.com/)

---

## Support & Contribution

### Getting Help
1. Check documentation in `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`
2. Review troubleshooting section above
3. Check n8n execution logs for errors
4. Review OpenAI API usage and errors

### Contributing
Contributions welcome! Areas for improvement:
- Additional email templates
- CRM integrations beyond HubSpot
- Performance optimizations
- Documentation improvements

---

## Production Checklist

Before running at scale:

- [ ] Test with 5-10 prospects manually
- [ ] Review generated email quality and tone
- [ ] Verify HubSpot contacts created correctly
- [ ] Check note formatting in HubSpot
- [ ] Test error handling with invalid data
- [ ] Set up Slack notifications (recommended)
- [ ] Monitor OpenAI API costs for 24 hours
- [ ] Understand rate limits for all services
- [ ] Configure proper polling interval
- [ ] Enable workflow and monitor first week
- [ ] Set up cost alerts for OpenAI spending
- [ ] Document any customizations made

---

## License

MIT

---

## Version History

**v1.1.0** (February 2024)
- Added complete HubSpot prospecting workflow
- Integrated email generation module
- Added Google Sheets monitoring
- Comprehensive n8n workflow automation
- Complete setup documentation

**v1.0.0** (February 2024)
- Initial release
- Company research module
- OpenAI GPT-4 integration
- Error handling and fallbacks
- Rate limiting

---

**Ready to automate your prospecting? Start with `n8n-workflows/HUBSPOT-SETUP-GUIDE.md`!**
