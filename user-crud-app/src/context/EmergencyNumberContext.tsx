import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { EmergencyNumber, EmergencyNumberContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const EmergencyNumberContext = createContext<EmergencyNumberContextType | undefined>(undefined);

const BACKEND_URL = `${API_BASE_URL}/maestro_emergencias`;

export const EmergencyNumberProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [numbers, setNumbers] = useState<EmergencyNumber[]>([]);

    const fetchNumbers = async () => {
        try {
            const response = await fetch(BACKEND_URL);
            if (response.ok) {
                const data = await response.json();
                setNumbers(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching emergency numbers:', e);
        }
    };

    useEffect(() => {
        fetchNumbers();
    }, []);

    const addNumber = async (number: Omit<EmergencyNumber, 'id' | 'created_at'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: EmergencyNumber = {
            ...number,
            id,
            created_at: new Date().toISOString()
        };

        const resp = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el número de emergencia');
        }
        fetchNumbers();
    };

    const updateNumber = async (id: string, number: Omit<EmergencyNumber, 'id' | 'created_at'>) => {
        const existing = numbers.find(n => n.id === id);
        if (!existing) return;

        const updated = { ...existing, ...number };

        const resp = await fetch(`${BACKEND_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el número de emergencia');
        }
        fetchNumbers();
    };

    const deleteNumber = async (id: string) => {
        const resp = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el número de emergencia');
        }
        fetchNumbers();
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
