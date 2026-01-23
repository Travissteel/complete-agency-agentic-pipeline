/**
 * Email Template Generator
 *
 * Professional email templates for cold outreach across target verticals.
 * Includes personalization, A/B testing variants, and 3-step sequences.
 *
 * @version 1.0.0
 * @requires none (standalone utility)
 *
 * Verticals: Commercial Insurance, Commercial Real Estate, Recruitment Firms
 */

// ============================================================================
// PERSONALIZATION ENGINE
// ============================================================================

/**
 * Replace personalization variables in email template
 *
 * @param {string} template - Email template with {{variables}}
 * @param {Object} lead - Lead data object
 * @returns {string} Personalized email content
 */
function personalize(template, lead) {
    let personalized = template;

    // Core personalization variables
    const variables = {
        firstName: lead.firstName || lead['First Name'] || '',
        lastName: lead.lastName || lead['Last Name'] || '',
        companyName: lead.companyName || lead.Company || lead.name || '',
        industry: lead.industry || lead.Industry || lead.vertical || '',
        location: lead.location || lead.Location || lead.standardizedLocation || '',
        companySize: lead.companySize || lead['Company Size'] || lead.companySizeRange || '',
        jobTitle: lead.jobTitle || lead['Job Title'] || lead.customField1 || '',
        website: lead.website || lead.Website || '',
        phone: lead.phone || lead.Phone || '',
        qualityScore: lead.qualityScore || lead['Quality Score'] || 0
    };

    // Replace all variables
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        personalized = personalized.replace(regex, value);
    }

    // Clean up any remaining unreplaced variables
    personalized = personalized.replace(/\{\{[^}]+\}\}/g, '');

    return personalized;
}

// ============================================================================
// COMMERCIAL INSURANCE VERTICAL
// ============================================================================

const insuranceTemplates = {
    subjectLines: [
        "Quick question about {{companyName}}'s insurance strategy",
        "Risk assessment for {{companyName}}",
        "{{firstName}}, thought of you",
        "Reducing insurance costs at {{companyName}}",
        "{{companyName}} - commercial policy review"
    ],

    email1: {
        subject: "Quick question about {{companyName}}'s insurance strategy",
        body: `Hi {{firstName}},

I noticed {{companyName}} is in {{industry}} — I'm reaching out because we help companies like yours reduce insurance costs by 15-30% while improving coverage.

We recently worked with a similar company to streamline their commercial policy and they saved $87K annually.

Would you be open to a quick 15-minute call to see if we could do something similar for {{companyName}}?

Best,
[Your Name]

P.S. No pressure if now isn't the right time. Happy to send over a quick audit checklist you can use internally.`
    },

    email2: {
        subject: "Re: {{companyName}}'s insurance strategy",
        body: `{{firstName}},

Following up on my last note about insurance optimization for {{companyName}}.

Quick case study: We helped a {{companySize}} {{industry}} company renegotiate their GL policy and cut premiums by 22% — same coverage, better pricing.

Want to explore what's possible? [Book 15 mins here]

Thanks,
[Your Name]`
    },

    email3: {
        subject: "Re: {{companyName}}'s insurance strategy",
        body: `{{firstName}},

I know you're busy, so I'll make this quick.

Should I close {{companyName}}'s file, or is insurance cost optimization still on your radar for 2026?

Just let me know and I'll follow up accordingly.

Best,
[Your Name]`
    },

    email4_nurture: {
        subject: "Insurance cost reduction checklist",
        body: `{{firstName}},

I know we haven't connected yet, but I wanted to share a quick resource that might be helpful for {{companyName}}.

Here's a 5-point checklist we use with {{industry}} companies to identify potential insurance savings:

1. Policy overlap analysis (are you double-covered anywhere?)
2. Claims history review (are you in the right risk tier?)
3. Coverage gap assessment (any exposures you're missing?)
4. Premium benchmark comparison (are you overpaying vs. peers?)
5. Multi-year rate lock opportunities (2026 rates may increase)

No strings attached — just thought it might be useful. If you want to discuss your specific situation, I'm happy to jump on a quick call.

Best,
[Your Name]`
    }
};

// ============================================================================
// COMMERCIAL REAL ESTATE VERTICAL
// ============================================================================

