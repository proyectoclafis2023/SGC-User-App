import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Correspondence, CorrespondenceContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CorrespondenceContext = createContext<CorrespondenceContextType | undefined>(undefined);

const BACKEND_URL = `${API_BASE_URL}/correspondence`;

export const CorrespondenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Correspondence[]>([]);

    const fetchItems = async () => {
        try {
            const response = await fetch(BACKEND_URL);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (e) {
            console.error('Error fetching correspondence:', e);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const addItem = async (item: Omit<Correspondence, 'id' | 'folio' | 'createdAt'>) => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const folio = `COR-${date}-${rand}`;

        try {
            const resp = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, folio })
            });

            if (resp.ok) {
                fetchItems();
            }
        } catch (e) {
            console.error('API Error adding correspondence:', e);
        }
    };

    const updateItemStatus = async (id: string, status: Correspondence['status'], deliveredAt?: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const updated = { 
            ...item, 
            status, 
            deliveredAt: status === 'delivered' ? (deliveredAt || new Date().toISOString()) : item.deliveredAt 
        };

        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (resp.ok) {
                fetchItems();
            }
        } catch (e) {
            console.error('API Error updating correspondence:', e);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (resp.ok) {
                fetchItems();
            }
        } catch (e) {
            console.error('API Error deleting correspondence:', e);
        }
    };

    return (
        <CorrespondenceContext.Provider value={{ items, addItem, updateItemStatus, deleteItem }}>
            {children}
        </CorrespondenceContext.Provider>
    );
};

export const useCorrespondence = () => {
    const context = useContext(CorrespondenceContext);
    if (!context) throw new Error('useCorrespondence must be used within CorrespondenceProvider');
    return context;
};
