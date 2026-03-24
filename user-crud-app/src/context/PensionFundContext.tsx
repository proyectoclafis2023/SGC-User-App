import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PensionFund, PensionFundContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const PensionFundContext = createContext<PensionFundContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/afps`;

export const PensionFundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [funds, setFunds] = useState<PensionFund[]>([]);

    const fetchFunds = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setFunds(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch pension funds:', error);
        }
    };

    useEffect(() => {
        fetchFunds();
    }, []);

    const addFund = async (fund: Omit<PensionFund, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(fund)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar la AFP');
        }
        await fetchFunds();
    };

    const updateFund = async (fund: PensionFund) => {
        const response = await fetch(`${API_URL}/${fund.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(fund)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar la AFP');
        }
        await fetchFunds();
    };

    const deleteFund = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar la AFP');
        }
        await fetchFunds();
    };

    return (
        <PensionFundContext.Provider value={{ funds, addFund, updateFund, deleteFund }}>
            {children}
        </PensionFundContext.Provider>
    );
};

export const usePensionFunds = () => {
    const context = useContext(PensionFundContext);
    if (!context) throw new Error('usePensionFunds must be used within PensionFundProvider');
    return context;
};