const realEstateTemplates = {
    subjectLines: [
        "Tenant screening automation for {{companyName}}",
        "{{firstName}} — reducing vacancy time by 40%",
        "Property management question",
        "Filling units faster at {{companyName}}",
        "{{companyName}} - tenant qualification system"
    ],

    email1: {
        subject: "Tenant screening automation for {{companyName}}",
        body: `Hi {{firstName}},

I saw {{companyName}} manages properties in {{location}} — we help CRE firms like yours cut vacancy time by 30-40% using AI-powered tenant screening and lead routing.

One of our clients (similar portfolio size to yours) filled 12 units in 3 weeks using our system vs. their usual 8-week average.

Would you be interested in seeing how this could work for {{companyName}}?

Best,
[Your Name]

P.S. No sales pitch — I can walk you through the system in 15 minutes and you can decide if it's a fit.`
    },

    email2: {
        subject: "Re: Tenant screening for {{companyName}}",
        body: `{{firstName}},

Quick follow-up on tenant screening automation for {{companyName}}.

Here's what our CRE clients love:
- Auto-qualify leads from Zillow, Apartments.com, etc.
- AI screening calls (so you don't waste time on unqualified renters)
- Instant application routing to your system

Want a 15-min demo? [Calendar link]

Thanks,
[Your Name]`
    },

    email3: {
        subject: "Re: Tenant screening for {{companyName}}",
        body: `{{firstName}},

Last note from me — just want to make sure this didn't get buried.

Is tenant screening/vacancy reduction still something {{companyName}} is looking to improve this quarter?

If not, no worries. If yes, let's find 15 minutes to chat.

Best,
[Your Name]`
    },

    email4_nurture: {
        subject: "2026 tenant screening best practices",
        body: `{{firstName}},

I wanted to share something we've been seeing across CRE firms in {{location}} this year.

The average vacancy time for mid-tier properties has increased from 45 to 67 days in 2025 — largely due to slower tenant qualification processes.

Here's what the fastest-filling properties are doing differently:

1. Auto-response to inquiries (within 2 minutes, not 2 hours)
2. Pre-screening via SMS/chat before showing (saves site visit time)
3. Digital applications with instant credit/background checks
4. AI-powered phone qualification (handles 80% of initial questions)

We've helped {{companySize}} property managers implement this exact stack and saw vacancy time drop by an average of 38%.

If you're interested in learning more about how this could work for {{companyName}}, let me know and we can set up a quick call.

No pressure — just thought this might be timely given market conditions.

Best,
[Your Name]`
    }
};

// ============================================================================
// RECRUITMENT FIRMS VERTICAL
// ============================================================================

const recruitmentTemplates = {
    subjectLines: [
        "Candidate sourcing automation for {{companyName}}",
        "{{firstName}} — filling reqs 50% faster",
        "Quick question about your recruiting stack",
        "Scaling placements at {{companyName}}",
        "{{companyName}} - recruiting automation"
    ],

    email1: {
        subject: "Candidate sourcing automation for {{companyName}}",
        body: `Hi {{firstName}},

I noticed {{companyName}} specializes in {{industry}} recruiting — we help firms like yours fill reqs 40-50% faster by automating candidate sourcing and initial screening.

One recruiter we work with went from 15 hours/week on manual LinkedIn outreach to fully automated multi-channel sequences (LinkedIn + email + SMS).

Would you be open to seeing how this could scale {{companyName}}'s placements?

Best,
[Your Name]

P.S. We integrate with any ATS (Bullhorn, Jobvite, Greenhouse, etc.) so there's no tech disruption.`
    },

    email2: {
        subject: "Re: Recruiting automation for {{companyName}}",
        body: `{{firstName}},

Following up about candidate sourcing automation for {{companyName}}.

What our recruiting clients get:
- Auto-scrape LinkedIn for ideal candidates
- Multi-touch sequences (email + SMS + InMail)
- Pre-screening AI calls to qualify interest
- CRM sync so everything flows to your ATS

Interested in a quick walkthrough? [Book here]

Thanks,
[Your Name]`
    },

    email3: {
        subject: "Re: Recruiting automation for {{companyName}}",
        body: `{{firstName}},

I'll keep this short — is recruiting automation still on {{companyName}}'s roadmap for Q1?

If yes, let's connect for 15 mins. If not, I'll stop bothering you. 😊

Either way, appreciate your time.

Best,
[Your Name]`
    },

    email4_nurture: {
        subject: "Recruiting automation ROI calculator",
        body: `{{firstName}},

Quick thought experiment for {{companyName}}:

If one of your recruiters spends 15 hours/week on candidate sourcing, that's ~60 hours/month.

At a $75K salary (conservative), that sourcing time costs roughly $2,700/month in labor.

Now imagine automating 80% of that sourcing work:
- LinkedIn scraping runs overnight
- Multi-channel outreach sequences run automatically
- AI pre-screens candidates before they hit your desk
- Only qualified, interested candidates make it to your recruiters

Time saved: ~48 hours/month
Cost saved: ~$2,160/month
Actual value: Recruiters focus on closing placements (not sourcing)

We've helped {{companySize}} recruiting firms implement this exact system. Average time-to-fill drops by 42%, and placement volume increases by 30%+ in the first quarter.

If you'd like to see how the numbers would work for {{companyName}}, I'm happy to build you a custom ROI model. No commitment required.

Interested?

Best,
[Your Name]`
    }
};

