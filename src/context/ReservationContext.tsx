import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Reservation, ReservationContextType, ReservationLog } from '../types';
import { API_BASE_URL } from '../config/api';

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/reservations`;
const LOGS_API_URL = `${API_BASE_URL}/reservation_logs`;

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [reservationLogs, setReservationLogs] = useState<ReservationLog[]>([]);

    const fetchReservations = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setReservations(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch(LOGS_API_URL);
            if (response.ok) {
                const data = await response.json();
                setReservationLogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch reservation logs:', error);
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchLogs();
    }, []);

    const addLog = async (resId: string, userId: string, action: ReservationLog['action'], details: string) => {
        try {
            await fetch(LOGS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservationId: resId,
                    userId,
                    action,
                    details,
                    timestamp: new Date().toISOString()
                })
            });
            await fetchLogs();
        } catch (error) {
            console.error('Error adding reservation log:', error);
        }
    };

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addReservation = async (reservation: Omit<Reservation, 'id' | 'folio' | 'createdAt' | 'status' | 'paymentStatus'>) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...reservation,
                    folio: generateFolio('RES'),
                    status: 'pending',
                    paymentStatus: 'pending',
                    createdAt: new Date().toISOString()
                })
            });
            if (response.ok) {
                const newRes = await response.json();
                await fetchReservations();
                await addLog(newRes.id, reservation.userId, 'created', 'Reserva solicitada por el usuario');
            }
        } catch (error) {
            console.error('Error adding reservation:', error);
        }
    };

    const updateReservation = async (reservation: Reservation) => {
        try {
            await fetch(`${API_URL}/${reservation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservation)
            });
            await fetchReservations();
        } catch (error) {
            console.error('Error updating reservation:', error);
        }
    };

    const deleteReservation = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchReservations();
        } catch (error) {
            console.error('Error deleting reservation:', error);
        }
    };

    const approveReservation = async (id: string, adminId: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            status: 'approved',
            approvalUserId: adminId,
            approvalDate: new Date().toISOString()
        });
        await addLog(id, adminId, 'approved', 'Reserva aprobada por administración');
    };

    const rejectReservation = async (id: string, adminId: string, reason: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            status: 'rejected',
            notes: reason
        });
        await addLog(id, adminId, 'rejected', `Reserva rechazada: ${reason}`);
    };

    const confirmPayment = async (id: string, adminId: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            paymentStatus: 'paid'
        });
        await addLog(id, adminId, 'payment_confirmed', 'Pago registrado por administración');
    };

    const uploadSignedDocument = async (id: string, url: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            signedDocumentUrl: url
        });
    };

    return (
        <ReservationContext.Provider value={{
            reservations,
            reservationLogs,
            addReservation,
            updateReservation,
            deleteReservation,
            approveReservation,
            rejectReservation,
            confirmPayment,
            uploadSignedDocument
        }}>
            {children}
        </ReservationContext.Provider>
    );
};

export const useReservations = () => {
    const context = useContext(ReservationContext);
    if (!context) throw new Error('useReservations must be used within ReservationProvider');
    return context;
};
