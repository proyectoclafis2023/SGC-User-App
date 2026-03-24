import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { InfrastructureItem, InfrastructureItemContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const InfrastructureItemContext = createContext<InfrastructureItemContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/infraestructura`;

export const InfrastructureItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InfrastructureItem[]>([]);

    const fetchItems = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch infrastructure items:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const addItem = async (item: Omit<InfrastructureItem, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, created_at: new Date().toISOString() })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el ítem de infraestructura');
        }
        await fetchItems();
    };

    const updateItem = async (item: InfrastructureItem) => {
        const response = await fetch(`${API_URL}/${item.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el ítem de infraestructura');
        }
        await fetchItems();
    };

    const deleteItem = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el ítem de infraestructura');
        }
        await fetchItems();
    };

    return (
        <InfrastructureItemContext.Provider value={{ items, addItem, updateItem, deleteItem }}>
            {children}
        </InfrastructureItemContext.Provider>
    );
};

export const useInfrastructureItems = () => {
    const context = useContext(InfrastructureItemContext);
    if (!context) throw new Error('useInfrastructureItems must be used within InfrastructureItemProvider');
    return context;
};
