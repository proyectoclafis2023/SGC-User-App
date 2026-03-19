import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UnitType, UnitTypeContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const UnitTypeContext = createContext<UnitTypeContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/unit_types`;

export const UnitTypeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);

    const fetchUnitTypes = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setUnitTypes(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch unit types:', error);
        }
    };

    useEffect(() => {
        fetchUnitTypes();
    }, []);

    const addUnitType = async (unitType: Omit<UnitType, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unitType)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el tipo de unidad');
        }
        const data = await response.json();
        await fetchUnitTypes();
        return data;
    };

    const updateUnitType = async (unitType: UnitType) => {
        const response = await fetch(`${API_URL}/${unitType.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unitType)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el tipo de unidad');
        }
        await fetchUnitTypes();
    };

    const deleteUnitType = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el tipo de unidad');
        }
        await fetchUnitTypes();
    };

    return (
        <UnitTypeContext.Provider value={{ unitTypes, addUnitType, updateUnitType, deleteUnitType }}>
            {children}
        </UnitTypeContext.Provider>
    );
};

export const useUnitTypes = () => {
    const context = useContext(UnitTypeContext);
    if (!context) throw new Error('useUnitTypes must be used within UnitTypeProvider');
    return context;
};
