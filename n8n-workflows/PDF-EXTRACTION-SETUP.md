# PDF Data Extraction with Claude AI - Setup Guide

## Overview

This n8n workflow extracts structured data from PDF files using Claude AI's vision and text analysis capabilities.

## Workflow Path
`~/agency-pipeline/n8n-workflows/06-pdf-data-extraction.json`

---

## Prerequisites

### 1. Anthropic API Access
- Sign up at https://console.anthropic.com
- Create an API key
- Model used: `claude-3-5-sonnet-20241022`

### 2. n8n Instance
- Self-hosted n8n OR n8n Cloud
- Version 1.x or higher
- Required nodes:
  - Webhook (built-in)
  - Extract from File (built-in)
  - HTTP Request (built-in)
  - Code (built-in)
  - IF (built-in)

---

## Environment Variables

Configure these in your n8n instance:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here

# Required - Destination webhook for extracted data
OUTPUT_WEBHOOK_URL=https://your-destination.com/webhook

# Optional - For custom prompts
EXTRACTION_PROMPT_TEMPLATE=your-custom-prompt
```

### Setting Environment Variables in n8n

**Self-Hosted:**
```bash
# In your .env file or docker-compose.yml
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OUTPUT_WEBHOOK_URL=https://destination.com/webhook
```

**n8n Cloud:**
1. Go to Settings → Environment Variables
2. Add each variable
3. Save and restart workflows

---

## Installation Steps

### Step 1: Import Workflow

1. Open n8n interface
2. Click "Import from File"
3. Select `06-pdf-data-extraction.json`
4. Click "Import"

### Step 2: Configure Webhook Trigger

1. Open the "Webhook" node
2. Note the webhook URL (will be shown after activation)
3. For production:
   - Enable authentication (recommended)
   - Set up API key or basic auth

### Step 3: Test the Workflow

1. Click "Execute Workflow" button
2. The webhook will start listening
3. Send a test PDF:

```bash
# Using cURL
curl -X POST \
  https://your-n8n-instance.com/webhook/pdf-extract \
  -F "data=@/path/to/sample.pdf"
```

```javascript
// Using JavaScript fetch
const formData = new FormData();
formData.append('data', pdfFile);

