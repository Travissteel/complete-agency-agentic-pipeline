/**
 * Nurture Sequence Templates and Utilities
 *
 * Email and SMS templates for nurturing leads at different pipeline stages.
 * Includes timing recommendations, personalization helpers, and sequence builders.
 *
 * @version 1.0.0
 * @requires none (standalone utility)
 *
 * Pipeline Stages Covered:
 * - Replied but Not Qualified
 * - Qualified but Not Booked
 * - Booked but No-Show
 * - Closed Lost (Long-term Nurture)
 */

// ============================================================================
// SEQUENCE TEMPLATES BY STAGE
// ============================================================================

/**
 * STAGE 1: Replied but Not Qualified
 *
 * Lead responded with neutral sentiment, needs warming up.
 * Goal: Provide value, build trust, move to qualified.
 */
const repliedNotQualifiedSequence = {
    name: "Replied but Not Qualified Nurture",
    triggerCondition: "Contact in 'Replied' stage for 2+ days with neutral/negative sentiment",
    goalStage: "Qualified",

    emails: [
        {
            step: 1,
            delay: 0, // Send immediately on trigger
            channel: "email",
            subject: "Resource for {{contact.companyName}}",
            body: `Hi {{contact.firstName}},

Thanks for getting back to me about [service]. I wanted to share something that might be helpful for {{contact.companyName}}.

{{dynamicResource}}

No strings attached — just thought it might be useful as you evaluate your options.

If you'd like to discuss how we could specifically help {{contact.companyName}}, I'm happy to jump on a quick call. Here's my calendar: {{user.calendarLink}}

Best,
{{user.firstName}}

P.S. If this isn't relevant right now, just let me know and I'll follow up later.`,
            timing: "Send 2 days after initial reply",
            expectedOpenRate: "35-45%",
            expectedReplyRate: "3-6%"
        },
        {
            step: 2,
            delay: 3, // Days after previous email
            channel: "email",
            subject: "How [Similar Company] solved {{painPoint}}",
            body: `{{contact.firstName}},

Quick follow-up — I wanted to share a recent win that might be relevant to {{contact.companyName}}.

We worked with {{similarCompany}} who was struggling with {{specificPainPoint}}. Within 90 days:
- {{metric1}}
- {{metric2}}
- {{metric3}}

The approach was surprisingly straightforward — happy to walk you through what we did if you're curious.

Would a 15-minute call work for you this week? {{user.calendarLink}}

Thanks,
{{user.firstName}}`,
            timing: "3 days after first email",
            expectedOpenRate: "30-40%",
            expectedReplyRate: "4-8%"
        },
        {
            step: 3,
            delay: 7, // Days after Email 1
            channel: "sms",
            condition: "Only if no email opened in past 7 days",
            body: `Hi {{contact.firstName}}, it's {{user.firstName}} from [Agency]. I sent you a resource about {{topic}}. Did you get a chance to check it out? Happy to answer any questions.`,
            characterCount: 160,
            timing: "7 days after first email if no response",
            expectedReplyRate: "10-15%"
        },
        {
            step: 4,
            delay: 10, // Days after Email 1
            channel: "email",
            subject: "Quick question, {{contact.firstName}}",
            body: `{{contact.firstName}},

I know you mentioned {{contact.customField.original_reply}} — I'm curious where that stands now?

We've helped a few {{contact.customField.vertical}} companies tackle this exact challenge, so if it's still on your radar, I'd love to chat.

If not, no worries at all. Just let me know when (if ever) makes sense to reconnect.

Best,
{{user.firstName}}`,
            timing: "10 days after initial reply",
            expectedOpenRate: "25-35%",
            expectedReplyRate: "5-10%"
        }
    ],

    exitConditions: [
        "Lead replies → Move to Qualified",
        "Lead books meeting → Move to Booked",
        "Lead unsubscribes → Add to suppression",
        "No response after 14 days → Move to long-term nurture"
    ],

    dynamicContentByVertical: {
        "commercial-insurance": "5-point insurance cost reduction checklist",
        "commercial-real-estate": "Tenant screening best practices guide",
        "recruitment": "Candidate sourcing ROI calculator"
    }
};

