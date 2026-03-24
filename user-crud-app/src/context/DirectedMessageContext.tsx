import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { DirectedMessage, DirectedMessageContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const DirectedMessageContext = createContext<DirectedMessageContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/directed_messages`;

export const DirectedMessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<DirectedMessage[]>([]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setMessages(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch directed messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const addMessage = async (message: Omit<DirectedMessage, 'id' | 'created_at'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...message, id: crypto.randomUUID(), created_at: new Date().toISOString() })
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error adding directed message:', error);
        }
    };

    const updateMessage = async (message: DirectedMessage) => {
        try {
            await fetch(`${API_URL}/${message.id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            await fetchMessages();
        } catch (error) {
            console.error('Error updating directed message:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchMessages();
        } catch (error) {
            console.error('Error deleting directed message:', error);
        }
    };

    return (
        <DirectedMessageContext.Provider value={{ messages, addMessage, updateMessage, deleteMessage }}>
            {children}
        </DirectedMessageContext.Provider>
    );
};

export const useDirectedMessages = () => {
    const context = useContext(DirectedMessageContext);
    if (!context) throw new Error('useDirectedMessages must be used within DirectedMessageProvider');
    return context;
};
