import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { HistoryLog } from '../types';

interface HistoryLogContextType {
    logs: HistoryLog[];
    addLog: (log: Omit<HistoryLog, 'id' | 'timestamp'>) => Promise<void>;
    getLogsByEntity: (entityType: HistoryLog['entityType'], entityId: string) => HistoryLog[];
    getLogsByUnit: (unitId: string) => HistoryLog[];
}

const HistoryLogContext = createContext<HistoryLogContextType | undefined>(undefined);

import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/history_logs`;

export const HistoryLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<HistoryLog[]>([]);

    const fetchLogs = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setLogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch history logs:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const addLog = async (log: Omit<HistoryLog, 'id' | 'timestamp'>) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...log,
                    timestamp: new Date().toISOString()
                })
            });
            if (response.ok) {
                await fetchLogs();
            }
        } catch (error) {
            console.error('Error adding history log:', error);
        }
    };


    const getLogsByEntity = (entityType: HistoryLog['entityType'], entityId: string) => {
        return logs.filter(l => l.entityType === entityType && l.entityId === entityId);
    };

    const getLogsByUnit = (unitId: string) => {
        return logs.filter(l => l.unitId === unitId);
    };

    return (
        <HistoryLogContext.Provider value={{ logs, addLog, getLogsByEntity, getLogsByUnit }}>
            {children}
        </HistoryLogContext.Provider>
    );
};

export const useHistoryLogs = () => {
    const context = useContext(HistoryLogContext);
    if (!context) throw new Error('useHistoryLogs must be used within HistoryLogProvider');
    return context;
};
