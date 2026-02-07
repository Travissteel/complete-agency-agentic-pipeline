# HubSpot Integration Guide for Agency Pipeline

Complete guide for integrating HubSpot CRM into your agency outreach workflow.

## Table of Contents

1. [Quick Start](#quick-start)
2. [HubSpot Account Setup](#hubspot-account-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Integration Workflow](#integration-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Quick Start

### 5-Minute Setup

1. **Install dependencies**
```bash
cd ~/agency-pipeline
npm install
```

2. **Set up HubSpot API key**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your HubSpot Private App token
# HUBSPOT_API_KEY=your-token-here
```

3. **Test the integration**
```bash
cd executions/integrations
node test-hubspot.js
```

4. **Run example workflow**
```bash
# Edit example-usage.js to use your data
node example-usage.js
```

---

## HubSpot Account Setup

### Step 1: Create Private App

1. Log in to your HubSpot account
2. Click Settings (gear icon) in top right
3. Navigate to **Integrations → Private Apps**
4. Click **Create a private app**

### Step 2: Configure App Details

**Basic Info Tab:**
- Name: `Agency Pipeline Integration`
- Description: `AI-powered outreach pipeline integration`

**Scopes Tab** (Required):
- [x] `crm.objects.contacts.read`
- [x] `crm.objects.contacts.write`
- [x] `crm.schemas.contacts.read`
- [x] `crm.objects.notes.write`

**Scopes Tab** (Optional - for Sequences):
- [x] `automation.sequences.read`
- [x] `automation.sequences.write`

> Note: Sequence scopes require Sales Hub Professional or Enterprise

### Step 3: Generate Token

1. Click **Create app**
2. Review permissions and click **Continue creating**
3. Copy the **Access Token** (you won't see it again!)
4. Save token securely in your `.env` file

### Step 4: Verify Setup

```bash
# Test the connection
export HUBSPOT_API_KEY="your-token-here"
node test-hubspot.js
```

---

## Installation

### Prerequisites

- Node.js v16 or higher
- HubSpot account (Free tier works for basic features)
- Private App access token

### Install Dependencies

```bash
# From project root
npm install

# Verify installation
npm list @hubspot/api-client
```

Expected output:
```
agency-pipeline@1.0.0
└── @hubspot/api-client@11.2.0
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Required: HubSpot API Authentication
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Optional: Default Sequence for Auto-Enrollment
HUBSPOT_DEFAULT_SEQUENCE_ID=12345

# Optional: Default Owner for Contact Assignment
HUBSPOT_DEFAULT_OWNER_ID=67890
```

### Find Your Sequence ID

1. Go to **Automation → Sequences** in HubSpot
2. Click on the sequence you want to use
3. Look at the URL: `https://app.hubspot.com/sequences/PORTAL_ID/sequence/SEQUENCE_ID`
4. Copy the `SEQUENCE_ID` number

### Find Your Owner ID

1. Go to **Settings → Users & Teams**
2. Click on a user
3. Look at the URL: `https://app.hubspot.com/settings/PORTAL_ID/user/OWNER_ID`
4. Copy the `OWNER_ID` number

---

## Integration Workflow

### Complete Prospect Processing Flow

```
Prospect Data → HubSpot Client → Contact Created → Sequence Enrolled → Note Added
```

### Code Example: Full Integration

```javascript
const HubSpotClient = require('./integrations/hubspot-client');

// Initialize client
const hubspot = new HubSpotClient(process.env.HUBSPOT_API_KEY);

// Step 1: Prepare prospect data (from your pipeline)
const prospectData = {
  contact: {
    email: "contact@example.com",
    firstName: "John",
    lastName: "Doe",
    jobTitle: "CEO",
    companyName: "Example Insurance Agency",
    phone: "+1-555-0100",
    website: "https://example.com",
    industry: "Insurance",
    location: "Austin, TX"
  },
  emails: [
    {
      subject: "Email subject line",
      body: "Email body content...",
      approach: "problem-solution"
    }
    // ... more variants
  ],
  companyResearch: "Research findings about the company...",
  options: {
    sequenceId: process.env.HUBSPOT_DEFAULT_SEQUENCE_ID,
    ownerId: process.env.HUBSPOT_DEFAULT_OWNER_ID
  }
};

// Step 2: Process prospect (creates contact, enrolls in sequence, adds note)
const result = await hubspot.processProspect(prospectData);

// Step 3: Handle result
if (result.success) {
  console.log(`✓ Contact created: ${result.contactUrl}`);
  console.log(`✓ Sequence enrolled: ${result.sequenceEnrolled}`);
  console.log(`✓ Note added: ${result.noteCreated}`);
} else {
  console.error('Failed to process prospect');
  result.errors.forEach(err => console.error(err.message));
}
```

### Individual Operations

#### Create Contact Only

```javascript
const result = await hubspot.createOrUpdateContact({
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  companyName: "Example Agency"
});

console.log(`Contact ID: ${result.contactId}`);
console.log(`Operation: ${result.operation}`); // 'created' or 'updated'
```

#### Enroll in Sequence Only

```javascript
const result = await hubspot.addContactToSequence(
  "12345", // contactId
  "67890"  // sequenceId
);

if (result.success) {
  console.log('Enrolled in sequence successfully');
} else {
  console.log(`Failed: ${result.message}`);
  // Handle gracefully - contact can be enrolled manually
}
```

#### Add Note Only

```javascript
const noteContent = `
# Follow-up Notes

## Research Findings
- Key insight 1
- Key insight 2

## Next Steps
- Action item 1
- Action item 2
`;

const result = await hubspot.addNoteToContact("12345", noteContent);
console.log(`Note ID: ${result.noteId}`);
```

---

## Troubleshooting

### Common Issues

#### Error: "HubSpot API key is required"

**Problem:** Environment variable not set

**Solution:**
```bash
# Check if variable is set
echo $HUBSPOT_API_KEY

# If empty, set it
export HUBSPOT_API_KEY="your-token-here"

# Or add to .env file
echo "HUBSPOT_API_KEY=your-token-here" >> .env
```

#### Error: "Permission denied" on Sequence Enrollment

**Problem:** Account doesn't have Sequences API access

**Solutions:**
1. Upgrade to Sales Hub Professional or Enterprise
2. Make sequence enrollment optional:
```javascript
options: {
  sequenceId: null // Will skip sequence enrollment
}
```
3. Manually enroll contacts in HubSpot UI

#### Error: "Sequence not found"

**Problem:** Sequence ID is incorrect or sequence was deleted

**Solutions:**
1. Verify sequence exists in HubSpot
2. Check sequence ID in URL
3. Ensure sequence is active (not archived)

#### Rate Limit Errors (429)

**Problem:** Too many API requests too quickly

**Solution:** The client auto-retries with exponential backoff. For high-volume:
```javascript
// Add delays between batch operations
for (const prospect of prospects) {
  await hubspot.processProspect(prospect);
  await new Promise(r => setTimeout(r, 500)); // 500ms delay
}
```

#### Validation Errors (400)

**Problem:** Invalid data format

**Common causes:**
- Invalid email format
- Phone number format issues
- Missing required fields

**Solution:**
```javascript
// Validate email before calling API
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (!isValidEmail(contact.email)) {
  console.error('Invalid email format');
  return;
}
```

---

## Best Practices

### 1. Error Handling

Always wrap API calls in try/catch:

```javascript
try {
  const result = await hubspot.processProspect(data);
  // Handle success
} catch (error) {
  console.error('HubSpot API Error:', error.message);
  // Log to error tracking service
  // Don't stop entire batch - continue with next prospect
}
```

### 2. Batch Processing

Process prospects sequentially with delays:

```javascript
async function processBatch(prospects) {
  const results = [];

  for (const prospect of prospects) {
    try {
      const result = await hubspot.processProspect(prospect);
      results.push({ email: prospect.contact.email, success: true });

      // Respect rate limits
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      results.push({
        email: prospect.contact.email,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
```

### 3. Data Validation

Validate data before sending to HubSpot:

```javascript
function validateProspectData(data) {
  const errors = [];

  if (!data.contact.email) {
    errors.push('Email is required');
  }

  if (!isValidEmail(data.contact.email)) {
    errors.push('Email format is invalid');
  }

  if (!data.contact.firstName || !data.contact.lastName) {
    errors.push('First and last name are required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Before processing
const validation = validateProspectData(prospectData);
if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  return;
}
```

### 4. Logging

Implement proper logging for production:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'hubspot-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'hubspot-combined.log' })
  ]
});

