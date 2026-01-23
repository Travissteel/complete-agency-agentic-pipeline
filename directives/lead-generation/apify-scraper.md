# Lead Generation Directive: Apify B2B Scraper

**Version:** 1.0.0
**Last Updated:** January 2026
**Framework:** DOE (Directive Orchestration Execution)
**Target Verticals:** Commercial Insurance, Commercial Real Estate, Recruitment Firms

---

## Objective Statement

Automate B2B lead generation by scraping high-quality prospects from LinkedIn and Google Maps using Apify actors, extracting decision-maker information and company details, then enriching and formatting leads for cold outreach campaigns via Instantly/SmartLead.

---

## Input Specifications

### Required Inputs

1. **Target Vertical**
   - Commercial Insurance
   - Commercial Real Estate
   - Recruitment Firms

2. **Geographic Parameters**
   - City/State (e.g., "Austin, TX")
   - Country (default: United States)
   - Radius for Google Maps (default: 50 miles)

3. **Company Size Filters**
   - Employee count range (e.g., 10-200 employees)
   - Revenue range (if available)

4. **Decision Maker Criteria**
   - Job titles to target (e.g., "CEO", "VP of Sales", "Insurance Agent")
   - Seniority levels (C-level, Director, Manager)

### Optional Inputs

- Industry keywords for filtering
- Company age (founded date range)
- Exclusion list (companies/domains to skip)
- Maximum leads per run

---

## Process Flow

### Step 1: Configure Scraping Parameters

1. **For Commercial Insurance:**
   - LinkedIn search: "insurance agency owner" OR "insurance broker"
   - Google Maps categories: "Insurance agency", "Insurance broker"
   - Job titles: CEO, President, Agency Owner, Managing Partner
   - Company size: 5-100 employees

2. **For Commercial Real Estate:**
   - LinkedIn search: "commercial real estate broker" OR "CRE investment"
   - Google Maps categories: "Commercial real estate agency", "Real estate investment"
   - Job titles: Principal, Managing Broker, Investment Director
   - Company size: 10-200 employees

3. **For Recruitment Firms:**
   - LinkedIn search: "staffing agency owner" OR "recruitment firm"
   - Google Maps categories: "Recruiter", "Employment agency", "Staffing service"
   - Job titles: CEO, Founder, Director of Recruiting
   - Company size: 5-150 employees

### Step 2: Execute LinkedIn Company Scraper

1. Initialize Apify LinkedIn actor with configured parameters
2. Extract company data:
   - Company name
   - Industry classification
   - Employee count
   - Headquarters location
   - Company website
   - LinkedIn company URL
   - Recent posts/activity (engagement signals)

3. Extract decision maker profiles:
   - Full name
   - Current job title
   - LinkedIn profile URL
   - Years in current role
   - Email (if publicly available)

4. Implement rate limiting:
   - Maximum 50 profiles per minute
   - Use residential proxies to avoid blocks
   - Random delays between requests (3-10 seconds)

5. Export results to Apify dataset

### Step 3: Execute Google Maps Scraper

1. Initialize Apify Google Maps actor with location parameters
2. Search by business categories based on vertical
3. Extract business data:
   - Business name
   - Phone number
   - Email (if available)
   - Website URL
   - Physical address
   - Google rating and review count
   - Business hours
   - Photos count (engagement signal)

4. Filter results:
   - Minimum 3.5 star rating
   - At least 5 reviews (indicates established business)
   - Active business (has recent reviews)

5. Export results to separate Apify dataset

### Step 4: Enrich and Deduplicate Leads

1. Merge LinkedIn and Google Maps data by:
   - Exact company name match
   - Website domain match
   - Fuzzy matching on business name + location

2. Validate email addresses:
   - Format validation (RFC 5322 compliance)
   - Domain MX record check
   - Disposable email detection
   - Role-based email flagging (info@, contact@)

3. Enrich missing data:
   - Use company website to find missing emails
   - Extract email patterns (firstname.lastname@domain.com)
   - Lookup additional contact info from public sources

4. Deduplicate across:
   - Email addresses (primary key)
   - LinkedIn profile URLs
   - Company domains
   - Phone numbers

5. Score lead quality (0-100):
   - Has decision maker email: +40 points
   - LinkedIn activity within 30 days: +20 points
   - Google rating >4.0: +15 points
   - Company size in target range: +15 points
   - Has company website: +10 points

### Step 5: Format for Outreach Platforms

1. **Instantly.ai format (CSV):**
   ```
   email, firstName, lastName, companyName, customField1, customField2, customField3
   ```
   - customField1: Job Title
   - customField2: Company Size
   - customField3: Location

2. **SmartLead format (CSV):**
   ```
   Email, First Name, Last Name, Company, Industry, Location, Phone
   ```

3. **Include metadata fields:**
   - Lead source (LinkedIn/Google Maps)
   - Scrape date
   - Lead quality score
   - Assigned campaign tag

### Step 6: Error Handling and Logging

1. **Handle Apify actor failures:**
   - Retry up to 3 times with exponential backoff
   - Log failed URLs/searches for manual review
   - Send Slack notification on critical errors

2. **Data quality checks:**
   - Flag leads with missing required fields
   - Log validation failures
   - Generate data quality report

3. **Output summary metrics:**
   - Total leads scraped
   - Leads passing quality threshold
   - Deduplication rate
   - Email validation pass rate
   - Average lead quality score

---

## Technical Requirements

### Apify Configuration

1. **Actor Selection:**
   - LinkedIn scraper: Use official "LinkedIn Company Scraper" or custom actor
   - Google Maps scraper: Use "Google Maps Scraper" by Compass

