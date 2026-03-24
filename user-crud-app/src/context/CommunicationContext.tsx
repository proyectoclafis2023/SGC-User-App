import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CommunicationTemplate, CommunicationHistory, CommunicationContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

const TPL_API = `${API_BASE_URL}/maestro_mensajes`;
const HIST_API = `${API_BASE_URL}/communication_history`;

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
    const [history, setHistory] = useState<CommunicationHistory[]>([]);

    const fetchAll = async () => {
        try {
            const [tRes, hRes] = await Promise.all([
                fetch(TPL_API),
                fetch(HIST_API)
            ]);
            const tData = tRes.ok ? await tRes.json() : [];
            const hData = hRes.ok ? await hRes.json() : [];
            setTemplates(Array.isArray(tData) ? tData : []);
            setHistory(Array.isArray(hData) ? hData : []);
        } catch (e) {
            console.error('Error fetching communications:', e);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addTemplate = async (template: Omit<CommunicationTemplate, 'id' | 'created_at'>) => {
        const response = await fetch(TPL_API, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(template)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al agregar la plantilla de comunicación');
        }
        fetchAll();
    };

    const updateTemplate = async (template: CommunicationTemplate) => {
        const response = await fetch(`${TPL_API}/${template.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(template)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar la plantilla de comunicación');
        }
        fetchAll();
    };

    const deleteTemplate = async (id: string) => {
        const response = await fetch(`${TPL_API}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al eliminar la plantilla de comunicación');
        }
        fetchAll();
    };

    const addHistory = async (item: Omit<CommunicationHistory, 'id' | 'created_at'>) => {
        const response = await fetch(HIST_API, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar al historial de comunicación');
        }
        fetchAll();
    };

    return (
        <CommunicationContext.Provider value={{ 
            templates, 
            history, 
            addTemplate, 
            updateTemplate, 
            deleteTemplate, 
            addHistory 
        }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export const useCommunications = () => {
    const context = useContext(CommunicationContext);
    if (!context) throw new Error('useCommunications must be used within a CommunicationProvider');
    return context;
};
