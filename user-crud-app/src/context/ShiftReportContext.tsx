import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ShiftReport, ShiftReportContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ShiftReportContext = createContext<ShiftReportContextType | undefined>(undefined);

export const ShiftReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<ShiftReport[]>([]);

    const fetchReports = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            if (response.ok) {
                const data = await response.json();
                setReports(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching shift reports:', e);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${dateStr}-${rand}`;
    };

    const addReport = async (report: Omit<ShiftReport, 'id' | 'folio' | 'created_at' | 'status' | 'has_incidents' | 'has_infrastructure_issues' | 'has_equipment_issues'>): Promise<boolean> => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: ShiftReport = {
            ...report,
            id,
            status: 'open',
            has_incidents: false,
            has_infrastructure_issues: false,
            has_equipment_issues: false,
            folio: generateFolio('SHR'),
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            if (response.ok) {
                await fetchReports();
                return true;
            }
            return false;
        } catch (e) {
            console.error('API Error adding shift report:', e);
            return false;
        }
    };

    const updateReport = async (id: string, data: Partial<ShiftReport>) => {
        const report = reports.find(r => r.id === id);
        if (!report) return;

        const updated = { ...report, ...data };

        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (response.ok) {
                fetchReports();
            }
        } catch (e) {
            console.error('API Error updating shift report:', e);
        }
    };

    const closeShift = async (id: string, data: Partial<ShiftReport>) => {
        await updateReport(id, {
            ...data,
            status: 'closed',
            closed_at: new Date().toISOString()
        });
    };

    const reopenShift = async (id: string, admin_name: string, reason: string) => {
        await updateReport(id, {
            status: 'open',
            admin_reopened_by: admin_name,
            admin_reopen_reason: reason,
            closed_at: undefined
        });
    };

    const deleteReport = async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchReports();
            }
        } catch (e) {
            console.error('API Error deleting shift report:', e);
        }
    };

    const clearAllReports = () => {
        if (window.confirm('¿Está seguro de que desea eliminar TODO el historial de turnos? Esta acción no se puede deshacer.')) {
            // Usually requires a specific DELETE ALL endpoint, skipping for safety
        }
    };

    return (
        <ShiftReportContext.Provider value={{ reports, addReport, updateReport, closeShift, reopenShift, deleteReport, clearAllReports }}>
            {children}
        </ShiftReportContext.Provider>
    );
};

export const useShiftReport = () => {
    const context = useContext(ShiftReportContext);
    if (!context) throw new Error('useShiftReport must be used within ShiftReportProvider');
    return context;
};
