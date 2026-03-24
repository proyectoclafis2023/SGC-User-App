import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { EquipmentItem, EquipmentItemContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const EquipmentItemContext = createContext<EquipmentItemContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/equipamiento`;

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

    const addItem = async (item: Omit<EquipmentItem, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, created_at: new Date().toISOString() })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el ítem de equipamiento');
        }
        await fetchItems();
    };

    const updateItem = async (item: EquipmentItem) => {
        const response = await fetch(`${API_URL}/${item.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el ítem de equipamiento');
        }
        await fetchItems();
    };

    const deleteItem = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el ítem de equipamiento');
        }
        await fetchItems();
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
