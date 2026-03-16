import React, { createContext, useContext, useState, useEffect } from 'react';
import type { JornadaGroup } from '../types';
import { api } from '../services/api';

interface JornadaGroupContextType {
    groups: JornadaGroup[];
    addGroup: (group: Omit<JornadaGroup, 'id'>) => Promise<void>;
    updateGroup: (group: JornadaGroup) => Promise<void>;
    deleteGroup: (id: string) => Promise<void>;
}

const JornadaGroupContext = createContext<JornadaGroupContextType | undefined>(undefined);

export const JornadaGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<JornadaGroup[]>([]);

    const fetchGroups = async () => {
        try {
            const data = await api.get<JornadaGroup[]>('/jornada_groups');
            setGroups(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching jornada groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGroup = async (group: Omit<JornadaGroup, 'id'>) => {
        try {
            await api.post('/jornada_groups', group);
            await fetchGroups();
        } catch (error) {
            console.error('Error adding jornada group:', error);
        }
    };

    const updateGroup = async (group: JornadaGroup) => {
        try {
            await api.put(`/jornada_groups/${group.id}`, group);
            await fetchGroups();
        } catch (error) {
            console.error('Error updating jornada group:', error);
        }
    };

    const deleteGroup = async (id: string) => {
        try {
            await api.delete(`/jornada_groups/${id}`);
            await fetchGroups();
        } catch (error) {
            console.error('Error deleting jornada group:', error);
        }
    };

    return (
        <JornadaGroupContext.Provider value={{ groups, addGroup, updateGroup, deleteGroup }}>
            {children}
        </JornadaGroupContext.Provider>
    );
};

export const useJornadaGroups = () => {
    const context = useContext(JornadaGroupContext);
    if (!context) throw new Error('useJornadaGroups must be used within a JornadaGroupProvider');
    return context;
};
