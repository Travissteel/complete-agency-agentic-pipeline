# HubSpot Prospecting Automation - Setup Guide

Complete step-by-step guide to set up the n8n HubSpot prospecting workflow.

---

## Prerequisites

Before starting, ensure you have:

- ✅ n8n instance running (self-hosted or n8n.cloud)
- ✅ Google Sheets account with OAuth access
- ✅ OpenAI API account with API key
- ✅ HubSpot account with API access (Private App recommended)
- ✅ Slack workspace (optional, for notifications)
- ✅ Node.js modules installed in n8n environment

---

## Part 1: Prepare Your Google Sheet

### Step 1.1: Create Company List Spreadsheet

1. Create a new Google Sheet
2. Name it: `HubSpot Prospect List`
3. Add the following column headers (Row 1):

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| Company Name | Yes | Full company name | ABC Insurance Agency |
| Website | Yes | Company website URL | https://abcinsurance.com |
| Industry | No | Industry or vertical | Commercial Insurance |
| Location | No | City, State format | Austin, TX |
| Employee Count | No | Number of employees | 25 |
| LinkedIn URL | No | Company LinkedIn profile | https://linkedin.com/company/abc |
| Contact First Name | Yes | Contact's first name | John |
| Contact Last Name | Yes | Contact's last name | Doe |
| Contact Email | Yes | Contact's email address | john@abcinsurance.com |
| Contact Job Title | Yes | Contact's job title | CEO |
| Contact Phone | No | Contact's phone number | (512) 555-1234 |
| Status | Auto | Processing status (auto-filled) | |
| HubSpot URL | Auto | Contact URL (auto-filled) | |
| Processed Date | Auto | Date processed (auto-filled) | |
| Emails Generated | Auto | Number of emails (auto-filled) | |
| Sequence Enrolled | Auto | Enrollment status (auto-filled) | |
| Contact ID | Auto | HubSpot contact ID (auto-filled) | |
| Error Message | Auto | Error details if failed (auto-filled) | |

### Step 1.2: Add Sample Data

Add 1-2 test rows with real company data to verify the workflow.

**Example Row:**
```
Company Name: Example Corp
Website: https://example.com
Industry: Technology
Location: San Francisco, CA
Contact First Name: Jane
Contact Last Name: Smith
Contact Email: jane@example.com
Contact Job Title: VP of Sales
```

---

## Part 2: Set Up API Credentials

### Step 2.1: OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: `n8n-hubspot-workflow`
4. Copy the API key (starts with `sk-...`)
5. Save securely for Step 4

**Cost Estimate:**
- GPT-4 Turbo: ~$0.30 per prospect (research + 3 emails)
- 100 prospects = ~$30

### Step 2.2: HubSpot API Key (Private App)

1. Go to HubSpot Settings → Integrations → Private Apps
2. Click "Create private app"
3. Name: `n8n Prospecting Integration`
4. Description: `Automated prospect processing from n8n`
5. **Scopes Required** (click "Scopes" tab):
   - ✅ `crm.objects.contacts.read`
   - ✅ `crm.objects.contacts.write`
   - ✅ `crm.schemas.contacts.read`
   - ✅ `crm.schemas.contacts.write`
   - ✅ `automation` (for sequences, if using)
6. Click "Create app"
7. Copy the Access Token (keep secure)

**Note:** For sequence enrollment, you need Sales Hub Professional or Enterprise.

### Step 2.3: Slack Webhook (Optional)

1. Go to: https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: `HubSpot Workflow Notifications`
4. Choose your workspace
5. Click "Incoming Webhooks"
6. Toggle "Activate Incoming Webhooks" to ON
7. Click "Add New Webhook to Workspace"
8. Select channel: `#sales-automation` (or create new)
9. Copy Webhook URL (starts with `https://hooks.slack.com/...`)

---

## Part 3: Install Node.js Dependencies in n8n

### Step 3.1: Install Required Packages

If using **self-hosted n8n**, SSH into your server and install:

```bash
cd /path/to/n8n
npm install openai @hubspot/api-client
```

If using **n8n.cloud**, contact support to install:
- `openai` (OpenAI Node.js SDK)
- `@hubspot/api-client` (HubSpot Node.js SDK)

### Step 3.2: Verify Installation

In n8n, create a test Code node and run:

```javascript
const OpenAI = require('openai');
const hubspot = require('@hubspot/api-client');

return [{ json: {
  openai: typeof OpenAI,
  hubspot: typeof hubspot
}}];
```

Expected output:
```json
{
  "openai": "function",
  "hubspot": "object"
}
```

---

## Part 4: Import and Configure Workflow

### Step 4.1: Import Workflow JSON

1. Open n8n dashboard
2. Click "Workflows" in sidebar
3. Click "+ Add Workflow" button
4. Click the "⋮" menu (top right) → "Import from File"
5. Select `05-hubspot-prospecting.json`
6. Workflow will load with all nodes

