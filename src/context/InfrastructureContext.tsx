import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Tower, Department, InfrastructureContextType } from '../types';

const InfrastructureContext = createContext<InfrastructureContextType | undefined>(undefined);

const STORAGE_KEY = 'infrastructure_data';

const INITIAL_INFRASTRUCTURE: Tower[] = [
    {
        id: '1',
        name: 'Torre A',
        departments: [
            { id: '101', number: '101', residentName: 'Juan Pérez', residentType: 'owner', familyCount: 3, hasPets: false, specialConditions: '' },
            { id: '102', number: '102', residentName: 'María García', residentType: 'tenant', familyCount: 2, hasPets: true, specialConditions: 'Electro-dependiente' },
        ]
    }
];

export const InfrastructureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [towers, setTowers] = useState<Tower[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : INITIAL_INFRASTRUCTURE;
        } catch (e) {
            console.error('Error loading infrastructure:', e);
            return INITIAL_INFRASTRUCTURE;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(towers));
    }, [towers]);

    const addTower = async (tower: Omit<Tower, 'id'>) => {
        const newTower: Tower = {
            ...tower,
            id: Math.random().toString(36).substr(2, 9),
        };
        setTowers(prev => [...prev, newTower]);
    };

    const updateTower = async (tower: Tower) => {
        setTowers(prev => prev.map(t => t.id === tower.id ? tower : t));
    };

    const deleteTower = async (id: string) => {
        setTowers(prev => prev.filter(t => t.id !== id));
    };

    const duplicateTower = async (id: string, newName: string) => {
        const sourceTower = towers.find(t => t.id === id);
        if (!sourceTower) return;

        const duplicatedTower: Tower = {
            ...sourceTower,
            id: Math.random().toString(36).substr(2, 9),
            name: newName,
            // Opcionalmente podemos resetear los residentes de los departamentos al duplicar
            departments: sourceTower.departments.map(dept => ({
                ...dept,
                id: Math.random().toString(36).substr(2, 9),
                residentName: '',
                residentType: 'owner',
                familyCount: 0,
                hasPets: false,
                specialConditions: ''
            }))
        };
        setTowers(prev => [...prev, duplicatedTower]);
    };

    return (
        <InfrastructureContext.Provider value={{ towers, addTower, updateTower, deleteTower, duplicateTower }}>
            {children}
        </InfrastructureContext.Provider>
    );
};

export const useInfrastructure = () => {
    const context = useContext(InfrastructureContext);
    if (!context) throw new Error('useInfrastructure must be used within InfrastructureProvider');
    return context;
};