// In your code
try {
  const result = await hubspot.processProspect(data);
  logger.info('Prospect processed', {
    email: data.contact.email,
    contactId: result.contactId
  });
} catch (error) {
  logger.error('Failed to process prospect', {
    email: data.contact.email,
    error: error.message
  });
}
```

### 5. Security

**Never commit API keys:**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.env" >> .gitignore

# Verify not tracked
git status
```

**Use environment-specific configs:**

```javascript
// config/hubspot.js
module.exports = {
  development: {
    apiKey: process.env.HUBSPOT_DEV_API_KEY,
    sequenceId: process.env.HUBSPOT_DEV_SEQUENCE_ID
  },
  production: {
    apiKey: process.env.HUBSPOT_PROD_API_KEY,
    sequenceId: process.env.HUBSPOT_PROD_SEQUENCE_ID
  }
};

const config = require('./config/hubspot')[process.env.NODE_ENV || 'development'];
const hubspot = new HubSpotClient(config.apiKey);
```

### 6. Monitoring

Track key metrics:

```javascript
const metrics = {
  contactsCreated: 0,
  contactsUpdated: 0,
  sequencesEnrolled: 0,
  notesAdded: 0,
  errors: 0
};

async function processWithMetrics(prospect) {
  try {
    const result = await hubspot.processProspect(prospect);

    if (result.operations.contactCreated) metrics.contactsCreated++;
    else metrics.contactsUpdated++;

    if (result.operations.sequenceEnrolled) metrics.sequencesEnrolled++;
    if (result.operations.noteAdded) metrics.notesAdded++;

  } catch (error) {
    metrics.errors++;
  }
}

// After batch processing
console.log('Batch Metrics:', metrics);
```

---

## Support & Resources

### Documentation
- [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)
- [Private Apps Guide](https://developers.hubspot.com/docs/api/private-apps)
- [Sequences API](https://developers.hubspot.com/docs/api/automation/sequences)

### Testing
- Use HubSpot Sandbox account for testing
- Test with small batches first
- Verify data in HubSpot UI before production

### Questions?
- Check the README.md for API reference
- Run test-hubspot.js for validation
- Review example-usage.js for patterns

---

**Last Updated:** February 2026
**Version:** 1.0.0
