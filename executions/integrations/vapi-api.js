/**
 * Vapi.ai Voice Agent API Integration
 *
 * Wrapper for Vapi.ai API to manage AI voice assistants.
 * Handles assistant creation, outbound calls, call transcripts, and webhooks.
 *
 * @version 1.0.0
 * @requires axios
 * @requires dotenv
 *
 * API Documentation: https://docs.vapi.ai/api-reference
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY;
const VAPI_PHONE_NUMBER = process.env.VAPI_PHONE_NUMBER;
const VAPI_BASE_URL = 'https://api.vapi.ai';
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Vapi.ai API Client Class
 */
class VapiAPI {
    constructor(apiKey = VAPI_API_KEY) {
        if (!apiKey) {
            throw new Error('VAPI_API_KEY is required. Set it in your .env file.');
        }

        this.apiKey = apiKey;
        this.baseURL = VAPI_BASE_URL;
        this.phoneNumber = VAPI_PHONE_NUMBER;

        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        );
    }

    // ========================================================================
    // ASSISTANT MANAGEMENT
    // ========================================================================

    /**
     * Create a new voice assistant
     *
     * @param {Object} assistantConfig - Assistant configuration
     * @param {string} assistantConfig.name - Assistant name
     * @param {string} assistantConfig.vertical - Target vertical (insurance, real-estate, recruitment)
     * @param {Object} assistantConfig.voiceSettings - Voice configuration
     * @param {string} assistantConfig.firstMessage - Greeting message
     * @param {Array<Object>} assistantConfig.functions - Custom functions for assistant
     * @returns {Promise<Object>} Created assistant object
     */
    async createAssistant(assistantConfig) {
        try {
            const {
                name,
                vertical,
                voiceSettings = {},
                firstMessage,
                functions = [],
                model = 'gpt-4',
                temperature = 0.7,
                systemPrompt = null
            } = assistantConfig;

            if (!name || !vertical || !firstMessage) {
                throw new Error('name, vertical, and firstMessage are required');
            }

            // Default voice settings by vertical
            const defaultVoiceSettings = this.getDefaultVoiceSettings(vertical);
            const mergedVoiceSettings = { ...defaultVoiceSettings, ...voiceSettings };

            // Build system prompt based on vertical
            const finalSystemPrompt = systemPrompt || this.buildSystemPrompt(vertical);

            const payload = {
                name: name,
                model: {
                    provider: 'openai',
                    model: model,
                    temperature: temperature,
                    systemPrompt: finalSystemPrompt
                },
                voice: mergedVoiceSettings,
                firstMessage: firstMessage,
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-2',
                    language: 'en-US'
                },
                recordingEnabled: true,
                endCallFunctionEnabled: true,
                silenceTimeoutSeconds: 30,
                maxDurationSeconds: 600, // 10 minute max call
                backgroundSound: 'office', // office ambiance for professionalism
                functions: functions,
                serverUrl: `${WEBHOOK_BASE_URL}/vapi/webhooks`,
                metadata: {
                    vertical: vertical,
                    created: new Date().toISOString()
                }
            };

            console.log(`Creating assistant: ${name} (${vertical})`);

            const response = await this.client.post('/assistant', payload);

            console.log(`Assistant created successfully: ${response.data.id}`);

            return {
                success: true,
                assistantId: response.data.id,
                assistant: response.data,
                message: 'Assistant created successfully'
            };

        } catch (error) {
            console.error('Error creating assistant:', error.message);
            throw error;
        }
    }

    /**
     * Get default voice settings by vertical
     */
    getDefaultVoiceSettings(vertical) {
        const voiceConfigs = {
            insurance: {
                provider: 'elevenlabs',
                voiceId: 'rachel', // Professional female voice
                stability: 0.8,
                similarityBoost: 0.75,
                speed: 1.1
            },
            'real-estate': {
                provider: 'elevenlabs',
                voiceId: 'alex', // Friendly male voice
                stability: 0.75,
                similarityBoost: 0.8,
                speed: 1.0
            },
            recruitment: {
                provider: 'elevenlabs',
                voiceId: 'sam', // Neutral voice
                stability: 0.85,
                similarityBoost: 0.7,
                speed: 1.05
            }
        };

        return voiceConfigs[vertical] || voiceConfigs.insurance;
    }

    /**
     * Build system prompt based on vertical
     */
    buildSystemPrompt(vertical) {
        const prompts = {
            insurance: `You are a professional voice assistant for a commercial insurance brokerage.
Your role is to:
1. Greet callers warmly and professionally
2. Qualify leads by asking about their business, employee count, current insurance, and timeline
3. Handle objections gracefully and redirect to value
4. Book 15-minute consultation calls with qualified decision-makers
5. Transfer to human agent if requested or if lead is highly qualified

Be conversational but efficient. Keep responses under 3 sentences. Ask one question at a time.`,

            'real-estate': `You are a friendly voice assistant for a commercial real estate technology company.
Your role is to:
1. Greet callers with energy and enthusiasm
2. Qualify leads by asking about property type, vacancies, and current challenges
3. Position the solution as a time-saver for property managers
4. Book 15-minute demo calls with property owners or managers
5. Transfer to human agent if requested or if lead has urgent vacancy

Be upbeat and solution-focused. Keep responses concise. Ask one question at a time.`,

            recruitment: `You are an efficient voice assistant for a recruiting automation company.
Your role is to:
1. Greet callers clearly and set expectations
2. Qualify leads by asking about recruiting volume, team size, and pain points
3. Focus on time savings and placement efficiency
4. Book 15-minute demo calls with recruiting decision-makers
5. Transfer to human agent if requested or if lead has immediate hiring need

Be professional and time-conscious. Keep responses brief. Ask one question at a time.`
        };

        return prompts[vertical] || prompts.insurance;
    }

    /**
     * Update an existing assistant
     *
     * @param {string} assistantId - Assistant ID to update
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated assistant object
     */
    async updateAssistant(assistantId, updates) {
        try {
            if (!assistantId) {
                throw new Error('Assistant ID is required');
            }

            console.log(`Updating assistant: ${assistantId}`);

            const response = await this.client.patch(`/assistant/${assistantId}`, updates);

            console.log('Assistant updated successfully');

            return {
                success: true,
                assistantId: assistantId,
                assistant: response.data,
                message: 'Assistant updated successfully'
            };

        } catch (error) {
            console.error('Error updating assistant:', error.message);
            throw error;
        }
    }

    /**
     * Get assistant by ID
     *
     * @param {string} assistantId - Assistant ID
     * @returns {Promise<Object>} Assistant object
     */
    async getAssistant(assistantId) {
        try {
            if (!assistantId) {
                throw new Error('Assistant ID is required');
            }

            console.log(`Fetching assistant: ${assistantId}`);

            const response = await this.client.get(`/assistant/${assistantId}`);

            return {
                success: true,
                assistant: response.data
            };

        } catch (error) {
            console.error('Error fetching assistant:', error.message);
            throw error;
        }
    }

    /**
     * List all assistants
     *
     * @returns {Promise<Object>} Array of assistants
     */
    async listAssistants() {
        try {
            console.log('Fetching all assistants');

            const response = await this.client.get('/assistant');

            return {
                success: true,
                total: response.data.length,
                assistants: response.data
            };

        } catch (error) {
            console.error('Error fetching assistants:', error.message);
            throw error;
        }
    }

    /**
     * Delete an assistant
     *
     * @param {string} assistantId - Assistant ID to delete
     * @returns {Promise<Object>} Result
     */
    async deleteAssistant(assistantId) {
        try {
            if (!assistantId) {
                throw new Error('Assistant ID is required');
            }

            console.log(`Deleting assistant: ${assistantId}`);

            await this.client.delete(`/assistant/${assistantId}`);

            console.log('Assistant deleted successfully');

            return {
                success: true,
                assistantId: assistantId,
                message: 'Assistant deleted successfully'
            };

        } catch (error) {
            console.error('Error deleting assistant:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // PHONE CALL MANAGEMENT
    // ========================================================================

    /**
     * Make an outbound call
     *
     * @param {Object} callData - Call configuration
     * @param {string} callData.assistantId - Assistant ID to use for call
     * @param {string} callData.phoneNumber - Phone number to call (E.164 format)
     * @param {string} callData.contactId - CRM contact ID (for context injection)
     * @param {Object} callData.context - Additional context to pass to assistant
     * @returns {Promise<Object>} Call object
     */
    async makeOutboundCall(callData) {
        try {
            const {
                assistantId,
                phoneNumber,
                contactId = null,
                context = {},
                name = null
            } = callData;

            if (!assistantId || !phoneNumber) {
                throw new Error('assistantId and phoneNumber are required');
            }

            // Validate phone number format (E.164)
            if (!phoneNumber.match(/^\+\d{10,15}$/)) {
                throw new Error('Phone number must be in E.164 format (e.g., +13125551234)');
            }

            const payload = {
                assistantId: assistantId,
                customer: {
                    number: phoneNumber,
                    name: name
                },
                phoneNumberId: this.phoneNumber,
                metadata: {
                    contactId: contactId,
                    callType: 'outbound',
                    context: context,
                    timestamp: new Date().toISOString()
                }
            };

            console.log(`Making outbound call to ${phoneNumber} (Contact: ${contactId})`);

            const response = await this.client.post('/call/phone', payload);

            console.log(`Call initiated successfully: ${response.data.id}`);

            return {
                success: true,
                callId: response.data.id,
                call: response.data,
                message: 'Outbound call initiated successfully'
            };

        } catch (error) {
            console.error('Error making outbound call:', error.message);
            throw error;
        }
    }

    /**
     * Get call details by ID
     *
     * @param {string} callId - Call ID
     * @returns {Promise<Object>} Call object with full details
     */
    async getCall(callId) {
        try {
            if (!callId) {
                throw new Error('Call ID is required');
            }

            console.log(`Fetching call: ${callId}`);

            const response = await this.client.get(`/call/${callId}`);

            return {
                success: true,
                call: response.data
            };

        } catch (error) {
            console.error('Error fetching call:', error.message);
            throw error;
        }
    }

    /**
     * List all calls with optional filters
     *
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Array of calls
     */
    async listCalls(filters = {}) {
        try {
            const {
                assistantId = null,
                limit = 100,
                createdAtGte = null, // ISO date string
                createdAtLte = null
            } = filters;

            const params = { limit };
            if (assistantId) params.assistantId = assistantId;
            if (createdAtGte) params.createdAtGte = createdAtGte;
            if (createdAtLte) params.createdAtLte = createdAtLte;

            console.log('Fetching calls with filters');

            const response = await this.client.get('/call', { params });

            return {
                success: true,
                total: response.data.length,
                calls: response.data
            };

        } catch (error) {
            console.error('Error fetching calls:', error.message);
            throw error;
        }
    }

    // ========================================================================
    // CALL TRANSCRIPTS & ANALYTICS
    // ========================================================================

    /**
     * Get full call transcript
     *
     * @param {string} callId - Call ID
     * @returns {Promise<Object>} Transcript object with messages
     */
    async getCallTranscript(callId) {
        try {
            if (!callId) {
                throw new Error('Call ID is required');
            }

            console.log(`Fetching transcript for call: ${callId}`);

            // Get full call details (includes transcript)
            const response = await this.client.get(`/call/${callId}`);
            const call = response.data;

            if (!call.messages || call.messages.length === 0) {
                return {
                    success: true,
                    callId: callId,
                    transcript: [],
                    message: 'No transcript available (call may still be in progress)'
                };
            }

            // Format transcript messages
            const transcript = call.messages.map(msg => ({
                role: msg.role, // 'assistant' or 'user'
                content: msg.content,
                timestamp: msg.timestamp,
                duration: msg.duration
            }));

            return {
                success: true,
                callId: callId,
                transcript: transcript,
                fullTranscriptText: this.formatTranscriptAsText(transcript),
                totalMessages: transcript.length,
                callDuration: call.duration,
                callStatus: call.status
            };

        } catch (error) {
            console.error('Error fetching transcript:', error.message);
            throw error;
        }
    }

    /**
     * Format transcript as readable text
     */
    formatTranscriptAsText(transcript) {
        return transcript.map(msg => {
            const role = msg.role === 'assistant' ? 'AI Agent' : 'Caller';
            return `${role}: ${msg.content}`;
        }).join('\n\n');
    }

    /**
     * Get call analytics and metrics
     *
     * @param {string} callId - Call ID
     * @returns {Promise<Object>} Analytics object
     */
    async getCallAnalytics(callId) {
        try {
            if (!callId) {
                throw new Error('Call ID is required');
            }

            console.log(`Fetching analytics for call: ${callId}`);

            const response = await this.client.get(`/call/${callId}`);
            const call = response.data;

            // Extract key metrics
            const analytics = {
                callId: callId,
                status: call.status, // 'completed', 'failed', 'no-answer', etc.
                duration: call.duration, // seconds
                cost: call.cost, // USD
                startedAt: call.startedAt,
                endedAt: call.endedAt,
                endReason: call.endedReason, // 'assistant-ended', 'customer-ended', etc.
                messages: {
                    total: call.messages?.length || 0,
                    assistantMessages: call.messages?.filter(m => m.role === 'assistant').length || 0,
                    userMessages: call.messages?.filter(m => m.role === 'user').length || 0
                },
                sentiment: this.analyzeSentiment(call.messages),
                outcome: this.determineCallOutcome(call),
                transferredToHuman: call.endedReason === 'assistant-forwarded-call',
                recordingUrl: call.recordingUrl || null
            };

            return {
                success: true,
                analytics: analytics
            };

        } catch (error) {
            console.error('Error fetching call analytics:', error.message);
            throw error;
        }
    }

    /**
     * Simple sentiment analysis from transcript
     */
    analyzeSentiment(messages) {
        if (!messages || messages.length === 0) return 'neutral';

        const userMessages = messages.filter(m => m.role === 'user');
        const userText = userMessages.map(m => m.content.toLowerCase()).join(' ');

        // Basic keyword sentiment analysis
        const positiveWords = ['yes', 'great', 'interested', 'perfect', 'sounds good', 'definitely'];
        const negativeWords = ['no', 'not interested', 'stop calling', 'unsubscribe', 'busy', 'waste'];

        const positiveCount = positiveWords.filter(word => userText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => userText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * Determine call outcome based on call data
     */
    determineCallOutcome(call) {
        const transcript = call.messages?.map(m => m.content.toLowerCase()).join(' ') || '';

        // Check for booking indicators
        if (transcript.includes('calendar') || transcript.includes('schedule') || transcript.includes('book')) {
            return 'meeting_booked';
        }

        // Check for positive interest
        if (transcript.includes('send me') || transcript.includes('email me')) {
            return 'nurture';
        }

        // Check for objections
        if (transcript.includes('not interested') || transcript.includes('no thanks')) {
            return 'objection';
        }

        // Check for transfer
        if (call.endedReason === 'assistant-forwarded-call') {
            return 'transferred_to_human';
        }

        // Check for completion
        if (call.status === 'completed' && call.duration > 60) {
            return 'qualified';
        }

        // Default
        return 'incomplete';
    }

    // ========================================================================
    // WEBHOOK HANDLING
    // ========================================================================

    /**
     * Process webhook payload from Vapi
     *
     * Webhook events include: call.started, call.ended, message.sent,
     * function.called, transcript.updated
     *
     * @param {Object} webhookPayload - Webhook payload from Vapi
     * @returns {Object} Processed webhook data
     */
    async handleWebhook(webhookPayload) {
        try {
            const {
                type,
                call,
                message,
                timestamp
            } = webhookPayload;

            console.log(`Processing Vapi webhook: ${type}`);

            let processedData = {
                eventType: type,
                callId: call?.id,
                timestamp: timestamp || new Date().toISOString()
            };

            // Process based on event type
            switch (type) {
                case 'call.started':
                    processedData.phoneNumber = call.customer.number;
                    processedData.assistantId = call.assistantId;
                    processedData.action = 'Call initiated';
                    break;

                case 'call.ended':
                    processedData.phoneNumber = call.customer.number;
                    processedData.duration = call.duration;
                    processedData.endReason = call.endedReason;
                    processedData.status = call.status;
                    processedData.action = 'Call completed';
                    break;

                case 'message.sent':
                    processedData.role = message.role;
                    processedData.content = message.content;
                    processedData.action = 'Message sent during call';
                    break;

                case 'function.called':
                    processedData.functionName = message.functionCall.name;
                    processedData.functionArgs = message.functionCall.parameters;
                    processedData.action = 'Custom function triggered';
                    break;

                case 'transcript.updated':
                    processedData.transcript = call.messages;
                    processedData.action = 'Transcript updated';
                    break;

                default:
                    console.warn(`Unknown webhook event type: ${type}`);
                    processedData.action = 'Unknown event type';
            }

            return {
                success: true,
                processed: processedData,
                raw: webhookPayload
            };

        } catch (error) {
            console.error('Error processing webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: webhookPayload
            };
        }
    }

    // ========================================================================
    // CRM CONTEXT INJECTION
    // ========================================================================

    /**
     * Get lead context from CRM before making call
     *
     * This should be called before makeOutboundCall to inject
     * personalized context into the conversation.
     *
     * @param {string} contactId - CRM contact ID
     * @param {Object} ghlAPI - Instance of GoHighLevelAPI
     * @returns {Promise<Object>} Context object for assistant
     */
    async getCRMContext(contactId, ghlAPI) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            console.log(`Fetching CRM context for contact: ${contactId}`);

            // Get contact from CRM
            const contactResponse = await ghlAPI.getContact(contactId);
            const contact = contactResponse.contact;

            // Build context object
            const context = {
                firstName: contact.firstName,
                lastName: contact.lastName,
                companyName: contact.companyName,
                industry: contact.customField?.industry,
                lastInteraction: contact.lastActivity,
                tags: contact.tags,
                source: contact.source,
                notes: contact.notes?.[0]?.body || 'No previous notes'
            };

            console.log('CRM context fetched successfully');

            return {
                success: true,
                contactId: contactId,
                context: context
            };

        } catch (error) {
            console.error('Error fetching CRM context:', error.message);
            return {
                success: false,
                contactId: contactId,
                context: {},
                error: error.message
            };
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Handle API errors with retry logic
     */
    async handleError(error) {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            console.error(`Vapi API Error ${status}:`, data.message || data);

            // Handle specific error codes
            if (status === 401) {
                throw new Error('Invalid API key. Check your VAPI_API_KEY in .env');
            } else if (status === 429) {
                console.warn('Rate limit hit. Retrying with exponential backoff...');
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (status === 404) {
                throw new Error('Resource not found. Check assistant ID or call ID.');
            } else if (status === 400) {
                throw new Error(`Bad request: ${data.message || JSON.stringify(data)}`);
            } else if (status >= 500) {
                throw new Error('Vapi server error. Please try again later.');
            }

            throw new Error(data.message || `API error: ${status}`);

        } else if (error.request) {
            // Request made but no response received
            console.error('No response from Vapi API:', error.message);
            throw new Error('Network error. Please check your internet connection.');

        } else {
            // Error setting up the request
            console.error('Request setup error:', error.message);
            throw error;
        }
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

module.exports = VapiAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Create voice assistant for commercial insurance
 *
 * const VapiAPI = require('./vapi-api');
 * const vapi = new VapiAPI();
 *
 * const assistant = await vapi.createAssistant({
 *   name: 'Insurance Qualifier',
 *   vertical: 'insurance',
 *   firstMessage: 'Hi, thanks for calling ABC Insurance Brokers. This is Sarah, your virtual assistant. I\'m here to help you explore your insurance options. Can I start by getting your name?'
 * });
 *
 * console.log('Assistant ID:', assistant.assistantId);
 */

/**
 * Example 2: Make outbound call with CRM context
 *
 * const VapiAPI = require('./vapi-api');
 * const GoHighLevelAPI = require('./gohighlevel-api');
 * const vapi = new VapiAPI();
 * const ghl = new GoHighLevelAPI();
 *
 * // Get CRM context
 * const contextResponse = await vapi.getCRMContext('contact_123', ghl);
 *
 * // Make call with context
 * const call = await vapi.makeOutboundCall({
 *   assistantId: 'asst_abc123',
 *   phoneNumber: '+13125551234',
 *   contactId: 'contact_123',
 *   context: contextResponse.context,
 *   name: 'John Smith'
 * });
 *
 * console.log('Call initiated:', call.callId);
 */

/**
 * Example 3: Get call transcript and analytics
 *
 * const VapiAPI = require('./vapi-api');
 * const vapi = new VapiAPI();
 *
 * // Wait for call to complete, then fetch transcript
 * const transcript = await vapi.getCallTranscript('call_xyz789');
 * console.log('Transcript:', transcript.fullTranscriptText);
 *
 * // Get analytics
 * const analytics = await vapi.getCallAnalytics('call_xyz789');
 * console.log('Call outcome:', analytics.analytics.outcome);
 * console.log('Sentiment:', analytics.analytics.sentiment);
 * console.log('Duration:', analytics.analytics.duration);
 */

/**
 * Example 4: Handle webhook for call completion
 *
 * const VapiAPI = require('./vapi-api');
 * const GoHighLevelAPI = require('./gohighlevel-api');
 * const vapi = new VapiAPI();
 * const ghl = new GoHighLevelAPI();
 *
 * // In your webhook endpoint (e.g., Express route)
 * app.post('/vapi/webhooks', async (req, res) => {
 *   const webhookData = await vapi.handleWebhook(req.body);
 *
 *   if (webhookData.processed.eventType === 'call.ended') {
 *     // Get full call details
 *     const callId = webhookData.processed.callId;
 *     const analytics = await vapi.getCallAnalytics(callId);
 *     const transcript = await vapi.getCallTranscript(callId);
 *
 *     // Update CRM with call data
 *     const contactId = req.body.call.metadata.contactId;
 *     await ghl.addNote(contactId, {
 *       body: `AI Call Summary:\n\nOutcome: ${analytics.analytics.outcome}\nSentiment: ${analytics.analytics.sentiment}\nDuration: ${analytics.analytics.duration}s\n\nTranscript:\n${transcript.fullTranscriptText}`
 *     });
 *
 *     // Tag based on outcome
 *     if (analytics.analytics.outcome === 'meeting_booked') {
 *       await ghl.addTags(contactId, ['ai-call-booked', 'qualified']);
 *     }
 *   }
 *
 *   res.status(200).send('OK');
 * });
 */
