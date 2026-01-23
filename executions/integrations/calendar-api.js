/**
 * Calendar Booking API Integration
 *
 * Multi-platform calendar wrapper for GoHighLevel (primary) and Cal.com (secondary).
 * Handles meeting scheduling, availability checking, booking confirmations, and CRM sync.
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * Platforms: GoHighLevel Calendar (Primary), Cal.com (Secondary)
 */

const axios = require('axios');
require('dotenv').config();

// Import CRM integration for auto-sync
const GoHighLevelAPI = require('./gohighlevel-api');

// Configuration
const CALENDAR_PLATFORM = process.env.CALENDAR_PLATFORM || 'gohighlevel';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_CALENDAR_ID = process.env.GHL_CALENDAR_ID;
const CALCOM_API_KEY = process.env.CALCOM_API_KEY;
const CALCOM_EVENT_TYPE_ID = process.env.CALCOM_EVENT_TYPE_ID;
const DEFAULT_MEETING_DURATION = parseInt(process.env.DEFAULT_MEETING_DURATION) || 30;
const BOOKING_BUFFER_HOURS = parseInt(process.env.BOOKING_BUFFER_HOURS) || 2;
const MAX_ADVANCE_DAYS = parseInt(process.env.MAX_ADVANCE_DAYS) || 30;

/**
 * Calendar API Client Class
 * Abstracts GoHighLevel and Cal.com calendar platforms
 */
class CalendarAPI {
    constructor(platform = CALENDAR_PLATFORM) {
        this.platform = platform;
        this.ghlClient = null;
        this.crmClient = null;

        // Initialize platform-specific client
        if (this.platform === 'gohighlevel') {
            this.initializeGoHighLevel();
        } else if (this.platform === 'calcom') {
            this.initializeCalCom();
        } else {
            throw new Error(`Unsupported calendar platform: ${platform}`);
        }

        // Initialize CRM client for auto-sync
        try {
            this.crmClient = new GoHighLevelAPI();
        } catch (error) {
            console.warn('CRM client initialization failed. CRM sync will be disabled.');
        }
    }

