import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { FixedAsset, FixedAssetContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const FixedAssetContext = createContext<FixedAssetContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/fixed_assets`;

export const FixedAssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [assets, setAssets] = useState<FixedAsset[]>([]);

    const fetchAssets = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setAssets(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching fixed assets:', e);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const addAsset = async (asset: Omit<FixedAsset, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(asset)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el activo fijo');
        }
        await fetchAssets();
    };

    const updateAsset = async (asset: FixedAsset) => {
        const response = await fetch(`${API_URL}/${asset.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(asset)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el activo fijo');
        }
        await fetchAssets();
    };

    const deleteAsset = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el activo fijo');
        }
        await fetchAssets();
    };

    return (
        <FixedAssetContext.Provider value={{ assets, addAsset, updateAsset, deleteAsset }}>
            {children}
        </FixedAssetContext.Provider>
    );
};

export const useFixedAssets = () => {
    const context = useContext(FixedAssetContext);
    if (!context) throw new Error('useFixedAssets must be used within FixedAssetProvider');
    return context;
};
