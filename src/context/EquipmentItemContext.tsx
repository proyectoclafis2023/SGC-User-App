import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { EquipmentItem, EquipmentItemContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const EquipmentItemContext = createContext<EquipmentItemContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/equipment_items`;

export const EquipmentItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<EquipmentItem[]>([]);

    const fetchItems = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch equipment items:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const addItem = async (item: Omit<EquipmentItem, 'id' | 'createdAt'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, createdAt: new Date().toISOString() })
            });
            await fetchItems();
        } catch (error) {
            console.error('Error adding equipment item:', error);
        }
    };

    const updateItem = async (item: EquipmentItem) => {
        try {
            await fetch(`${API_URL}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            await fetchItems();
        } catch (error) {
            console.error('Error updating equipment item:', error);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchItems();
        } catch (error) {
            console.error('Error deleting equipment item:', error);
        }
    };

    return (
        <EquipmentItemContext.Provider value={{ items, addItem, updateItem, deleteItem }}>
            {children}
        </EquipmentItemContext.Provider>
    );
};

export const useEquipmentItems = () => {
    const context = useContext(EquipmentItemContext);
    if (!context) throw new Error('useEquipmentItems must be used within EquipmentItemProvider');
    return context;
};
