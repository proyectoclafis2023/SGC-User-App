import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CommonSpace, CommonSpaceContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CommonSpaceContext = createContext<CommonSpaceContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/common_spaces`;

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
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(space)
            });
            await fetchSpaces();
        } catch (error) {
            console.error('Error adding space:', error);
        }
    };

    const updateSpace = async (space: CommonSpace) => {
        try {
            await fetch(`${API_URL}/${space.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(space)
            });
            await fetchSpaces();
        } catch (error) {
            console.error('Error updating space:', error);
        }
    };

    const deleteSpace = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchSpaces();
        } catch (error) {
            console.error('Error deleting space:', error);
        }
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
