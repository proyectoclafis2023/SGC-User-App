import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CommonExpensePayment, CommonExpenseContextType, SpecialFund, CommonExpenseRule, CommunityExpense } from '../types';
import { API_BASE_URL } from '../config/api';

const CommonExpenseContext = createContext<CommonExpenseContextType | undefined>(undefined);

export const CommonExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [payments, setPayments] = useState<CommonExpensePayment[]>([]);
    const [rules, setRules] = useState<CommonExpenseRule[]>([]);
    const [funds, setFunds] = useState<SpecialFund[]>([]);
    const [communityExpenses, setCommunityExpenses] = useState<CommunityExpense[]>([]);

    const fetchPayments = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_payments`);
            if (response.ok) {
                const data = await response.json();
                setPayments(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching payments:', e); }
    }, []);

    const fetchRules = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_rules`);
            if (response.ok) {
                const data = await response.json();
                setRules(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching rules:', e); }
    }, []);

    const fetchFunds = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/special_funds`);
            if (response.ok) {
                const data = await response.json();
                const arrayData = Array.isArray(data) ? data : [];
                setFunds(includeArchived ? arrayData : arrayData.filter((f: SpecialFund) => !f.isArchived));
            }
        } catch (e) { console.error('Error fetching funds:', e); }
    }, []);

    const fetchCommunityExpenses = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/community_expenses`);
            if (response.ok) {
                const data = await response.json();
                const arrayData = Array.isArray(data) ? data : [];
                setCommunityExpenses(includeArchived ? arrayData : arrayData.filter((e: CommunityExpense) => !e.isArchived));
            }
        } catch (e) { console.error('Error fetching community expenses:', e); }
    }, []);

    useEffect(() => {
        fetchPayments();
        fetchRules();
        fetchFunds();
        fetchCommunityExpenses();
    }, [fetchPayments, fetchRules, fetchFunds, fetchCommunityExpenses]);

    const addPayment = React.useCallback(async (payment: Omit<CommonExpensePayment, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payment)
            });
            if (response.ok) fetchPayments();
        } catch (e) { console.error('Error adding payment:', e); }
    }, [fetchPayments]);

    const updatePayment = React.useCallback(async (payment: CommonExpensePayment) => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_payments/${payment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payment)
            });
            if (response.ok) fetchPayments();
        } catch (e) { console.error('Error updating payment:', e); }
    }, [fetchPayments]);

    const deletePayment = React.useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_payments/${id}`, { method: 'DELETE' });
            if (response.ok) fetchPayments();
        } catch (e) { console.error('Error deleting payment:', e); }
    }, [fetchPayments]);

    const addRule = React.useCallback(async (rule: Omit<CommonExpenseRule, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
            if (response.ok) fetchRules();
        } catch (e) { console.error('Error adding rule:', e); }
    }, [fetchRules]);

    const calculateAmount = React.useCallback(async (deptId: string) => {
        try {
            // 1. Get current month community expenses
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            
            // Sum community expenses for this period
            const totalMonthlyExpenses = communityExpenses
                .filter(e => {
                    const eDate = new Date(e.date);
                    return eDate.getMonth() + 1 === month && eDate.getFullYear() === year && !e.isArchived;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            if (totalMonthlyExpenses === 0) return { suggestedAmount: 0, ruleUsed: 'No hay gastos mensuales registrados' };

            // 2. Get total m2 and dept m2
            const deptsRes = await fetch(`${API_BASE_URL}/departments`);
            const departments = await deptsRes.json();
            
            const totalM2 = departments.reduce((acc: number, d: any) => acc + (Number(d.m2) || 0), 0);
            const dept = departments.find((d: any) => d.id === deptId);
            
            if (!dept || totalM2 === 0) return { suggestedAmount: 0, ruleUsed: 'Error en datos de m2' };

            const suggestedAmount = (totalMonthlyExpenses / totalM2) * (Number(dept.m2) || 0);

            return { 
                suggestedAmount: Math.round(suggestedAmount), 
                ruleUsed: `Proporcional por m2 (${dept.m2} m2 de ${totalM2} m2 totales)` 
            };
        } catch (e) {
            console.error('Error calculating amount:', e);
            return { suggestedAmount: 0, ruleUsed: 'Error en cálculo' };
        }
    }, [communityExpenses]);

    const addFund = React.useCallback(async (fund: Omit<SpecialFund, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/special_funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fund)
            });
            if (response.ok) fetchFunds();
        } catch (e) { console.error('Error adding fund:', e); }
    }, [fetchFunds]);

    const updateFund = React.useCallback(async (fund: SpecialFund) => {
        try {
            const response = await fetch(`${API_BASE_URL}/special_funds/${fund.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fund)
            });
            if (response.ok) fetchFunds();
        } catch (e) { console.error('Error updating fund:', e); }
    }, [fetchFunds]);

    const deleteFund = React.useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/special_funds/${id}`, { method: 'DELETE' });
            if (response.ok) fetchFunds();
        } catch (e) { console.error('Error deleting fund:', e); }
    }, [fetchFunds]);

    const restoreFund = React.useCallback(async (id: string) => {
        // Not implemented in generic CRUD yet (restore usually means setting isArchived=false)
        const fund = funds.find(f => f.id === id);
        if (fund) await updateFund({ ...fund, isArchived: false });
    }, [funds, updateFund]);

    const addCommunityExpense = React.useCallback(async (expense: Omit<CommunityExpense, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/community_expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });
            if (response.ok) fetchCommunityExpenses();
        } catch (e) { console.error('Error adding community expense:', e); }
    }, [fetchCommunityExpenses]);

    const deleteCommunityExpense = React.useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/community_expenses/${id}`, { method: 'DELETE' });
            if (response.ok) fetchCommunityExpenses();
        } catch (e) { console.error('Error deleting community expense:', e); }
    }, [fetchCommunityExpenses]);

    return (
        <CommonExpenseContext.Provider value={{
            payments, funds, rules, communityExpenses, fetchPayments, fetchFunds, fetchCommunityExpenses,
            addPayment, updatePayment, deletePayment,
            addFund, updateFund, deleteFund, restoreFund, addRule, calculateAmount,
            addCommunityExpense, deleteCommunityExpense
        }}>
            {children}
        </CommonExpenseContext.Provider>
    );
};

export const useCommonExpenses = () => {
    const context = useContext(CommonExpenseContext);
    if (!context) throw new Error('useCommonExpenses must be used within CommonExpenseProvider');
    return context;
};