// ============================================================================
// TEMPLATE GENERATOR FUNCTIONS
// ============================================================================

/**
 * Get email sequence for a specific vertical
 *
 * @param {string} vertical - 'insurance', 'real-estate', or 'recruitment'
 * @param {Object} lead - Lead data for personalization
 * @param {Object} options - Template options
 * @returns {Array<Object>} Array of email objects for sequence
 */
function getEmailSequence(vertical, lead, options = {}) {
    const {
        includeNurture = false,
        subjectVariant = 0, // Which subject line variant to use
        yourName = '[Your Name]',
        calendarLink = '[Calendar link]'
    } = options;

    // Select template set based on vertical
    let templates;
    switch (vertical.toLowerCase()) {
        case 'insurance':
        case 'commercial-insurance':
            templates = insuranceTemplates;
            break;
        case 'real-estate':
        case 'commercial-real-estate':
            templates = realEstateTemplates;
            break;
        case 'recruitment':
        case 'recruitment-firms':
            templates = recruitmentTemplates;
            break;
        default:
            throw new Error(`Unknown vertical: ${vertical}. Must be 'insurance', 'real-estate', or 'recruitment'`);
    }

    const sequence = [];

    // Email 1: Initial outreach
    sequence.push({
        step: 1,
        delay: 0, // Send immediately
        subject: personalize(templates.email1.subject, lead),
        body: personalize(templates.email1.body, lead)
            .replace('[Your Name]', yourName)
            .replace('[Calendar link]', calendarLink)
    });

    // Email 2: Value follow-up (Day 3)
    sequence.push({
        step: 2,
        delay: 3, // Days after previous email
        subject: personalize(templates.email2.subject, lead),
        body: personalize(templates.email2.body, lead)
            .replace('[Your Name]', yourName)
            .replace('[Calendar link]', calendarLink)
    });

    // Email 3: Breakup email (Day 7)
    sequence.push({
        step: 3,
        delay: 7, // Days after Email 1
        subject: personalize(templates.email3.subject, lead),
        body: personalize(templates.email3.body, lead)
            .replace('[Your Name]', yourName)
    });

    // Email 4: Long-term nurture (Day 14) - optional, for high-quality leads
    if (includeNurture || (lead.qualityScore && lead.qualityScore >= 80)) {
        sequence.push({
            step: 4,
            delay: 14, // Days after Email 1
            subject: personalize(templates.email4_nurture.subject, lead),
            body: personalize(templates.email4_nurture.body, lead)
                .replace('[Your Name]', yourName)
        });
    }

    return sequence;
}

/**
 * Get subject line variants for A/B testing
 *
 * @param {string} vertical - 'insurance', 'real-estate', or 'recruitment'
 * @param {Object} lead - Lead data for personalization
 * @returns {Array<string>} Array of subject line variants
 */
