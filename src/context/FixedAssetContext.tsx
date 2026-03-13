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

    const addAsset = async (asset: Omit<FixedAsset, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset)
            });
            if (response.ok) await fetchAssets();
        } catch (e) { console.error('Error adding fixed asset:', e); }
    };

    const updateAsset = async (asset: FixedAsset) => {
        try {
            const response = await fetch(`${API_URL}/${asset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset)
            });
            if (response.ok) await fetchAssets();
        } catch (e) { console.error('Error updating fixed asset:', e); }
    };

    const deleteAsset = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) await fetchAssets();
        } catch (e) { console.error('Error deleting fixed asset:', e); }
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
