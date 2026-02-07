# HubSpot Integration Module

Professional HubSpot API integration for the agency pipeline system.

## Overview

The `hubspot-client.js` module provides a wrapper around the HubSpot API to:
- Create and update contacts
- Enroll contacts in email sequences (requires Sales Hub Pro/Enterprise)
- Add research notes and email variants to contacts
- Handle rate limiting and retries automatically

## Installation

```bash
npm install @hubspot/api-client
```

## Setup

### 1. Get HubSpot API Key

1. Log in to your HubSpot account
2. Go to Settings → Integrations → Private Apps
3. Create a new Private App with the following scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read`
   - `crm.objects.notes.write`
   - `automation.sequences.read` (if using sequences)
   - `automation.sequences.write` (if using sequences)

4. Copy the Access Token

### 2. Set Environment Variable

```bash
export HUBSPOT_API_KEY="your-private-app-token"
```

Or create a `.env` file:
```
HUBSPOT_API_KEY=your-private-app-token
```

## Usage

### Basic Contact Creation

```javascript
const HubSpotClient = require('./integrations/hubspot-client');

const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

const result = await client.createOrUpdateContact({
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  jobTitle: "CEO",
  companyName: "ABC Insurance Agency",
  phone: "+1-512-555-0100",
  website: "https://abcinsurance.com",
  industry: "Commercial Insurance",
  location: "Austin, TX"
});

console.log(`Contact ID: ${result.contactId}`);
console.log(`Operation: ${result.operation}`); // 'created' or 'updated'
```

### Complete Prospect Processing

```javascript
const prospectData = {
  contact: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    jobTitle: "CEO",
    companyName: "ABC Insurance Agency",
    phone: "+1-512-555-0100",
    website: "https://abcinsurance.com",
    industry: "Commercial Insurance",
    location: "Austin, TX"
  },
  emails: [
    {
      subject: "Transform Your Agency's Digital Presence",
      body: "Hi John,\n\nI noticed ABC Insurance Agency...",
      approach: "problem-solution"
    },
    {
      subject: "How 3 Insurance Agencies 2x'd Their Leads",
      body: "Hi John,\n\nWe helped XYZ Insurance...",
      approach: "social-proof"
    },
    {
      subject: "Quick question about ABC Insurance's website",
      body: "Hi John,\n\nI was looking at your site...",
      approach: "question"
    }
  ],
  companyResearch: "ABC Insurance Agency is a commercial insurance brokerage based in Austin, TX...",
  options: {
    sequenceId: "12345", // Optional: HubSpot sequence ID
    ownerId: "67890"     // Optional: HubSpot owner ID
  }
};

const result = await client.processProspect(prospectData);

