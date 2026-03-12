import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Tower, Department, InfrastructureContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const InfrastructureContext = createContext<InfrastructureContextType | undefined>(undefined);

export const InfrastructureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [towers, setTowers] = useState<Tower[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const fetchAll = async () => {
        try {
            const [towersRes, deptsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/towers`),
                fetch(`${API_BASE_URL}/departments`)
            ]);
            if (towersRes.ok) setTowers(await towersRes.json());
            if (deptsRes.ok) setDepartments(await deptsRes.json());
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addTower = async (tower: Omit<Tower, 'id'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/towers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tower)
            });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) {
            console.error('Error adding tower:', e);
        }
    };

    const updateTower = async (updatedTower: Tower) => {
        try {
            const response = await fetch(`${API_BASE_URL}/towers/${updatedTower.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTower)
            });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) { console.error('Error updating tower:', e); }
    };

    const deleteTower = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/towers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) { console.error('Error deleting tower:', e); }
    };

    const duplicateTower = async (id: string, newName: string) => {
        const sourceTower = towers.find(t => t.id === id);
        if (!sourceTower) return;
        const { id: _, ...rest } = sourceTower;
        await addTower({ ...rest, name: newName, departments: sourceTower.departments || [] });
    };

    const addDepartment = async (dept: Omit<Department, 'id'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dept)
            });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) { console.error('Error adding department:', e); }
    };

    const updateDepartment = async (dept: Department) => {
        try {
            const response = await fetch(`${API_BASE_URL}/departments/${dept.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dept)
            });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) { console.error('Error updating department:', e); }
    };

    const deleteDepartment = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/departments/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchAll();
            }
        } catch (e) { console.error('Error deleting department:', e); }
    };

    const enrichedTowers = useMemo(() => {
        const mapped = towers.map(tower => ({
            ...tower,
            departments: (departments || [])
                .filter(d => d.towerId === tower.id)
                .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
        }));
        return mapped.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }, [towers, departments]);

    return (
        <InfrastructureContext.Provider value={{ 
            towers: enrichedTowers, 
            departments, 
            addTower, 
            updateTower, 
            deleteTower, 
            duplicateTower, 
            addDepartment, 
            updateDepartment, 
            deleteDepartment,
            fetchAll 
        }}>
            {children}
        </InfrastructureContext.Provider>
    );
};

export const useInfrastructure = () => {
    const context = useContext(InfrastructureContext);
    if (!context) throw new Error('useInfrastructure must be used within InfrastructureProvider');
    return context;
};
