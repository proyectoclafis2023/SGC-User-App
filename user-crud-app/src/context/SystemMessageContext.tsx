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

    const addMessage = async (message: Omit<SystemMessage, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...message, created_at: new Date().toISOString() })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el mensaje');
        }
        await fetchMessages();
    };

    const updateMessage = async (message: SystemMessage) => {
        const response = await fetch(`${API_URL}/${message.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el mensaje');
        }
        await fetchMessages();
    };

    const deleteMessage = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el mensaje');
        }
        await fetchMessages();
    };

    const toggleMessageStatus = async (id: string) => {
        const msg = messages.find(m => m.id === id);
        if (msg) {
            await updateMessage({ ...msg, is_active: !msg.is_active });
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
