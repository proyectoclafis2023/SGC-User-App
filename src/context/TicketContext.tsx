import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { Ticket, TicketContextType } from '../types';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/tickets`;

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const fetchTickets = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setTickets(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'folio'>) => {
        // Generate a folio
        const folio = `REQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = { ...ticketData, folio, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el ticket');
        }
        
        const newTicket = await response.json();
        await fetchTickets();
        return newTicket;
    };

    const updateTicket = async (id: string, ticketData: Partial<Ticket>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ticketData, updatedAt: new Date().toISOString() })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el ticket');
        }
        await fetchTickets();
    };

    const deleteTicket = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el ticket');
        }
        await fetchTickets();
    };

    const acknowledgeTicket = async (id: string, adminId: string) => {
        await updateTicket(id, {
            status: 'acknowledged',
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: adminId
        });
    };

    return (
        <TicketContext.Provider value={{ tickets, addTicket, updateTicket, deleteTicket, acknowledgeTicket, refreshTickets: fetchTickets }}>
            {children}
        </TicketContext.Provider>
    );
};

export const useTickets = () => {
    const context = useContext(TicketContext);
    if (!context) throw new Error('useTickets must be used within TicketProvider');
    return context;
};
