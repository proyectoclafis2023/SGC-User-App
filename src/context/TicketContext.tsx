import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Ticket, TicketContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const BACKEND_URL = `${API_BASE_URL}/tickets`;

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const fetchTickets = async () => {
        try {
            const response = await fetch(BACKEND_URL);
            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            }
        } catch (e) {
            console.error('Error fetching tickets:', e);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addTicket = async (ticketData: Omit<Ticket, 'id' | 'folio' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const id = `TCK-${Date.now()}`;
        const newTicket: Ticket = {
            ...ticketData,
            id,
            folio: generateFolio('TCK'),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            const resp = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });
            if (resp.ok) {
                fetchTickets();
            }
        } catch (e) {
            console.error('API Error adding ticket:', e);
        }
    };

    const updateTicketStatus = async (id: string, status: Ticket['status'], adminNotes?: string) => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        const updated = {
            ...ticket,
            status,
            updatedAt: new Date().toISOString(),
            adminNotes: adminNotes !== undefined ? adminNotes : ticket.adminNotes,
        };

        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (resp.ok) {
                fetchTickets();
            }
        } catch (e) {
            console.error('API Error updating ticket:', e);
        }
    };

    const deleteTicket = async (id: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (resp.ok) {
                fetchTickets();
            }
        } catch (e) {
            console.error('API Error deleting ticket:', e);
        }
    };

    return (
        <TicketContext.Provider value={{
            tickets,
            addTicket,
            updateTicketStatus,
            deleteTicket
        }}>
            {children}
        </TicketContext.Provider>
    );
};

export const useTickets = () => {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketProvider');
    }
    return context;
};
