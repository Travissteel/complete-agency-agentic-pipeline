/**
 * Booking Confirmation & Reminder Templates
 *
 * Professional email and SMS templates for calendar booking confirmations,
 * reminders, reschedule requests, and no-show follow-ups.
 *
 * @version 1.0.0
 * @requires none (standalone utility)
 *
 * Supports: Email confirmations, SMS confirmations, 24hr reminders, 1hr reminders,
 *           reschedule requests, cancellation confirmations, no-show follow-ups
 */

// ============================================================================
// PERSONALIZATION ENGINE
// ============================================================================

/**
 * Replace personalization variables in template
 *
 * @param {string} template - Template with {{variables}}
 * @param {Object} data - Data object with replacement values
 * @returns {string} Personalized content
 */
function personalize(template, data) {
    let personalized = template;

    // Replace all variables
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        personalized = personalized.replace(regex, value || '');
    }

    // Clean up any remaining unreplaced variables
    personalized = personalized.replace(/\{\{[^}]+\}\}/g, '');

    return personalized;
}

/**
 * Format date for display
 *
 * @param {string} dateTime - ISO 8601 date/time
 * @param {string} timezone - Timezone
 * @returns {Object} Formatted date components
 */
function formatDateTime(dateTime, timezone = 'America/Chicago') {
    const date = new Date(dateTime);

    const options = {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    const parts = formatted.split(', ');

    return {
        fullDate: formatted,
        dayOfWeek: parts[0], // "Monday"
        monthDay: parts[1], // "January 25, 2026"
        time: parts[2], // "2:00 PM"
        timezone: timezone.split('/')[1].replace('_', ' ') // "Chicago"
    };
}

/**
 * Generate .ics calendar file content
 *
 * @param {Object} bookingData - Booking information
 * @returns {string} iCalendar format content
 */
function generateICalendar(bookingData) {
    const {
        title,
        description,
        location,
        startDateTime,
        endDateTime,
        organizerEmail,
        attendeeEmail
    } = bookingData;

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = new Date(startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendar Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
ORGANIZER;CN=Meeting Organizer:mailto:${organizerEmail}
ATTENDEE;CN=Attendee:mailto:${attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: Meeting in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

/**
 * Shorten URL (placeholder - would integrate with bit.ly or similar in production)
 *
 * @param {string} url - Full URL to shorten
 * @returns {string} Shortened URL
 */
function shortenURL(url) {
    // In production, integrate with URL shortening service
    // For now, return truncated URL
    if (url.length <= 30) return url;
    return url.substring(0, 27) + '...';
}

// ============================================================================
// EMAIL CONFIRMATION TEMPLATES
// ============================================================================

const emailConfirmations = {
    /**
     * Initial booking confirmation email
     */
    bookingConfirmation: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);
        const agendaItems = data.agendaItems || [
            'Review your current situation',
            'Discuss potential solutions',
            'Answer any questions you have'
        ];
        const preparationItems = data.preparationItems || [
            'Any relevant documents or information',
            'List of questions or concerns'
        ];

        const template = `Subject: Your meeting with {{companyName}} is confirmed

Hi {{firstName}},

You're all set! Here are the details:

📅 Date: {{fullDate}}
🕐 Time: {{time}} {{timezoneDisplay}}
📹 Video Link: {{meetingLink}}
⏱️ Duration: {{duration}} minutes

What we'll cover:
${agendaItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Please have the following ready:
${preparationItems.map((item, i) => `• ${item}`).join('\n')}

Need to reschedule? {{rescheduleLink}}

Looking forward to speaking with you!

{{senderName}}
{{companyName}}
{{senderPhone}}

---
This meeting was scheduled via our calendar booking system.
If you have any questions, please reply to this email.`;

        return personalize(template, {
            firstName: data.firstName,
            companyName: data.companyName,
            fullDate: `${dt.dayOfWeek}, ${dt.monthDay}`,
            time: dt.time,
            timezoneDisplay: dt.timezone,
            meetingLink: data.meetingLink,
            duration: data.duration || 30,
            rescheduleLink: data.rescheduleLink,
            senderName: data.senderName,
            senderPhone: data.senderPhone || ''
        });
    },

    /**
     * 24-hour reminder email
     */
    reminder24Hour: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);

        const template = `Subject: Reminder: Meeting tomorrow with {{companyName}}

Hi {{firstName}},

This is a friendly reminder that we have a meeting scheduled for tomorrow:

📅 Date: {{dayOfWeek}}, {{monthDay}}
🕐 Time: {{time}} {{timezoneDisplay}}
📹 Video Link: {{meetingLink}}

What to prepare:
{{preparationNotes}}

If something comes up and you need to reschedule, no problem! Just use this link:
{{rescheduleLink}}

See you tomorrow!

{{senderName}}
{{companyName}}`;

        return personalize(template, {
            firstName: data.firstName,
            companyName: data.companyName,
            dayOfWeek: dt.dayOfWeek,
            monthDay: dt.monthDay,
            time: dt.time,
            timezoneDisplay: dt.timezone,
            meetingLink: data.meetingLink,
            preparationNotes: data.preparationNotes || 'Please have any relevant documents or questions ready.',
            rescheduleLink: data.rescheduleLink,
            senderName: data.senderName
        });
    },

    /**
     * Reschedule confirmation email
     */
    rescheduleConfirmation: (data) => {
        const oldDt = formatDateTime(data.oldDateTime, data.timezone);
        const newDt = formatDateTime(data.newDateTime, data.timezone);

        const template = `Subject: Your meeting has been rescheduled

Hi {{firstName}},

Your meeting has been successfully rescheduled.

Original time: {{oldFullDate}} at {{oldTime}}
New time: {{newFullDate}} at {{newTime}} {{timezoneDisplay}}

📹 Video Link: {{meetingLink}}
⏱️ Duration: {{duration}} minutes

All other details remain the same.

Looking forward to speaking with you!

{{senderName}}
{{companyName}}`;

        return personalize(template, {
            firstName: data.firstName,
            companyName: data.companyName,
            oldFullDate: `${oldDt.dayOfWeek}, ${oldDt.monthDay}`,
            oldTime: oldDt.time,
            newFullDate: `${newDt.dayOfWeek}, ${newDt.monthDay}`,
            newTime: newDt.time,
            timezoneDisplay: newDt.timezone,
            meetingLink: data.meetingLink,
            duration: data.duration || 30,
            senderName: data.senderName
        });
    },

    /**
     * Cancellation confirmation email
     */
    cancellationConfirmation: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);

        const template = `Subject: Your meeting has been cancelled

Hi {{firstName}},

Your meeting scheduled for {{fullDate}} at {{time}} has been cancelled.

If you'd like to reschedule for a later time, you can book here:
{{bookingLink}}

Or if you have any questions, feel free to reply to this email.

Thanks,
{{senderName}}
{{companyName}}`;

        return personalize(template, {
            firstName: data.firstName,
            companyName: data.companyName,
            fullDate: `${dt.dayOfWeek}, ${dt.monthDay}`,
            time: dt.time,
            bookingLink: data.bookingLink,
            senderName: data.senderName
        });
    },

    /**
     * No-show follow-up email (2 hours after missed meeting)
     */
    noShowFollowUp: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);

        const template = `Subject: We missed you today

Hi {{firstName}},

We had a meeting scheduled for {{time}} {{timezoneDisplay}} today, but it looks like we didn't connect.

No worries! Life happens. If you'd still like to chat, you can reschedule here:
{{bookingLink}}

Or if now isn't the right time, just let me know and I'll follow up later.

Thanks,
{{senderName}}
{{companyName}}`;

        return personalize(template, {
            firstName: data.firstName,
            companyName: data.companyName,
            time: dt.time,
            timezoneDisplay: dt.timezone,
            bookingLink: data.bookingLink,
            senderName: data.senderName
        });
    }
};

