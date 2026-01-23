/**
 * Multi-Platform Voice Agent API Wrapper
 *
 * Provides a unified interface for AI voice agents across multiple platforms:
 * - GoHighLevel (PRIMARY - White-labelable, all-in-one)
 * - Vapi.ai (SECONDARY - Premium voice quality)
 * - Retell.ai (SECONDARY - Low latency)
 *
 * @version 2.0.0
 * @requires axios
 * @requires dotenv
 *
 * This abstraction layer allows switching between platforms without changing application code.
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const VOICE_PLATFORM = process.env.VOICE_PLATFORM || 'gohighlevel'; // Default to GHL
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL;

// Platform-specific configurations
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_PHONE_NUMBER = process.env.GHL_PHONE_NUMBER;

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY;
const VAPI_PHONE_NUMBER = process.env.VAPI_PHONE_NUMBER;

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_PHONE_NUMBER = process.env.RETELL_PHONE_NUMBER;

const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Multi-Platform Voice Agent API Client
 *
 * Provides platform-agnostic methods for voice agent operations
 */
class VoiceAgentAPI {
    constructor(platform = VOICE_PLATFORM) {
        this.platform = platform.toLowerCase();

        console.log(`Initializing Voice Agent API with platform: ${this.platform}`);

        // Initialize the appropriate platform client
        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                this.client = this.initGoHighLevel();
                break;
            case 'vapi':
            case 'vapi.ai':
                this.client = this.initVapi();
                break;
            case 'retell':
            case 'retell.ai':
                this.client = this.initRetell();
                break;
            default:
                throw new Error(`Unknown platform: ${platform}. Must be 'gohighlevel', 'vapi', or 'retell'`);
        }
    }

    // ========================================================================
    // PLATFORM INITIALIZATION
    // ========================================================================

    /**
     * Initialize GoHighLevel client
     */
    initGoHighLevel() {
        if (!GHL_API_KEY || !GHL_LOCATION_ID) {
            throw new Error('GHL_API_KEY and GHL_LOCATION_ID are required for GoHighLevel');
        }

        return axios.create({
            baseURL: 'https://services.leadconnectorhq.com',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT
        });
    }

    /**
     * Initialize Vapi.ai client
     */
    initVapi() {
        if (!VAPI_API_KEY) {
            throw new Error('VAPI_API_KEY is required for Vapi.ai');
        }

        return axios.create({
            baseURL: 'https://api.vapi.ai',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT
        });
    }

    /**
     * Initialize Retell.ai client
     */
    initRetell() {
        if (!RETELL_API_KEY) {
            throw new Error('RETELL_API_KEY is required for Retell.ai');
        }

        return axios.create({
            baseURL: 'https://api.retellai.com',
            headers: {
                'Authorization': `Bearer ${RETELL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: REQUEST_TIMEOUT
        });
    }

    // ========================================================================
    // UNIFIED API METHODS
    // ========================================================================

    /**
     * Create a voice assistant
     *
     * @param {Object} config - Assistant configuration
     * @param {string} config.name - Assistant name
     * @param {string} config.vertical - Target vertical (insurance, real-estate, recruitment)
     * @param {string} config.firstMessage - Greeting message
     * @param {Object} config.voiceSettings - Voice configuration (optional)
     * @param {string} config.systemPrompt - System prompt for AI (optional)
     * @returns {Promise<Object>} Created assistant
     */
    async createAssistant(config) {
        console.log(`Creating assistant on ${this.platform}: ${config.name}`);

        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                return this.createGHLAssistant(config);
            case 'vapi':
            case 'vapi.ai':
                return this.createVapiAssistant(config);
            case 'retell':
            case 'retell.ai':
                return this.createRetellAssistant(config);
            default:
                throw new Error(`Unknown platform: ${this.platform}`);
        }
    }

    /**
     * Make an outbound call
     *
     * @param {Object} callData - Call configuration
     * @param {string} callData.assistantId - Assistant ID to use
     * @param {string} callData.phoneNumber - Phone number to call (E.164 format)
     * @param {string} callData.contactId - CRM contact ID (optional)
     * @param {Object} callData.context - Additional context (optional)
     * @returns {Promise<Object>} Call object
     */
    async makeOutboundCall(callData) {
        console.log(`Making outbound call via ${this.platform} to ${callData.phoneNumber}`);

        // Validate phone number format
        if (!callData.phoneNumber.match(/^\+\d{10,15}$/)) {
            throw new Error('Phone number must be in E.164 format (e.g., +13125551234)');
        }

        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                return this.makeGHLCall(callData);
            case 'vapi':
            case 'vapi.ai':
                return this.makeVapiCall(callData);
            case 'retell':
            case 'retell.ai':
                return this.makeRetellCall(callData);
            default:
                throw new Error(`Unknown platform: ${this.platform}`);
        }
    }

    /**
     * Get call transcript
     *
     * @param {string} callId - Call ID
     * @returns {Promise<Object>} Transcript object
     */
    async getCallTranscript(callId) {
        console.log(`Fetching transcript for call ${callId} from ${this.platform}`);

        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                return this.getGHLTranscript(callId);
            case 'vapi':
            case 'vapi.ai':
                return this.getVapiTranscript(callId);
            case 'retell':
            case 'retell.ai':
                return this.getRetellTranscript(callId);
            default:
                throw new Error(`Unknown platform: ${this.platform}`);
        }
    }

    /**
     * Get call analytics
     *
     * @param {string} callId - Call ID
     * @returns {Promise<Object>} Analytics object
     */
    async getCallAnalytics(callId) {
        console.log(`Fetching analytics for call ${callId} from ${this.platform}`);

        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                return this.getGHLAnalytics(callId);
            case 'vapi':
            case 'vapi.ai':
                return this.getVapiAnalytics(callId);
            case 'retell':
            case 'retell.ai':
                return this.getRetellAnalytics(callId);
            default:
                throw new Error(`Unknown platform: ${this.platform}`);
        }
    }

    /**
     * Handle webhook event
     *
     * @param {Object} webhookPayload - Webhook payload
     * @returns {Object} Processed webhook data
     */
    async handleWebhook(webhookPayload) {
        console.log(`Processing webhook from ${this.platform}`);

        switch (this.platform) {
            case 'gohighlevel':
            case 'ghl':
                return this.handleGHLWebhook(webhookPayload);
            case 'vapi':
            case 'vapi.ai':
                return this.handleVapiWebhook(webhookPayload);
            case 'retell':
            case 'retell.ai':
                return this.handleRetellWebhook(webhookPayload);
            default:
                throw new Error(`Unknown platform: ${this.platform}`);
        }
    }

    // ========================================================================
    // GOHIGHLEVEL IMPLEMENTATION
    // ========================================================================

    /**
     * Create assistant in GoHighLevel Conversation AI
     */
    async createGHLAssistant(config) {
        try {
            const {
                name,
                vertical,
                firstMessage,
                systemPrompt = null
            } = config;

            // In GHL, we use Conversation AI workflows instead of standalone assistants
            // This would typically be configured via the GHL UI or Workflow API
            const payload = {
                locationId: GHL_LOCATION_ID,
                name: name,
                type: 'conversation_ai',
                settings: {
                    vertical: vertical,
                    firstMessage: firstMessage,
                    systemPrompt: systemPrompt || this.buildSystemPrompt(vertical),
                    enableTranscription: true,
                    enableCallRecording: true
                }
            };

            console.log('Note: GoHighLevel Conversation AI is typically configured via UI.');
            console.log('This method returns a simulated assistant object for API compatibility.');

            // For GHL, we return a simulated response since most configuration is UI-based
            return {
                success: true,
                platform: 'gohighlevel',
                assistantId: `ghl_conv_${Date.now()}`, // Simulated ID
                assistant: {
                    name: name,
                    vertical: vertical,
                    locationId: GHL_LOCATION_ID,
                    configured: true
                },
                message: 'Assistant configuration ready. Complete setup in GoHighLevel Conversation AI dashboard.',
                configurationUrl: `https://app.gohighlevel.com/${GHL_LOCATION_ID}/settings/conversation-ai`
            };

        } catch (error) {
            console.error('Error creating GHL assistant:', error.message);
            throw error;
        }
    }

    /**
     * Make outbound call via GoHighLevel
     */
    async makeGHLCall(callData) {
        try {
            const {
                assistantId,
                phoneNumber,
                contactId = null,
                context = {}
            } = callData;

            // GHL outbound calls are typically triggered via workflows
            // This uses the Conversations API to initiate a call
            const payload = {
                locationId: GHL_LOCATION_ID,
                contactId: contactId,
                phoneNumber: phoneNumber,
                callType: 'ai_conversation',
                metadata: {
                    context: context,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await this.client.post('/conversations/calls', payload);

            return {
                success: true,
                platform: 'gohighlevel',
                callId: response.data.id,
                call: response.data,
                message: 'Outbound call initiated successfully'
            };

        } catch (error) {
            console.error('Error making GHL call:', error.message);
            throw error;
        }
    }

    /**
     * Get transcript from GoHighLevel
     */
    async getGHLTranscript(callId) {
        try {
            const response = await this.client.get(`/conversations/calls/${callId}`);
            const call = response.data;

            if (!call.transcript) {
                return {
                    success: true,
                    platform: 'gohighlevel',
                    callId: callId,
                    transcript: [],
                    message: 'No transcript available yet'
                };
            }

            return {
                success: true,
                platform: 'gohighlevel',
                callId: callId,
                transcript: call.transcript,
                fullTranscriptText: call.transcript.map(t => `${t.speaker}: ${t.text}`).join('\n\n'),
                duration: call.duration
            };

        } catch (error) {
            console.error('Error fetching GHL transcript:', error.message);
            throw error;
        }
    }

    /**
     * Get analytics from GoHighLevel
     */
    async getGHLAnalytics(callId) {
        try {
            const response = await this.client.get(`/conversations/calls/${callId}`);
            const call = response.data;

            return {
                success: true,
                platform: 'gohighlevel',
                analytics: {
                    callId: callId,
                    status: call.status,
                    duration: call.duration,
                    startedAt: call.startedAt,
                    endedAt: call.endedAt,
                    outcome: this.determineCallOutcome(call),
                    sentiment: this.analyzeSentiment(call.transcript),
                    contactId: call.contactId
                }
            };

        } catch (error) {
            console.error('Error fetching GHL analytics:', error.message);
            throw error;
        }
    }

    /**
     * Handle GoHighLevel webhook
     */
    async handleGHLWebhook(payload) {
        try {
            const {
                type,
                data
            } = payload;

            let processedData = {
                platform: 'gohighlevel',
                eventType: type,
                callId: data.callId,
                timestamp: data.timestamp || new Date().toISOString()
            };

            switch (type) {
                case 'CallStarted':
                    processedData.action = 'Call initiated';
                    processedData.phoneNumber = data.phoneNumber;
                    break;
                case 'CallEnded':
                    processedData.action = 'Call completed';
                    processedData.duration = data.duration;
                    processedData.status = data.status;
                    break;
                default:
                    processedData.action = 'Unknown event';
            }

            return {
                success: true,
                processed: processedData,
                raw: payload
            };

        } catch (error) {
            console.error('Error processing GHL webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: payload
            };
        }
    }

    // ========================================================================
    // VAPI.AI IMPLEMENTATION
    // ========================================================================

    /**
     * Create assistant in Vapi.ai
     */
    async createVapiAssistant(config) {
        try {
            const {
                name,
                vertical,
                firstMessage,
                voiceSettings = {},
                systemPrompt = null
            } = config;

            const defaultVoice = this.getDefaultVoiceSettings(vertical);
            const mergedVoice = { ...defaultVoice, ...voiceSettings };

            const payload = {
                name: name,
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    temperature: 0.7,
                    systemPrompt: systemPrompt || this.buildSystemPrompt(vertical)
                },
                voice: mergedVoice,
                firstMessage: firstMessage,
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-2',
                    language: 'en-US'
                },
                recordingEnabled: true,
                endCallFunctionEnabled: true,
                silenceTimeoutSeconds: 30,
                maxDurationSeconds: 600,
                serverUrl: `${WEBHOOK_BASE_URL}/vapi/webhooks`,
                metadata: {
                    vertical: vertical,
                    created: new Date().toISOString()
                }
            };

            const response = await this.client.post('/assistant', payload);

            return {
                success: true,
                platform: 'vapi',
                assistantId: response.data.id,
                assistant: response.data,
                message: 'Assistant created successfully'
            };

        } catch (error) {
            console.error('Error creating Vapi assistant:', error.message);
            throw error;
        }
    }

    /**
     * Make outbound call via Vapi.ai
     */
    async makeVapiCall(callData) {
        try {
            const {
                assistantId,
                phoneNumber,
                contactId = null,
                context = {},
                name = null
            } = callData;

            const payload = {
                assistantId: assistantId,
                customer: {
                    number: phoneNumber,
                    name: name
                },
                phoneNumberId: VAPI_PHONE_NUMBER,
                metadata: {
                    contactId: contactId,
                    callType: 'outbound',
                    context: context,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await this.client.post('/call/phone', payload);

            return {
                success: true,
                platform: 'vapi',
                callId: response.data.id,
                call: response.data,
                message: 'Outbound call initiated successfully'
            };

        } catch (error) {
            console.error('Error making Vapi call:', error.message);
            throw error;
        }
    }

    /**
     * Get transcript from Vapi.ai
     */
    async getVapiTranscript(callId) {
        try {
            const response = await this.client.get(`/call/${callId}`);
            const call = response.data;

            if (!call.messages || call.messages.length === 0) {
                return {
                    success: true,
                    platform: 'vapi',
                    callId: callId,
                    transcript: [],
                    message: 'No transcript available yet'
                };
            }

            const transcript = call.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            }));

            return {
                success: true,
                platform: 'vapi',
                callId: callId,
                transcript: transcript,
                fullTranscriptText: transcript.map(t => `${t.role === 'assistant' ? 'AI' : 'Caller'}: ${t.content}`).join('\n\n'),
                duration: call.duration
            };

        } catch (error) {
            console.error('Error fetching Vapi transcript:', error.message);
            throw error;
        }
    }

    /**
     * Get analytics from Vapi.ai
     */
    async getVapiAnalytics(callId) {
        try {
            const response = await this.client.get(`/call/${callId}`);
            const call = response.data;

            return {
                success: true,
                platform: 'vapi',
                analytics: {
                    callId: callId,
                    status: call.status,
                    duration: call.duration,
                    cost: call.cost,
                    startedAt: call.startedAt,
                    endedAt: call.endedAt,
                    endReason: call.endedReason,
                    outcome: this.determineCallOutcome(call),
                    sentiment: this.analyzeSentiment(call.messages),
                    recordingUrl: call.recordingUrl
                }
            };

        } catch (error) {
            console.error('Error fetching Vapi analytics:', error.message);
            throw error;
        }
    }

    /**
     * Handle Vapi.ai webhook
     */
    async handleVapiWebhook(payload) {
        try {
            const {
                type,
                call,
                message,
                timestamp
            } = payload;

            let processedData = {
                platform: 'vapi',
                eventType: type,
                callId: call?.id,
                timestamp: timestamp || new Date().toISOString()
            };

            switch (type) {
                case 'call.started':
                    processedData.action = 'Call initiated';
                    processedData.phoneNumber = call.customer.number;
                    break;
                case 'call.ended':
                    processedData.action = 'Call completed';
                    processedData.duration = call.duration;
                    processedData.endReason = call.endedReason;
                    break;
                case 'message.sent':
                    processedData.action = 'Message sent during call';
                    processedData.role = message.role;
                    processedData.content = message.content;
                    break;
                default:
                    processedData.action = 'Unknown event';
            }

            return {
                success: true,
                processed: processedData,
                raw: payload
            };

        } catch (error) {
            console.error('Error processing Vapi webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: payload
            };
        }
    }

    // ========================================================================
    // RETELL.AI IMPLEMENTATION
    // ========================================================================

    /**
     * Create assistant in Retell.ai
     */
    async createRetellAssistant(config) {
        try {
            const {
                name,
                vertical,
                firstMessage,
                systemPrompt = null
            } = config;

            const payload = {
                agent_name: name,
                voice_id: this.getRetellVoiceId(vertical),
                llm_websocket_url: `${WEBHOOK_BASE_URL}/retell/llm`,
                response_engine: {
                    type: 'retell-llm',
                    llm_id: 'gpt-4'
                },
                general_prompt: systemPrompt || this.buildSystemPrompt(vertical),
                begin_message: firstMessage,
                enable_transcription: true
            };

            const response = await this.client.post('/create-agent', payload);

            return {
                success: true,
                platform: 'retell',
                assistantId: response.data.agent_id,
                assistant: response.data,
                message: 'Assistant created successfully'
            };

        } catch (error) {
            console.error('Error creating Retell assistant:', error.message);
            throw error;
        }
    }

    /**
     * Make outbound call via Retell.ai
     */
    async makeRetellCall(callData) {
        try {
            const {
                assistantId,
                phoneNumber,
                contactId = null,
                context = {}
            } = callData;

            const payload = {
                agent_id: assistantId,
                to_number: phoneNumber,
                from_number: RETELL_PHONE_NUMBER,
                metadata: {
                    contactId: contactId,
                    context: context,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await this.client.post('/create-phone-call', payload);

            return {
                success: true,
                platform: 'retell',
                callId: response.data.call_id,
                call: response.data,
                message: 'Outbound call initiated successfully'
            };

        } catch (error) {
            console.error('Error making Retell call:', error.message);
            throw error;
        }
    }

    /**
     * Get transcript from Retell.ai
     */
    async getRetellTranscript(callId) {
        try {
            const response = await this.client.get(`/get-call/${callId}`);
            const call = response.data;

            if (!call.transcript) {
                return {
                    success: true,
                    platform: 'retell',
                    callId: callId,
                    transcript: [],
                    message: 'No transcript available yet'
                };
            }

            return {
                success: true,
                platform: 'retell',
                callId: callId,
                transcript: call.transcript,
                fullTranscriptText: call.transcript_text,
                duration: call.call_duration
            };

        } catch (error) {
            console.error('Error fetching Retell transcript:', error.message);
            throw error;
        }
    }

    /**
     * Get analytics from Retell.ai
     */
    async getRetellAnalytics(callId) {
        try {
            const response = await this.client.get(`/get-call/${callId}`);
            const call = response.data;

            return {
                success: true,
                platform: 'retell',
                analytics: {
                    callId: callId,
                    status: call.call_status,
                    duration: call.call_duration,
                    startedAt: call.start_timestamp,
                    endedAt: call.end_timestamp,
                    outcome: this.determineCallOutcome(call),
                    sentiment: call.call_analysis?.sentiment || 'neutral'
                }
            };

        } catch (error) {
            console.error('Error fetching Retell analytics:', error.message);
            throw error;
        }
    }

    /**
     * Handle Retell.ai webhook
     */
    async handleRetellWebhook(payload) {
        try {
            const {
                event,
                call
            } = payload;

            let processedData = {
                platform: 'retell',
                eventType: event,
                callId: call?.call_id,
                timestamp: new Date().toISOString()
            };

            switch (event) {
                case 'call_started':
                    processedData.action = 'Call initiated';
                    processedData.phoneNumber = call.to_number;
                    break;
                case 'call_ended':
                    processedData.action = 'Call completed';
                    processedData.duration = call.call_duration;
                    break;
                default:
                    processedData.action = 'Unknown event';
            }

            return {
                success: true,
                processed: processedData,
                raw: payload
            };

        } catch (error) {
            console.error('Error processing Retell webhook:', error.message);
            return {
                success: false,
                error: error.message,
                raw: payload
            };
        }
    }

    // ========================================================================
    // HELPER METHODS (Shared across platforms)
    // ========================================================================

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
     * Get default voice settings by vertical (for Vapi)
     */
    getDefaultVoiceSettings(vertical) {
        const voiceConfigs = {
            insurance: {
                provider: 'elevenlabs',
                voiceId: 'rachel',
                stability: 0.8,
                similarityBoost: 0.75,
                speed: 1.1
            },
            'real-estate': {
                provider: 'elevenlabs',
                voiceId: 'alex',
                stability: 0.75,
                similarityBoost: 0.8,
                speed: 1.0
            },
            recruitment: {
                provider: 'elevenlabs',
                voiceId: 'sam',
                stability: 0.85,
                similarityBoost: 0.7,
                speed: 1.05
            }
        };

        return voiceConfigs[vertical] || voiceConfigs.insurance;
    }

    /**
     * Get Retell voice ID by vertical
     */
    getRetellVoiceId(vertical) {
        const voiceIds = {
            insurance: 'retell-professional-female',
            'real-estate': 'retell-friendly-male',
            recruitment: 'retell-neutral'
        };

        return voiceIds[vertical] || voiceIds.insurance;
    }

    /**
     * Analyze sentiment from transcript
     */
    analyzeSentiment(messages) {
        if (!messages || messages.length === 0) return 'neutral';

        const userText = messages
            .filter(m => m.role === 'user' || m.speaker === 'user')
            .map(m => (m.content || m.text || '').toLowerCase())
            .join(' ');

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
        const transcript = call.messages || call.transcript || [];
        const transcriptText = transcript
            .map(t => t.content || t.text || '')
            .join(' ')
            .toLowerCase();

        if (transcriptText.includes('calendar') || transcriptText.includes('schedule') || transcriptText.includes('book')) {
            return 'meeting_booked';
        }

        if (transcriptText.includes('send me') || transcriptText.includes('email me')) {
            return 'nurture';
        }

        if (transcriptText.includes('not interested') || transcriptText.includes('no thanks')) {
            return 'objection';
        }

        if (call.endedReason === 'assistant-forwarded-call' || call.transferred) {
            return 'transferred_to_human';
        }

        if (call.status === 'completed' && call.duration > 60) {
            return 'qualified';
        }

        return 'incomplete';
    }

    /**
     * Get CRM context before making call
     */
    async getCRMContext(contactId, ghlAPI) {
        try {
            if (!contactId) {
                throw new Error('Contact ID is required');
            }

            console.log(`Fetching CRM context for contact: ${contactId}`);

            const contactResponse = await ghlAPI.getContact(contactId);
            const contact = contactResponse.contact;

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
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = VoiceAgentAPI;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Create assistant (platform-agnostic)
 *
 * const VoiceAgentAPI = require('./voice-agent-api');
 *
 * // Uses platform from VOICE_PLATFORM env var (defaults to GoHighLevel)
 * const voiceAgent = new VoiceAgentAPI();
 *
 * const assistant = await voiceAgent.createAssistant({
 *   name: 'Insurance Qualifier',
 *   vertical: 'insurance',
 *   firstMessage: 'Hi, thanks for calling ABC Insurance. This is Sarah. How can I help you today?'
 * });
 *
 * console.log('Assistant ID:', assistant.assistantId);
 * console.log('Platform:', assistant.platform);
 */

/**
 * Example 2: Switch platforms
 *
 * const VoiceAgentAPI = require('./voice-agent-api');
 *
 * // Use GoHighLevel (primary)
 * const ghlAgent = new VoiceAgentAPI('gohighlevel');
 *
 * // Or use Vapi (secondary)
 * const vapiAgent = new VoiceAgentAPI('vapi');
 *
 * // Or use Retell (secondary)
 * const retellAgent = new VoiceAgentAPI('retell');
 *
 * // All three have the same API methods!
 */

/**
 * Example 3: Make outbound call with CRM context
 *
 * const VoiceAgentAPI = require('./voice-agent-api');
 * const GoHighLevelAPI = require('./gohighlevel-api');
 *
 * const voiceAgent = new VoiceAgentAPI(); // Uses GHL by default
 * const ghl = new GoHighLevelAPI();
 *
 * // Get CRM context
 * const contextResponse = await voiceAgent.getCRMContext('contact_123', ghl);
 *
 * // Make call with context
 * const call = await voiceAgent.makeOutboundCall({
 *   assistantId: 'asst_abc123',
 *   phoneNumber: '+13125551234',
 *   contactId: 'contact_123',
 *   context: contextResponse.context
 * });
 *
 * console.log('Call initiated:', call.callId);
 * console.log('Platform:', call.platform);
 */

/**
 * Example 4: Get transcript and analytics (any platform)
 *
 * const VoiceAgentAPI = require('./voice-agent-api');
 * const voiceAgent = new VoiceAgentAPI();
 *
 * // Works with any platform
 * const transcript = await voiceAgent.getCallTranscript('call_xyz789');
 * console.log('Transcript:', transcript.fullTranscriptText);
 * console.log('Platform:', transcript.platform);
 *
 * const analytics = await voiceAgent.getCallAnalytics('call_xyz789');
 * console.log('Outcome:', analytics.analytics.outcome);
 * console.log('Sentiment:', analytics.analytics.sentiment);
 */

/**
 * Example 5: Handle webhooks (platform-agnostic)
 *
 * const VoiceAgentAPI = require('./voice-agent-api');
 * const GoHighLevelAPI = require('./gohighlevel-api');
 *
 * // In your webhook endpoint (Express)
 * app.post('/webhooks/voice/:platform', async (req, res) => {
 *   const platform = req.params.platform; // 'gohighlevel', 'vapi', or 'retell'
 *   const voiceAgent = new VoiceAgentAPI(platform);
 *   const ghl = new GoHighLevelAPI();
 *
 *   const webhookData = await voiceAgent.handleWebhook(req.body);
 *
 *   if (webhookData.processed.action === 'Call completed') {
 *     const callId = webhookData.processed.callId;
 *     const analytics = await voiceAgent.getCallAnalytics(callId);
 *     const transcript = await voiceAgent.getCallTranscript(callId);
 *
 *     // Update CRM
 *     const contactId = req.body.contactId || req.body.call?.metadata?.contactId;
 *     await ghl.addNote(contactId, {
 *       body: `AI Call Summary (${platform}):\n\nOutcome: ${analytics.analytics.outcome}\nSentiment: ${analytics.analytics.sentiment}\n\nTranscript:\n${transcript.fullTranscriptText}`
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
