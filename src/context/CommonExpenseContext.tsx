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
            if (response.ok) setPayments(await response.json());
        } catch (e) { console.error('Error fetching payments:', e); }
    }, []);

    const fetchRules = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_rules`);
            if (response.ok) setRules(await response.json());
        } catch (e) { console.error('Error fetching rules:', e); }
    }, []);

    const fetchFunds = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/special_funds`);
            if (response.ok) {
                const data = await response.json();
                setFunds(includeArchived ? data : data.filter((f: SpecialFund) => !f.isArchived));
            }
        } catch (e) { console.error('Error fetching funds:', e); }
    }, []);

    const fetchCommunityExpenses = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/community_expenses`);
            if (response.ok) {
                const data = await response.json();
                setCommunityExpenses(includeArchived ? data : data.filter((e: CommunityExpense) => !e.isArchived));
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
        // Logic for calculation can be frontend-based or backend-based
        // For now, return 0 or dummy
        return { suggestedAmount: 0, ruleUsed: null };
    }, []);

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
