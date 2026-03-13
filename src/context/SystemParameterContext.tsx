import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemParameter, SystemParameterContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const SystemParameterContext = createContext<SystemParameterContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/system_parameters`;

export const SystemParameterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [parameters, setParameters] = useState<SystemParameter[]>([]);

    const fetchParameters = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setParameters(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch system parameters:', error);
        }
    };

    useEffect(() => {
        fetchParameters();
    }, []);

    const addParameter = async (parameter: Omit<SystemParameter, 'id'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parameter)
            });
            await fetchParameters();
        } catch (error) {
            console.error('Error adding system parameter:', error);
        }
    };

    const updateParameter = async (parameter: SystemParameter) => {
        try {
            await fetch(`${API_URL}/${parameter.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parameter)
            });
            await fetchParameters();
        } catch (error) {
            console.error('Error updating system parameter:', error);
        }
    };

    const deleteParameter = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchParameters();
        } catch (error) {
            console.error('Error deleting system parameter:', error);
        }
    };

    return (
        <SystemParameterContext.Provider value={{ parameters, addParameter, updateParameter, deleteParameter }}>
            {children}
        </SystemParameterContext.Provider>
    );
};

export const useSystemParameters = () => {
    const context = useContext(SystemParameterContext);
    if (!context) throw new Error('useSystemParameters must be used within SystemParameterProvider');
    return context;
};
