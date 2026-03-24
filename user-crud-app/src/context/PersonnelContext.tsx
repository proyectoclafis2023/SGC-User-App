import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Personnel, PersonnelContextType } from '../types';
import { useHistoryLogs } from './HistoryLogContext';
import { useSettings } from './SettingsContext';
import { API_BASE_URL } from '../config/api';

const PersonnelContext = createContext<PersonnelContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/personnel`;

export const PersonnelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addLog } = useHistoryLogs();
    const { settings } = useSettings();
    const [personnel, setPersonnel] = useState<Personnel[]>([]);

    const fetchPersonnel = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setPersonnel(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch personnel from backend:', error);
        }
    };

    useEffect(() => {
        fetchPersonnel();
    }, []);

    // Accrue vacations based on the last update time
    useEffect(() => {
        if (personnel.length === 0) return;
        const now = new Date();
        const accrualRate = settings.vacationAccrualRate || 1.25;

        let requiresUpdate = false;
        const updatedPersonnel = personnel.map(p => {
            if (p.status === 'inactive' || p.is_archived) return p;

            const lastUpdateStr = p.vacation_last_update || p.created_at || now.toISOString();
            const lastUpdate = new Date(lastUpdateStr);
            const diffMonths = (now.getFullYear() - lastUpdate.getFullYear()) * 12 + (now.getMonth() - lastUpdate.getMonth());

            if (diffMonths >= 1) {
                requiresUpdate = true;
                const addedDays = diffMonths * accrualRate;
                const newUpdateDate = new Date(lastUpdate);
                newUpdateDate.setMonth(newUpdateDate.getMonth() + diffMonths);

                return {
                    ...p,
                    vacation_days: (Number(p.vacation_days) || 0) + addedDays,
                    vacation_last_update: newUpdateDate.toISOString()
                };
            }
            return p;
        });

        if (requiresUpdate) {
            setPersonnel(updatedPersonnel);
            // In a real scenario, we should also PUT these updates to the backend
        }
    }, [personnel, settings.vacationAccrualRate]);

    const uploadPersonnel = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir archivo');
        }
        const result = await response.json();
        await fetchPersonnel();
        return result;
    };

    const addPersonnel = async (person: Omit<Personnel, 'id' | 'created_at' | 'status'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...person, status: 'active' })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el personal');
        }

        const newPerson = await response.json();
        await fetchPersonnel();
        await addLog({
            entityType: 'personnel',
            entityId: newPerson.id,
            action: 'created',
            details: `Personal ${newPerson.names} registrado.`
        });
        return newPerson;
    };

    const updatePersonnel = async (person: Personnel) => {
        const response = await fetch(`${API_URL}/${person.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(person)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el personal');
        }
        await fetchPersonnel();
        await addLog({
            entityType: 'personnel',
            entityId: person.id,
            action: 'updated',
            details: `Personal ${person.names} actualizado.`
        });
    };

    const deletePersonnel = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el personal');
        }
        await fetchPersonnel();
    };

    return (
        <PersonnelContext.Provider value={{ personnel, addPersonnel, updatePersonnel, deletePersonnel, uploadPersonnel }}>
            {children}
        </PersonnelContext.Provider>
    );
};

export const usePersonnel = () => {
    const context = useContext(PersonnelContext);
    if (!context) throw new Error('usePersonnel must be used within PersonnelProvider');
    return context;
};
