import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Personnel, PersonnelContextType } from '../types';

const PersonnelContext = createContext<PersonnelContextType | undefined>(undefined);

const STORAGE_KEY = 'personnel_data';

export const PersonnelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [personnel, setPersonnel] = useState<Personnel[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
            return [
                {
                    id: 'p1',
                    names: 'Jorge',
                    lastNames: 'Valdivia',
                    dni: '12.345.678-9',
                    isHonorary: false,
                    baseSalary: 850000,
                    vacationDays: 15,
                    address: 'Calle Falsa 123',
                    hasEmergencyContact: true,
                    emergencyContact: { names: 'Daniela', lastNames: 'Aranguiz', phone: '+56912345678' },
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'p2',
                    names: 'Esteban',
                    lastNames: 'Pavez',
                    dni: '18.765.432-1',
                    isHonorary: true,
                    baseSalary: 1200000,
                    vacationDays: 0,
                    address: 'Avenida Siempre Viva 742',
                    hasEmergencyContact: false,
                    createdAt: new Date().toISOString()
                }
            ];
        } catch (e) {
            console.error('Error loading personnel:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(personnel));
    }, [personnel]);

    useEffect(() => {
        const handleSync = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) setPersonnel(JSON.parse(e.newValue));
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    const addPersonnel = async (person: Omit<Personnel, 'id' | 'createdAt'>) => {
        const newRecord: Personnel = {
            ...person,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        setPersonnel(prev => [newRecord, ...prev]);
    };

    const updatePersonnel = async (person: Personnel) => {
        setPersonnel(prev => prev.map(p => p.id === person.id ? person : p));
    };

    const deletePersonnel = async (id: string) => {
        setPersonnel(prev => prev.filter(p => p.id !== id));
    };

    return (
        <PersonnelContext.Provider value={{ personnel, addPersonnel, updatePersonnel, deletePersonnel }}>
            {children}
        </PersonnelContext.Provider>
    );
};

export const usePersonnel = () => {
    const context = useContext(PersonnelContext);
    if (!context) throw new Error('usePersonnel must be used within PersonnelProvider');
    return context;
};
