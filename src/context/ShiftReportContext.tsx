import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ShiftReport, ShiftReportContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ShiftReportContext = createContext<ShiftReportContextType | undefined>(undefined);

export const ShiftReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<ShiftReport[]>([]);

    const fetchReports = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports`);
            if (response.ok) {
                const data = await response.json();
                setReports(data);
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

    const addReport = async (report: Omit<ShiftReport, 'id' | 'folio' | 'createdAt' | 'status' | 'hasIncidents' | 'hasInfrastructureIssues' | 'hasEquipmentIssues'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newRecord: ShiftReport = {
            ...report,
            id,
            status: 'open',
            hasIncidents: false,
            hasInfrastructureIssues: false,
            hasEquipmentIssues: false,
            folio: generateFolio('SHR'),
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            if (response.ok) {
                fetchReports();
            }
        } catch (e) {
            console.error('API Error adding shift report:', e);
        }
    };

    const updateReport = async (id: string, data: Partial<ShiftReport>) => {
        const report = reports.find(r => r.id === id);
        if (!report) return;

        const updated = { ...report, ...data };

        try {
            const response = await fetch(`${API_BASE_URL}/shift_reports/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            closedAt: new Date().toISOString()
        });
    };

    const reopenShift = async (id: string, adminName: string, reason: string) => {
        await updateReport(id, {
            status: 'open',
            adminReopenedBy: adminName,
            adminReopenReason: reason,
            closedAt: undefined
        });
    };

    const deleteReport = async (id: string) => {
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
