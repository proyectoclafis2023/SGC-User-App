import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Reservation, ReservationContextType, ReservationLog } from '../types';
import { API_BASE_URL } from '../config/api';

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/reservas`;
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

    const addLog = async (res_id: string, resident_id: string, action: ReservationLog['action'], details: string) => {
        await fetch(LOGS_API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservation_id: res_id,
                resident_id,
                action,
                details,
                timestamp: new Date().toISOString()
            })
        });
        await fetchLogs();
    };

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addReservation = async (reservation: Omit<Reservation, 'id' | 'folio' | 'is_archived' | 'created_at' | 'status' | 'payment_status'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...reservation,
                folio: generateFolio('RES'),
                status: 'pending',
                payment_status: 'pending'
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Error al agregar la reserva');
        }
        const newRes = await response.json();
        await fetchReservations();
        await addLog(newRes.id, reservation.resident_id, 'created', 'Reserva solicitada por el usuario');
    };

    const updateReservation = async (reservation: Reservation) => {
        const response = await fetch(`${API_URL}/${reservation.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Error al actualizar la reserva');
        }
        await fetchReservations();
    };

    const deleteReservation = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.message || 'Error al eliminar la reserva');
        }
        await fetchReservations();
    };

    const approveReservation = async (id: string, admin_id: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            status: 'approved',
            approval_user_id: admin_id,
            approval_date: new Date().toISOString()
        });
        await addLog(id, admin_id, 'approved', 'Reserva aprobada por administración');
    };

    const rejectReservation = async (id: string, admin_id: string, reason: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            status: 'rejected',
            notes: reason
        });
        await addLog(id, admin_id, 'rejected', `Reserva rechazada: ${reason}`);
    };

    const confirmPayment = async (id: string, admin_id: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            payment_status: 'paid'
        });
        await addLog(id, admin_id, 'payment_confirmed', 'Pago registrado por administración');
    };

    const uploadSignedDocument = async (id: string, url: string) => {
        const res = reservations.find(r => r.id === id);
        if (!res) return;
        await updateReservation({
            ...res,
            signed_document_url: url
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
