import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CommonExpensePayment, CommonExpenseContextType, SpecialFund, CommonExpenseRule, CommunityExpense, ChargeRule, Payment } from '../types';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';

const CommonExpenseContext = createContext<CommonExpenseContextType | undefined>(undefined);

export const CommonExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<CommonExpensePayment[]>([]);
    const [rules, setRules] = useState<CommonExpenseRule[]>([]);
    const [funds, setFunds] = useState<SpecialFund[]>([]);
    const [communityExpenses, setCommunityExpenses] = useState<CommunityExpense[]>([]);
    const [chargeRules, setChargeRules] = useState<ChargeRule[]>([]);
    const [actualPayments, setActualPayments] = useState<Payment[]>([]);

    const fetchPayments = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/common_expense_payments`, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'x-role': user?.role || 'resident' }
            });
            if (response.ok) {
                const data = await response.json();
                setPayments(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching payments:', e); }
    }, [user?.role]);

    const fetchRules = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reglas_gastos_comunes`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setRules(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching rules:', e); }
    }, []);

    const fetchFunds = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/maestro_fondos`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                const arrayData = Array.isArray(data) ? data : [];
                setFunds(includeArchived ? arrayData : arrayData.filter((f: SpecialFund) => !f.is_archived));
            }
        } catch (e) { console.error('Error fetching funds:', e); }
    }, []);

    const fetchCommunityExpenses = React.useCallback(async (includeArchived = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/registro_gastos`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                const arrayData = Array.isArray(data) ? data : [];
                setCommunityExpenses(includeArchived ? arrayData : arrayData.filter((e: CommunityExpense) => !e.is_archived));
            }
        } catch (e) { console.error('Error fetching community expenses:', e); }
    }, []);

    const fetchChargeRules = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reglas_gastos_comunes`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setChargeRules(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching charge rules:', e); }
    }, []);

    const fetchActualPayments = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pagos_gastos_comunes`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setActualPayments(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching actual payments:', e); }
    }, []);

    useEffect(() => {
        fetchPayments();
        fetchRules();
        fetchFunds();
        fetchCommunityExpenses();
        fetchChargeRules();
        fetchActualPayments();
    }, [fetchPayments, fetchRules, fetchFunds, fetchCommunityExpenses, fetchChargeRules, fetchActualPayments]);

    const addPayment = React.useCallback(async (payment: Omit<CommonExpensePayment, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/common_expense_payments`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el pago');
        }
        await fetchPayments();
    }, [fetchPayments]);

    const updatePayment = React.useCallback(async (payment: CommonExpensePayment) => {
        const response = await fetch(`${API_BASE_URL}/common_expense_payments/${payment.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el pago');
        }
        await fetchPayments();
    }, [fetchPayments]);

    const deletePayment = React.useCallback(async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/common_expense_payments/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el pago');
        }
        await fetchPayments();
    }, [fetchPayments]);

    const addRule = React.useCallback(async (rule: Omit<CommonExpenseRule, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/reglas_gastos_comunes`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la regla');
        }
        await fetchRules();
    }, [fetchRules]);

    const calculateAmount = React.useCallback(async (deptId: string) => {
        try {
            // DEPRECATED in frontend, now handled via master generation per period.
            // Keeping for suggested payment preview if needed, but using backend logic.
            const response = await fetch(`${API_BASE_URL}/common_expense_payments?dept_id=${deptId}&status=unpaid`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                const latest = data.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))[0];
                return { 
                    suggestedAmount: latest?.amount_paid || 0, 
                    ruleUsed: latest ? `Deuda mensual periodo ${latest.period_year}-${latest.period_month}` : 'Sin deuda pendiente'
                };
            }
            return { suggestedAmount: 0, ruleUsed: 'Sin datos' };
        } catch (e) {
            console.error('Error calculating amount:', e);
            return { suggestedAmount: 0, ruleUsed: 'Error en conexión' };
        }
    }, []);

    const addFund = React.useCallback(async (fund: Omit<SpecialFund, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/maestro_fondos`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(fund)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el fondo especial');
        }
        await fetchFunds();
    }, [fetchFunds]);

    const updateFund = React.useCallback(async (fund: SpecialFund) => {
        const response = await fetch(`${API_BASE_URL}/maestro_fondos/${fund.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(fund)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el fondo especial');
        }
        await fetchFunds();
    }, [fetchFunds]);

    const deleteFund = React.useCallback(async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/maestro_fondos/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el fondo especial');
        }
        await fetchFunds();
    }, [fetchFunds]);

    const restoreFund = React.useCallback(async (id: string) => {
        const fund = funds.find(f => f.id === id);
        if (fund) await updateFund({ ...fund, is_archived: false } as any);
    }, [funds, updateFund]);

    const addCommunityExpense = React.useCallback(async (expense: Omit<CommunityExpense, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/registro_gastos`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el gasto de la comunidad');
        }
        await fetchCommunityExpenses();
    }, [fetchCommunityExpenses]);

    const deleteCommunityExpense = React.useCallback(async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/registro_gastos/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el gasto');
        }
        await fetchCommunityExpenses();
    }, [fetchCommunityExpenses]);

    const addChargeRule = React.useCallback(async (rule: Omit<ChargeRule, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/reglas_gastos_comunes`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la regla de cobro');
        }
        await fetchChargeRules();
    }, [fetchChargeRules]);

    const deleteChargeRule = React.useCallback(async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/reglas_gastos_comunes/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar la regla de cobro');
        }
        await fetchChargeRules();
    }, [fetchChargeRules]);

    const addActualPayment = React.useCallback(async (transaction: Omit<Payment, 'id' | 'created_at'>) => {
        const response = await fetch(`${API_BASE_URL}/pagos_gastos_comunes`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el pago');
        }
        await Promise.all([fetchActualPayments(), fetchPayments()]);
    }, [fetchActualPayments, fetchPayments]);

    const deleteActualPayment = React.useCallback(async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/pagos_gastos_comunes/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el pago');
        }
        await Promise.all([fetchActualPayments(), fetchPayments()]);
    }, [fetchActualPayments, fetchPayments]);

    return (
        <CommonExpenseContext.Provider value={{
            payments, funds, rules, communityExpenses, chargeRules, actualPayments, fetchPayments, fetchFunds, fetchCommunityExpenses, fetchChargeRules, fetchActualPayments,
            addPayment, updatePayment, deletePayment,
            addFund, updateFund, deleteFund, restoreFund, addRule, calculateAmount,
            addCommunityExpense, deleteCommunityExpense, addChargeRule, deleteChargeRule,
            addActualPayment, deleteActualPayment
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
