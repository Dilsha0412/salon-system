import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/aiAgentService';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { text: "Welcome to Salona. How may I assist you with your treatments or appointments today?", sender: 'ai', time: 'Just now' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const quickSuggestions = [
        "Haircut & Styling",
        "Facial Treatments",
        "Bridal Packages",
        "Operating Hours"
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
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => [...prev, { text: textToSend, sender: 'user', time: currentTime }]);
        setInput('');
        setIsLoading(true);

        const result = await sendChatMessage(textToSend, currentHistory);

        setMessages(prev => [...prev, { 
            text: result.reply, 
            sender: 'ai', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
        setIsLoading(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
            {/* Floating Black & White Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: '#ffffff',
                        color: '#000000',
                        border: '2px solid #ffffff',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                    title="Open Salona Assistant"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Popup Window */}
            {isOpen && (
                <div style={{
                    width: '390px',
                    height: '560px',
                    backgroundColor: '#09090b',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #27272a',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#000000',
                        color: '#ffffff',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #27272a'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: '#ffffff',
                                color: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Salona Assistant
                                </h4>
                                <span style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'inline-block' }}></span>
                                    ONLINE • 24/7 CONCIERGE
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: '#18181b',
                                border: '1px solid #27272a',
                                color: '#ffffff',
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div style={{
                        flex: 1,
                        padding: '18px 16px',
                        overflowY: 'auto',
                        backgroundColor: '#050507',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        {messages.map((msg, index) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div
                                    key={index}
                                    style={{
                                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isUser ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: isUser ? '#ffffff' : '#18181b',
                                            color: isUser ? '#000000' : '#f4f4f5',
                                            padding: '12px 16px',
                                            borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                            border: isUser ? 'none' : '1px solid #27272a',
                                            fontSize: '13.5px',
                                            lineHeight: '1.5',
                                            fontWeight: isUser ? '500' : '400',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.time && (
                                        <span style={{ fontSize: '10.5px', color: '#52525b', marginTop: '4px', padding: '0 4px' }}>
                                            {msg.time}
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#18181b',
                                color: '#a1a1aa',
                                padding: '10px 16px',
                                borderRadius: '14px 14px 14px 2px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid #27272a'
                            }}>
                                <span>Assistant is typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Chips */}
                    <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#09090b',
                        borderTop: '1px solid #18181b',
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
                                    backgroundColor: '#18181b',
                                    color: '#ffffff',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '11.5px',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffffff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleFormSubmit} style={{
                        padding: '14px 16px',
                        backgroundColor: '#000000',
                        borderTop: '1px solid #27272a',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type an inquiry..."
                            disabled={isLoading}
                            className="glass-input"
                            style={{
                                padding: '10px 14px',
                                fontSize: '13px',
                                borderRadius: '8px'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{
                                background: isLoading || !input.trim() ? '#27272a' : '#ffffff',
                                color: isLoading || !input.trim() ? '#71717a' : '#000000',
                                border: 'none',
                                borderRadius: '8px',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
