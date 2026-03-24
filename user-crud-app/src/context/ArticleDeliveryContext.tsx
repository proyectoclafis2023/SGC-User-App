import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ArticleDelivery, ArticleDeliveryContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ArticleDeliveryContext = createContext<ArticleDeliveryContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/article_deliveries`;

export const ArticleDeliveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deliveries, setDeliveries] = useState<ArticleDelivery[]>([]);

    const fetchDeliveries = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setDeliveries(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching deliveries:', e);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addDelivery = async (delivery: Omit<ArticleDelivery, 'id' | 'folio' | 'created_at'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: ArticleDelivery = {
            ...delivery,
            id,
            folio: generateFolio('DEL'),
            created_at: new Date().toISOString()
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la entrega del artículo');
        }
        await fetchDeliveries();
        return newRecord.id;
    };

    const updateDelivery = async (delivery: ArticleDelivery) => {
        const response = await fetch(`${API_URL}/${delivery.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(delivery)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar la entrega del artículo');
        }
        await fetchDeliveries();
    };

    const deleteDelivery = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar la entrega del artículo');
        }
        await fetchDeliveries();
    };

    return (
        <ArticleDeliveryContext.Provider value={{ deliveries, addDelivery, updateDelivery, deleteDelivery, setDeliveries }}>
            {children}
        </ArticleDeliveryContext.Provider>
    );
};

export const useArticleDeliveries = () => {
    const context = useContext(ArticleDeliveryContext);
    if (!context) throw new Error('useArticleDeliveries must be used within ArticleDeliveryProvider');
    return context;
};