function getSubjectLineVariants(vertical, lead) {
    let templates;
    switch (vertical.toLowerCase()) {
        case 'insurance':
        case 'commercial-insurance':
            templates = insuranceTemplates;
            break;
        case 'real-estate':
        case 'commercial-real-estate':
            templates = realEstateTemplates;
            break;
        case 'recruitment':
        case 'recruitment-firms':
            templates = recruitmentTemplates;
            break;
        default:
            throw new Error(`Unknown vertical: ${vertical}`);
    }

    return templates.subjectLines.map(subject => personalize(subject, lead));
}

/**
 * Generate personalized email from template
 *
 * @param {string} vertical - Target vertical
 * @param {number} emailNumber - Email step (1-4)
 * @param {Object} lead - Lead data
 * @param {Object} options - Template options
 * @returns {Object} Personalized email object
 */
function generateEmail(vertical, emailNumber, lead, options = {}) {
    const sequence = getEmailSequence(vertical, lead, options);

    if (emailNumber < 1 || emailNumber > sequence.length) {
        throw new Error(`Email number must be between 1 and ${sequence.length}`);
    }

    return sequence[emailNumber - 1];
}

// ============================================================================
// DYNAMIC CONTENT HELPERS
// ============================================================================

/**
 * Add conditional content based on lead attributes
 *
 * @param {string} baseTemplate - Base email template
 * @param {Object} lead - Lead data
 * @returns {string} Enhanced template with conditional content
 */
function addConditionalContent(baseTemplate, lead) {
    let enhanced = baseTemplate;

    // Premium CTA for high-quality leads
    if (lead.qualityScore && lead.qualityScore >= 80) {
        enhanced = enhanced.replace(
            '[Book 15 mins here]',
            '[Book a VIP consultation here]'
        );
    }

    // Emphasize cost savings for small companies
    if (lead.companySize && lead.companySize.includes('10-50')) {
        enhanced = enhanced.replace(
            'reduce insurance costs by 15-30%',
            'reduce insurance costs by 15-30% (especially critical for growing companies)'
        );
    }

    // Emphasize scalability for large companies
    if (lead.companySize && (lead.companySize.includes('200+') || lead.companySize.includes('500+'))) {
        enhanced = enhanced.replace(
            'reduce insurance costs',
            'reduce insurance costs at scale'
        );
    }

    return enhanced;
}

/**
 * Get optimal sending time based on industry and location
 *
 * @param {Object} lead - Lead data
 * @returns {Object} Recommended sending schedule
 */
function getOptimalSendingTime(lead) {
    // Default: 9-11 AM local time (highest open rates)
    const defaultSchedule = {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeWindow: '09:00-11:00',
        timezone: 'recipient' // Use recipient's timezone
    };

    // Industry-specific optimizations
    if (lead.industry && lead.industry.includes('real-estate')) {
        // Real estate professionals check email later in morning
        defaultSchedule.timeWindow = '10:00-12:00';
    }

    if (lead.industry && lead.industry.includes('recruitment')) {
        // Recruiters are most active early morning
        defaultSchedule.timeWindow = '08:00-10:00';
    }

    return defaultSchedule;
}

// ============================================================================
// VALIDATION & QUALITY CHECKS
// ============================================================================

/**
 * Validate email template before sending
 *
 * @param {Object} email - Email object with subject and body
 * @returns {Object} Validation result
 */
function validateEmail(email) {
    const issues = [];

    // Check for unreplaced merge tags
    const unmergedTags = email.body.match(/\{\{[^}]+\}\}/g);
    if (unmergedTags) {
        issues.push(`Unreplaced merge tags: ${unmergedTags.join(', ')}`);
    }

    // Check email length (too long reduces reply rate)
    const wordCount = email.body.split(/\s+/).length;
    if (wordCount > 200) {
        issues.push(`Email body is ${wordCount} words (recommended: <150 words)`);
    }

    // Check for spam trigger words
    const spamWords = ['free', 'guaranteed', 'act now', 'limited time', '100%', 'risk-free'];
    const foundSpamWords = spamWords.filter(word =>
        email.body.toLowerCase().includes(word) || email.subject.toLowerCase().includes(word)
    );
    if (foundSpamWords.length > 0) {
        issues.push(`Potential spam words detected: ${foundSpamWords.join(', ')}`);
    }

    // Check for ALL CAPS in subject (spam filter trigger)
    if (email.subject === email.subject.toUpperCase() && email.subject.length > 5) {
        issues.push('Subject line is all caps (spam filter risk)');
    }

    // Check for placeholder text
    if (email.body.includes('[Your Name]') || email.body.includes('[Calendar link]')) {
        issues.push('Placeholder text not replaced ([Your Name] or [Calendar link])');
    }

    return {
        isValid: issues.length === 0,
        issues: issues,
        warnings: issues.length > 0 ? issues : ['Email passed validation']
    };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Generate email sequences for multiple leads
 *
 * @param {string} vertical - Target vertical
 * @param {Array<Object>} leads - Array of lead objects
 * @param {Object} options - Template options
 * @returns {Array<Object>} Array of lead-email-sequence pairs
 */