/**
 * STAGE 2: Qualified but Not Booked
 *
 * Lead expressed interest but hasn't scheduled meeting.
 * Goal: Overcome objections, secure meeting commitment.
 */
const qualifiedNotBookedSequence = {
    name: "Qualified but Not Booked Nurture",
    triggerCondition: "Contact in 'Qualified' stage for 3+ days without calendar booking",
    goalStage: "Booked",

    emails: [
        {
            step: 1,
            delay: 0,
            channel: "email",
            subject: "Ready to connect, {{contact.firstName}}?",
            body: `Hi {{contact.firstName}},

Thanks for expressing interest in [service] for {{contact.companyName}}!

I have a few open slots this week if you'd like to do a quick 15-minute call to discuss:
- Your specific situation with {{painPoint}}
- What similar companies have implemented
- Whether our approach would be a fit

Here's my calendar: {{user.calendarLink}}

Pick a time that works for you — looking forward to connecting.

Best,
{{user.firstName}}`,
            timing: "3 days after moving to qualified",
            expectedOpenRate: "40-50%",
            expectedReplyRate: "8-12%"
        },
        {
            step: 2,
            delay: 2,
            channel: "sms",
            condition: "Only if calendar email not opened within 24 hours",
            body: `Hi {{contact.firstName}}, saw you were interested in [service]. I have a few open slots this week - would 15 mins work for a quick chat? {{user.calendarLink}}`,
            characterCount: 155,
            timing: "2 days after calendar email",
            expectedReplyRate: "12-18%"
        },
        {
            step: 3,
            delay: 4,
            channel: "email",
            subject: "Is this the right time?",
            body: `{{contact.firstName}},

I haven't heard back about scheduling a call — which usually means one of three things:

1. Now's not the right time (totally understandable)
2. You're not sure if this is the right fit (happy to clarify)
3. My emails are landing in your spam folder (whoops)

If it's #1, just let me know when I should follow up (next month, next quarter, etc.).

If it's #2, reply with your biggest question and I'll give you a straight answer.

If it's #3... well, at least you're reading this now.

Either way, I'm here if you need me.

Best,
{{user.firstName}}`,
            timing: "4 days after first email",
            expectedOpenRate: "35-45%",
            expectedReplyRate: "10-15%"
        },
        {
            step: 4,
            delay: 7,
            channel: "email",
            subject: "Closing {{contact.companyName}}'s file",
            body: `{{contact.firstName}},

Last note from me — I'm closing out files for leads I haven't connected with.

If {{painPoint}} is still something you want to address at {{contact.companyName}}, let me know and I'll keep your file open.

If not, no worries at all. I'll stop reaching out.

Just reply "yes" or "not now" and I'll know what to do.

Best,
{{user.firstName}}`,
            timing: "7 days after first email",
            expectedOpenRate: "40-55%",
            expectedReplyRate: "15-25%"
        }
    ],

    exitConditions: [
        "Meeting booked → Move to Booked",
        "Lead says not interested → Move to Closed Lost",
        "No response after 10 days → Move to Closed Lost or long-term nurture"
    ]
};

/**
 * STAGE 3: Booked but No-Show
 *
 * Meeting was scheduled but lead didn't attend.
 * Goal: Reschedule, understand barriers, maintain relationship.
 */
