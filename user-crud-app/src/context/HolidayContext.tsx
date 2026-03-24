import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Holiday, HolidayContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/feriados`;

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    const fetchHolidays = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setHolidays(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch holidays:', error);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const addHoliday = async (holiday: Omit<Holiday, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(holiday)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el feriado');
        }
        await fetchHolidays();
    };

    const updateHoliday = async (holiday: Holiday) => {
        const response = await fetch(`${API_URL}/${holiday.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(holiday)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el feriado');
        }
        await fetchHolidays();
    };

    const deleteHoliday = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el feriado');
        }
        await fetchHolidays();
    };

    return (
        <HolidayContext.Provider value={{ holidays, addHoliday, updateHoliday, deleteHoliday }}>
            {children}
        </HolidayContext.Provider>
    );
};

export const useHolidays = () => {
    const context = useContext(HolidayContext);
    if (!context) throw new Error('useHolidays must be used within HolidayProvider');
    return context;
};
