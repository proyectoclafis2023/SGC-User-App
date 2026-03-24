import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import type { IPCProjection } from '../types';

interface IPCProjectionContextType {
    projections: IPCProjection[];
    addProjection: (p: Omit<IPCProjection, 'id' | 'created_at'>) => Promise<void>;
    updateProjection: (p: IPCProjection) => Promise<void>;
    deleteProjection: (id: string) => Promise<void>;
}

const IPCProjectionContext = createContext<IPCProjectionContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/maestro_ipc`;

export const IPCProjectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projections, setProjections] = useState<IPCProjection[]>([]);

    const fetchProjections = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setProjections(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching projections:', error);
        }
    };

    useEffect(() => {
        fetchProjections();
    }, []);

    const addProjection = async (p: Omit<IPCProjection, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la proyección IPC');
        }
        await fetchProjections();
    };

    const updateProjection = async (p: IPCProjection) => {
        const response = await fetch(`${API_URL}/${p.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar la proyección IPC');
        }
        await fetchProjections();
    };

    const deleteProjection = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar la proyección IPC');
        }
        await fetchProjections();
    };

    return (
        <IPCProjectionContext.Provider value={{ projections, addProjection, updateProjection, deleteProjection }}>
            {children}
        </IPCProjectionContext.Provider>
    );
};

export const useIPCProjections = () => {
    const context = useContext(IPCProjectionContext);
    if (!context) throw new Error('useIPCProjections must be used within an IPCProjectionProvider');
    return context;
};
