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

    const addTicket = async (ticket_data: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'folio' | 'is_archived'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...ticket_data,
                folio: `REQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
                status: 'open'
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Error al agregar el ticket');
        }
        const newTicket = await response.json();
        await fetchTickets();
        return newTicket;
    };

    const updateTicketStatus = async (id: string, status: Ticket['status']) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status,
                acknowledged_at: (status === 'resolved' || status === 'closed') ? new Date().toISOString() : undefined
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el estado del ticket');
        }
        await fetchTickets();
    };

    const addSolutionNote = async (id: string, notes: string) => {
        await updateTicket(id, { admin_notes: notes });
    };

    const updateTicket = async (id: string, ticket_data: Partial<Ticket>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket_data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el ticket');
        }
        await fetchTickets();
    };

    const deleteTicket = async (id: string) => {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        await fetchTickets();
    };

    return (
        <TicketContext.Provider value={{ 
            tickets, 
            addTicket, 
            updateTicket, 
            deleteTicket, 
            updateTicketStatus, 
            addSolutionNote,
            refreshTickets: fetchTickets 
        }}>
            {children}
        </TicketContext.Provider>
    );
};

export const useTickets = () => {
    const context = useContext(TicketContext);
    if (!context) throw new Error('useTickets must be used within TicketProvider');
    return context;
};
