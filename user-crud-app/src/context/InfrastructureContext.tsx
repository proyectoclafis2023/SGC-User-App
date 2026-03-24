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
                fetch(`${API_BASE_URL}/torres`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }),
                fetch(`${API_BASE_URL}/unidades`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
            ]);
            const tData = towersRes.ok ? await towersRes.json() : [];
            const dData = deptsRes.ok ? await deptsRes.json() : [];
            setTowers(Array.isArray(tData) ? tData : []);
            setDepartments(Array.isArray(dData) ? dData : []);
        } catch (e) {
            console.error('Error fetching data:', e);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addTower = async (tower: Omit<Tower, 'id'>) => {
        const response = await fetch(`${API_BASE_URL}/torres`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(tower)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la torre');
        }
        const data = await response.json();
        await fetchAll();
        return data;
    };

    const updateTower = async (updatedTower: Tower) => {
        const response = await fetch(`${API_BASE_URL}/torres/${updatedTower.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTower)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar la torre');
        }
        await fetchAll();
    };

    const deleteTower = async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/torres/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar la torre');
        }
        await fetchAll();
    };

    const duplicateTower = async (id: string, newName: string) => {
        const sourceTower = towers.find(t => t.id === id);
        if (!sourceTower) return;
        const { id: _, ...rest } = sourceTower;
        await addTower({ ...rest, name: newName, departments: sourceTower.departments || [] });
    };

    const addDepartment = async (dept: Omit<Department, 'id'>) => {
        const response = await fetch(`${API_BASE_URL}/unidades`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el departamento');
        }
        const data = await response.json();
        await fetchAll();
        return data;
    };

    const updateDepartment = async (dept: Department) => {
        const response = await fetch(`${API_BASE_URL}/unidades/${dept.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el departamento');
        }
        await fetchAll();
    };

    const deleteDepartment = async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/unidades/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el departamento');
        }
        await fetchAll();
    };

    const enrichedTowers = useMemo(() => {
        const mapped = towers.map(tower => ({
            ...tower,
            departments: (departments || [])
                .filter(d => d.tower_id === tower.id)
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