function generateBulkSequences(vertical, leads, options = {}) {
    const results = [];

    for (const lead of leads) {
        try {
            const sequence = getEmailSequence(vertical, lead, options);

            results.push({
                leadEmail: lead.email || lead.Email,
                leadName: `${lead.firstName || lead['First Name'] || ''} ${lead.lastName || lead['Last Name'] || ''}`.trim(),
                companyName: lead.companyName || lead.Company || '',
                sequence: sequence,
                status: 'ready'
            });
        } catch (error) {
            results.push({
                leadEmail: lead.email || lead.Email,
                leadName: `${lead.firstName || lead['First Name'] || ''} ${lead.lastName || lead['Last Name'] || ''}`.trim(),
                companyName: lead.companyName || lead.Company || '',
                sequence: null,
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Template generators
    getEmailSequence,
    getSubjectLineVariants,
    generateEmail,

    // Personalization
    personalize,
    addConditionalContent,

    // Optimization
    getOptimalSendingTime,

    // Validation
    validateEmail,

    // Bulk operations
    generateBulkSequences,

    // Direct access to template sets (for custom usage)
    insuranceTemplates,
    realEstateTemplates,
    recruitmentTemplates
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Generate full email sequence for a lead
 *
 * const { getEmailSequence } = require('./email-templates');
 *
 * const lead = {
 *   firstName: 'John',
 *   lastName: 'Smith',
 *   companyName: 'ABC Insurance Corp',
 *   industry: 'commercial-insurance',
 *   location: 'Chicago, IL',
 *   qualityScore: 85
 * };
 *
 * const sequence = getEmailSequence('insurance', lead, {
 *   yourName: 'Sarah Johnson',
 *   calendarLink: 'https://calendly.com/sarah/15min',
 *   includeNurture: true
 * });
 *
 * console.log(sequence);
 * // Returns array of 4 email objects with subject, body, delay
 */

/**
 * Example 2: Get subject line variants for A/B testing
 *
 * const { getSubjectLineVariants } = require('./email-templates');
 *
 * const lead = {
 *   firstName: 'Jane',
 *   companyName: 'XYZ Properties'
 * };
 *
 * const variants = getSubjectLineVariants('real-estate', lead);
 * console.log(variants);
 * // Returns 5 personalized subject line variants
 */

/**
 * Example 3: Validate email before sending
 *
 * const { generateEmail, validateEmail } = require('./email-templates');
 *
 * const email = generateEmail('recruitment', 1, lead, {
 *   yourName: 'Mike Chen',
 *   calendarLink: 'https://calendly.com/mike/demo'
 * });
 *
 * const validation = validateEmail(email);
 * if (!validation.isValid) {
 *   console.error('Email validation failed:', validation.issues);
 * } else {
 *   // Send email
 * }
 */

/**
 * Example 4: Generate sequences for 100 leads
 *
 * const { generateBulkSequences } = require('./email-templates');
 *
 * const leads = [...]; // Array of 100 lead objects
 *
 * const sequences = generateBulkSequences('insurance', leads, {
 *   yourName: 'Sarah Johnson',
 *   calendarLink: 'https://calendly.com/sarah/15min'
 * });
 *
 * const successCount = sequences.filter(s => s.status === 'ready').length;
 * console.log(`Generated ${successCount} sequences successfully`);
 */
