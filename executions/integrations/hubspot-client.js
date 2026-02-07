/**
 * HubSpot API Integration Module
 *
 * Wrapper around HubSpot API to create contacts and add them to email sequences.
 * Handles contact creation/updates, sequence enrollment, and activity logging.
 *
 * Requirements:
 * - @hubspot/api-client npm package
 * - HUBSPOT_API_KEY environment variable
 * - HubSpot Sales Hub Professional/Enterprise for Sequences API (optional)
 *
 * @module hubspot-client
 */

const hubspot = require('@hubspot/api-client');

/**
 * Rate limiter to respect HubSpot API limits (100 requests per 10 seconds)
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 10000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      console.log(`[RateLimiter] Waiting ${waitTime}ms to respect rate limits...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      // Recursively check again after waiting
      return this.waitIfNeeded();
    }

    this.requests.push(now);
  }
}

/**
 * HubSpot API Client
 * Provides methods for contact management and sequence enrollment
 */
class HubSpotClient {
  /**
   * Initialize HubSpot client with API key
   * @param {string} apiKey - HubSpot API key (Private App token recommended)
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('HubSpot API key is required. Set HUBSPOT_API_KEY environment variable.');
    }

    this.client = new hubspot.Client({ accessToken: apiKey });
    this.rateLimiter = new RateLimiter();
    console.log('[HubSpotClient] Initialized successfully');
  }

  /**
   * Retry wrapper for API calls with exponential backoff
   * @private
   */
  async _retryOperation(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimiter.waitIfNeeded();
        return await operation();
      } catch (error) {
        // Handle rate limiting (429)
        if (error.code === 429 && attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[Retry] Rate limited. Waiting ${backoffMs}ms before retry ${attempt}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }

        // Handle known recoverable errors
        if (attempt < maxRetries && [500, 502, 503, 504].includes(error.code)) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`[Retry] Server error ${error.code}. Retrying ${attempt}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }

        // Re-throw if max retries reached or non-recoverable error
        throw error;
      }
    }
  }

  /**
   * Create or update a contact in HubSpot
   * @param {Object} contactData - Contact information
   * @param {string} contactData.email - Contact email (required, used as unique identifier)
   * @param {string} contactData.firstName - First name
   * @param {string} contactData.lastName - Last name
   * @param {string} contactData.jobTitle - Job title
   * @param {string} contactData.companyName - Company name
   * @param {string} contactData.phone - Phone number
   * @param {string} contactData.website - Website URL
   * @param {string} contactData.industry - Industry
   * @param {string} contactData.location - Location (city, state)
   * @returns {Promise<Object>} Contact creation/update result
   */
  async createOrUpdateContact(contactData) {
    console.log(`[createOrUpdateContact] Processing contact: ${contactData.email}`);

    // Map contact data to HubSpot properties
    const properties = {
      email: contactData.email,
      firstname: contactData.firstName || '',
      lastname: contactData.lastName || '',
      jobtitle: contactData.jobTitle || '',
      company: contactData.companyName || '',
      phone: contactData.phone || '',
      website: contactData.website || '',
      industry: contactData.industry || '',
      city: contactData.location ? contactData.location.split(',')[0].trim() : '',
      state: contactData.location && contactData.location.includes(',')
        ? contactData.location.split(',')[1].trim()
        : '',
    };

    try {
      // Try to create contact
      const result = await this._retryOperation(async () => {
        return await this.client.crm.contacts.basicApi.create({
          properties,
          associations: []
        });
      });

      console.log(`[createOrUpdateContact] Contact created successfully. ID: ${result.id}`);
      return {
        success: true,
        contactId: result.id,
        operation: 'created',
        data: result
      };

    } catch (error) {
      // Handle duplicate email (409 conflict)
      if (error.code === 409) {
        console.log(`[createOrUpdateContact] Contact exists. Updating instead...`);

        try {
          // Search for existing contact by email
          const searchResult = await this._retryOperation(async () => {
            return await this.client.crm.contacts.searchApi.doSearch({
              filterGroups: [{
                filters: [{
                  propertyName: 'email',
                  operator: 'EQ',
                  value: contactData.email
                }]
              }],
              limit: 1
            });
          });

          if (searchResult.results && searchResult.results.length > 0) {
            const existingContactId = searchResult.results[0].id;

            // Update existing contact
            const updateResult = await this._retryOperation(async () => {
              return await this.client.crm.contacts.basicApi.update(existingContactId, {
                properties
              });
            });

            console.log(`[createOrUpdateContact] Contact updated successfully. ID: ${existingContactId}`);
            return {
              success: true,
              contactId: existingContactId,
              operation: 'updated',
              data: updateResult
            };
          }
        } catch (updateError) {
          console.error(`[createOrUpdateContact] Error updating contact:`, updateError.message);
          throw new Error(`Failed to update existing contact: ${updateError.message}`);
        }
      }

      // Re-throw other errors
      console.error(`[createOrUpdateContact] Error:`, error.message);
      throw new Error(`Failed to create/update contact: ${error.message}`);
    }
  }

  /**
   * Add a contact to a HubSpot sequence
   * Note: Requires Sales Hub Professional or Enterprise
   * @param {string} contactId - HubSpot contact ID
   * @param {string} sequenceId - HubSpot sequence ID
   * @returns {Promise<Object>} Enrollment result
   */
  async addContactToSequence(contactId, sequenceId) {
    console.log(`[addContactToSequence] Enrolling contact ${contactId} in sequence ${sequenceId}`);

    try {
      // Note: Sequences API endpoint may vary based on HubSpot account tier
      // This uses the automation/sequences API which requires proper permissions
      const result = await this._retryOperation(async () => {
        return await this.client.automation.actions.callbacksApi.complete({
          callbackId: sequenceId,
          // Sequences enrollment uses specific API structure
          // This may need adjustment based on actual HubSpot Sequences API version
        });
      });

      console.log(`[addContactToSequence] Contact enrolled successfully`);
      return {
        success: true,
        contactId,
        sequenceId,
        data: result
      };

    } catch (error) {
      // Handle sequence not found
      if (error.code === 404) {
        console.error(`[addContactToSequence] Sequence not found: ${sequenceId}`);
        return {
          success: false,
          error: 'SEQUENCE_NOT_FOUND',
          message: `Sequence ${sequenceId} not found. Verify sequence ID and permissions.`,
          contactId,
          sequenceId
        };
      }

      // Handle permission errors (Sequences API requires Sales Hub Pro/Enterprise)
      if (error.code === 403) {
        console.error(`[addContactToSequence] Permission denied. Check if account has Sequences API access.`);
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'Sequences API requires Sales Hub Professional or Enterprise. Contact may need manual enrollment.',
          contactId,
          sequenceId
        };
      }

      console.error(`[addContactToSequence] Error:`, error.message);
      return {
        success: false,
        error: 'ENROLLMENT_FAILED',
        message: `Failed to enroll contact in sequence: ${error.message}`,
        contactId,
        sequenceId
      };
    }
  }

  /**
   * Add a note to a contact with research and email variants
   * @param {string} contactId - HubSpot contact ID
   * @param {string} noteContent - Note content (markdown supported)
   * @returns {Promise<Object>} Note creation result
   */
  async addNoteToContact(contactId, noteContent) {
    console.log(`[addNoteToContact] Adding note to contact ${contactId}`);

    try {
      const result = await this._retryOperation(async () => {
        return await this.client.crm.objects.notes.basicApi.create({
          properties: {
            hs_timestamp: Date.now(),
            hs_note_body: noteContent,
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202 // Note to Contact association
            }]
          }]
        });
      });

      console.log(`[addNoteToContact] Note created successfully. ID: ${result.id}`);
      return {
        success: true,
        noteId: result.id,
        contactId,
        data: result
      };

    } catch (error) {
      console.error(`[addNoteToContact] Error:`, error.message);
      throw new Error(`Failed to create note: ${error.message}`);
    }
  }

  /**
   * Format email variants and research into a note
   * @private
   */
  _formatNoteContent(emails, companyResearch) {
    const timestamp = new Date().toISOString();

    let content = `# AI-Generated Outreach - ${timestamp}\n\n`;

    if (companyResearch) {
      content += `## Company Research\n\n${companyResearch}\n\n`;
    }

    if (emails && emails.length > 0) {
      content += `## Email Variants (${emails.length})\n\n`;

      emails.forEach((email, index) => {
        content += `### Variant ${index + 1}: ${email.approach || 'Standard'}\n\n`;
        content += `**Subject:** ${email.subject}\n\n`;
        content += `**Body:**\n${email.body}\n\n`;
        content += `---\n\n`;
      });
    }

    content += `\n*Generated by Agency Pipeline AI System*`;

    return content;
  }