### Step 4.2: Configure Google Sheets Trigger

1. Click the **"Google Sheets Trigger"** node
2. Click "Create New Credential" under "Credential for Google Sheets"
3. Follow OAuth flow to connect your Google account
4. Select your spreadsheet: `HubSpot Prospect List`
5. Select the sheet tab (usually "Sheet1")
6. Set polling interval: **5 minutes** (or adjust as needed)
7. Save node

### Step 4.3: Set Environment Variables

In n8n Settings → Variables, add the following:

| Variable Name | Value | Required |
|---------------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI key (sk-...) | Yes |
| `HUBSPOT_API_KEY` | Your HubSpot access token | Yes |
| `HUBSPOT_SEQUENCE_ID` | HubSpot sequence ID (if enrolling) | No |
| `HUBSPOT_OWNER_ID` | Default owner ID for contacts | No |
| `SLACK_CHANNEL` | Slack channel ID (e.g., C01234ABC) | No |

**To find Slack Channel ID:**
1. Open Slack
2. Right-click channel → "View channel details"
3. Scroll to bottom, copy Channel ID

### Step 4.4: Configure Slack Notifications (Optional)

If using Slack notifications:

1. Click **"Slack Notification - Success"** node
2. Click "Create New Credential" under "Credential for Slack"
3. Select "Webhook URL" authentication
4. Paste your Webhook URL from Step 2.3
5. Save credential
6. Repeat for **"Slack Notification - Error"** node

**To disable Slack notifications:**
- Simply delete or disable both Slack nodes

### Step 4.5: Update Code Nodes with Module Paths

The Code nodes reference local modules. You need to update paths:

**Option A: Copy modules to n8n directory**

```bash
# Copy modules to n8n's node_modules or a shared directory
cp agency-pipeline/executions/ai/company-research.js /path/to/n8n/modules/
cp agency-pipeline/executions/ai/email-generation.js /path/to/n8n/modules/
cp agency-pipeline/executions/integrations/hubspot-client.js /path/to/n8n/modules/
```

Then update `require()` paths in Code nodes:

```javascript
// Change from:
const HubSpotClient = require('./hubspot-client.js');

// To:
const HubSpotClient = require('/path/to/n8n/modules/hubspot-client.js');
```

**Option B: Inline the code**

Copy the complete module code directly into the Code nodes (simpler for n8n.cloud).

---

## Part 5: Test the Workflow

### Step 5.1: Manual Test Execution

1. Click **"Save"** workflow (top right)
2. Click **"Execute Workflow"** button (top right)
3. The workflow will process the first row in your sheet
4. Watch the node execution flow
5. Check for any errors (red nodes)

### Step 5.2: Verify Results

After successful test:

1. **Check Google Sheet:**
   - Status column should show "Completed"
   - HubSpot URL should be populated
   - Processed Date should be filled
   - Emails Generated should show "3"

2. **Check HubSpot:**
   - Go to the HubSpot URL from the sheet
   - Verify contact was created/updated
   - Check Activity feed for the note with research + emails
   - If sequence enrollment enabled, verify enrollment

3. **Check Slack (if enabled):**
   - Look for success notification in your channel
   - Should include contact details and HubSpot link

### Step 5.3: Test Error Handling

Add a row with invalid data (e.g., missing email) to test error branch:

```
Company Name: Test Error
Website: https://test.com
Contact First Name: Test
Contact Last Name: User
Contact Email: [leave blank]
```

Expected result:
- Status: "Error"
- Error Message: "Contact Email is required"
- Slack error notification (if enabled)

---

## Part 6: Activate Workflow

### Step 6.1: Enable Trigger

1. Toggle **"Active"** switch (top right)
2. Workflow will now poll every 5 minutes
3. Any new rows added will be processed automatically

### Step 6.2: Monitor Execution

View execution history:
1. Click "Executions" tab in workflow
2. See all past runs with success/failure status
3. Click any execution to view detailed logs
4. Use for debugging and monitoring

---

## Part 7: Scaling and Rate Limits

### OpenAI Rate Limits

**Default Limits (Pay-as-you-go):**
- 10,000 requests per minute
- 2,000,000 tokens per minute

**Handling:**
- Rate limiting is built into the Code nodes
- Max 10 requests/minute enforced
- Exponential backoff on errors

### HubSpot Rate Limits

**Standard Limits:**
- 100 requests per 10 seconds
- Daily limits vary by subscription

**Handling:**
- Built-in rate limiter in HubSpot client
- Automatic retry with backoff
- Respects 429 rate limit responses

### Recommended Processing Volume

| Interval | Max Prospects/Day | Est. Cost (OpenAI) |
|----------|-------------------|-------------------|
| 5 minutes | ~288 prospects | ~$86/day |
| 10 minutes | ~144 prospects | ~$43/day |
| 30 minutes | ~48 prospects | ~$14/day |
| 1 hour | ~24 prospects | ~$7/day |