// ============================================================================
// SMS CONFIRMATION TEMPLATES
// ============================================================================

const smsConfirmations = {
    /**
     * Initial booking confirmation SMS
     */
    bookingConfirmation: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);
        const shortLink = shortenURL(data.meetingLink);

        const template = `Hi {{firstName}}, your {{meetingType}} with {{companyName}} is confirmed for {{dayOfWeek}} at {{time}} {{timezone}}.
Video: {{meetingLink}}
Reschedule: {{rescheduleLink}}`;

        return personalize(template, {
            firstName: data.firstName,
            meetingType: data.meetingType || 'meeting',
            companyName: data.companyName,
            dayOfWeek: dt.dayOfWeek,
            time: dt.time,
            timezone: dt.timezone,
            meetingLink: shortLink,
            rescheduleLink: shortenURL(data.rescheduleLink)
        });
    },

    /**
     * 24-hour reminder SMS
     */
    reminder24Hour: (data) => {
        const dt = formatDateTime(data.meetingDateTime, data.timezone);
        const shortLink = shortenURL(data.meetingLink);

        const template = `Reminder: Meeting tomorrow at {{time}} {{timezone}} with {{companyName}}.
Video: {{meetingLink}}
Reply CONFIRM to confirm attendance.`;

        return personalize(template, {
            time: dt.time,
            timezone: dt.timezone,
            companyName: data.companyName,
            meetingLink: shortLink
        });
    },

    /**
     * 1-hour reminder SMS
     */
    reminder1Hour: (data) => {
        const shortLink = shortenURL(data.meetingLink);

        const template = `Your meeting with {{companyName}} starts in 1 hour.
Video: {{meetingLink}}`;

        return personalize(template, {
            companyName: data.companyName,
            meetingLink: shortLink
        });
    },

    /**
     * Reschedule request response SMS
     */
    rescheduleOptions: (data) => {
        const slots = data.availableSlots || [];
        const slotTexts = slots.slice(0, 3).map((slot, i) => {
            const dt = formatDateTime(slot.dateTime, slot.timezone);
            return `${i + 1}. ${dt.dayOfWeek} at ${dt.time}`;
        });

        const template = `No problem! Here are some available times:

{{slotOptions}}

Book here: {{bookingLink}}`;

        return personalize(template, {
            slotOptions: slotTexts.join('\n'),
            bookingLink: shortenURL(data.bookingLink)
        });
    },

    /**
     * Cancellation confirmation SMS
     */
    cancellationConfirmation: (data) => {
        const template = `Your meeting with {{companyName}} has been cancelled.
Reschedule anytime: {{bookingLink}}`;

        return personalize(template, {
            companyName: data.companyName,
            bookingLink: shortenURL(data.bookingLink)
        });
    },

    /**
     * No-show immediate follow-up SMS (within 30 minutes)
     */
    noShowImmediate: (data) => {
        const template = `Hi {{firstName}}, we missed you at our meeting today. Everything okay?
Let's reschedule: {{bookingLink}}`;

        return personalize(template, {
            firstName: data.firstName,
            bookingLink: shortenURL(data.bookingLink)
        });
    }
};

