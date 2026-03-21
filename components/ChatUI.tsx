'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Settings, User, Bot, Loader2, Table as TableIcon } from 'lucide-react';
import DataTable from './DataTable';

interface Message {
    role: 'user' | 'bot';
    content: string;
    sql?: string;
    results?: any[];
    validationNote?: string | null;
}

export default function ChatUI() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Hello! I am your AI Analytics assistant. Ask me anything about your data.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await axios.post('/api/chat', { query: userMsg });

            setMessages(prev => [...prev, {
                role: 'bot',
                content: `I've generated the query for you.`,
                sql: data.sql,
                results: data.results,
                validationNote: data.validationNote
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: `Error: ${error.response?.data?.error || 'Something went wrong.'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message-wrapper ${msg.role}`}>
                        <div className="avatar">
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className="message-content">
                            <p>{msg.content}</p>
                            {msg.sql && (
                                <div className="sql-block">
                                    <div className="sql-header">
                                        <span>SQL Query</span>
                                    </div>
                                    <pre><code>{msg.sql}</code></pre>
                                </div>
                            )}
                            {msg.validationNote && (
                                <div className="validation-note">
                                    <strong>Note:</strong> {msg.validationNote}
                                </div>
                            )}
                            {msg.results && (
                                <div className="results-container">
                                    <div className="results-header">
                                        <TableIcon size={16} />
                                        <span>Results</span>
                                    </div>
                                    <DataTable data={msg.results} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message-wrapper bot loading">
                        <div className="avatar"><Bot size={20} /></div>
                        <div className="message-content">
                            <Loader2 className="animate-spin" size={20} />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ask a question (e.g., 'What are our top 3 products?')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
