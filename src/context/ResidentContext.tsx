import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Resident, ResidentContextType } from '../types';
import { useHistoryLogs } from './HistoryLogContext';
import { API_BASE_URL } from '../config/api';

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/residents`;

export const ResidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addLog } = useHistoryLogs();
    const [residents, setResidents] = useState<Resident[]>([]);

    const fetchResidents = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setResidents(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch from backend:', error);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const uploadResidents = async (file: File) => {
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
        await fetchResidents();
        return result;
    };

    const addResident = async (resident: Omit<Resident, 'id' | 'createdAt' | 'status'>) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...resident,
                    status: 'active'
                })
            });

            if (response.ok) {
                const newRes = await response.json();
                await fetchResidents();

                await addLog({
                    entityType: 'resident',
                    entityId: newRes.id,
                    unitId: newRes.unitId,
                    action: 'created',
                    details: `Residente ${newRes.names} ${newRes.lastNames} registrado.`
                });
                return newRes.id;
            }
        } catch (e) {
            console.error('API Error adding resident:', e);
        }
    };

    const updateResident = async (resident: Resident) => {
        try {
            const response = await fetch(`${API_URL}/${resident.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resident)
            });
            if (response.ok) {
                await fetchResidents();
                await addLog({
                    entityType: 'resident',
                    entityId: resident.id,
                    unitId: resident.unitId,
                    action: 'updated',
                    details: `Datos del residente ${resident.names} ${resident.lastNames} actualizados.`
                });
            }
        } catch (e) {
            console.error('Error updating resident:', e);
        }
    };

    const deleteResident = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchResidents();
            }
        } catch (e) {
            console.error('Error deleting resident:', e);
        }
    };

    return (
        <ResidentContext.Provider value={{ residents, addResident, updateResident, deleteResident, uploadResidents }}>
            {children}
        </ResidentContext.Provider>
    );
};

export const useResidents = () => {
    const context = useContext(ResidentContext);
    if (!context) throw new Error('useResidents must be used within ResidentProvider');
    return context;
};
