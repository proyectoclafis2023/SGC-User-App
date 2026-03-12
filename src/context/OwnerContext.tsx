import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Owner, OwnerContextType } from '../types';
import { useHistoryLogs } from './HistoryLogContext';
import { API_BASE_URL } from '../config/api';

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export const OwnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addLog } = useHistoryLogs();
    const [owners, setOwners] = useState<Owner[]>([]);

    const fetchOwners = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/owners`);
            if (response.ok) {
                const data = await response.json();
                setOwners(data);
            }
        } catch (e) {
            console.error('Error fetching owners:', e);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const addOwner = async (owner: Omit<Owner, 'id' | 'createdAt' | 'status'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/owners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...owner, status: 'active' })
            });

            if (response.ok) {
                const newOwner = await response.json();
                fetchOwners();
                await addLog({
                    entityType: 'owner',
                    entityId: newOwner.id,
                    action: 'created',
                    details: `Propietario ${newOwner.names} ${newOwner.lastNames} registrado.`
                });
                return newOwner.id;
            }
        } catch (e) {
            console.error('Error adding owner:', e);
        }
    };

    const updateOwner = async (owner: Owner) => {
        try {
            const response = await fetch(`${API_BASE_URL}/owners/${owner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(owner)
            });
            if (response.ok) {
                fetchOwners();
                await addLog({
                    entityType: 'owner',
                    entityId: owner.id,
                    action: 'updated',
                    details: `Propietario ${owner.names} ${owner.lastNames} actualizado.`
                });
            }
        } catch (e) {
            console.error('Error updating owner:', e);
        }
    };

    const deleteOwner = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/owners/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchOwners();
            }
        } catch (e) {
            console.error('Error deleting owner:', e);
        }
    };

    return (
        <OwnerContext.Provider value={{ owners, addOwner, updateOwner, deleteOwner }}>
            {children}
        </OwnerContext.Provider>
    );
};

export const useOwners = () => {
    const context = useContext(OwnerContext);
    if (!context) throw new Error('useOwners must be used within OwnerProvider');
    return context;
};
