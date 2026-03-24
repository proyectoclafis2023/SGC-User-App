import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SpecialCondition, SpecialConditionContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const SpecialConditionContext = createContext<SpecialConditionContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/condiciones_especiales`; // Verify table name

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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(condition)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar la condición especial');
        }
        await fetchConditions();
    };

    const updateCondition = async (condition: SpecialCondition) => {
        const response = await fetch(`${API_URL}/${condition.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(condition)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar la condición especial');
        }
        await fetchConditions();
    };

    const deleteCondition = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar la condición especial');
        }
        await fetchConditions();
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
