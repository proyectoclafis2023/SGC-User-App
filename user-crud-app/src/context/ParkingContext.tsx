import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Parking, ParkingContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/estacionamientos`;

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [parkings, setParkings] = useState<Parking[]>([]);

    const fetchParkings = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setParkings(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch parkings:', error);
        }
    };

    useEffect(() => {
        fetchParkings();
    }, []);

    const addParking = async (parking: Omit<Parking, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(parking)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el estacionamiento');
        }
        await fetchParkings();
    };

    const updateParking = async (parking: Parking) => {
        const response = await fetch(`${API_URL}/${parking.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(parking)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el estacionamiento');
        }
        await fetchParkings();
    };

    const deleteParking = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el estacionamiento');
        }
        await fetchParkings();
    };

    return (
        <ParkingContext.Provider value={{ parkings, addParking, updateParking, deleteParking }}>
            {children}
        </ParkingContext.Provider>
    );
};

export const useParkings = () => {
    const context = useContext(ParkingContext);
    if (!context) throw new Error('useParkings must be used within ParkingProvider');
    return context;
};