2. **Proxy Settings:**
   - Use residential proxies (APIFY_DEFAULT_PROXY_GROUP=RESIDENTIAL)
   - Rotate IPs every 10 requests
   - Implement request throttling

3. **Storage:**
   - Use Apify Dataset for raw scraped data
   - Export to Key-Value Store for processed leads
   - Retain data for 30 days (Apify retention policy)

### Data Schema

**Lead Object Structure:**
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "CEO",
  "companyName": "Example Insurance Agency",
  "companySize": "25-50",
  "industry": "Commercial Insurance",
  "location": "Austin, TX",
  "website": "https://example.com",
  "phone": "+1-512-555-0100",
  "linkedinProfile": "https://linkedin.com/in/johndoe",
  "linkedinCompany": "https://linkedin.com/company/example-insurance",
  "googleRating": 4.7,
  "reviewCount": 127,
  "leadSource": "LinkedIn",
  "qualityScore": 85,
  "scrapeDate": "2026-01-19",
  "vertical": "insurance",
  "campaignTag": "insurance-q1-2026"
}
```

### Environment Variables Required

```
APIFY_API_TOKEN=your_apify_api_token
APIFY_DEFAULT_PROXY_GROUP=RESIDENTIAL
APIFY_STORAGE_DATASET_ID=your_dataset_id
```

---

## Definition of Done

### Success Criteria

1. **Functional Requirements:**
   - [ ] LinkedIn scraper successfully extracts company and decision-maker data
   - [ ] Google Maps scraper extracts business contact information
   - [ ] Enrichment utility validates and deduplicates leads
   - [ ] Export formats match Instantly and SmartLead requirements
   - [ ] All scripts handle errors gracefully with retries

2. **Data Quality:**
   - [ ] Minimum 70% of leads have validated email addresses
   - [ ] Deduplication removes 100% of exact duplicates
   - [ ] Lead quality scores accurately reflect data completeness
   - [ ] No test/placeholder data in final output

3. **Performance:**
   - [ ] LinkedIn scraper processes 100+ companies per hour
   - [ ] Google Maps scraper processes 200+ businesses per hour
   - [ ] Enrichment processes 500+ leads per minute
   - [ ] No rate limit violations or IP blocks

4. **Documentation:**
   - [ ] All scripts have clear inline comments
   - [ ] README explains setup and usage
   - [ ] Environment variables documented
   - [ ] Example output files provided

5. **Integration:**
   - [ ] Exported CSV can be directly imported to Instantly
   - [ ] Exported CSV can be directly imported to SmartLead
   - [ ] Scripts log to console with structured output
   - [ ] Error notifications integrate with Slack (optional)

### Validation Steps

1. Run LinkedIn scraper with test query (10 companies)
2. Run Google Maps scraper with test location (20 businesses)
3. Process combined results through enrichment utility
4. Verify output CSV format matches platform requirements
5. Attempt import to Instantly staging campaign
6. Check logs for errors or warnings
7. Validate data quality metrics meet thresholds

### Edge Cases Handled

- LinkedIn profiles without public emails
- Companies with multiple locations
- Duplicate entries across LinkedIn and Google Maps
- Invalid/malformed email addresses
- Businesses permanently closed
- Rate limiting from scraping platforms
- Network timeouts and connection errors
- Apify actor failures or timeouts

---

## Self-Annealing Notes

### Lessons Learned
(To be updated as workflows are executed)

- **Issue:** [Description of problem encountered]
- **Solution:** [How it was resolved]
- **Directive Update:** [Changes made to improve future runs]

### Common Failures and Fixes

1. **Email validation false positives:**
   - Symptom: Valid emails marked as invalid
   - Fix: Update regex patterns, use multiple validation methods
   - Prevention: Maintain whitelist of known valid domains

2. **Proxy blocks:**
   - Symptom: 429 Too Many Requests or CAPTCHA challenges
   - Fix: Increase delay between requests, rotate proxy pool
   - Prevention: Use residential proxies, implement smart throttling

3. **Data format mismatches:**
   - Symptom: Import errors in Instantly/SmartLead
   - Fix: Standardize CSV headers, escape special characters
   - Prevention: Use platform-specific export templates

---

## Integration with Downstream Systems

### Cold Outreach Platforms

**Instantly.ai:**
- Import via CSV upload or API
- Map custom fields to campaign variables
- Tag leads with scrape date and vertical
- Assign to appropriate email sequence

**SmartLead:**
- Import via API endpoint
- Configure lead rotation across inboxes
- Set daily sending limits per lead
- Track engagement in SmartLead dashboard

### CRM Sync (GoHighLevel)

- Push enriched leads to GHL via API
- Create contacts with tags: vertical, source, quality score
- Assign to appropriate pipeline stage
- Trigger automated follow-up workflows

### n8n Workflow Orchestration

- Schedule daily scraping runs (off-peak hours)
- Trigger enrichment on new dataset creation
- Auto-export to outreach platforms
- Send summary report to Slack

---

## Monitoring and Alerts

### Key Metrics to Track

- Total leads scraped per run
- Email validation pass rate
- Lead quality score distribution
- Time to process (end-to-end duration)
- Error rate and types

### Alert Conditions

- Scraping failure rate >10%
- Email validation rate <50%
- Zero leads produced in scheduled run
- Apify actor timeout or crash
- Duplicate rate >30% (indicates poor filtering)

### Reporting

- Daily summary: leads scraped, quality metrics, errors
- Weekly trends: vertical performance, source effectiveness
- Monthly analysis: cost per lead, conversion rates

---

**This directive is battle-tested and self-annealing. Update this document as you discover edge cases and improvements.**
