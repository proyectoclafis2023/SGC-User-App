import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Visitor, VisitorContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const VisitorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visitors, setVisitors] = useState<Visitor[]>([]);

    const fetchVisitors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/visitors`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setVisitors(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching visitors:', e);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${dateStr}-${rand}`;
    };

    const addVisitor = async (visitor: Omit<Visitor, 'id' | 'folio' | 'created_at'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: Visitor = {
            ...visitor,
            id,
            folio: generateFolio('VIS'),
            created_at: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE_URL}/visitors`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el visitante');
        }
        await fetchVisitors();
    };

    const updateVisitorStatus = async (id: string, status: Visitor['status'], time?: string) => {
        const visitor = visitors.find(v => v.id === id);
        if (!visitor) return;

        const updated = { ...visitor, status };
        if (status === 'entered') updated.entry_at = time || new Date().toLocaleTimeString();
        if (status === 'exited') updated.exit_at = time || new Date().toLocaleTimeString();

        const response = await fetch(`${API_BASE_URL}/visitors/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el estado del visitante');
        }
        await fetchVisitors();
    };

    const deleteVisitor = async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/visitors/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el visitante');
        }
        await fetchVisitors();
    };

    return (
        <VisitorContext.Provider value={{ visitors, addVisitor, updateVisitorStatus, deleteVisitor }}>
            {children}
        </VisitorContext.Provider>
    );
};

export const useVisitors = () => {
    const context = useContext(VisitorContext);
    if (!context) throw new Error('useVisitors must be used within VisitorProvider');
    return context;
};