const bookedNoShowSequence = {
    name: "Booked but No-Show Recovery",
    triggerCondition: "Calendar event passed, lead marked as no-show",
    goalStage: "Booked (Rescheduled)",

    messages: [
        {
            step: 1,
            delay: 0, // 1 hour after scheduled meeting end
            channel: "sms",
            body: `Hi {{contact.firstName}}, we had a meeting scheduled for {{meetingTime}} but I didn't see you join. Everything okay? If you need to reschedule, here's my calendar: {{user.calendarLink}}`,
            characterCount: 160,
            timing: "1 hour after scheduled meeting end time",
            expectedReplyRate: "15-25%"
        },
        {
            step: 2,
            delay: 1, // 1 day after no-show
            channel: "email",
            subject: "Did we miss each other?",
            body: `Hi {{contact.firstName}},

We had a call scheduled for {{meetingTime}} yesterday, but I didn't see you join. No worries — I know things come up!

If you're still interested in discussing [service] for {{contact.companyName}}, I'd be happy to reschedule.

Here's my calendar: {{user.calendarLink}}

If timing isn't great right now, just let me know when I should follow up instead.

Thanks,
{{user.firstName}}`,
            timing: "1 day after no-show",
            expectedOpenRate: "45-55%",
            expectedReplyRate: "12-20%"
        },
        {
            step: 3,
            delay: 3,
            channel: "sms",
            body: `{{contact.firstName}}, just checking - are you still looking to improve {{painPoint}} at {{contact.companyName}}? Happy to reschedule if timing works better next week.`,
            characterCount: 155,
            timing: "3 days after no-show",
            expectedReplyRate: "8-15%"
        },
        {
            step: 4,
            delay: 7,
            channel: "email",
            subject: "Should I follow up later?",
            body: `{{contact.firstName}},

Just wanted to check in one more time about rescheduling our call.

If now's not the right time, that's completely fine. Would it make more sense for me to reach back out in:
- 30 days?
- 60 days?
- 90 days?

Just reply with your preference and I'll follow up then.

If you're no longer interested, that's okay too — just let me know so I'm not bothering you.

Best,
{{user.firstName}}`,
            timing: "7 days after no-show",
            expectedOpenRate: "35-45%",
            expectedReplyRate: "10-18%"
        }
    ],

    exitConditions: [
        "Meeting rescheduled → Back to Booked",
        "Lead says not interested → Move to Closed Lost",
        "No response after 10 days → Move to Closed Lost with 'no-show-unresponsive' tag"
    ]
};

/**
 * STAGE 4: Closed Lost (Long-term Nurture)
 *
 * Lead said not interested, bad timing, or disqualified.
 * Goal: Stay top-of-mind, re-engage when timing improves.
 */
