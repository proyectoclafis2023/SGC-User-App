import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { InfrastructureItem, InfrastructureItemContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const InfrastructureItemContext = createContext<InfrastructureItemContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/infrastructure_items`;

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

    const addItem = async (item: Omit<InfrastructureItem, 'id' | 'createdAt'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, createdAt: new Date().toISOString() })
            });
            await fetchItems();
        } catch (error) {
            console.error('Error adding infrastructure item:', error);
        }
    };

    const updateItem = async (item: InfrastructureItem) => {
        try {
            await fetch(`${API_URL}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            await fetchItems();
        } catch (error) {
            console.error('Error updating infrastructure item:', error);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchItems();
        } catch (error) {
            console.error('Error deleting infrastructure item:', error);
        }
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
