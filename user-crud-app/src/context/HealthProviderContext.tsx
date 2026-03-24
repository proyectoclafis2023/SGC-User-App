import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { HealthProvider, HealthProviderContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const HealthProviderContext = createContext<HealthProviderContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/previsiones`;

export const HealthProviderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [providers, setProviders] = useState<HealthProvider[]>([]);

    const fetchProviders = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setProviders(Array.isArray(data) ? data : []);
            } else {
                const err = await response.json();
                console.error('Failed to fetch health providers:', err.message);
            }
        } catch (error) {
            console.error('Failed to fetch health providers:', error);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const addProvider = async (provider: Omit<HealthProvider, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(provider)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el sistema de salud');
        }
        await fetchProviders();
    };

    const updateProvider = async (provider: HealthProvider) => {
        const response = await fetch(`${API_URL}/${provider.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(provider)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el sistema de salud');
        }
        await fetchProviders();
    };

    const deleteProvider = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el sistema de salud');
        }
        await fetchProviders();
    };

    return (
        <HealthProviderContext.Provider value={{ providers, addProvider, updateProvider, deleteProvider }}>
            {children}
        </HealthProviderContext.Provider>
    );
};

export const useHealthProviders = () => {
    const context = useContext(HealthProviderContext);
    if (!context) throw new Error('useHealthProviders must be used within HealthProviderProvider');
    return context;
};