const closedLostNurtureSequence = {
    name: "Closed Lost - Long-term Nurture",
    triggerCondition: "Opportunity moved to 'Closed Lost' stage",
    goalStage: "Re-Qualified",
    frequency: "Monthly",

    emails: [
        {
            step: 1,
            delay: 30, // 30 days after closed lost
            channel: "email",
            subject: "Thought of you - {{contact.customField.vertical}} trends",
            body: `Hi {{contact.firstName}},

I know we talked a while back and timing wasn't right for {{contact.companyName}} — no problem at all.

I came across this [industry report/article/insight] about {{contact.customField.vertical}} and thought of you: {{resourceLink}}

Key takeaways:
- {{insight1}}
- {{insight2}}
- {{insight3}}

No sales pitch here — just wanted to share something potentially useful.

If your priorities shift and you want to revisit [service], I'm here. Otherwise, hope this is helpful!

Best,
{{user.firstName}}`,
            timing: "30 days after closed lost",
            expectedOpenRate: "20-30%",
            expectedReplyRate: "1-3%"
        },
        {
            step: 2,
            delay: 60, // 60 days after closed lost
            channel: "email",
            subject: "Quick check-in, {{contact.firstName}}",
            body: `{{contact.firstName}},

Hope things are going well at {{contact.companyName}}.

I wanted to check in and see if {{painPoint}} is still on your radar for this year.

If so, I'd love to reconnect and see if we can help. If not, totally understand — I'll keep you on my list for quarterly check-ins.

Either way, hope business is great!

Best,
{{user.firstName}}`,
            timing: "60 days after closed lost",
            expectedOpenRate: "18-28%",
            expectedReplyRate: "2-4%"
        },
        {
            step: 3,
            delay: 90, // 90 days after closed lost
            channel: "email",
            subject: "{{contact.customField.vertical}} checklist for Q2",
            body: `Hi {{contact.firstName}},

As we head into Q2, I wanted to share a quick resource for {{contact.customField.vertical}} companies: {{resourceLink}}

This checklist covers:
- {{checklist1}}
- {{checklist2}}
- {{checklist3}}

Hope it's useful for planning at {{contact.companyName}}.

If [service] becomes a priority this quarter, I'm happy to chat. Otherwise, I'll check in again in a few months.

Best,
{{user.firstName}}`,
            timing: "90 days after closed lost",
            expectedOpenRate: "15-25%",
            expectedReplyRate: "1-3%"
        },
        {
            step: 4,
            delay: 180, // Quarterly check-ins continue
            channel: "email",
            subject: "Still thinking of {{contact.companyName}}",
            body: `{{contact.firstName}},

Quick quarterly check-in from me.

We've rolled out some new capabilities for {{contact.customField.vertical}} companies recently, including:
- {{newFeature1}}
- {{newFeature2}}

Not sure if this changes anything for {{contact.companyName}}, but wanted to keep you in the loop.

Let me know if timing is better now, or I'll continue these periodic check-ins.

Best,
{{user.firstName}}`,
            timing: "Every 90 days indefinitely",
            expectedOpenRate: "12-22%",
            expectedReplyRate: "1-2%"
        }
    ],

    exitConditions: [
        "Lead replies with interest → Move back to Qualified",
        "Lead unsubscribes → Remove from all nurture",
        "Lead changes company → Update record, continue nurture at new company"
    ],

    reactivationRate: "5-10% over 12 months"
};

// ============================================================================
// DYNAMIC CONTENT GENERATORS
// ============================================================================

/**
 * Generate dynamic resource content based on vertical
 *
 * @param {string} vertical - Industry vertical
 * @returns {string} Resource description for email
 */
function getDynamicResource(vertical) {
    const resources = {
        "commercial-insurance": "5-point insurance cost reduction checklist that helped similar companies save 15-30% on premiums",
        "commercial-real-estate": "Tenant screening best practices guide that reduced vacancy time by 30-40% for CRE firms",
        "recruitment": "Candidate sourcing ROI calculator showing how automation can save 15+ hours per week per recruiter"
    };

    return resources[vertical] || "resource guide for your industry";
}

/**
 * Generate similar company example based on vertical and size
 *
 * @param {string} vertical - Industry vertical
 * @param {string} companySize - Employee count range
 * @returns {Object} Similar company case study details
 */
function getSimilarCompanyExample(vertical, companySize) {
    const examples = {
        "commercial-insurance": {
            company: "a mid-size insurance broker",
            painPoint: "high premium costs and policy overlap",
            metric1: "Cut premiums by 22% (same coverage)",
            metric2: "Eliminated $45K in duplicate coverage",
            metric3: "Reduced policy management time by 8 hours/month"
        },
        "commercial-real-estate": {
            company: "a commercial property management firm",
            painPoint: "long vacancy times and unqualified tenant leads",
            metric1: "Reduced average vacancy from 67 to 41 days",
            metric2: "Automated 80% of initial tenant screening",
            metric3: "Filled 15 units in 30 days vs. usual 90-day average"
        },
        "recruitment": {
            company: "a specialized recruiting firm",
            painPoint: "manual candidate sourcing taking 15+ hours per week",
            metric1: "Automated LinkedIn scraping (500+ candidates/week)",
            metric2: "Multi-channel sequences (email + SMS + InMail)",
            metric3: "Reduced sourcing time by 12 hours/week per recruiter"
        }
    };

    return examples[vertical] || {
        company: "a similar company",
        painPoint: "operational inefficiencies",
        metric1: "Improved efficiency by 30%",
        metric2: "Reduced manual work by 40%",
        metric3: "Increased conversion rates by 25%"
    };
}

