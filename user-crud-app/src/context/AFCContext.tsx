import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AFC, AFCContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const AFCContext = createContext<AFCContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/afcs`;

export const AFCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [afcs, setAfcs] = useState<AFC[]>([]);

    const fetchAfcs = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setAfcs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch AFCs:', error);
        }
    };

    useEffect(() => {
        fetchAfcs();
    }, []);

    const addAFC = async (afc: Omit<AFC, 'id' | 'createdAt'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(afc)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el registro AFC');
        }
        await fetchAfcs();
    };

    const updateAFC = async (afc: AFC) => {
        const response = await fetch(`${API_URL}/${afc.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(afc)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el registro AFC');
        }
        await fetchAfcs();
    };

    const deleteAFC = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el registro AFC');
        }
        await fetchAfcs();
    };

    return (
        <AFCContext.Provider value={{ afcs, addAFC, updateAFC, deleteAFC }}>
            {children}
        </AFCContext.Provider>
    );
};

export const useAFC = () => {
    const context = useContext(AFCContext);
    if (!context) throw new Error('useAFC must be used within AFCProvider');
    return context;
};
