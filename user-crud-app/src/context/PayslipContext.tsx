import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Payslip, Advance, PayslipContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const PayslipContext = createContext<PayslipContextType | undefined>(undefined);

const PAYSLIPS_API = `${API_BASE_URL}/payslips`;
const ADVANCES_API = `${API_BASE_URL}/employee_advances`;

export const PayslipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [advances, setAdvances] = useState<Advance[]>([]);

    const fetchAll = async () => {
        try {
            const [pRes, aRes] = await Promise.all([
                fetch(PAYSLIPS_API),
                fetch(ADVANCES_API)
            ]);
            const pData = pRes.ok ? await pRes.json() : [];
            const aData = aRes.ok ? await aRes.json() : [];
            setPayslips(Array.isArray(pData) ? pData : []);
            setAdvances(Array.isArray(aData) ? aData : []);
        } catch (e) { console.error('Error fetching payslips/advances:', e); }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addPayslip = async (data: Omit<Payslip, 'id' | 'folio' | 'generated_at'>): Promise<Payslip> => {
        const lastFolio = payslips.length > 0 ? parseInt(payslips[0].folio) : 5000;
        const folio = (lastFolio + 1).toString();
        const generated_at = new Date().toISOString();

        const response = await fetch(PAYSLIPS_API, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, folio, generated_at })
        });

        if (response.ok) {
            const newPayslip = await response.json();
            fetchAll();
            return newPayslip;
        }
        throw new Error('Failed to create payslip');
    };

    const deletePayslip = async (id: string) => {
        const response = await fetch(`${PAYSLIPS_API}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAll();
    };

    const addAdvance = async (data: Omit<Advance, 'id' | 'status'>) => {
        const response = await fetch(ADVANCES_API, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, status: 'pending' })
        });
        if (response.ok) {
            const newAdvance = await response.json();
            fetchAll();
            return newAdvance.id;
        }
    };

    const updateAdvanceStatus = async (id: string, status: Advance['status'], payslip_id?: string) => {
        const advance = advances.find(a => a.id === id);
        if (advance) {
            const response = await fetch(`${ADVANCES_API}/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...advance, status, payslip_id })
            });
            if (response.ok) fetchAll();
        }
    };

    const deleteAdvance = async (id: string) => {
        const response = await fetch(`${ADVANCES_API}/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAll();
    };

    return (
        <PayslipContext.Provider value={{
            payslips,
            advances,
            addPayslip,
            deletePayslip,
            addAdvance,
            updateAdvanceStatus,
            deleteAdvance
        }}>
            {children}
        </PayslipContext.Provider>
    );
};

export const usePayslips = () => {
    const context = useContext(PayslipContext);
    if (!context) {
        throw new Error('usePayslips must be used within a PayslipProvider');
    }
    return context;
};