**To adjust polling interval:**
1. Click "Google Sheets Trigger" node
2. Change "Poll Times" setting
3. Save workflow

---

## Part 8: Customization

### Customize Email Prompts

To adjust email generation:

1. Click **"AI Email Generation"** node
2. Find the `approaches` array
3. Modify the `instructions` for each approach
4. Save node

**Example:** Change tone to more casual:

```javascript
instructions: `Use a casual, friendly approach:
- Write like a helpful colleague, not a salesperson
- Use contractions and natural language
- Keep it brief and to-the-point
- End with a simple question`
```

### Add Custom Contact Fields

To capture additional data:

1. Update Google Sheet with new columns
2. Modify **"Prepare Contact Data"** node:

```javascript
const contactData = {
  // Existing fields...
  customField: row['Custom Field Name'],
};
```

3. Update **"HubSpot Integration"** node to map to HubSpot properties

### Change Sequence Enrollment Logic

To use sheet-specific sequence IDs:

1. Add "Sequence ID" column to Google Sheet
2. Modify **"HubSpot Integration"** node:

```javascript
options: {
  sequenceId: originalRow['Sequence ID'] || process.env.HUBSPOT_SEQUENCE_ID,
}
```

Now each row can specify its own sequence!

---

## Part 9: Troubleshooting

### Common Issues

#### Issue: "OpenAI API key not found"

**Solution:**
1. Check environment variable is set: `OPENAI_API_KEY`
2. Restart n8n after adding variable
3. Verify no typos in variable name

#### Issue: "HubSpot contact creation failed"

**Solution:**
1. Verify API key has correct scopes
2. Check email format is valid
3. Review HubSpot error in execution logs
4. Ensure Private App is not disabled

#### Issue: "Sequence enrollment failed - Permission Denied"

**Solution:**
- Sequences API requires Sales Hub Professional/Enterprise
- If not available, remove sequence enrollment step
- Contacts will still be created with notes

#### Issue: "Rate limit exceeded"

**Solution:**
1. Reduce polling frequency (10 or 30 minutes)
2. Process smaller batches
3. Check if hitting OpenAI or HubSpot limits
4. Built-in retry logic will handle temporary limits

#### Issue: "Google Sheets not updating"

**Solution:**
1. Verify OAuth credential is still valid
2. Re-authenticate if expired
3. Check sheet name matches exactly
4. Ensure sheet has write permissions

### Debug Mode

Enable detailed logging:

1. Click any Code node
2. Add `console.log()` statements:

```javascript
console.log('[DEBUG] Input data:', $input.item.json);
console.log('[DEBUG] Processing:', contactData);
```

3. View logs in Execution details

---

## Part 10: Production Best Practices

### Security

- ✅ Never commit API keys to version control
- ✅ Use environment variables for all credentials
- ✅ Restrict HubSpot API scopes to minimum required
- ✅ Rotate API keys periodically
- ✅ Use Private Apps (not OAuth) for HubSpot
- ✅ Enable 2FA on all accounts

### Monitoring

- ✅ Set up Slack error notifications
- ✅ Review execution logs weekly
- ✅ Monitor OpenAI API costs in dashboard
- ✅ Track HubSpot contact creation rate
- ✅ Set up alerts for high failure rates

### Data Quality

- ✅ Validate company data before adding to sheet
- ✅ Remove duplicate emails before processing
- ✅ Verify contact job titles are accurate
- ✅ Check company websites are correct
- ✅ Review generated emails periodically for quality

### Optimization

- ✅ Batch process during off-hours
- ✅ Use fallback templates for cost savings
- ✅ Archive processed rows monthly
- ✅ Clean up old execution logs
- ✅ Monitor token usage per prospect

---

## Part 11: Support and Resources

### Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [Google Sheets API](https://developers.google.com/sheets/api)

### Community

- [n8n Community Forum](https://community.n8n.io/)
- [n8n Discord](https://discord.gg/n8n)

### Getting Help

If you encounter issues:

1. Check execution logs for error details
2. Search n8n community forum
3. Review this guide's Troubleshooting section
4. Contact support with execution ID and error message

---

## Success Checklist

Before going live, verify:

- [ ] Google Sheet created with correct columns
- [ ] All API credentials configured in n8n
- [ ] Environment variables set correctly
- [ ] Test execution completed successfully
- [ ] Contact created in HubSpot with note
- [ ] Sheet updated with status and URL
- [ ] Error handling tested with invalid data
- [ ] Slack notifications working (if enabled)
- [ ] Rate limits understood and configured
- [ ] Workflow activated and monitoring set up

---

## Next Steps

1. **Start Small:** Process 5-10 prospects manually first
2. **Review Quality:** Check generated emails and research
3. **Adjust Prompts:** Customize if needed
4. **Scale Gradually:** Increase volume as confidence grows
5. **Monitor Costs:** Track OpenAI usage
6. **Optimize:** Remove unused steps, improve prompts

**You're ready to automate your HubSpot prospecting!**
