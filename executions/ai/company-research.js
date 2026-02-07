/**
 * AI-Powered Company Research Module
 *
 * Uses OpenAI ChatGPT to generate comprehensive company research summaries
 * from basic company data for agency prospecting and sales intelligence.
 *
 * @module company-research
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
        'Set it before calling generateCompanyResearch().'
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
 * Construct ChatGPT prompt for company research
 * @param {Object} companyData - Company information
 * @returns {string} Formatted prompt
 */
function buildResearchPrompt(companyData) {
  const {
    companyName,
    website,
    industry,
    location,
    employeeCount,
    linkedIn,
  } = companyData;

  return `Generate a concise company research summary for prospecting purposes.

Company Information:
- Name: ${companyName}
- Website: ${website}
- Industry: ${industry || 'Unknown'}
${location ? `- Location: ${location}` : ''}
${employeeCount ? `- Employee Count: ${employeeCount}` : ''}
${linkedIn ? `- LinkedIn: ${linkedIn}` : ''}

Please provide a 150-250 word summary that includes:
1. What the company does (1-2 sentences)
2. Target market and customers
3. Key differentiators or main services
4. Relevant pain points or challenges they likely face (for prospecting context)

Format the response as a professional research summary suitable for sales intelligence.`;
}

/**
 * Validate company data input
 * @param {Object} companyData - Company information to validate
 * @throws {Error} If required fields are missing or invalid
 */
function validateCompanyData(companyData) {
  if (!companyData || typeof companyData !== 'object') {
    throw new Error('Company data must be a valid object');
  }

  if (!companyData.companyName || typeof companyData.companyName !== 'string') {
    throw new Error('Company name is required and must be a string');
  }

  if (!companyData.website || typeof companyData.website !== 'string') {
    throw new Error('Website URL is required and must be a string');
  }

  // Basic URL validation
  try {
    new URL(companyData.website);
  } catch (error) {
    throw new Error('Website must be a valid URL');
  }
}

/**
 * Validate OpenAI API response
 * @param {string} content - Response content to validate
 * @returns {boolean} True if valid
 */
function isValidResponse(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmedContent = content.trim();

  // Check minimum length (150 words ≈ 750 characters)
  if (trimmedContent.length < 100) {
    return false;
  }

  // Check if response looks like an error message
  const errorPatterns = [
    /^error:/i,
    /^i cannot/i,
    /^i'm unable/i,
    /^sorry/i,
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(trimmedContent)) {
      return false;
    }
  }

  return true;
}

/**
 * Generate fallback summary when API fails
 * @param {Object} companyData - Company information
 * @returns {string} Basic summary
 */
function generateFallbackSummary(companyData) {
  const { companyName, website, industry, location } = companyData;

  return `${companyName} is a ${industry || 'company'} ${location ? `based in ${location}` : 'organization'} (${website}). ` +
    `As a ${industry || 'business'} entity, they likely serve clients in their sector with specialized services and solutions. ` +
    `Further research recommended to understand their specific offerings, target market, and competitive positioning. ` +
    `Key prospecting areas may include digital transformation, operational efficiency, and industry-specific challenges.`;
}

/**
 * Call OpenAI API with retry logic
 * @param {string} prompt - Research prompt
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {Promise<string>} Research summary
 */
async function callOpenAI(prompt, attempt = 0) {
  try {
    // Get OpenAI client (lazy initialization)
    const client = getOpenAIClient();

    // Enforce rate limiting before API call
    await enforceRateLimit();

    const startTime = Date.now();
    console.log(`[OpenAI API] Attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts}...`);

    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use GPT-4 for better research quality
      messages: [
        {
          role: 'system',
          content: 'You are a business research analyst specializing in company intelligence for B2B sales prospecting. Provide accurate, concise, and actionable company summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content;

    // Log API usage for cost tracking
    console.log(`[OpenAI API] Success in ${duration}ms | Tokens: ${completion.usage.total_tokens} | Model: ${completion.model}`);

    // Validate response
    if (!isValidResponse(content)) {
      throw new Error('Invalid or empty response from OpenAI API');
    }

    return content.trim();

  } catch (error) {
    console.error(`[OpenAI API] Error on attempt ${attempt + 1}:`, error.message);

    // Check if we should retry
    if (attempt < RETRY_CONFIG.maxAttempts - 1) {
      const delay = getBackoffDelay(attempt);
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await sleep(delay);
      return callOpenAI(prompt, attempt + 1);
    }

    // All retries exhausted
    throw error;
  }
}

/**
 * Generate AI-powered company research summary
 *
 * @param {Object} companyData - Company information object
 * @param {string} companyData.companyName - Name of the company
 * @param {string} companyData.website - Company website URL
 * @param {string} [companyData.industry] - Industry or vertical
 * @param {string} [companyData.location] - Company location
 * @param {number} [companyData.employeeCount] - Number of employees
 * @param {string} [companyData.linkedIn] - LinkedIn profile URL
 *
 * @returns {Promise<string>} Research summary (150-250 words)
 *
 * @throws {Error} If required fields are missing or API fails after retries
 *
 * @example
 * const research = await generateCompanyResearch({
 *   companyName: "ABC Insurance Agency",
 *   website: "https://abcinsurance.com",
 *   industry: "Commercial Insurance",
 *   location: "Austin, TX",
 *   employeeCount: 25
 * });
 */
async function generateCompanyResearch(companyData) {
  try {
    // Validate input
    validateCompanyData(companyData);

    console.log(`\n[Company Research] Starting research for: ${companyData.companyName}`);

    // Build prompt
    const prompt = buildResearchPrompt(companyData);

    // Call OpenAI with retry logic
    const research = await callOpenAI(prompt);

    console.log(`[Company Research] ✓ Research completed successfully\n`);
    return research;

  } catch (error) {
    console.error(`[Company Research] ✗ Failed after all retries:`, error.message);

    // Return fallback summary instead of throwing error
    console.log(`[Company Research] Using fallback summary...`);
    const fallback = generateFallbackSummary(companyData);

    return fallback;
  }
}

// Export the main function
module.exports = {
  generateCompanyResearch,
};
