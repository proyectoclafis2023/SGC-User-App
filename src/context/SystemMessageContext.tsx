import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemMessage, SystemMessageContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/system_messages`;

export const SystemMessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<SystemMessage[]>([]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setMessages(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const addMessage = async (message: Omit<SystemMessage, 'id' | 'createdAt'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...message, createdAt: new Date().toISOString() })
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error adding message:', error);
        }
    };

    const updateMessage = async (message: SystemMessage) => {
        try {
            await fetch(`${API_URL}/${message.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const toggleMessageStatus = async (id: string) => {
        const msg = messages.find(m => m.id === id);
        if (msg) {
            await updateMessage({ ...msg, isActive: !msg.isActive });
        }
    };

    return (
        <SystemMessageContext.Provider value={{ messages, addMessage, updateMessage, deleteMessage, toggleMessageStatus }}>
            {children}
        </SystemMessageContext.Provider>
    );
};

export const useSystemMessages = () => {
    const context = useContext(SystemMessageContext);
    if (!context) throw new Error('useSystemMessages must be used within SystemMessageProvider');
    return context;
};