console.log(`Success: ${result.success}`);
console.log(`Contact URL: ${result.contactUrl}`);
console.log(`Sequence Enrolled: ${result.sequenceEnrolled}`);
console.log(`Note Created: ${result.noteCreated}`);
```

## API Methods

### `constructor(apiKey)`

Initialize the HubSpot client.

**Parameters:**
- `apiKey` (string): HubSpot Private App access token

**Throws:**
- Error if API key is not provided

---

### `createOrUpdateContact(contactData)`

Create a new contact or update existing one (by email).

**Parameters:**
- `contactData` (object):
  - `email` (string, required): Contact email
  - `firstName` (string): First name
  - `lastName` (string): Last name
  - `jobTitle` (string): Job title
  - `companyName` (string): Company name
  - `phone` (string): Phone number
  - `website` (string): Website URL
  - `industry` (string): Industry
  - `location` (string): Location (City, State format)

**Returns:**
```javascript
{
  success: true,
  contactId: "12345",
  operation: "created", // or "updated"
  data: { ... } // Full HubSpot API response
}
```

**Error Handling:**
- Automatically updates if contact with email exists
- Retries on rate limits (429) and server errors (5xx)
- Throws on unrecoverable errors

---

### `addContactToSequence(contactId, sequenceId)`

Enroll a contact in a HubSpot sequence.

**Requirements:**
- HubSpot Sales Hub Professional or Enterprise
- Sequences API permissions

**Parameters:**
- `contactId` (string): HubSpot contact ID
- `sequenceId` (string): HubSpot sequence ID

**Returns:**
```javascript
{
  success: true,
  contactId: "12345",
  sequenceId: "67890",
  data: { ... }
}
```

**On Error:**
```javascript
{
  success: false,
  error: "SEQUENCE_NOT_FOUND", // or "PERMISSION_DENIED"
  message: "Sequence 12345 not found...",
  contactId: "12345",
  sequenceId: "67890"
}
```

**Note:** Gracefully handles missing Sequences API access. Contact can be enrolled manually in HubSpot UI.

---

### `addNoteToContact(contactId, noteContent)`

Add a note to a contact.

**Parameters:**
- `contactId` (string): HubSpot contact ID
- `noteContent` (string): Note content (markdown supported)

**Returns:**
```javascript
{
  success: true,
  noteId: "98765",
  contactId: "12345",
  data: { ... }
}
```

---

### `processProspect(prospectData)`

Complete workflow: create contact, enroll in sequence, add note.

**Parameters:**
- `prospectData` (object):
  - `contact` (object): Contact data (see `createOrUpdateContact`)
  - `emails` (array): Email variants with subject, body, approach
  - `companyResearch` (string): Research summary
  - `options` (object, optional):
    - `sequenceId` (string): HubSpot sequence ID
    - `ownerId` (string): HubSpot owner ID

**Returns:**
```javascript
{
  success: true,
  contactId: "12345",
  contactUrl: "https://app.hubspot.com/contacts/.../contact/12345",
  sequenceEnrolled: true,
  sequenceId: "67890",
  noteCreated: true,
  operations: {
    contactCreated: true,  // or false if updated
    sequenceEnrolled: true,
    noteAdded: true
  },
  errors: [] // Any non-critical errors (e.g., sequence enrollment failed)
}
```

**Workflow Steps:**
1. Create or update contact in HubSpot
2. Enroll in sequence (if `sequenceId` provided)
3. Add note with research and email variants

**Error Handling:**
- Continues on non-critical errors (e.g., sequence enrollment failure)
- Throws on critical errors (e.g., contact creation failure)
- Returns partial results with error details

## Rate Limiting

The client automatically handles HubSpot's rate limits:
- **Default:** 100 requests per 10 seconds
- **Behavior:** Queues requests and waits when limit approached
- **Retries:** Exponential backoff on 429 responses

## Error Handling

### Automatic Retries

The client retries on:
- Rate limit errors (429)
- Server errors (500, 502, 503, 504)
- Network timeouts

**Retry Strategy:**
- Maximum 3 attempts
- Exponential backoff (2s, 4s, 8s)
- Clear logging of retry attempts

### Error Types

| Error Code | Meaning | Handling |
|------------|---------|----------|
| 400 | Bad Request | Throws (check input data) |
| 401 | Unauthorized | Throws (check API key) |
| 403 | Forbidden | Returns error (likely missing Sequences API) |
| 404 | Not Found | Returns error (sequence doesn't exist) |
| 409 | Conflict | Auto-updates existing contact |
| 429 | Rate Limited | Auto-retries with backoff |
| 5xx | Server Error | Auto-retries up to 3 times |

## HubSpot Requirements

### Minimum (Contact Creation Only)

- HubSpot Free or higher
- Private App with Contacts read/write scopes

### Full Features (With Sequences)

- HubSpot Sales Hub Professional or Enterprise
- Private App with additional scopes:
  - `automation.sequences.read`
  - `automation.sequences.write`

### Graceful Degradation

If Sequences API is not available:
- Contact creation still works
- Sequence enrollment returns error with flag
- Note with email variants still added
- Contact can be manually enrolled in HubSpot UI

## Logging

The client logs all operations to console:

```
[HubSpotClient] Initialized successfully
[createOrUpdateContact] Processing contact: john@example.com
[createOrUpdateContact] Contact created successfully. ID: 12345
[addContactToSequence] Enrolling contact 12345 in sequence 67890
[addContactToSequence] Contact enrolled successfully
[addNoteToContact] Adding note to contact 12345
[addNoteToContact] Note created successfully. ID: 98765
```

**Production:** Redirect logs to proper logging system (Winston, Bunyan, etc.)

## Troubleshooting

### "HubSpot API key is required"
- Set `HUBSPOT_API_KEY` environment variable
- Verify API key is valid Private App token

### "Permission denied" on sequence enrollment
- Verify account has Sales Hub Professional/Enterprise
- Check Private App has Sequences API scopes
- Consider manual enrollment as fallback

### "Sequence not found"
- Verify sequence ID is correct
- Check sequence exists in HubSpot
- Ensure sequence is active

### Rate limit errors persisting
- Reduce parallel requests
- Implement queue system for high-volume operations
- Consider batching operations

## Best Practices

1. **Environment Variables:** Always use `.env` file, never commit API keys
2. **Error Handling:** Wrap calls in try/catch, handle partial failures
3. **Logging:** Implement proper logging in production
4. **Testing:** Test with HubSpot sandbox account first
5. **Sequences:** Make sequence enrollment optional for MVP
6. **Validation:** Validate email format before calling API
7. **Monitoring:** Track API usage to stay within limits

## Future Enhancements

- [ ] Batch contact creation (up to 100 at a time)
- [ ] Company record creation/association
- [ ] Deal creation and pipeline management
- [ ] Custom contact properties support
- [ ] Webhook integration for real-time updates
- [ ] Analytics and reporting integration

## License

Internal use for agency pipeline system.
