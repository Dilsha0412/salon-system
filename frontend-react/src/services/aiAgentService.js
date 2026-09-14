import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const sendChatMessage = async (userMessage, history = []) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/chat`, {
            message: userMessage,
            history: history
        }, {
            timeout: 15000
        });

        return {
            success: true,
            reply: response.data.reply || "I couldn't process that. Please try again."
        };
    } catch (error) {
        console.error("AI Agent API Error:", error);
        let errorMsg = "Sorry, I'm having trouble connecting to the server. Please ensure the AI service is active.";
        if (error.code === 'ECONNABORTED') {
            errorMsg = "Request timed out. Please try asking again.";
        }
        return {
            success: false,
            reply: errorMsg
        };
    }
};
