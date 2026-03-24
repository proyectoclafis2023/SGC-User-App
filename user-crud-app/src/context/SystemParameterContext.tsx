import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemParameter, SystemParameterContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const SystemParameterContext = createContext<SystemParameterContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/maestros_operativos`;

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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(parameter)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el parámetro del sistema');
        }
        await fetchParameters();
    };

    const updateParameter = async (parameter: SystemParameter) => {
        const response = await fetch(`${API_URL}/${parameter.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(parameter)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el parámetro del sistema');
        }
        await fetchParameters();
    };

    const deleteParameter = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el parámetro del sistema');
        }
        await fetchParameters();
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