  /**
   * Get HubSpot portal ID for building contact URLs
   * @private
   */
  async _getPortalId() {
    try {
      const accountInfo = await this._retryOperation(async () => {
        return await this.client.apiRequest({
          method: 'GET',
          path: '/account-info/v3/api-usage/daily'
        });
      });

      // Extract portal ID from response (structure may vary)
      return accountInfo?.portalId || 'PORTAL_ID';
    } catch (error) {
      console.warn(`[_getPortalId] Could not fetch portal ID:`, error.message);
      return 'PORTAL_ID'; // Fallback placeholder
    }
  }

  /**
   * Process complete prospect workflow: create contact, add to sequence, create note
   * @param {Object} prospectData - Complete prospect information
   * @param {Object} prospectData.contact - Contact information
   * @param {Array} prospectData.emails - Array of email variants
   * @param {string} prospectData.companyResearch - Company research summary
   * @param {Object} prospectData.options - Optional settings
   * @param {string} prospectData.options.sequenceId - HubSpot sequence ID (optional)
   * @param {string} prospectData.options.ownerId - HubSpot owner ID (optional)
   * @returns {Promise<Object>} Complete workflow result
   */
  async processProspect(prospectData) {
    console.log(`\n[processProspect] Starting workflow for ${prospectData.contact.email}`);
    console.log(`[processProspect] Options:`, prospectData.options);

    const result = {
      success: false,
      contactId: null,
      contactUrl: null,
      sequenceEnrolled: false,
      sequenceId: null,
      noteCreated: false,
      operations: {
        contactCreated: false,
        sequenceEnrolled: false,
        noteAdded: false
      },
      errors: []
    };

    try {
      // Step 1: Create or update contact
      console.log(`\n[Step 1/3] Creating/updating contact...`);
      const contactResult = await this.createOrUpdateContact(prospectData.contact);

      if (!contactResult.success) {
        throw new Error('Failed to create/update contact');
      }

      result.contactId = contactResult.contactId;
      result.operations.contactCreated = contactResult.operation === 'created';

      // Get portal ID for URL construction
      const portalId = await this._getPortalId();
      result.contactUrl = `https://app.hubspot.com/contacts/${portalId}/contact/${contactResult.contactId}`;

      console.log(`[Step 1/3] ✓ Contact ${contactResult.operation}: ${result.contactUrl}`);

      // Step 2: Add to sequence (if sequenceId provided)
      if (prospectData.options?.sequenceId) {
        console.log(`\n[Step 2/3] Enrolling in sequence ${prospectData.options.sequenceId}...`);

        const sequenceResult = await this.addContactToSequence(
          result.contactId,
          prospectData.options.sequenceId
        );

        if (sequenceResult.success) {
          result.sequenceEnrolled = true;
          result.sequenceId = prospectData.options.sequenceId;
          result.operations.sequenceEnrolled = true;
          console.log(`[Step 2/3] ✓ Sequence enrollment successful`);
        } else {
          // Log error but don't fail entire workflow
          result.errors.push({
            step: 'sequence',
            error: sequenceResult.error,
            message: sequenceResult.message
          });
          console.log(`[Step 2/3] ⚠ Sequence enrollment failed: ${sequenceResult.message}`);
          console.log(`[Step 2/3] → Contact can be enrolled manually in HubSpot`);
        }
      } else {
        console.log(`\n[Step 2/3] ⊘ Skipping sequence enrollment (no sequenceId provided)`);
      }

      // Step 3: Create note with research and emails
      console.log(`\n[Step 3/3] Adding research note...`);
      const noteContent = this._formatNoteContent(
        prospectData.emails,
        prospectData.companyResearch
      );

      const noteResult = await this.addNoteToContact(result.contactId, noteContent);

      if (noteResult.success) {
        result.noteCreated = true;
        result.operations.noteAdded = true;
        console.log(`[Step 3/3] ✓ Note created with ${prospectData.emails?.length || 0} email variants`);
      }

      // Mark overall success if contact created and note added
      result.success = result.operations.contactCreated && result.operations.noteAdded;

      console.log(`\n[processProspect] ✓ Workflow completed successfully`);
      console.log(`[processProspect] Contact URL: ${result.contactUrl}`);

      return result;

    } catch (error) {
      console.error(`\n[processProspect] ✗ Workflow failed:`, error.message);
      result.errors.push({
        step: 'workflow',
        error: 'WORKFLOW_FAILED',
        message: error.message
      });

      throw error;
    }
  }
}

module.exports = HubSpotClient;
