import React, { createContext, useContext, useState, useEffect } from 'react';
import type { JornadaGroup } from '../types';
import { API_BASE_URL } from '../config/api';

interface JornadaGroupContextType {
    groups: JornadaGroup[];
    addGroup: (group: Omit<JornadaGroup, 'id'>) => Promise<void>;
    updateGroup: (group: JornadaGroup) => Promise<void>;
    deleteGroup: (id: string) => Promise<void>;
}

const JornadaGroupContext = createContext<JornadaGroupContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/jornada_groups`;

export const JornadaGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<JornadaGroup[]>([]);

    const fetchGroups = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setGroups(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching jornada groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGroup = async (group: Omit<JornadaGroup, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el grupo de jornada');
        }
        await fetchGroups();
    };

    const updateGroup = async (group: JornadaGroup) => {
        const response = await fetch(`${API_URL}/${group.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el grupo de jornada');
        }
        await fetchGroups();
    };

    const deleteGroup = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el grupo de jornada');
        }
        await fetchGroups();
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