/**
 * Get pain point description by vertical
 *
 * @param {string} vertical - Industry vertical
 * @returns {string} Pain point description
 */
function getPainPoint(vertical) {
    const painPoints = {
        "commercial-insurance": "insurance cost optimization",
        "commercial-real-estate": "tenant screening and vacancy reduction",
        "recruitment": "candidate sourcing and placement speed"
    };

    return painPoints[vertical] || "operational improvement";
}

// ============================================================================
// PERSONALIZATION ENGINE
// ============================================================================

/**
 * Personalize template with contact data
 *
 * @param {string} template - Email/SMS template with {{variables}}
 * @param {Object} contact - Contact data from GHL
 * @param {Object} user - User (sales rep) data
 * @param {Object} additional - Additional dynamic content
 * @returns {string} Personalized message
 */
function personalizeTemplate(template, contact, user = {}, additional = {}) {
    let personalized = template;

    // Standard contact variables
    const contactVars = {
        'contact.firstName': contact.firstName || '',
        'contact.lastName': contact.lastName || '',
        'contact.companyName': contact.companyName || contact.company || '',
        'contact.email': contact.email || '',
        'contact.phone': contact.phone || '',
        'contact.customField.vertical': contact.customFields?.vertical || '',
        'contact.customField.lead_temperature': contact.customFields?.lead_temperature || '',
        'contact.customField.original_reply': contact.customFields?.original_reply || '',
        'contact.customField.quality_score': contact.customFields?.quality_score || '',
        'contact.customField.campaign_name': contact.customFields?.campaign_name || ''
    };

    // User (sales rep) variables
    const userVars = {
        'user.firstName': user.firstName || '[Your Name]',
        'user.lastName': user.lastName || '',
        'user.email': user.email || '',
        'user.calendarLink': user.calendarLink || '[Calendar Link]'
    };

    // Dynamic content variables
    const vertical = contact.customFields?.vertical || '';
    const companySize = contact.companySize || '';

    const dynamicVars = {
        'dynamicResource': getDynamicResource(vertical),
        'painPoint': getPainPoint(vertical),
        'specificPainPoint': getSimilarCompanyExample(vertical, companySize).painPoint,
        'similarCompany': getSimilarCompanyExample(vertical, companySize).company,
        'metric1': getSimilarCompanyExample(vertical, companySize).metric1,
        'metric2': getSimilarCompanyExample(vertical, companySize).metric2,
        'metric3': getSimilarCompanyExample(vertical, companySize).metric3,
        ...additional // Any additional variables passed in
    };

    // Combine all variables
    const allVars = { ...contactVars, ...userVars, ...dynamicVars };

    // Replace all variables
    for (const [key, value] of Object.entries(allVars)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        personalized = personalized.replace(regex, value);
    }

    // Clean up any remaining unreplaced variables
    personalized = personalized.replace(/\{\{[^}]+\}\}/g, '[Variable Missing]');

    return personalized;
}

// ============================================================================
// SEQUENCE BUILDERS
// ============================================================================

/**
 * Get complete nurture sequence for a specific stage
 *
 * @param {string} stage - Pipeline stage ('replied', 'qualified', 'no-show', 'closed-lost')
 * @param {Object} contact - Contact data
 * @param {Object} user - User data
 * @returns {Array<Object>} Array of message objects with personalized content
 */
