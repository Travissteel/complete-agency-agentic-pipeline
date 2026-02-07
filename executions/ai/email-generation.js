/**
 * AI-Powered Email Generation Module
 *
 * Uses OpenAI ChatGPT to generate 3 personalized outreach email variants
 * per contact using company research and contact data. Each email uses a
 * different approach to maximize response rates.
 *
 * @module email-generation
 */

const OpenAI = require('openai');

// OpenAI client (lazy initialization)
let openai = null;

/**
 * Get or initialize OpenAI client
 * @returns {OpenAI} OpenAI client instance
 * @throws {Error} If API key is not set
 */
function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY environment variable is required. ' +
        'Set it before calling generateOutreachEmails().'
      );
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  requestTimestamps: [],
};

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function getBackoffDelay(attempt) {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check and enforce rate limiting
 * @returns {Promise<void>}
 */
async function enforceRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove timestamps older than 1 minute
  RATE_LIMIT.requestTimestamps = RATE_LIMIT.requestTimestamps.filter(
    timestamp => timestamp > oneMinuteAgo
  );

  // If at rate limit, wait until oldest request expires
  if (RATE_LIMIT.requestTimestamps.length >= RATE_LIMIT.maxRequestsPerMinute) {
    const oldestTimestamp = RATE_LIMIT.requestTimestamps[0];
    const waitTime = oldestTimestamp + 60000 - now;

    if (waitTime > 0) {
      console.log(`[Rate Limit] Waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
      await sleep(waitTime);
    }
  }

  // Record this request
  RATE_LIMIT.requestTimestamps.push(Date.now());
}

/**
 * Build ChatGPT prompt for a specific email variant
 * @param {Object} contact - Contact information
 * @param {string} companyResearch - Company research summary
 * @param {string} approach - Email approach type
 * @returns {string} Formatted prompt
 */
function buildEmailPrompt(contact, companyResearch, approach) {
  const { firstName, lastName, jobTitle, companyName, industry, location } = contact;

  const approachInstructions = {
    'problem-solution': `Use a problem/solution approach:
- Start by identifying a specific challenge their company likely faces
- Reference insights from the company research
- Present your solution as the answer to that problem
- Be direct and value-focused`,

    'social-proof': `Use a social proof/case study approach:
- Open with a brief success story or statistic from similar clients
- Make it relevant to their industry or situation
- Show credibility through specific results
- Connect the dots to how they could benefit`,

    'question': `Use a question/curiosity approach:
- Start with a thought-provoking question about their business
- Reference something specific from the company research
- Create curiosity about your solution
- Make them want to reply to learn more`
  };

  return `Generate a personalized outreach email for the following prospect:

Contact Information:
- Name: ${firstName} ${lastName}
- Job Title: ${jobTitle}
- Company: ${companyName}
- Industry: ${industry}
- Location: ${location}

Company Research:
${companyResearch}

Email Requirements:
- Length: 100-150 words (body only, excluding subject line)
- Tone: Professional but conversational, helpful not salesy
- ${approachInstructions[approach]}
- Include a specific call-to-action (15-minute call, quick question, etc.)
- Reference specific details from the company research to show you did homework
- Address ${firstName} by first name

Format your response as JSON with this exact structure:
{
  "subject": "Your subject line here (under 60 characters)",
  "body": "Your email body here (100-150 words)"
}

Important: Return ONLY valid JSON, no additional text or markdown formatting.`;
}

/**
 * Validate contact data input
 * @param {Object} contact - Contact information to validate
 * @throws {Error} If required fields are missing or invalid
 */
function validateContactData(contact) {
  if (!contact || typeof contact !== 'object') {
    throw new Error('Contact data must be a valid object');
  }

  const requiredFields = ['firstName', 'lastName', 'jobTitle', 'companyName'];
  for (const field of requiredFields) {
    if (!contact[field] || typeof contact[field] !== 'string') {
      throw new Error(`Contact ${field} is required and must be a string`);
    }
  }
}

/**
 * Validate company research input
 * @param {string} companyResearch - Company research summary
 * @throws {Error} If research is missing or invalid
 */
function validateCompanyResearch(companyResearch) {
  if (!companyResearch || typeof companyResearch !== 'string') {
    throw new Error('Company research must be a valid string');
  }

  if (companyResearch.trim().length < 50) {
    throw new Error('Company research is too short (minimum 50 characters)');
  }
}

/**
 * Validate email response from OpenAI
 * @param {Object} email - Email object to validate
 * @param {string} approach - Expected approach type
 * @returns {boolean} True if valid
 */
function isValidEmail(email, approach) {
  if (!email || typeof email !== 'object') {
    return false;
  }

  // Check required fields
  if (!email.subject || !email.body) {
    return false;
  }

  if (typeof email.subject !== 'string' || typeof email.body !== 'string') {
    return false;
  }

  // Check subject line length (should be under 60 characters)
  if (email.subject.length < 5 || email.subject.length > 70) {
    return false;
  }

  // Check body word count (100-150 words)
  const wordCount = email.body.trim().split(/\s+/).length;
  if (wordCount < 80 || wordCount > 180) {
    console.log(`[Validation] Email body has ${wordCount} words (expected 100-150)`);
    return false;
  }

  // Check for error patterns in response
  const errorPatterns = [
    /^error:/i,
    /^i cannot/i,
    /^i'm unable/i,
    /^sorry/i,
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(email.body)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate fallback email template when API fails
 * @param {Object} contact - Contact information
 * @param {string} companyResearch - Company research summary
 * @param {string} approach - Email approach type
 * @returns {Object} Email object with subject and body
 */
function generateFallbackEmail(contact, companyResearch, approach) {
  const { firstName, companyName } = contact;

  // Extract a snippet from research (first 100 characters)
  const researchSnippet = companyResearch.substring(0, 100).split('.')[0];

  const templates = {
    'problem-solution': {
      subject: `Quick idea for ${companyName}`,
      body: `Hi ${firstName},

I was researching ${companyName} and noticed ${researchSnippet}.

Many companies in your space struggle with scaling their client acquisition efficiently. We've helped similar agencies streamline their prospecting process and increase qualified leads by 40%.

Would you be open to a quick 15-minute call to explore if this could work for ${companyName}?

Best regards`
    },
    'social-proof': {
      subject: `How we helped 3 agencies like ${companyName}`,
      body: `Hi ${firstName},

We recently helped three agencies similar to ${companyName} increase their pipeline by 40% through automated prospecting.

I noticed ${researchSnippet}, which suggests you might benefit from a similar approach.

Would you be interested in a brief call to see if this could work for your team?

Best regards`
    },
    'question': {
      subject: `Question about ${companyName}'s growth strategy`,
      body: `Hi ${firstName},

I was researching ${companyName} and had a quick question about your client acquisition strategy.

${researchSnippet}—this made me curious about how you're currently handling prospecting at scale.

Would you have 15 minutes for a quick conversation? I'd love to share what's working for similar agencies.

Best regards`
    }
  };

  return templates[approach];
}

/**
 * Call OpenAI API to generate a single email variant
 * @param {string} prompt - Email generation prompt
 * @param {string} approach - Email approach type
 * @param {Object} contact - Contact data (for fallback)
 * @param {string} companyResearch - Company research (for fallback)
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {Promise<Object>} Email object with subject and body
 */
async function callOpenAIForEmail(prompt, approach, contact, companyResearch, attempt = 0) {
  try {
    // Get OpenAI client (lazy initialization)
    const client = getOpenAIClient();

    // Enforce rate limiting before API call
    await enforceRateLimit();

    const startTime = Date.now();
    console.log(`[OpenAI API] Generating ${approach} email - Attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts}...`);

    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use GPT-4 for better personalization
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B sales copywriter specializing in personalized cold email outreach. Write compelling, research-backed emails that get replies. Always return valid JSON format with subject and body fields.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher temperature for more creative variations
      max_tokens: 400,
      response_format: { type: 'json_object' }, // Enforce JSON response
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content;

    // Log API usage for cost tracking
    console.log(`[OpenAI API] Success in ${duration}ms | Tokens: ${completion.usage.total_tokens} | Model: ${completion.model}`);

    // Parse JSON response
    let emailData;
    try {
      emailData = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }

    // Validate email structure
    if (!isValidEmail(emailData, approach)) {
      throw new Error('Invalid email structure or content from OpenAI API');
    }

    return {
      subject: emailData.subject.trim(),
      body: emailData.body.trim(),
      approach: approach,
    };

  } catch (error) {
    console.error(`[OpenAI API] Error on attempt ${attempt + 1}:`, error.message);

    // Check if we should retry
    if (attempt < RETRY_CONFIG.maxAttempts - 1) {
      const delay = getBackoffDelay(attempt);
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await sleep(delay);
      return callOpenAIForEmail(prompt, approach, contact, companyResearch, attempt + 1);
    }

    // All retries exhausted - use fallback
    console.log(`[Fallback] Using template-based email for ${approach} approach`);
    const fallbackEmail = generateFallbackEmail(contact, companyResearch, approach);
    return {
      ...fallbackEmail,
      approach: approach,
    };
  }
}

/**
 * Generate 3 personalized outreach email variants
 *
 * @param {Object} contact - Contact information object
 * @param {string} contact.firstName - Contact's first name
 * @param {string} contact.lastName - Contact's last name
 * @param {string} contact.jobTitle - Contact's job title
 * @param {string} contact.companyName - Contact's company name
 * @param {string} [contact.industry] - Contact's industry
 * @param {string} [contact.location] - Contact's location
 * @param {string} companyResearch - Company research summary from company-research.js
 *
 * @returns {Promise<Object>} Object containing 3 email variants and metadata
 *
 * @throws {Error} If required fields are missing or validation fails
 *
 * @example
 * const result = await generateOutreachEmails(
 *   {
 *     firstName: "John",
 *     lastName: "Doe",
 *     jobTitle: "CEO",
 *     companyName: "ABC Insurance Agency",
 *     industry: "Commercial Insurance",
 *     location: "Austin, TX"
 *   },
 *   "ABC Insurance Agency is a commercial insurance broker..."
 * );
 *
 * console.log(result.emails[0].subject);
 * console.log(result.emails[0].body);
 */
async function generateOutreachEmails(contact, companyResearch) {
  try {
    // Validate inputs
    validateContactData(contact);
    validateCompanyResearch(companyResearch);

    console.log(`\n[Email Generation] Starting email generation for: ${contact.firstName} ${contact.lastName}`);

    // Define the 3 email approaches
    const approaches = ['problem-solution', 'social-proof', 'question'];

    // Generate prompts for all 3 approaches
    const prompts = approaches.map(approach => ({
      approach,
      prompt: buildEmailPrompt(contact, companyResearch, approach),
    }));

    // Generate all 3 emails in parallel (but still respecting rate limits)
    const emails = [];
    for (const { approach, prompt } of prompts) {
      const email = await callOpenAIForEmail(
        prompt,
        approach,
        contact,
        companyResearch
      );
      emails.push(email);
    }

    // Validate we have all 3 emails
    if (emails.length !== 3) {
      throw new Error(`Expected 3 emails but got ${emails.length}`);
    }

    console.log(`[Email Generation] ✓ Successfully generated ${emails.length} email variants\n`);

    // Return structured result
    return {
      emails: emails,
      metadata: {
        contactName: `${contact.firstName} ${contact.lastName}`,
        companyName: contact.companyName,
        generatedAt: new Date().toISOString(),
        approachesUsed: approaches,
      },
    };

  } catch (error) {
    console.error(`[Email Generation] ✗ Failed:`, error.message);
    throw error;
  }
}

// Export the main function
module.exports = {
  generateOutreachEmails,
};
