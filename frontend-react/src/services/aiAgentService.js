import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8082';
const DIRECT_AI_URL = 'http://127.0.0.1:8000';

export const sendChatMessage = async (userMessage, history = []) => {
    // Try sending request via API Gateway
    try {
        const response = await axios.post(`${GATEWAY_URL}/api/chat`, {
            message: userMessage,
            history: history
        }, {
            timeout: 20000
        });

        return {
            success: true,
            reply: response.data.reply || "I couldn't process that. Please try again."
        };
    } catch (gatewayError) {
        console.warn("Gateway request failed, attempting direct AI agent service fallback...", gatewayError);

        // Try direct AI Agent service port 8000
        try {
            const directResponse = await axios.post(`${DIRECT_AI_URL}/api/chat`, {
                message: userMessage,
                history: history
            }, {
                timeout: 20000
            });

            return {
                success: true,
                reply: directResponse.data.reply || "I couldn't process that. Please try again."
            };
        } catch (directError) {
            console.error("AI Agent Connection Error:", directError);
            let errorMsg = "Sorry, I'm having trouble connecting to the server. Please ensure the AI service is active.";
            if (gatewayError.code === 'ECONNABORTED' || directError.code === 'ECONNABORTED') {
                errorMsg = "Request timed out. Please try asking again.";
            }
            return {
                success: false,
                reply: errorMsg
            };
        }
    }
};