function getNurtureSequence(stage, contact, user = {}) {
    let sequenceTemplate;

    switch (stage.toLowerCase()) {
        case 'replied':
        case 'replied-not-qualified':
            sequenceTemplate = repliedNotQualifiedSequence;
            break;
        case 'qualified':
        case 'qualified-not-booked':
            sequenceTemplate = qualifiedNotBookedSequence;
            break;
        case 'no-show':
        case 'booked-no-show':
            sequenceTemplate = bookedNoShowSequence;
            break;
        case 'closed-lost':
        case 'long-term':
            sequenceTemplate = closedLostNurtureSequence;
            break;
        default:
            throw new Error(`Unknown stage: ${stage}. Must be 'replied', 'qualified', 'no-show', or 'closed-lost'`);
    }

    // Get messages array (could be 'emails' or 'messages' depending on sequence)
    const messages = sequenceTemplate.emails || sequenceTemplate.messages || [];

    // Personalize each message
    const personalizedSequence = messages.map(msg => ({
        ...msg,
        subject: msg.subject ? personalizeTemplate(msg.subject, contact, user) : undefined,
        body: personalizeTemplate(msg.body, contact, user),
        sequenceName: sequenceTemplate.name,
        goalStage: sequenceTemplate.goalStage
    }));

    return personalizedSequence;
}

/**
 * Get single message from sequence
 *
 * @param {string} stage - Pipeline stage
 * @param {number} stepNumber - Message step (1-4)
 * @param {Object} contact - Contact data
 * @param {Object} user - User data
 * @returns {Object} Single personalized message
 */
function getNurtureMessage(stage, stepNumber, contact, user = {}) {
    const sequence = getNurtureSequence(stage, contact, user);

    if (stepNumber < 1 || stepNumber > sequence.length) {
        throw new Error(`Step number must be between 1 and ${sequence.length} for ${stage} sequence`);
    }

    return sequence[stepNumber - 1];
}

// ============================================================================
// SMS UTILITIES
// ============================================================================

/**
 * Validate SMS length and format
 *
 * @param {string} message - SMS message text
 * @returns {Object} Validation result with character count and segment info
 */
function validateSMS(message) {
    const length = message.length;
    const segments = Math.ceil(length / 160);
    const isValid = length <= 160; // Recommend staying within 1 segment

    // Check for problematic characters
    const hasEmojis = /[\u{1F600}-\u{1F64F}]/u.test(message);
    const hasSpecialChars = /[^\x00-\x7F]/g.test(message);

    return {
        isValid,
        characterCount: length,
        segments,
        cost: segments * 0.02, // Approximate cost per segment
        warnings: [
            ...(!isValid ? [`Message is ${length} characters (${segments} segments). Consider shortening to 160 chars.`] : []),
            ...(hasEmojis ? ['Message contains emojis (count as 2 characters each in B2B)'] : []),
            ...(hasSpecialChars ? ['Message contains special characters (may cause encoding issues)'] : [])
        ]
    };
}

/**
 * Get optimal sending time for SMS
 *
 * @param {Object} contact - Contact data with timezone
 * @returns {Object} Recommended sending window
 */
function getOptimalSMSTime(contact) {
    // Default: 10 AM - 7 PM weekdays (recipient's timezone)
    const defaultWindow = {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeStart: '10:00',
        timeEnd: '19:00',
        timezone: contact.timezone || 'America/New_York',
        avoidWeekends: true,
        avoidHolidays: true
    };

    // Industry-specific optimizations
    const vertical = contact.customFields?.vertical;

    if (vertical === 'commercial-real-estate') {
        // Real estate professionals check messages later in morning
        defaultWindow.timeStart = '11:00';
    }

    if (vertical === 'recruitment') {
        // Recruiters active early morning
        defaultWindow.timeStart = '09:00';
    }

    return defaultWindow;
}

// ============================================================================
// EMAIL UTILITIES
// ============================================================================

/**
 * Validate email template
 *
 * @param {Object} email - Email object with subject and body
 * @returns {Object} Validation result
 */
