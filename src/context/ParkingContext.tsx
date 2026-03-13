import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Parking, ParkingContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/parking`;

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

    const addParking = async (parking: Omit<Parking, 'id' | 'createdAt'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parking)
            });
            await fetchParkings();
        } catch (error) {
            console.error('Error adding parking:', error);
        }
    };

    const updateParking = async (parking: Parking) => {
        try {
            await fetch(`${API_URL}/${parking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parking)
            });
            await fetchParkings();
        } catch (error) {
            console.error('Error updating parking:', error);
        }
    };

    const deleteParking = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchParkings();
        } catch (error) {
            console.error('Error deleting parking:', error);
        }
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
