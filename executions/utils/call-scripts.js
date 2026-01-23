/**
 * Voice Call Scripts Utility
 *
 * Provides call scripts for AI voice agents across verticals and scenarios.
 * Includes qualification questions, objection responses, booking scripts, and voicemail messages.
 *
 * @version 1.0.0
 * @requires none (standalone utility)
 *
 * Verticals: Commercial Insurance, Commercial Real Estate, Recruitment Firms
 * Scenarios: Inbound, Outbound, Follow-up, Voicemail
 */

// ============================================================================
// SCRIPT PERSONALIZATION ENGINE
// ============================================================================

/**
 * Personalize script with lead data
 *
 * @param {string} script - Script template with {{variables}}
 * @param {Object} data - Data for personalization
 * @returns {string} Personalized script
 */
function personalizeScript(script, data) {
    let personalized = script;

    // Common variables
    const variables = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        companyName: data.companyName || 'your company',
        industry: data.industry || '',
        location: data.location || '',
        timeReference: data.timeReference || 'recently',
        topic: data.topic || 'your inquiry',
        agentName: data.agentName || 'our team',
        companyNameFull: data.companyNameFull || 'our company',
        day: data.day || 'Tuesday',
        time: data.time || '2:00 PM',
        timezone: data.timezone || 'Central Time'
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
// COMMERCIAL INSURANCE - CALL SCRIPTS
// ============================================================================

const insuranceScripts = {
    // INBOUND CALL SCRIPTS
    inbound: {
        greeting: `Hi, thanks for calling {{companyNameFull}}. This is {{agentName}}, your virtual assistant. I'm here to help you explore your insurance options or connect you with one of our brokers. Can I start by getting your name?`,

        greeting_afterHours: `Hi, thanks for calling {{companyNameFull}}. Our office is currently closed, but I'm {{agentName}}, your 24/7 virtual assistant. I can still help you get scheduled or answer basic questions. Can I start by getting your name?`,

        nameCapture: `Great, nice to meet you, {{firstName}}. And what's the name of your company?`,

        qualifyBusiness: `Thanks, {{firstName}}. So I can connect you with the right specialist, can you tell me what type of business {{companyName}} is in?`,

        qualifySize: `Got it. How many employees does {{companyName}} have currently?`,

        qualifyCurrentInsurance: `Are you currently working with an insurance broker, or are you self-managing your policies?`,

        qualifyPainPoint: `What's prompting you to look at insurance options right now? Is it an upcoming renewal, a coverage gap, or something else?`,

        qualifyTimeline: `When are you looking to have a new policy in place? Is there a specific deadline?`,

        qualifyDecisionMaker: `Perfect. Are you the one who makes the final decisions about insurance for {{companyName}}, or is there someone else I should also include in our conversation?`,

        transitionToBooking: `Based on what you've shared, I think one of our commercial insurance specialists would be a great fit for your needs. They can walk you through options specific to {{industry}} companies and put together a quote. Would you be open to a 15-minute consultation call?`
    },

    // OUTBOUND CALL SCRIPTS
    outbound: {
        greeting: `Hi {{firstName}}, this is {{agentName}} calling from {{companyNameFull}}. We spoke {{timeReference}} about commercial insurance options for {{companyName}}. Is now still a good time to chat for a few minutes?`,

        greeting_noAnswer: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I wanted to follow up on our conversation about insurance for {{companyName}}. I'll try you again later, but if you'd like to connect sooner, you can book time directly at [calendar link]. Talk soon!`,

        reasonForCall: `Great. I'm following up because you mentioned you were looking to reduce your insurance costs and improve coverage. I wanted to see if we could get you on the calendar with one of our specialists to explore some options.`,

        valueProposition: `Just to give you context, we recently helped a similar {{industry}} company save $87,000 annually by restructuring their commercial policy. No pressure, but I thought it might be worth a quick conversation to see if we could do something similar for {{companyName}}.`,

        qualifyInterestLevel: `Does that sound like something you'd be interested in exploring?`,

        handleTimingObjection: `I totally understand you're busy. That's actually why we keep these calls to just 15 minutes — it's enough time to see if there's a fit without taking up your whole day. Would {{day}} at {{time}} work?`
    },

    // OBJECTION HANDLING
    objections: {
        notInterested: `I totally understand, {{firstName}}. Just so I don't waste your time in the future, can I ask — is it that insurance cost reduction isn't a priority right now, or is there something specific about our approach that's not a fit?`,

        alreadyHaveBroker: `That's great that you're working with someone. Most of our clients were already working with a broker when we met. The reason they switched is we specialize in {{industry}} companies and typically find 15-30% in savings that general brokers miss. Would it make sense to at least get a second opinion, or are you locked into a long-term contract?`,

        sendInformation: `Absolutely, I can send you some information. But it'll make a lot more sense if we jump on a quick 15-minute call first so I can tailor it to {{companyName}}'s specific situation. Does {{day}} at {{time}} work, or is {{alternativeDay}} at {{alternativeTime}} better?`,

        talkToPartner: `That makes total sense, {{firstName}}. Would it be helpful if I schedule a call for both you and your partner together? That way we can answer questions in real-time and see if it's a fit. What's their availability like this week?`,

        howMuchCost: `Great question. Our pricing depends on your industry, coverage needs, and current policy structure. The best way to get an accurate quote is to spend 15 minutes understanding your situation. I have {{day}} at {{time}} open — does that work?`,

        tooBusy: `I completely get it, {{firstName}}. That's actually why I'm calling — we help {{industry}} companies cut down on the time they spend managing insurance by an average of 40%. Even just 15 minutes now could save you hours down the road. How about we do a super quick call on {{day}} at {{time}}?`
    },

    // BOOKING SCRIPTS
    booking: {
        proposeTime: `Perfect, let me get you on the calendar. I have {{day}}, {{date}} at {{time}} {{timezone}}. Does that work for you?`,

        confirmBooking: `Great. You'll receive a calendar invite at {{email}} with a Zoom link. We'll cover your current coverage, identify any gaps or overlaps, and explore potential savings. Sound good?`,

        captureEmail: `Perfect. What's the best email address to send the calendar invite to?`,

        capturePhone: `And just to confirm, is {{phone}} still the best number to reach you?`,

        alternativeTime: `No problem. What's your availability like {{alternativeDay}} or {{alternativeDay2}}?`,

        confirmationClose: `You're all set for {{day}}, {{date}} at {{time}}. You'll get a calendar invite and a reminder text 30 minutes before. If anything changes, just reply to that text and we'll reschedule. Is there anything else I can help with today?`
    },

    // VOICEMAIL SCRIPTS
    voicemail: {
        initial: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I'm reaching out because we help {{industry}} companies reduce insurance costs by 15-30% while improving coverage. We recently saved a company similar to {{companyName}} about $87,000 annually. If you're interested in exploring what's possible, give me a call back at {{phone}} or book a time directly at [calendar link]. Thanks!`,

        followUp: `Hi {{firstName}}, {{agentName}} from {{companyNameFull}} again. I left a message {{timeReference}} about insurance cost optimization for {{companyName}}. I know you're busy, so I'll make this quick. If you're interested in a 15-minute call to see if we can save you money, just book time at [calendar link]. If now's not the right time, no worries. Thanks!`,

        breakup: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I've tried reaching you a few times about insurance options for {{companyName}}. I don't want to be a pest, so this will be my last attempt. If you're interested, you can book time at [calendar link]. Otherwise, I'll close your file. Thanks for your time!`
    }
};

// ============================================================================
// COMMERCIAL REAL ESTATE - CALL SCRIPTS
// ============================================================================

const realEstateScripts = {
    // INBOUND CALL SCRIPTS
    inbound: {
        greeting: `Hi, thanks for calling {{companyNameFull}}. This is {{agentName}}, your virtual assistant. I'm here to help you learn about our property management solutions or get you scheduled with our team. Can I start by getting your name?`,

        greeting_afterHours: `Hi, thanks for calling {{companyNameFull}}. Our office is currently closed, but I'm {{agentName}}, your 24/7 virtual assistant. I can help you schedule a demo or answer questions about our platform. Can I start by getting your name?`,

        nameCapture: `Awesome, nice to meet you, {{firstName}}. Are you calling about a specific property, or are you exploring solutions for your portfolio?`,

        qualifyPropertyType: `Great. What type of properties are you managing? Office, retail, industrial, multifamily, or a mix?`,

        qualifyUnitCount: `How many units or properties are we talking about?`,

        qualifyRole: `Are you the property owner, or do you manage properties for others?`,

        qualifyPainPoint: `What's the biggest challenge you're facing with property management or leasing right now?`,

        qualifyVacancy: `Do you have any vacancies right now that you're trying to fill?`,

        qualifyTimeline: `When would you ideally like to have a solution in place?`,

        transitionToBooking: `Based on what you're describing, I think our platform could be a really good fit. We help property managers like you reduce vacancy time by 30-40% using AI-powered tenant screening and automated lead routing. Would you be interested in seeing a 15-minute demo?`
    },

    // OUTBOUND CALL SCRIPTS
    outbound: {
        greeting: `Hi {{firstName}}, this is {{agentName}} calling from {{companyNameFull}}. We spoke {{timeReference}} about tenant screening automation for {{companyName}}. Is now a good time to chat for a few minutes?`,

        greeting_noAnswer: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I wanted to follow up about reducing vacancy time at {{companyName}}. I'll try you again later, but if you'd like to see a quick demo, you can book time at [calendar link]. Talk soon!`,

        reasonForCall: `Great. I'm following up because you mentioned you were looking to fill vacancies faster and reduce the time spent on tenant screening. I wanted to see if we could show you how our system works.`,

        valueProposition: `Just to give you context, we recently worked with a property manager in {{location}} who went from an average 8-week vacancy time down to 3 weeks using our platform. They're filling units 60% faster now. I thought it might be worth showing you how it works.`,

        qualifyInterestLevel: `Does that sound like something you'd be interested in seeing?`,

        handleTimingObjection: `I totally get it. These demos are only 15 minutes, so it won't take up much of your day. Would {{day}} at {{time}} work?`
    },

    // OBJECTION HANDLING
    objections: {
        notInterested: `No problem, {{firstName}}. Just so I know for the future, is it that vacancy time isn't a concern right now, or is there something about our platform that's not a fit?`,

        alreadyHaveSystem: `That's great that you have a system in place. Most of our clients were using other tools when we met. The reason they switched is we integrate everything — lead capture, screening calls, credit checks, and application routing — into one automated flow. Would it make sense to at least see how we compare?`,

        sendInformation: `Absolutely. I can send you a video walkthrough, but it'll make more sense if I show you the platform live so you can ask questions. It's only 15 minutes. Does {{day}} at {{time}} work?`,

        noVacancies: `That's great that you're fully leased right now. But since vacancy is inevitable, would it make sense to see how our system works so you're ready when the next unit opens up? It could save you weeks of lost rent.`,

        tooExpensive: `I totally understand budget is a factor. Here's how most property managers think about it: if our platform saves you even one week of vacancy per year on a $2,000/month unit, that's $2,000 saved. Our pricing is way less than that. Would it make sense to see the numbers?`,

        tooBusy: `I get it, {{firstName}}. That's exactly why we built this — to save property managers time. Our clients tell us they spend 50% less time on tenant screening. Even 15 minutes now could save you hours every month. How about {{day}} at {{time}}?`
    },

    // BOOKING SCRIPTS
    booking: {
        proposeTime: `Perfect, let me get you on the calendar for a demo. I have {{day}}, {{date}} at {{time}} {{timezone}}. Does that work?`,

        confirmBooking: `Awesome. You'll receive a calendar invite at {{email}} with a Zoom link. We'll walk through the platform, show you how the automation works, and answer any questions. Sound good?`,

        captureEmail: `Great. What's the best email to send the calendar invite to?`,

        capturePhone: `And just to confirm, is {{phone}} the best number to reach you?`,

        alternativeTime: `No worries. What does your schedule look like {{alternativeDay}} or {{alternativeDay2}}?`,

        confirmationClose: `You're all set for {{day}}, {{date}} at {{time}}. You'll get a calendar invite and a reminder text 30 minutes before. If anything changes, just reply to that text. Is there anything else I can help with?`
    },

    // VOICEMAIL SCRIPTS
    voicemail: {
        initial: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I'm reaching out because we help property managers reduce vacancy time by 30-40% using AI-powered tenant screening. One of our clients in {{location}} went from 8 weeks to 3 weeks on average. If you're interested in seeing how it works, give me a call at {{phone}} or book a demo at [calendar link]. Thanks!`,

        followUp: `Hi {{firstName}}, {{agentName}} from {{companyNameFull}} again. I left a message {{timeReference}} about reducing vacancy time at {{companyName}}. If you'd like to see a quick 15-minute demo of our platform, just book time at [calendar link]. If now's not the right time, no problem. Thanks!`,

        breakup: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I've tried reaching you a few times about our tenant screening platform. I don't want to be a pest, so this will be my last message. If you're interested, you can book a demo at [calendar link]. Otherwise, I'll close your file. Thanks!`
    }
};

// ============================================================================
// RECRUITMENT FIRMS - CALL SCRIPTS
// ============================================================================

const recruitmentScripts = {
    // INBOUND CALL SCRIPTS
    inbound: {
        greeting: `Hi, thanks for calling {{companyNameFull}}. This is {{agentName}}, your virtual assistant. I'm here to help you learn about our recruiting automation platform or connect you with our team. Can I start by getting your name?`,

        greeting_afterHours: `Hi, thanks for calling {{companyNameFull}}. Our office is currently closed, but I'm {{agentName}}, available 24/7. I can help you schedule a demo or answer questions about our platform. Can I start by getting your name?`,

        nameCapture: `Great, nice to meet you, {{firstName}}. What's the name of your recruiting firm?`,

        qualifyIndustry: `Perfect. What industries do you recruit for primarily?`,

        qualifyTeamSize: `How many recruiters are on your team?`,

        qualifyATS: `Do you use an ATS system currently? Which one?`,

        qualifyPainPoint: `What's the biggest bottleneck in your recruiting process right now?`,

        qualifyReqVolume: `How many requisitions are you typically working on at once?`,

        qualifySourceTime: `How much time does your team spend on initial candidate sourcing each week?`,

        qualifyDecisionMaker: `Are you the one who evaluates new recruiting technology, or is there someone else involved in that decision?`,

        transitionToBooking: `Based on what you've shared, I think our platform could really help {{companyName}}. We automate candidate sourcing and pre-screening, which typically saves recruiting teams 40-50% of their sourcing time. Would you be interested in a 15-minute demo?`
    },

    // OUTBOUND CALL SCRIPTS
    outbound: {
        greeting: `Hi {{firstName}}, this is {{agentName}} calling from {{companyNameFull}}. We spoke {{timeReference}} about recruiting automation for {{companyName}}. Is now a good time to chat briefly?`,

        greeting_noAnswer: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I wanted to follow up about automating candidate sourcing at {{companyName}}. I'll try you again, but if you'd like to see a demo, you can book time at [calendar link]. Talk soon!`,

        reasonForCall: `Great. I'm following up because you mentioned you were looking to scale placements without adding more recruiters. I wanted to show you how our automation platform works.`,

        valueProposition: `Just to give you context, one of our recruiting clients went from 15 hours per week on manual LinkedIn outreach to fully automated multi-channel sequences. They increased placements by 30% in the first quarter without hiring anyone new. I thought it might be worth showing you how.`,

        qualifyInterestLevel: `Does that sound like something you'd want to see?`,

        handleTimingObjection: `I totally understand you're slammed. That's exactly why we built this — to free up your recruiters' time. The demo is only 15 minutes. Would {{day}} at {{time}} work?`
    },

    // OBJECTION HANDLING
    objections: {
        notInterested: `No problem, {{firstName}}. Just so I know, is it that recruiting automation isn't a priority right now, or is there something about our platform that's not a fit?`,

        alreadyHaveTools: `That's great that you have tools in place. Most of our clients were using other platforms when we met. The reason they added us is we handle the full sourcing workflow — LinkedIn scraping, email sequences, SMS follow-up, and AI pre-screening — all in one system. Would it make sense to see how we compare?`,

        sendInformation: `Absolutely. I can send you a video, but it's way easier to understand if I show you the platform live. It's only 15 minutes and you can ask questions. Does {{day}} at {{time}} work?`,

        talkToPartner: `That makes sense. Would it be easier if I schedule a demo for both of you together? That way everyone's on the same page. What's their availability this week?`,

        tooExpensive: `I get it, budget is always a factor. Here's how our clients think about ROI: if your recruiters spend 15 hours a week on sourcing and we cut that by 80%, that's 12 hours saved. At a $75K salary, that's roughly $2,000 a month in labor cost saved. Our pricing is a fraction of that. Want to see the math?`,

        tooBusy: `I completely understand, {{firstName}}. That's exactly why we built this platform — to save recruiters time. Our clients tell us they spend 60% less time on sourcing and focus that time on closing placements. Even 15 minutes now could save you hours every week. How about {{day}} at {{time}}?`
    },

    // BOOKING SCRIPTS
    booking: {
        proposeTime: `Perfect, let me get you scheduled for a demo. I have {{day}}, {{date}} at {{time}} {{timezone}}. Does that work?`,

        confirmBooking: `Great. You'll receive a calendar invite at {{email}} with a Zoom link. We'll walk through the platform, show you how the automation works, and discuss integration with your ATS. Sound good?`,

        captureEmail: `Perfect. What's the best email for the calendar invite?`,

        capturePhone: `And just to confirm, is {{phone}} the best number to reach you?`,

        alternativeTime: `No problem. What's your availability like {{alternativeDay}} or {{alternativeDay2}}?`,

        confirmationClose: `You're all set for {{day}}, {{date}} at {{time}}. You'll get a calendar invite and a reminder text 30 minutes before. If anything changes, just reply to that text. Is there anything else I can help with?`
    },

    // VOICEMAIL SCRIPTS
    voicemail: {
        initial: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I'm reaching out because we help recruiting firms scale placements by automating candidate sourcing and pre-screening. One of our clients increased placements by 30% in Q1 without adding headcount. If you're interested in seeing how it works, call me at {{phone}} or book a demo at [calendar link]. Thanks!`,

        followUp: `Hi {{firstName}}, {{agentName}} from {{companyNameFull}} again. I left a message {{timeReference}} about recruiting automation for {{companyName}}. If you'd like to see a 15-minute demo, just book time at [calendar link]. If now's not the right time, no worries. Thanks!`,

        breakup: `Hi {{firstName}}, this is {{agentName}} from {{companyNameFull}}. I've tried reaching you a few times about our recruiting automation platform. I don't want to be a pest, so this will be my last attempt. If you're interested, book a demo at [calendar link]. Otherwise, I'll close your file. Thanks!`
    }
};

// ============================================================================
// SCRIPT RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Get script by vertical, scenario, and script type
 *
 * @param {string} vertical - 'insurance', 'real-estate', or 'recruitment'
 * @param {string} scenario - 'inbound', 'outbound', 'objections', 'booking', 'voicemail'
 * @param {string} scriptType - Specific script name (e.g., 'greeting', 'notInterested')
 * @param {Object} data - Data for personalization (optional)
 * @returns {string} Call script
 */
function getScript(vertical, scenario, scriptType, data = {}) {
    // Select script set based on vertical
    let scripts;
    switch (vertical.toLowerCase()) {
        case 'insurance':
        case 'commercial-insurance':
            scripts = insuranceScripts;
            break;
        case 'real-estate':
        case 'commercial-real-estate':
            scripts = realEstateScripts;
            break;
        case 'recruitment':
        case 'recruitment-firms':
            scripts = recruitmentScripts;
            break;
        default:
            throw new Error(`Unknown vertical: ${vertical}. Must be 'insurance', 'real-estate', or 'recruitment'`);
    }

    // Get script from scenario
    if (!scripts[scenario]) {
        throw new Error(`Unknown scenario: ${scenario}. Must be 'inbound', 'outbound', 'objections', 'booking', or 'voicemail'`);
    }

    const script = scripts[scenario][scriptType];

    if (!script) {
        throw new Error(`Script type '${scriptType}' not found in ${vertical} > ${scenario}`);
    }

    // Personalize if data provided
    return data && Object.keys(data).length > 0 ? personalizeScript(script, data) : script;
}

/**
 * Get all scripts for a specific vertical and scenario
 *
 * @param {string} vertical - Target vertical
 * @param {string} scenario - Scenario type
 * @returns {Object} Object with all scripts for that scenario
 */
function getAllScripts(vertical, scenario) {
    let scripts;
    switch (vertical.toLowerCase()) {
        case 'insurance':
        case 'commercial-insurance':
            scripts = insuranceScripts;
            break;
        case 'real-estate':
        case 'commercial-real-estate':
            scripts = realEstateScripts;
            break;
        case 'recruitment':
        case 'recruitment-firms':
            scripts = recruitmentScripts;
            break;
        default:
            throw new Error(`Unknown vertical: ${vertical}`);
    }

    if (!scripts[scenario]) {
        throw new Error(`Unknown scenario: ${scenario}`);
    }

    return scripts[scenario];
}

/**
 * Get qualification question flow for a vertical
 *
 * @param {string} vertical - Target vertical
 * @param {string} callType - 'inbound' or 'outbound'
 * @returns {Array<Object>} Array of question objects
 */
function getQualificationFlow(vertical, callType = 'inbound') {
    const flows = {
        insurance: [
            { step: 1, script: 'greeting', category: 'opening' },
            { step: 2, script: 'nameCapture', category: 'identification' },
            { step: 3, script: 'qualifyBusiness', category: 'business_context' },
            { step: 4, script: 'qualifySize', category: 'business_context' },
            { step: 5, script: 'qualifyCurrentInsurance', category: 'pain_discovery' },
            { step: 6, script: 'qualifyPainPoint', category: 'pain_discovery' },
            { step: 7, script: 'qualifyTimeline', category: 'urgency' },
            { step: 8, script: 'qualifyDecisionMaker', category: 'authority' },
            { step: 9, script: 'transitionToBooking', category: 'transition' }
        ],
        'real-estate': [
            { step: 1, script: 'greeting', category: 'opening' },
            { step: 2, script: 'nameCapture', category: 'identification' },
            { step: 3, script: 'qualifyPropertyType', category: 'business_context' },
            { step: 4, script: 'qualifyUnitCount', category: 'business_context' },
            { step: 5, script: 'qualifyRole', category: 'authority' },
            { step: 6, script: 'qualifyPainPoint', category: 'pain_discovery' },
            { step: 7, script: 'qualifyVacancy', category: 'urgency' },
            { step: 8, script: 'qualifyTimeline', category: 'urgency' },
            { step: 9, script: 'transitionToBooking', category: 'transition' }
        ],
        recruitment: [
            { step: 1, script: 'greeting', category: 'opening' },
            { step: 2, script: 'nameCapture', category: 'identification' },
            { step: 3, script: 'qualifyIndustry', category: 'business_context' },
            { step: 4, script: 'qualifyTeamSize', category: 'business_context' },
            { step: 5, script: 'qualifyATS', category: 'technical' },
            { step: 6, script: 'qualifyPainPoint', category: 'pain_discovery' },
            { step: 7, script: 'qualifyReqVolume', category: 'pain_discovery' },
            { step: 8, script: 'qualifySourceTime', category: 'pain_discovery' },
            { step: 9, script: 'qualifyDecisionMaker', category: 'authority' },
            { step: 10, script: 'transitionToBooking', category: 'transition' }
        ]
    };

    const flow = flows[vertical.toLowerCase()];
    if (!flow) {
        throw new Error(`Unknown vertical: ${vertical}`);
    }

    return flow;
}

/**
 * Get objection response by objection type
 *
 * @param {string} vertical - Target vertical
 * @param {string} objectionType - Type of objection (e.g., 'notInterested', 'tooBusy')
 * @param {Object} data - Personalization data
 * @returns {string} Objection response script
 */
function getObjectionResponse(vertical, objectionType, data = {}) {
    return getScript(vertical, 'objections', objectionType, data);
}

// ============================================================================
// DYNAMIC SCRIPT GENERATION
// ============================================================================

/**
 * Build a complete call script based on call type and lead data
 *
 * @param {string} vertical - Target vertical
 * @param {string} callType - 'inbound' or 'outbound'
 * @param {Object} leadData - Lead information for personalization
 * @returns {Object} Complete call script with all steps
 */
function buildCompleteCallScript(vertical, callType, leadData = {}) {
    const flow = getQualificationFlow(vertical, callType);
    const scenario = callType === 'inbound' ? 'inbound' : 'outbound';

    const completeScript = {
        vertical: vertical,
        callType: callType,
        leadData: leadData,
        steps: []
    };

    // Build each step with personalized script
    for (const step of flow) {
        const scriptText = getScript(vertical, scenario, step.script, leadData);

        completeScript.steps.push({
            step: step.step,
            category: step.category,
            scriptName: step.script,
            script: scriptText
        });
    }

    // Add booking scripts
    const bookingScripts = getAllScripts(vertical, 'booking');
    completeScript.bookingScripts = {};
    for (const [key, script] of Object.entries(bookingScripts)) {
        completeScript.bookingScripts[key] = personalizeScript(script, leadData);
    }

    // Add objection scripts
    const objectionScripts = getAllScripts(vertical, 'objections');
    completeScript.objectionScripts = {};
    for (const [key, script] of Object.entries(objectionScripts)) {
        completeScript.objectionScripts[key] = personalizeScript(script, leadData);
    }

    return completeScript;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Core script retrieval
    getScript,
    getAllScripts,
    getQualificationFlow,
    getObjectionResponse,

    // Script generation
    buildCompleteCallScript,
    personalizeScript,

    // Direct access to script sets
    insuranceScripts,
    realEstateScripts,
    recruitmentScripts
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Get a single script
 *
 * const { getScript } = require('./call-scripts');
 *
 * const greeting = getScript('insurance', 'inbound', 'greeting', {
 *   agentName: 'Sarah',
 *   companyNameFull: 'ABC Insurance Brokers'
 * });
 *
 * console.log(greeting);
 * // "Hi, thanks for calling ABC Insurance Brokers. This is Sarah, your virtual assistant..."
 */

/**
 * Example 2: Get all objection scripts for a vertical
 *
 * const { getAllScripts } = require('./call-scripts');
 *
 * const objections = getAllScripts('real-estate', 'objections');
 * console.log(objections.notInterested);
 * console.log(objections.tooBusy);
 */

/**
 * Example 3: Get qualification flow
 *
 * const { getQualificationFlow } = require('./call-scripts');
 *
 * const flow = getQualificationFlow('recruitment', 'inbound');
 * console.log(flow);
 * // [
 * //   { step: 1, script: 'greeting', category: 'opening' },
 * //   { step: 2, script: 'nameCapture', category: 'identification' },
 * //   ...
 * // ]
 */

/**
 * Example 4: Build complete personalized call script
 *
 * const { buildCompleteCallScript } = require('./call-scripts');
 *
 * const leadData = {
 *   firstName: 'John',
 *   lastName: 'Smith',
 *   companyName: 'ABC Corp',
 *   industry: 'manufacturing',
 *   agentName: 'Sarah',
 *   companyNameFull: 'InsureTech Solutions',
 *   day: 'Tuesday',
 *   time: '2:00 PM',
 *   timezone: 'Central Time',
 *   email: 'john@abccorp.com',
 *   phone: '+13125551234'
 * };
 *
 * const callScript = buildCompleteCallScript('insurance', 'inbound', leadData);
 *
 * console.log('Qualification Steps:');
 * callScript.steps.forEach(step => {
 *   console.log(`Step ${step.step} (${step.category}): ${step.script}`);
 * });
 *
 * console.log('\nObjection Scripts:');
 * console.log('Not Interested:', callScript.objectionScripts.notInterested);
 *
 * console.log('\nBooking Scripts:');
 * console.log('Propose Time:', callScript.bookingScripts.proposeTime);
 */

/**
 * Example 5: Use with Vapi.ai assistant
 *
 * const { getScript, getObjectionResponse } = require('./call-scripts');
 * const VapiAPI = require('./vapi-api');
 * const vapi = new VapiAPI();
 *
 * // Get greeting script
 * const greeting = getScript('insurance', 'inbound', 'greeting', {
 *   agentName: 'Sarah',
 *   companyNameFull: 'ABC Insurance'
 * });
 *
 * // Create assistant with that greeting
 * await vapi.createAssistant({
 *   name: 'Insurance Qualifier',
 *   vertical: 'insurance',
 *   firstMessage: greeting
 * });
 *
 * // In webhook handler, respond to objections
 * if (transcript.includes('not interested')) {
 *   const response = getObjectionResponse('insurance', 'notInterested', {
 *     firstName: 'John'
 *   });
 *   // Send response back to Vapi
 * }
 */
