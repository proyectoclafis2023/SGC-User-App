import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface IPCProjection {
    id: string;
    name: string;
    ipcRate: number;
    description: string;
    isActive: boolean;
    createdAt: string;
}

interface IPCProjectionContextType {
    projections: IPCProjection[];
    addProjection: (p: Omit<IPCProjection, 'id' | 'createdAt'>) => Promise<void>;
    updateProjection: (p: IPCProjection) => Promise<void>;
    deleteProjection: (id: string) => Promise<void>;
}

const IPCProjectionContext = createContext<IPCProjectionContextType | undefined>(undefined);

export const IPCProjectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projections, setProjections] = useState<IPCProjection[]>([]);

    const fetchProjections = async () => {
        try {
            const data = await api.get<IPCProjection[]>('/ipc_projections');
            setProjections(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching IPC projections:', error);
        }
    };

    useEffect(() => {
        fetchProjections();
    }, []);

    const addProjection = async (p: Omit<IPCProjection, 'id' | 'createdAt'>) => {
        try {
            await api.post('/ipc_projections', p);
            await fetchProjections();
        } catch (error) {
            console.error('Error adding IPC projection:', error);
        }
    };

    const updateProjection = async (p: IPCProjection) => {
        try {
            await api.put(`/ipc_projections/${p.id}`, p);
            await fetchProjections();
        } catch (error) {
            console.error('Error updating IPC projection:', error);
        }
    };

    const deleteProjection = async (id: string) => {
        try {
            await api.delete(`/ipc_projections/${id}`);
            await fetchProjections();
        } catch (error) {
            console.error('Error deleting IPC projection:', error);
        }
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
