import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Bank, BankContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const BankContext = createContext<BankContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/banks`;

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
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bank)
            });
            if (response.ok) {
                const newBank = await response.json();
                await fetchBanks();
                return newBank.id;
            }
        } catch (error) {
            console.error('Error adding bank:', error);
        }
        return '';
    };

    const updateBank = async (bank: Bank) => {
        try {
            await fetch(`${API_URL}/${bank.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bank)
            });
            await fetchBanks();
        } catch (error) {
            console.error('Error updating bank:', error);
        }
    };

    const deleteBank = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchBanks();
        } catch (error) {
            console.error('Error deleting bank:', error);
        }
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