function validateEmail(email) {
    const issues = [];

    // Check subject line length
    if (email.subject && email.subject.length > 50) {
        issues.push(`Subject line is ${email.subject.length} characters (recommended: <50)`);
    }

    // Check for unreplaced merge tags
    const subjectTags = email.subject ? email.subject.match(/\{\{[^}]+\}\}/g) : [];
    const bodyTags = email.body.match(/\{\{[^}]+\}\}/g);

    if (subjectTags && subjectTags.length > 0) {
        issues.push(`Unreplaced merge tags in subject: ${subjectTags.join(', ')}`);
    }

    if (bodyTags && bodyTags.length > 0) {
        issues.push(`Unreplaced merge tags in body: ${bodyTags.join(', ')}`);
    }

    // Check email length
    const wordCount = email.body.split(/\s+/).length;
    if (wordCount > 200) {
        issues.push(`Email is ${wordCount} words (recommended: <150 for nurture emails)`);
    }

    // Check for spam trigger words
    const spamWords = ['free', 'guaranteed', 'act now', 'limited time', '100%', 'risk-free', 'no cost'];
    const foundSpamWords = spamWords.filter(word =>
        email.body.toLowerCase().includes(word) ||
        (email.subject && email.subject.toLowerCase().includes(word))
    );

    if (foundSpamWords.length > 0) {
        issues.push(`Potential spam words detected: ${foundSpamWords.join(', ')}`);
    }

    // Check for placeholder text
    const placeholders = ['[Your Name]', '[Calendar Link]', '[Agency]', '[service]'];
    const foundPlaceholders = placeholders.filter(ph => email.body.includes(ph));

    if (foundPlaceholders.length > 0) {
        issues.push(`Placeholder text not replaced: ${foundPlaceholders.join(', ')}`);
    }

    return {
        isValid: issues.length === 0,
        issues: issues,
        wordCount: wordCount,
        subjectLength: email.subject ? email.subject.length : 0
    };
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Calculate when next message should be sent
 *
 * @param {Date} lastMessageDate - When last message was sent
 * @param {number} delayDays - Delay in days
 * @returns {Date} Next send date
 */
