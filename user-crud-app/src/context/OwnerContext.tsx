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
            const response = await fetch(`${API_BASE_URL}/propietarios`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setOwners(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching owners:', e);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const addOwner = async (owner: Omit<Owner, 'id' | 'created_at' | 'status'>) => {
        const response = await fetch(`${API_BASE_URL}/propietarios`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...owner, status: 'active' })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar el propietario');
        }

        const newOwner = await response.json();
        await fetchOwners();
        await addLog({
            entityType: 'owner',
            entityId: newOwner.id,
            action: 'created',
            details: `Propietario ${newOwner.names} ${newOwner.last_names} registrado.`
        });
        return newOwner.id;
    };

    const updateOwner = async (owner: Owner) => {
        const response = await fetch(`${API_BASE_URL}/propietarios/${owner.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(owner)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar el propietario');
        }
        await fetchOwners();
        await addLog({
            entityType: 'owner',
            entityId: owner.id,
            action: 'updated',
            details: `Propietario ${owner.names} ${owner.last_names} actualizado.`
        });
    };

    const deleteOwner = async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/propietarios/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar el propietario');
        }
        await fetchOwners();
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
