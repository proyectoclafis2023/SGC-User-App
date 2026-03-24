import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CommonSpace, CommonSpaceContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CommonSpaceContext = createContext<CommonSpaceContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/espacios`;

export const CommonSpaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [spaces, setSpaces] = useState<CommonSpace[]>([]);

    const fetchSpaces = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setSpaces(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch spaces:', error);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const addSpace = async (space: Omit<CommonSpace, 'id'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(space)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el espacio común');
        }
        await fetchSpaces();
    };

    const updateSpace = async (space: CommonSpace) => {
        const response = await fetch(`${API_URL}/${space.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(space)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el espacio común');
        }
        await fetchSpaces();
    };

    const deleteSpace = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el espacio común');
        }
        await fetchSpaces();
    };

    return (
        <CommonSpaceContext.Provider value={{ spaces, addSpace, updateSpace, deleteSpace }}>
            {children}
        </CommonSpaceContext.Provider>
    );
};

export const useCommonSpaces = () => {
    const context = useContext(CommonSpaceContext);
    if (!context) throw new Error('useCommonSpaces must be used within CommonSpaceProvider');
    return context;
};
