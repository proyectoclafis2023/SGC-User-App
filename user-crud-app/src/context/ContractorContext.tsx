import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Contractor, ContractorContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ContractorContext = createContext<ContractorContextType | undefined>(undefined);

const BACKEND_URL = `${API_BASE_URL}/contractors`;

export const ContractorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contractors, setContractors] = useState<Contractor[]>([]);

    const fetchContractors = async () => {
        try {
            const response = await fetch(BACKEND_URL);
            if (response.ok) {
                const data = await response.json();
                setContractors(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching contractors:', e);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${dateStr}-${rand}`;
    };

    const addContractor = async (contractor: Omit<Contractor, 'id' | 'folio' | 'created_at'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: Contractor = {
            ...contractor,
            id,
            folio: generateFolio('CON'),
            created_at: new Date().toISOString()
        };

        try {
            const resp = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            if (resp.ok) {
                fetchContractors();
            }
        } catch (e) {
            console.error('API Error adding contractor:', e);
        }
    };

    const updateContractor = async (contractor: Contractor) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/${contractor.id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(contractor)
            });
            if (resp.ok) {
                fetchContractors();
            }
        } catch (e) {
            console.error('API Error updating contractor:', e);
        }
    };

    const deleteContractor = async (id: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (resp.ok) {
                fetchContractors();
            }
        } catch (e) {
            console.error('API Error deleting contractor:', e);
        }
    };

    return (
        <ContractorContext.Provider value={{ contractors, addContractor, updateContractor, deleteContractor }}>
            {children}
        </ContractorContext.Provider>
    );
};

export const useContractors = () => {
    const context = useContext(ContractorContext);
    if (!context) throw new Error('useContractors must be used within ContractorProvider');
    return context;
};