fetch('https://your-n8n-instance.com/webhook/pdf-extract', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Step 4: Verify Output

Check that the output webhook receives:
- `data`: JSON array of extracted information
- `recordCount`: Number of records extracted
- `timestamp`: ISO timestamp
- `pdf`: Original PDF file (binary)

---

## Workflow Nodes Explained

### 1. Webhook (Trigger)
- **Path**: `/pdf-extract`
- **Method**: POST
- **Input**: PDF file as binary data (form field name: `data`)
- **Output**: Passes PDF binary to next node

### 2. Extract from File
- **Purpose**: Convert PDF to text
- **Input**: Binary PDF data
- **Output**: Text content in `data` field
- **Note**: Works with text-based PDFs (not scanned images)

### 3. Check Extraction (IF Node)
- **Purpose**: Error handling
- **Condition**: Checks if text extraction succeeded
- **True Branch**: Proceeds to Claude AI
- **False Branch**: Returns error response

### 4. Claude AI Extraction
- **Method**: POST to Anthropic API
- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 4000
- **Input**: PDF text + extraction prompt
- **Output**: Claude's JSON response

### 5. Format JSON (Code Node)
- **Purpose**: Parse Claude response and clean data
- **Logic**:
  - Removes markdown code blocks
  - Parses JSON
  - Ensures array format
  - Handles errors gracefully
- **Output**: Clean JSON array + metadata

### 6. Send to Output Webhook
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Payload**:
  - Original PDF (binary)
  - Extracted data (JSON string)
  - Record count
  - Timestamp

### 7. Extraction Error (Code Node)
- **Purpose**: Error response when PDF extraction fails
- **Output**: Structured error message

---

## Customizing the Extraction Prompt

The default prompt extracts:
- name
- date
- amount
- description

### To Customize:

1. Open the "Claude AI Extraction" node
2. Edit the `jsonBody` field
3. Modify the prompt in the `content` field

**Example - Invoice Extraction:**
```json
"content": "Extract invoice data from this PDF and return as JSON array:\n\nFor each line item:\n- item_name\n- quantity\n- unit_price\n- total\n- tax_amount\n\nAlso extract:\n- invoice_number\n- invoice_date\n- vendor_name\n- total_amount\n\nReturn ONLY valid JSON array.\n\nDocument: {{$node['Extract from File'].json.data}}"
```

**Example - Resume Parsing:**
```json
"content": "Extract candidate information from this resume:\n\n- full_name\n- email\n- phone\n- skills (array)\n- work_experience (array of objects)\n- education (array of objects)\n\nReturn as JSON object.\n\nResume text: {{$node['Extract from File'].json.data}}"
```

---

## Error Handling

### Common Issues

**1. PDF Extraction Fails**
- **Cause**: Scanned PDF (image-based)
- **Solution**: Use OCR preprocessing OR use Claude's vision API with PDF images

**2. Claude API Error**
- **Cause**: Invalid API key or rate limit
- **Solution**: Check `ANTHROPIC_API_KEY` environment variable

**3. JSON Parse Error**
- **Cause**: Claude returned non-JSON text
- **Solution**: Improve prompt clarity, add examples

**4. Output Webhook Fails**
- **Cause**: Invalid `OUTPUT_WEBHOOK_URL`
- **Solution**: Verify destination webhook is accessible

### Debugging Tips

1. **Enable n8n Debug Mode**: Settings → Executions → Save Manual Executions
2. **Inspect Node Outputs**: Click on each node to see input/output data
3. **Test Claude Prompt Separately**: Use Anthropic Console to test prompts
4. **Check Logs**: n8n logs show detailed error messages

---

## Advanced Configurations

### Adding Authentication

**Option 1: API Key Header**
1. Edit Webhook node
2. Add Header Auth
3. Require `X-API-Key` header

**Option 2: Basic Auth**
1. Edit Webhook node
2. Enable Basic Auth
3. Set username/password

### Rate Limiting

Add a "Wait" node before Claude API:
```json
{
  "amount": 1,
  "unit": "seconds"
}
```

### Batch Processing

To process multiple PDFs:
1. Replace Webhook with "Read Binary Files" node
2. Enable "Loop Over Items" in Claude node
3. Aggregate results with "Aggregate" node

### Using Claude Vision for Scanned PDFs

For image-based PDFs, modify the Claude API call:

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4000,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "application/pdf",
            "data": "={{$binary.data.toString('base64')}}"
          }
        },
        {
          "type": "text",
          "text": "Extract data from this PDF..."
        }
      ]
    }
  ]
}
```

---

## Production Deployment

### 1. Security Checklist
- [ ] Enable webhook authentication
- [ ] Store API keys in environment variables (never hardcode)
- [ ] Use HTTPS for all endpoints
- [ ] Implement rate limiting
- [ ] Add request validation

### 2. Monitoring
- [ ] Set up execution logging
- [ ] Configure error notifications (email/Slack)
- [ ] Track API usage and costs
- [ ] Monitor webhook uptime

### 3. Scaling
- [ ] Enable n8n queue mode for high volume
- [ ] Use multiple n8n instances with load balancer
- [ ] Implement retry logic for failed extractions
- [ ] Cache common extraction patterns

---

## Cost Estimation

**Anthropic API Pricing (as of Feb 2026):**
- Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens
- Average PDF extraction: ~1000 input tokens + 500 output tokens
- **Cost per PDF**: ~$0.01

**Example Monthly Costs:**
- 1,000 PDFs/month: ~$10
- 10,000 PDFs/month: ~$100
- 100,000 PDFs/month: ~$1,000

---

## Testing Checklist

Before production deployment:

- [ ] Test with small PDF (< 5 pages)
- [ ] Test with large PDF (> 50 pages)
- [ ] Test with scanned PDF
- [ ] Test with corrupted/invalid PDF
- [ ] Verify error handling works
- [ ] Confirm output webhook receives data
- [ ] Test with authentication enabled
- [ ] Verify JSON parsing handles edge cases

---

## Support & Resources

- **n8n Documentation**: https://docs.n8n.io
- **Anthropic API Docs**: https://docs.anthropic.com
- **Claude Prompt Engineering**: https://docs.anthropic.com/claude/docs/prompt-engineering
- **PDF Text Extraction Issues**: Check if PDF is text-based or scanned

---

## Example Use Cases

1. **Invoice Processing**: Extract line items, totals, vendor info
2. **Resume Parsing**: Extract candidate skills, experience, education
3. **Contract Analysis**: Extract key terms, dates, parties
4. **Medical Records**: Extract patient info, diagnoses, prescriptions
5. **Financial Reports**: Extract tables, figures, summaries

---

## Next Steps

1. Import workflow into n8n
2. Configure environment variables
3. Test with sample PDFs
4. Customize extraction prompt for your use case
5. Set up output webhook destination
6. Deploy to production with authentication

**Questions?** Check the troubleshooting section or consult n8n/Anthropic documentation.