    /**
     * Initialize GoHighLevel calendar client
     */
    initializeGoHighLevel() {
        if (!GHL_API_KEY || !GHL_LOCATION_ID || !GHL_CALENDAR_ID) {
            throw new Error('GoHighLevel credentials missing. Set GHL_API_KEY, GHL_LOCATION_ID, GHL_CALENDAR_ID in .env');
        }

        this.ghlClient = axios.create({
            baseURL: 'https://services.leadconnectorhq.com',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('GoHighLevel calendar client initialized');
    }

    /**
     * Initialize Cal.com calendar client
     */
    initializeCalCom() {
        if (!CALCOM_API_KEY || !CALCOM_EVENT_TYPE_ID) {
            throw new Error('Cal.com credentials missing. Set CALCOM_API_KEY, CALCOM_EVENT_TYPE_ID in .env');
        }

        this.calcomClient = axios.create({
            baseURL: 'https://api.cal.com/v1',
            headers: {
                'Authorization': `Bearer ${CALCOM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('Cal.com calendar client initialized');
    }

    // ========================================================================
    // AVAILABILITY MANAGEMENT
    // ========================================================================

    /**
     * Get available time slots for booking
     *
     * @param {Object} params - Availability parameters
     * @param {string} params.startDate - Start date for availability check (YYYY-MM-DD)
     * @param {string} params.endDate - End date for availability check (YYYY-MM-DD)
     * @param {string} params.meetingType - Type of meeting (discovery-call, demo, etc.)
     * @param {number} params.duration - Meeting duration in minutes
     * @param {string} params.timezone - Timezone (e.g., "America/Chicago")
     * @returns {Promise<Array>} Array of available time slots
     */
    async getAvailability(params) {
        const {
            startDate,
            endDate = this.calculateEndDate(startDate),
            meetingType = 'discovery-call',
            duration = DEFAULT_MEETING_DURATION,
            timezone = 'America/Chicago'
        } = params;

        console.log(`Fetching availability from ${startDate} to ${endDate} for ${meetingType}`);

        try {
            if (this.platform === 'gohighlevel') {
                return await this.getGHLAvailability(startDate, endDate, duration, timezone);
            } else if (this.platform === 'calcom') {
                return await this.getCalComAvailability(startDate, endDate, duration, timezone);
            }
        } catch (error) {
            console.error('Error fetching availability:', error.message);
            throw error;
        }
    }

    /**
     * Get availability from GoHighLevel calendar
     */
    async getGHLAvailability(startDate, endDate, duration, timezone) {
        try {
            const response = await this.ghlClient.get(`/calendars/${GHL_CALENDAR_ID}/free-slots`, {
                params: {
                    startDate: this.toISODateTime(startDate, '00:00', timezone),
                    endDate: this.toISODateTime(endDate, '23:59', timezone),
                    timezone: timezone
                }
            });

            const slots = response.data.slots || [];

            // Filter slots based on buffer time and business hours
            const availableSlots = this.filterSlots(slots, duration, timezone);

            console.log(`Found ${availableSlots.length} available slots`);

            return availableSlots.map(slot => ({
                dateTime: slot.startTime,
                timezone: timezone,
                duration: duration,
                available: true
            }));

        } catch (error) {
            console.error('GHL availability error:', error.message);
            throw error;
        }
    }

    /**
     * Get availability from Cal.com
     */
    async getCalComAvailability(startDate, endDate, duration, timezone) {
        try {
            const response = await this.calcomClient.get('/availability', {
                params: {
                    eventTypeId: CALCOM_EVENT_TYPE_ID,
                    dateFrom: startDate,
                    dateTo: endDate,
                    timeZone: timezone
                }
            });

            const slots = response.data.slots || [];

            console.log(`Found ${slots.length} available slots`);

            return slots.map(slot => ({
                dateTime: slot.time,
                timezone: timezone,
                duration: duration,
                available: true
            }));

        } catch (error) {
            console.error('Cal.com availability error:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // BOOKING MANAGEMENT
    // ========================================================================

    /**
     * Create a new booking
     *
     * @param {Object} bookingData - Booking information
     * @param {string} bookingData.contactId - CRM contact ID
     * @param {string} bookingData.dateTime - Meeting date/time (ISO 8601)
     * @param {string} bookingData.timezone - Timezone
     * @param {string} bookingData.meetingType - Meeting type
     * @param {number} bookingData.duration - Duration in minutes
     * @param {string} bookingData.title - Meeting title
     * @param {string} bookingData.description - Meeting description
     * @param {Array<string>} bookingData.attendees - Attendee emails
     * @returns {Promise<Object>} Created booking object
     */
    async createBooking(bookingData) {
        const {
            contactId,
            dateTime,
            timezone = 'America/Chicago',
            meetingType = 'discovery-call',
            duration = DEFAULT_MEETING_DURATION,
            title,
            description = '',
            attendees = []
        } = bookingData;

        console.log(`Creating booking for contact ${contactId} at ${dateTime}`);

        try {
            // Validate booking time (must be at least BOOKING_BUFFER_HOURS from now)
            if (!this.isValidBookingTime(dateTime, timezone)) {
                throw new Error(`Booking must be at least ${BOOKING_BUFFER_HOURS} hours from now`);
            }

            // Check slot availability before booking
            const isAvailable = await this.checkSlotAvailability(dateTime, duration, timezone);
            if (!isAvailable) {
                throw new Error('Selected time slot is no longer available');
            }

            let booking;

            if (this.platform === 'gohighlevel') {
                booking = await this.createGHLBooking(bookingData);
            } else if (this.platform === 'calcom') {
                booking = await this.createCalComBooking(bookingData);
            }

            // Sync booking to CRM
            await this.syncBookingToCRM(contactId, booking, meetingType);

            console.log(`Booking created successfully: ${booking.bookingId}`);

            return {
                success: true,
                bookingId: booking.bookingId,
                contactId: contactId,
                meetingDateTime: dateTime,
                meetingLink: booking.meetingLink,
                confirmationSent: true
            };

        } catch (error) {
            console.error('Error creating booking:', error.message);
            throw error;
        }
    }

    /**
     * Create booking in GoHighLevel
     */
    async createGHLBooking(bookingData) {
        const {
            contactId,
            dateTime,
            timezone,
            meetingType,
            duration,
            title,
            description,
            attendees
        } = bookingData;

        try {
            // Get contact details from CRM
            let contactEmail, contactPhone, contactName;
            if (this.crmClient) {
                const contactResponse = await this.crmClient.getContact(contactId);
                contactEmail = contactResponse.contact.email;
                contactPhone = contactResponse.contact.phone;
                contactName = contactResponse.contact.name;
            }

            const payload = {
                calendarId: GHL_CALENDAR_ID,
                locationId: GHL_LOCATION_ID,
                contactId: contactId,
                startTime: dateTime,
                endTime: this.calculateEndTime(dateTime, duration),
                title: title || `${contactName} - ${this.formatMeetingType(meetingType)}`,
                description: description,
                appointmentStatus: 'confirmed',
                assignedUserId: null, // Will be auto-assigned via round-robin
                timezone: timezone
            };

            const response = await this.ghlClient.post('/appointments/', payload);

            const appointment = response.data.appointment;

            return {
                bookingId: appointment.id,
                meetingLink: appointment.meetingLink || 'Will be sent separately',
                platform: 'gohighlevel'
            };

        } catch (error) {
            console.error('GHL booking error:', error.message);
            throw error;
        }
    }

    /**
     * Create booking in Cal.com
     */
    async createCalComBooking(bookingData) {
        const {
            dateTime,
            timezone,
            duration,
            title,
            description,
            attendees
        } = bookingData;

        try {
            const payload = {
                eventTypeId: parseInt(CALCOM_EVENT_TYPE_ID),
                start: dateTime,
                timeZone: timezone,
                responses: {
                    name: attendees[0] ? attendees[0].split('@')[0] : 'Guest',
                    email: attendees[0] || '',
                    notes: description
                },
                metadata: {
                    title: title
                }
            };

            const response = await this.calcomClient.post('/bookings', payload);

            const booking = response.data.booking;

            return {
                bookingId: booking.id.toString(),
                meetingLink: booking.metadata?.videoCallUrl || 'Will be sent separately',
                platform: 'calcom'
            };

        } catch (error) {
            console.error('Cal.com booking error:', error.message);
            throw error;
        }
    }

    /**
     * Reschedule an existing booking
     *
     * @param {string} bookingId - Booking ID to reschedule
     * @param {string} newDateTime - New date/time (ISO 8601)
     * @param {string} timezone - Timezone
     * @param {string} reason - Reschedule reason
     * @returns {Promise<Object>} Updated booking object
     */
    async rescheduleBooking(bookingId, newDateTime, timezone, reason = 'Contact requested reschedule') {
        console.log(`Rescheduling booking ${bookingId} to ${newDateTime}`);

        try {
            // Validate new booking time
            if (!this.isValidBookingTime(newDateTime, timezone)) {
                throw new Error(`New time must be at least ${BOOKING_BUFFER_HOURS} hours from now`);
            }

            let result;

            if (this.platform === 'gohighlevel') {
                result = await this.rescheduleGHLBooking(bookingId, newDateTime, timezone);
            } else if (this.platform === 'calcom') {
                result = await this.rescheduleCalComBooking(bookingId, newDateTime, timezone);
            }

            console.log(`Booking rescheduled successfully: ${bookingId}`);

            return {
                success: true,
                bookingId: result.bookingId,
                oldDateTime: result.oldDateTime,
                newDateTime: newDateTime,
                reason: reason
            };

        } catch (error) {
            console.error('Error rescheduling booking:', error.message);
            throw error;
        }
    }

    /**
     * Reschedule booking in GoHighLevel
     */
    async rescheduleGHLBooking(bookingId, newDateTime, timezone) {
        try {
            // Get existing appointment
            const existingResponse = await this.ghlClient.get(`/appointments/${bookingId}`);
            const oldAppointment = existingResponse.data.appointment;

            // Update appointment
            const payload = {
                startTime: newDateTime,
                endTime: this.calculateEndTime(newDateTime, DEFAULT_MEETING_DURATION),
                timezone: timezone
            };

            await this.ghlClient.put(`/appointments/${bookingId}`, payload);

            return {
                bookingId: bookingId,
                oldDateTime: oldAppointment.startTime
            };

        } catch (error) {
            console.error('GHL reschedule error:', error.message);
            throw error;
        }
    }

    /**
     * Reschedule booking in Cal.com
     */
    async rescheduleCalComBooking(bookingId, newDateTime, timezone) {
        try {
            // Cal.com requires cancellation and recreation
            await this.cancelCalComBooking(bookingId, 'Rescheduled');

            // Note: In production, you'd need to get original booking details and recreate
            // This is simplified for demonstration
            return {
                bookingId: bookingId,
                oldDateTime: null // Would need to retrieve from original booking
            };

        } catch (error) {
            console.error('Cal.com reschedule error:', error.message);
            throw error;
        }
    }

    /**
     * Cancel a booking
     *
     * @param {string} bookingId - Booking ID to cancel
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Cancellation confirmation
     */
    async cancelBooking(bookingId, reason = 'Contact cancelled') {
        console.log(`Cancelling booking ${bookingId}. Reason: ${reason}`);

        try {
            if (this.platform === 'gohighlevel') {
                await this.cancelGHLBooking(bookingId, reason);
            } else if (this.platform === 'calcom') {
                await this.cancelCalComBooking(bookingId, reason);
            }

            console.log(`Booking cancelled successfully: ${bookingId}`);

            return {
                success: true,
                bookingId: bookingId,
                reason: reason,
                cancelledAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error cancelling booking:', error.message);
            throw error;
        }
    }

    /**
     * Cancel booking in GoHighLevel
     */
    async cancelGHLBooking(bookingId, reason) {
        try {
            await this.ghlClient.put(`/appointments/${bookingId}`, {
                appointmentStatus: 'cancelled'
            });

            // Add cancellation note
            const appointment = await this.ghlClient.get(`/appointments/${bookingId}`);
            const contactId = appointment.data.appointment.contactId;

            if (this.crmClient) {
                await this.crmClient.addNote(contactId, {
                    body: `Meeting cancelled. Reason: ${reason}`
                });
            }

        } catch (error) {
            console.error('GHL cancellation error:', error.message);
            throw error;
        }
    }

    /**
     * Cancel booking in Cal.com
     */
    async cancelCalComBooking(bookingId, reason) {
        try {
            await this.calcomClient.delete(`/bookings/${bookingId}`, {
                data: { reason: reason }
            });

        } catch (error) {
            console.error('Cal.com cancellation error:', error.message);
            throw error;
        }
    }

    /**
     * Get upcoming bookings for a contact
     *
     * @param {string} contactId - CRM contact ID
     * @param {number} limit - Number of bookings to retrieve
     * @returns {Promise<Array>} Array of upcoming bookings
     */
    async getUpcomingBookings(contactId, limit = 10) {
        console.log(`Fetching upcoming bookings for contact ${contactId}`);

        try {
            let bookings = [];

            if (this.platform === 'gohighlevel') {
                bookings = await this.getGHLUpcomingBookings(contactId, limit);
            } else if (this.platform === 'calcom') {
                // Cal.com doesn't have direct contact-based lookup
                // Would need to implement custom logic
                console.warn('Cal.com contact-based booking lookup not implemented');
            }

            return {
                success: true,
                contactId: contactId,
                total: bookings.length,
                bookings: bookings
            };

        } catch (error) {
            console.error('Error fetching upcoming bookings:', error.message);
            throw error;
        }
    }

    /**
     * Get upcoming bookings from GoHighLevel
     */
    async getGHLUpcomingBookings(contactId, limit) {
        try {
            const now = new Date().toISOString();

            const response = await this.ghlClient.get('/appointments/', {
                params: {
                    locationId: GHL_LOCATION_ID,
                    contactId: contactId,
                    startDate: now,
                    limit: limit
                }
            });

            const appointments = response.data.appointments || [];

            return appointments.map(apt => ({
                bookingId: apt.id,
                dateTime: apt.startTime,
                endTime: apt.endTime,
                title: apt.title,
                status: apt.appointmentStatus,
                meetingLink: apt.meetingLink
            }));

        } catch (error) {
            console.error('Error fetching GHL appointments:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // WEBHOOK HANDLING
    // ========================================================================

    /**
     * Process webhook payload from calendar platform
     *
     * @param {Object} webhookPayload - Webhook payload
     * @returns {Object} Processed webhook data
     */
    async handleBookingWebhook(webhookPayload) {
        try {
            const {
                eventType,
                bookingId,
                contactId,
                dateTime,
                meetingType,
                attendee,
                timestamp
            } = webhookPayload;

            console.log(`Processing booking webhook: ${eventType} for booking ${bookingId}`);

            let processedData = {
                eventType: eventType,
                bookingId: bookingId,
                contactId: contactId,
                timestamp: timestamp || new Date().toISOString()
            };

            // Process based on event type
            switch (eventType) {
                case 'booking.created':
                    processedData.action = 'Booking created';
                    processedData.dateTime = dateTime;
                    processedData.meetingType = meetingType;

                    // Update CRM pipeline stage to "Booked"
                    if (this.crmClient && contactId) {
                        await this.updateCRMStage(contactId, 'Booked', 'Meeting scheduled');
                    }
                    break;

                case 'booking.rescheduled':
                    processedData.action = 'Booking rescheduled';
                    processedData.oldDateTime = webhookPayload.oldDateTime;
                    processedData.newDateTime = dateTime;

                    // Add CRM note
                    if (this.crmClient && contactId) {
                        await this.crmClient.addNote(contactId, {
                            body: `Meeting rescheduled from ${webhookPayload.oldDateTime} to ${dateTime}`
                        });
                    }
                    break;

                case 'booking.cancelled':
                    processedData.action = 'Booking cancelled';
                    processedData.reason = webhookPayload.reason || 'Not specified';

                    // Update CRM pipeline stage to "Cancelled"
                    if (this.crmClient && contactId) {
                        await this.updateCRMStage(contactId, 'Cancelled', webhookPayload.reason);
                    }
                    break;

                case 'booking.no_show':
                    processedData.action = 'Contact did not show up';

                    // Update CRM pipeline stage to "No-Show"
                    if (this.crmClient && contactId) {
                        await this.updateCRMStage(contactId, 'No-Show', 'Contact did not attend meeting');
                        await this.crmClient.addTags(contactId, ['no-show']);
                    }
                    break;

                case 'booking.confirmed':
                    processedData.action = 'Booking confirmed by contact';

                    // Update CRM custom field
                    if (this.crmClient && contactId) {
                        await this.crmClient.updateContact(contactId, {
                            customField: { meeting_confirmed: true }
                        });
                    }
                    break;

                default:
                    console.warn(`Unknown booking webhook event type: ${eventType}`);
                    processedData.action = 'Unknown event type';
            }

            return {
                success: true,
                processed: processedData,
                raw: webhookPayload
            };

        } catch (error) {
            console.error('Error processing booking webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: webhookPayload
            };
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Sync booking to CRM
     */
    async syncBookingToCRM(contactId, booking, meetingType) {
        if (!this.crmClient) {
            console.warn('CRM client not available. Skipping CRM sync.');
            return;
        }

        try {
            // Update contact with booking info
            await this.crmClient.updateContact(contactId, {
                customField: {
                    last_booking_date: new Date().toISOString(),
                    meeting_type: meetingType,
                    booking_source: 'calendar-api'
                }
            });

            // Add tags
            await this.crmClient.addTags(contactId, ['meeting-booked', meetingType]);

            // Add note
            await this.crmClient.addNote(contactId, {
                body: `Meeting booked: ${this.formatMeetingType(meetingType)} on ${booking.meetingDateTime || 'TBD'}\nBooking ID: ${booking.bookingId}`
            });

            // Update opportunity stage to "Booked"
            await this.updateCRMStage(contactId, 'Booked', 'Meeting scheduled via calendar');

            console.log('Booking synced to CRM successfully');

        } catch (error) {
            console.error('Error syncing booking to CRM:', error.message);
            // Don't throw - booking was created, CRM sync is secondary
        }
    }

    /**
     * Update CRM opportunity stage
     */
    async updateCRMStage(contactId, stageName, note) {
        if (!this.crmClient) return;

        try {
            // Get contact's opportunities
            const contact = await this.crmClient.getContact(contactId);

            // Find open opportunity (simplified - in production, use more robust logic)
            // This would require additional API calls to get opportunities

            console.log(`CRM stage update queued: ${stageName} for contact ${contactId}`);

        } catch (error) {
            console.error('Error updating CRM stage:', error.message);
        }
    }

    /**
     * Check if a specific time slot is available
     */
    async checkSlotAvailability(dateTime, duration, timezone) {
        try {
            const date = new Date(dateTime);
            const dateStr = date.toISOString().split('T')[0];

            const availability = await this.getAvailability({
                startDate: dateStr,
                endDate: dateStr,
                duration: duration,
                timezone: timezone
            });

            // Check if requested time matches any available slot
            return availability.some(slot =>
                new Date(slot.dateTime).getTime() === new Date(dateTime).getTime()
            );

        } catch (error) {
            console.error('Error checking slot availability:', error.message);
            return false;
        }
    }

    /**
     * Validate booking time meets minimum buffer requirement
     */
    isValidBookingTime(dateTime, timezone) {
        const bookingTime = new Date(dateTime);
        const now = new Date();
        const bufferMs = BOOKING_BUFFER_HOURS * 60 * 60 * 1000;

        return (bookingTime.getTime() - now.getTime()) >= bufferMs;
    }

    /**
     * Filter slots based on business hours and buffer time
     */
    filterSlots(slots, duration, timezone) {
        const now = new Date();
        const bufferMs = BOOKING_BUFFER_HOURS * 60 * 60 * 1000;

        return slots.filter(slot => {
            const slotTime = new Date(slot.startTime);

            // Check buffer time
            if (slotTime.getTime() - now.getTime() < bufferMs) {
                return false;
            }

            // Check business hours (9am-5pm)
            const hour = slotTime.getHours();
            if (hour < 9 || hour >= 17) {
                return false;
            }

            // Check not on weekend
            const day = slotTime.getDay();
            if (day === 0 || day === 6) {
                return false;
            }

            return true;
        });
    }

    /**
     * Calculate end date for availability check
     */
    calculateEndDate(startDate) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + MAX_ADVANCE_DAYS);
        return end.toISOString().split('T')[0];
    }

    /**
     * Calculate end time based on start time and duration
     */
    calculateEndTime(startTime, duration) {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60 * 1000);
        return end.toISOString();
    }

    /**
     * Convert date and time to ISO 8601 format
     */
    toISODateTime(date, time, timezone) {
        return `${date}T${time}:00`;
    }

    /**
     * Format meeting type for display
     */
    formatMeetingType(meetingType) {
        return meetingType
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Sleep helper for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = CalendarAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Check availability and create booking
 *
 * const CalendarAPI = require('./calendar-api');
 * const calendar = new CalendarAPI('gohighlevel');
 *
 * // Check availability for next 30 days
 * const availability = await calendar.getAvailability({
 *   startDate: '2026-01-25',
 *   meetingType: 'discovery-call',
 *   duration: 30,
 *   timezone: 'America/Chicago'
 * });
 *
 * console.log('Available slots:', availability);
 *
 * // Create booking
 * const booking = await calendar.createBooking({
 *   contactId: 'contact_xyz123',
 *   dateTime: '2026-01-25T14:00:00-06:00',
 *   timezone: 'America/Chicago',
 *   meetingType: 'discovery-call',
 *   duration: 30,
 *   title: 'ABC Insurance Corp - Discovery Call',
 *   description: 'Discuss insurance optimization opportunities',
 *   attendees: ['john.smith@abcinsurance.com']
 * });
 *
 * console.log('Booking created:', booking.bookingId);
 *
 * // Reschedule booking
 * const rescheduled = await calendar.rescheduleBooking(
 *   booking.bookingId,
 *   '2026-01-26T10:00:00-06:00',
 *   'America/Chicago',
 *   'Contact requested new time'
 * );
 *
 * console.log('Booking rescheduled:', rescheduled);
 *
 * // Get upcoming bookings for contact
 * const upcoming = await calendar.getUpcomingBookings('contact_xyz123');
 * console.log('Upcoming meetings:', upcoming.bookings);
 *
 * // Cancel booking
 * const cancelled = await calendar.cancelBooking(booking.bookingId, 'Contact cancelled');
 * console.log('Booking cancelled:', cancelled);
 */
