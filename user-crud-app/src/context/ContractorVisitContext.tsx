import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ContractorVisit, ContractorVisitContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ContractorVisitContext = createContext<ContractorVisitContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/contractors`;

export const ContractorVisitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visits, setVisits] = useState<ContractorVisit[]>([]);

    const fetchVisits = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setVisits(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch contractor visits:', error);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addVisit = async (visit: Omit<ContractorVisit, 'id' | 'folio' | 'created_at' | 'status'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...visit,
                    folio: generateFolio('VCON'),
                    status: 'active',
                    created_at: new Date().toISOString()
                })
            });
            await fetchVisits();
        } catch (error) {
            console.error('Error adding contractor visit:', error);
        }
    };

    const updateVisitStatus = async (id: string, status: ContractorVisit['status']) => {
        try {
            const visit = visits.find(v => v.id === id);
            if (visit) {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        ...visit, 
                        status, 
                        exit_at: status === 'exited' ? new Date().toLocaleTimeString() : visit.exit_at 
                    })
                });
                await fetchVisits();
            }
        } catch (error) {
            console.error('Error updating contractor visit status:', error);
        }
    };

    return (
        <ContractorVisitContext.Provider value={{ visits, addVisit, updateVisitStatus }}>
            {children}
        </ContractorVisitContext.Provider>
    );
};

export const useContractorVisits = () => {
    const context = useContext(ContractorVisitContext);
    if (!context) throw new Error('useContractorVisits must be used within ContractorVisitProvider');
    return context;
};
