import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Courier, CourierContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CourierContext = createContext<CourierContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/couriers`;

export const CourierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [couriers, setCouriers] = useState<Courier[]>([]);

    const fetchCouriers = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setCouriers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch couriers:', error);
        }
    };

    useEffect(() => {
        fetchCouriers();
    }, []);

    const addCourier = async (courier: Omit<Courier, 'id'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(courier)
            });
            await fetchCouriers();
        } catch (error) {
            console.error('Error adding courier:', error);
        }
    };

    const updateCourier = async (courier: Courier) => {
        try {
            await fetch(`${API_URL}/${courier.id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(courier)
            });
            await fetchCouriers();
        } catch (error) {
            console.error('Error updating courier:', error);
        }
    };

    const deleteCourier = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchCouriers();
        } catch (error) {
            console.error('Error deleting courier:', error);
        }
    };

    return (
        <CourierContext.Provider value={{ couriers, addCourier, updateCourier, deleteCourier }}>
            {children}
        </CourierContext.Provider>
    );
};

export const useCouriers = () => {
    const context = useContext(CourierContext);
    if (!context) throw new Error('useCouriers must be used within CourierProvider');
    return context;
};
