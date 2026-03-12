import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { EmergencyNumber, EmergencyNumberContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const EmergencyNumberContext = createContext<EmergencyNumberContextType | undefined>(undefined);

const BACKEND_URL = `${API_BASE_URL}/emergency_numbers`;

export const EmergencyNumberProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [numbers, setNumbers] = useState<EmergencyNumber[]>([]);

    const fetchNumbers = async () => {
        try {
            const response = await fetch(BACKEND_URL);
            if (response.ok) {
                const data = await response.json();
                setNumbers(data);
            }
        } catch (e) {
            console.error('Error fetching emergency numbers:', e);
        }
    };

    useEffect(() => {
        fetchNumbers();
    }, []);

    const addNumber = async (number: Omit<EmergencyNumber, 'id' | 'createdAt'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: EmergencyNumber = {
            ...number,
            id,
            createdAt: new Date().toISOString()
        };

        try {
            const resp = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            if (resp.ok) {
                fetchNumbers();
            }
        } catch (e) {
            console.error('API Error adding emergency number:', e);
        }
    };

    const updateNumber = async (id: string, number: Omit<EmergencyNumber, 'id' | 'createdAt'>) => {
        const existing = numbers.find(n => n.id === id);
        if (!existing) return;

        const updated = { ...existing, ...number };

        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (resp.ok) {
                fetchNumbers();
            }
        } catch (e) {
            console.error('API Error updating emergency number:', e);
        }
    };

    const deleteNumber = async (id: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (resp.ok) {
                fetchNumbers();
            }
        } catch (e) {
            console.error('API Error deleting emergency number:', e);
        }
    };

    return (
        <EmergencyNumberContext.Provider value={{ numbers, addNumber, updateNumber, deleteNumber }}>
            {children}
        </EmergencyNumberContext.Provider>
    );
};

export const useEmergencyNumbers = () => {
    const context = useContext(EmergencyNumberContext);
    if (!context) throw new Error('useEmergencyNumbers must be used within EmergencyNumberProvider');
    return context;
};
