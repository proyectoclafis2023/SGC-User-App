import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SpecialCondition, SpecialConditionContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const SpecialConditionContext = createContext<SpecialConditionContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/special_conditions`; // Verify table name

export const SpecialConditionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [conditions, setConditions] = useState<SpecialCondition[]>([]);

    const fetchConditions = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setConditions(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch conditions:', error);
        }
    };

    useEffect(() => {
        fetchConditions();
    }, []);

    const addCondition = async (condition: Omit<SpecialCondition, 'id'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(condition)
            });
            await fetchConditions();
        } catch (error) {
            console.error('Error adding condition:', error);
        }
    };

    const updateCondition = async (condition: SpecialCondition) => {
        try {
            await fetch(`${API_URL}/${condition.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(condition)
            });
            await fetchConditions();
        } catch (error) {
            console.error('Error updating condition:', error);
        }
    };

    const deleteCondition = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchConditions();
        } catch (error) {
            console.error('Error deleting condition:', error);
        }
    };

    return (
        <SpecialConditionContext.Provider value={{ conditions, addCondition, updateCondition, deleteCondition }}>
            {children}
        </SpecialConditionContext.Provider>
    );
};

export const useSpecialConditions = () => {
    const context = useContext(SpecialConditionContext);
    if (!context) throw new Error('useSpecialConditions must be used within SpecialConditionProvider');
    return context;
};
