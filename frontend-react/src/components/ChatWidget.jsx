import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/aiAgentService';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { text: "Hello! Welcome to Salona Beauty & Hair Studio. How can I help you today?", sender: 'ai' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Quick suggestion chips
    const quickSuggestions = [
        "Haircut Prices ✂️",
        "Facial Treatments ✨",
        "Bridal Packages 👰",
        "Opening Hours 🕒"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async (messageText) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;

        const currentHistory = [...messages];
        setMessages(prev => [...prev, { text: textToSend, sender: 'user' }]);
        setInput('');
        setIsLoading(true);

        const result = await sendChatMessage(textToSend, currentHistory);

        setMessages(prev => [...prev, { text: result.reply, sender: 'ai' }]);
        setIsLoading(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* 💬 Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '62px',
                        height: '62px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(219, 39, 119, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Chat with AI Receptionist"
                >
                    💬
                </button>
            )}

            {/* 📱 Main Chat Popup Window */}
            {isOpen && (
                <div style={{
                    width: '390px',
                    height: '540px',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #f3f4f6',
                    animation: 'fadeIn 0.25s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
                        color: 'white',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #db2777'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #db2777, #f43f5e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                boxShadow: '0 2px 8px rgba(219, 39, 119, 0.4)'
                            }}>
                                💇‍♀️
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', letterSpacing: '0.3px' }}>
                                    Salona AI Assistant
                                </h4>
                                <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Online • 24/7 Support
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: '#27272a',
                                border: 'none',
                                color: '#a1a1aa',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#3f3f46'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = '#27272a'; }}
                            title="Close Chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map((msg, index) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div
                                    key={index}
                                    style={{
                                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                                        maxWidth: '82%',
                                        backgroundColor: isUser ? '#db2777' : '#ffffff',
                                        color: isUser ? '#ffffff' : '#1e293b',
                                        padding: '12px 16px',
                                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        boxShadow: isUser
                                            ? '0 4px 12px rgba(219, 39, 119, 0.25)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {msg.text}
                                </div>
                            );
                        })}

                        {/* Typing Animation */}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#ffffff',
                                color: '#64748b',
                                padding: '10px 16px',
                                borderRadius: '18px 18px 18px 4px',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                            }}>
                                <span>✨</span> Salona AI is typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div style={{
                        padding: '8px 14px',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap'
                    }}>
                        {quickSuggestions.map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(chip)}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#fdf2f8',
                                    color: '#be185d',
                                    border: '1px solid #fbcfe8',
                                    borderRadius: '16px',
                                    padding: '5px 10px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fce7f3'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fdf2f8'; }}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleFormSubmit} style={{
                        padding: '12px 16px',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about prices, timings, bridal..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                fontSize: '14px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#db2777'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{
                                backgroundColor: isLoading || !input.trim() ? '#f472b6' : '#db2777',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '10px 18px',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
