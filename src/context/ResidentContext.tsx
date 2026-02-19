import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Resident, ResidentContextType } from '../types';

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

const STORAGE_KEY = 'residents_data';

export const ResidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [residents, setResidents] = useState<Resident[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
            return [
                {
                    id: 'r1',
                    names: 'Alexis',
                    lastNames: 'Sanchez',
                    dni: '15.555.555-5',
                    phone: '+56911111111',
                    email: 'as7@example.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'r2',
                    names: 'Arturo',
                    lastNames: 'Vidal',
                    dni: '16.666.666-6',
                    phone: '+56922222222',
                    email: 'king@example.com',
                    createdAt: new Date().toISOString()
                }
            ];
        } catch (e) {
            console.error('Error loading residents:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(residents));
    }, [residents]);

    useEffect(() => {
        const handleSync = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) setResidents(JSON.parse(e.newValue));
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    const addResident = async (resident: Omit<Resident, 'id' | 'createdAt'>) => {
        const newRecord: Resident = {
            ...resident,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        setResidents(prev => [newRecord, ...prev]);
    };

    const updateResident = async (resident: Resident) => {
        setResidents(prev => prev.map(r => r.id === resident.id ? resident : r));
    };

    const deleteResident = async (id: string) => {
        setResidents(prev => prev.filter(r => r.id !== id));
    };

    return (
        <ResidentContext.Provider value={{ residents, addResident, updateResident, deleteResident }}>
            {children}
        </ResidentContext.Provider>
    );
};

export const useResidents = () => {
    const context = useContext(ResidentContext);
    if (!context) throw new Error('useResidents must be used within ResidentProvider');
    return context;
};