// ============================================================================
// MEETING TYPE SPECIFIC TEMPLATES
// ============================================================================

/**
 * Get meeting-specific agenda items
 *
 * @param {string} meetingType - Type of meeting
 * @param {string} vertical - Industry vertical
 * @returns {Array<string>} Agenda items
 */
function getMeetingAgenda(meetingType, vertical) {
    const agendas = {
        'commercial-insurance': {
            'discovery-call': [
                'Review your current insurance coverage',
                'Identify potential gaps or redundancies',
                'Discuss upcoming renewal timeline',
                'Preliminary cost analysis'
            ],
            'insurance-audit': [
                'Deep dive into existing policies',
                'Claims history analysis',
                'Coverage adequacy assessment',
                'Savings opportunity identification'
            ],
            'proposal-review': [
                'Present new policy recommendations',
                'Compare coverage and costs',
                'Answer questions about proposed changes',
                'Discuss implementation timeline'
            ]
        },
        'commercial-real-estate': {
            'property-consultation': [
                'Understand your current vacancy challenges',
                'Review tenant screening process',
                'Identify lead generation gaps',
                'Discuss automation opportunities'
            ],
            'system-demo': [
                'Live demonstration of AI screening',
                'Show integration with existing systems',
                'Calculate ROI for your portfolio',
                'Answer technical questions'
            ],
            'implementation-planning': [
                'Review technical requirements',
                'Plan rollout timeline and milestones',
                'Discuss team training needs',
                'Set success metrics'
            ]
        },
        'recruitment': {
            'optimization-call': [
                'Review current recruiting bottlenecks',
                'Analyze time spent per requisition',
                'Identify sourcing inefficiencies',
                'Discuss automation goals'
            ],
            'technology-demo': [
                'Demonstrate AI candidate sourcing',
                'Show ATS integration options',
                'Review candidate quality metrics',
                'Calculate time savings'
            ],
            'implementation-strategy': [
                'Plan ATS integration approach',
                'Create team training schedule',
                'Define success metrics',
                'Set go-live timeline'
            ]
        }
    };

    return agendas[vertical]?.[meetingType] || [
        'Discuss your current situation',
        'Explore potential solutions',
        'Answer your questions',
        'Determine next steps'
    ];
}

/**
 * Get meeting-specific preparation items
 *
 * @param {string} meetingType - Type of meeting
 * @param {string} vertical - Industry vertical
 * @returns {Array<string>} Preparation items
 */
