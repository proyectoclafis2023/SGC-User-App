import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Bank, BankContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const BankContext = createContext<BankContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/bancos`;

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [banks, setBanks] = useState<Bank[]>([]);

    const fetchBanks = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setBanks(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch banks:', error);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const addBank = async (bank: Omit<Bank, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(bank)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el banco');
        }
        const newBank = await response.json();
        await fetchBanks();
        return newBank.id;
    };

    const updateBank = async (bank: Bank) => {
        const response = await fetch(`${API_URL}/${bank.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(bank)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el banco');
        }
        await fetchBanks();
    };

    const deleteBank = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el banco');
        }
        await fetchBanks();
    };

    return (
        <BankContext.Provider value={{ banks, addBank, updateBank, deleteBank }}>
            {children}
        </BankContext.Provider>
    );
};

export const useBanks = () => {
    const context = useContext(BankContext);
    if (!context) throw new Error('useBanks must be used within BankProvider');
    return context;
};
