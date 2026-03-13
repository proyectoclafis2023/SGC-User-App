import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PensionFund, PensionFundContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const PensionFundContext = createContext<PensionFundContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/pension_funds`;

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
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fund)
            });
            await fetchFunds();
        } catch (error) {
            console.error('Error adding pension fund:', error);
        }
    };

    const updateFund = async (fund: PensionFund) => {
        try {
            await fetch(`${API_URL}/${fund.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fund)
            });
            await fetchFunds();
        } catch (error) {
            console.error('Error updating pension fund:', error);
        }
    };

    const deleteFund = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchFunds();
        } catch (error) {
            console.error('Error deleting pension fund:', error);
        }
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