function getMeetingPreparation(meetingType, vertical) {
    const preparations = {
        'commercial-insurance': {
            'discovery-call': [
                'List of current insurance policies',
                'Upcoming renewal dates',
                'Any recent claims or coverage issues'
            ],
            'insurance-audit': [
                'Current policy documents',
                'Last 3 years of claims history',
                'Any coverage concerns or questions'
            ],
            'proposal-review': [
                'Our proposal document (sent separately)',
                'List of questions about the proposal',
                'Decision timeline'
            ]
        },
        'commercial-real-estate': {
            'property-consultation': [
                'Property portfolio overview',
                'Current vacancy rates',
                'Existing tenant screening process'
            ],
            'system-demo': [
                'Access to your property management system (if applicable)',
                'List of current lead sources',
                'Technical questions prepared'
            ],
            'implementation-planning': [
                'IT/technical requirements list',
                'Team availability for training',
                'Go-live timeline preferences'
            ]
        },
        'recruitment': {
            'optimization-call': [
                'Current recruiting metrics (time-to-fill, etc.)',
                'List of active requisitions',
                'Existing ATS information'
            ],
            'technology-demo': [
                'Sample job descriptions',
                'ATS access (if comfortable sharing)',
                'Technical questions prepared'
            ],
            'implementation-strategy': [
                'ATS technical documentation',
                'Team training availability',
                'Success metric goals'
            ]
        }
    };

    return preparations[vertical]?.[meetingType] || [
        'Any relevant documents or information',
        'List of questions or concerns',
        'Your availability for next steps'
    ];
}

// ============================================================================
// MAIN TEMPLATE GENERATOR
// ============================================================================

/**
 * Generate email confirmation
 *
 * @param {string} templateType - Type of template (bookingConfirmation, reminder24Hour, etc.)
 * @param {Object} data - Template data
 * @returns {string} Generated email content
 */
function generateEmailConfirmation(templateType, data) {
    // Add meeting-specific agenda and preparation if applicable
    if (data.meetingType && data.vertical && !data.agendaItems) {
        data.agendaItems = getMeetingAgenda(data.meetingType, data.vertical);
    }

    if (data.meetingType && data.vertical && !data.preparationItems) {
        data.preparationItems = getMeetingPreparation(data.meetingType, data.vertical);
    }

    const generator = emailConfirmations[templateType];
    if (!generator) {
        throw new Error(`Unknown email template type: ${templateType}`);
    }

    return generator(data);
}

/**
 * Generate SMS confirmation
 *
 * @param {string} templateType - Type of template (bookingConfirmation, reminder24Hour, etc.)
 * @param {Object} data - Template data
 * @returns {string} Generated SMS content
 */
function generateSMSConfirmation(templateType, data) {
    const generator = smsConfirmations[templateType];
    if (!generator) {
        throw new Error(`Unknown SMS template type: ${templateType}`);
    }

    return generator(data);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    generateEmailConfirmation,
    generateSMSConfirmation,
    generateICalendar,
    formatDateTime,
    getMeetingAgenda,
    getMeetingPreparation,
    personalize
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Generate booking confirmation email
 *
 * const { generateEmailConfirmation, generateSMSConfirmation, generateICalendar } = require('./booking-confirmations');
 *
 * const bookingData = {
 *   firstName: 'John',
 *   companyName: 'ABC Insurance Corp',
 *   meetingDateTime: '2026-01-25T14:00:00-06:00',
 *   timezone: 'America/Chicago',
 *   meetingLink: 'https://zoom.us/j/123456789',
 *   rescheduleLink: 'https://calendar.example.com/reschedule/abc123',
 *   duration: 30,
 *   meetingType: 'discovery-call',
 *   vertical: 'commercial-insurance',
 *   senderName: 'Sarah Johnson',
 *   senderPhone: '+1-312-555-0100'
 * };
 *
 * // Generate confirmation email
 * const email = generateEmailConfirmation('bookingConfirmation', bookingData);
 * console.log(email);
 *
 * // Generate confirmation SMS
 * const sms = generateSMSConfirmation('bookingConfirmation', bookingData);
 * console.log(sms);
 *
 * // Generate calendar invite (.ics file)
 * const icsData = {
 *   title: 'ABC Insurance Corp - Discovery Call',
 *   description: 'Discuss insurance optimization opportunities',
 *   location: 'https://zoom.us/j/123456789',
 *   startDateTime: '2026-01-25T14:00:00-06:00',
 *   endDateTime: '2026-01-25T14:30:00-06:00',
 *   organizerEmail: 'sarah@agency.com',
 *   attendeeEmail: 'john.smith@abcinsurance.com'
 * };
 * const icsFile = generateICalendar(icsData);
 * console.log(icsFile);
 *
 * // Generate 24-hour reminder
 * const reminder = generateEmailConfirmation('reminder24Hour', bookingData);
 * console.log(reminder);
 *
 * // Generate no-show follow-up
 * const noShow = generateSMSConfirmation('noShowImmediate', {
 *   firstName: 'John',
 *   bookingLink: 'https://calendar.example.com/book/abc123'
 * });
 * console.log(noShow);
 */