function calculateNextSendDate(lastMessageDate, delayDays) {
    const nextDate = new Date(lastMessageDate);
    nextDate.setDate(nextDate.getDate() + delayDays);

    // If next date falls on weekend, move to Monday
    const dayOfWeek = nextDate.getDay();
    if (dayOfWeek === 0) { // Sunday
        nextDate.setDate(nextDate.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
        nextDate.setDate(nextDate.getDate() + 2);
    }

    return nextDate;
}

/**
 * Get recommended sequence based on lead attributes
 *
 * @param {Object} contact - Contact data
 * @returns {Object} Recommended sequence configuration
 */
function getRecommendedSequence(contact) {
    const stage = contact.pipelineStage?.toLowerCase();
    const sentiment = contact.sentiment?.toLowerCase();
    const qualityScore = contact.customFields?.quality_score || 0;

    const recommendations = {
        stage: stage,
        sequenceType: 'standard',
        frequency: 'normal',
        channels: ['email'],
        aggressiveness: 'medium'
    };

    // Adjust based on quality score
    if (qualityScore >= 80) {
        recommendations.sequenceType = 'premium';
        recommendations.aggressiveness = 'high';
        recommendations.channels = ['email', 'sms'];
    } else if (qualityScore < 50) {
        recommendations.sequenceType = 'basic';
        recommendations.aggressiveness = 'low';
        recommendations.channels = ['email'];
    }

    // Adjust based on sentiment
    if (sentiment === 'positive') {
        recommendations.aggressiveness = 'high';
        recommendations.channels = ['email', 'sms'];
    } else if (sentiment === 'negative') {
        recommendations.aggressiveness = 'low';
        recommendations.frequency = 'low'; // Less frequent touchpoints
    }

    // Stage-specific adjustments
    if (stage === 'closed-lost') {
        recommendations.frequency = 'monthly';
        recommendations.channels = ['email']; // No SMS for long-term nurture
    }

    return recommendations;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Generate nurture sequences for multiple contacts
 *
 * @param {string} stage - Pipeline stage
 * @param {Array<Object>} contacts - Array of contact objects
 * @param {Object} user - User data
 * @returns {Array<Object>} Array of contact-sequence pairs
 */
function generateBulkNurtureSequences(stage, contacts, user = {}) {
    const results = [];

    for (const contact of contacts) {
        try {
            const sequence = getNurtureSequence(stage, contact, user);
            const validation = {
                email: sequence.filter(m => m.channel === 'email').map(m => validateEmail(m)),
                sms: sequence.filter(m => m.channel === 'sms').map(m => validateSMS(m.body))
            };

            results.push({
                contactId: contact.contactId || contact.id,
                contactEmail: contact.email,
                contactName: `${contact.firstName} ${contact.lastName}`.trim(),
                sequence: sequence,
                validation: validation,
                status: 'ready'
            });
        } catch (error) {
            results.push({
                contactId: contact.contactId || contact.id,
                contactEmail: contact.email,
                contactName: `${contact.firstName} ${contact.lastName}`.trim(),
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
    // Sequence templates
    sequences: {
        repliedNotQualified: repliedNotQualifiedSequence,
        qualifiedNotBooked: qualifiedNotBookedSequence,
        bookedNoShow: bookedNoShowSequence,
        closedLostNurture: closedLostNurtureSequence
    },

    // Sequence builders
    getNurtureSequence,
    getNurtureMessage,
    getRecommendedSequence,

    // Personalization
    personalizeTemplate,
    getDynamicResource,
    getSimilarCompanyExample,
    getPainPoint,

    // Validation
    validateEmail,
    validateSMS,

    // Timing utilities
    calculateNextSendDate,
    getOptimalSMSTime,

    // Bulk operations
    generateBulkNurtureSequences
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Get full nurture sequence for a lead
 *
 * const { getNurtureSequence } = require('./nurture-sequences');
 *
 * const contact = {
 *   firstName: 'John',
 *   lastName: 'Smith',
 *   email: 'john@company.com',
 *   phone: '+13125551234',
 *   companyName: 'ABC Insurance',
 *   pipelineStage: 'qualified',
 *   customFields: {
 *     vertical: 'commercial-insurance',
 *     quality_score: 85
 *   }
 * };
 *
 * const user = {
 *   firstName: 'Sarah',
 *   calendarLink: 'https://calendly.com/sarah/15min'
 * };
 *
 * const sequence = getNurtureSequence('qualified', contact, user);
 * console.log(sequence);
 * // Returns array of 4 personalized email/SMS messages
 */

/**
 * Example 2: Get single message from sequence
 *
 * const { getNurtureMessage } = require('./nurture-sequences');
 *
 * const message = getNurtureMessage('no-show', 1, contact, user);
 * console.log(message.body); // Personalized SMS for step 1
 */

/**
 * Example 3: Validate SMS before sending
 *
 * const { validateSMS } = require('./nurture-sequences');
 *
 * const sms = "Hi John, it's Sarah from AgencyName. I sent you a resource about insurance optimization. Did you get a chance to check it out?";
 * const validation = validateSMS(sms);
 *
 * if (!validation.isValid) {
 *   console.warn('SMS too long:', validation.warnings);
 * }
 */

/**
 * Example 4: Generate sequences for 50 leads
 *
 * const { generateBulkNurtureSequences } = require('./nurture-sequences');
 *
 * const contacts = [...]; // Array of 50 contact objects
 * const results = generateBulkNurtureSequences('replied', contacts, user);
 *
 * const successCount = results.filter(r => r.status === 'ready').length;
 * console.log(`Generated ${successCount} sequences successfully`);
 */

/**
 * Example 5: Get recommended sequence configuration
 *
 * const { getRecommendedSequence } = require('./nurture-sequences');
 *
 * const recommendation = getRecommendedSequence(contact);
 * console.log(recommendation);
 * // Returns: { stage, sequenceType, frequency, channels, aggressiveness }
 */
