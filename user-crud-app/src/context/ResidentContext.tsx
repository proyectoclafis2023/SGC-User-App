import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Resident, ResidentContextType } from '../types';
import { useHistoryLogs } from './HistoryLogContext';
import { API_BASE_URL } from '../config/api';

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/residentes`;

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

    const addResident = async (resident: Omit<Resident, 'id' | 'created_at' | 'status'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...resident,
                status: 'active'
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el residente');
        }

        const newRes = await response.json();
        await fetchResidents();

        await addLog({
            entityType: 'resident',
            entityId: newRes.id,
            unit_id: newRes.unit_id,
            action: 'created',
            details: `Residente ${newRes.names} ${newRes.last_names} registrado.`
        });
        return newRes;
    };

    const updateResident = async (resident: Resident) => {
        const response = await fetch(`${API_URL}/${resident.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(resident)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el residente');
        }
        await fetchResidents();
        await addLog({
            entityType: 'resident',
            entityId: resident.id,
            unit_id: resident.unit_id,
            action: 'updated',
            details: `Datos del residente ${resident.names} ${resident.last_names} actualizados.`
        });
    };

    const deleteResident = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el residente');
        }
        await fetchResidents();
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
