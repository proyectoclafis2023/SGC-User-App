import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Reservation, ReservationContextType } from '../types';

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const STORAGE_KEY = 'reservations_data';

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reservations, setReservations] = useState<Reservation[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading reservations:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    }, [reservations]);

    const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
        const newRes: Reservation = {
            ...reservation,
            id: Math.random().toString(36).substr(2, 9),
        };
        setReservations(prev => [newRes, ...prev]);
    };

    const updateReservation = async (reservation: Reservation) => {
        setReservations(prev => prev.map(r => r.id === reservation.id ? reservation : r));
    };

    const deleteReservation = async (id: string) => {
        setReservations(prev => prev.filter(r => r.id !== id));
    };

    return (
        <ReservationContext.Provider value={{ reservations, addReservation, updateReservation, deleteReservation }}>
            {children}
        </ReservationContext.Provider>
    );
};

export const useReservations = () => {
    const context = useContext(ReservationContext);
    if (!context) throw new Error('useReservations must be used within ReservationProvider');
    return context;
};
