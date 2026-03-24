import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { ServiceDirectory, ServiceDirectoryContextType } from '../types';

const ServiceDirectoryContext = createContext<ServiceDirectoryContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/service_directory`;

export const ServiceDirectoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<ServiceDirectory[]>([]);

    const fetchServices = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setServices(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const addService = async (service: Omit<ServiceDirectory, 'id' | 'created_at' | 'updated_at' | 'is_archived'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar el servicio');
        }
        await fetchServices();
    };

    const updateService = async (id: string, service: Partial<ServiceDirectory>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar el servicio');
        }
        await fetchServices();
    };

    const deleteService = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar el servicio');
        }
        await fetchServices();
    };

    return (
        <ServiceDirectoryContext.Provider value={{
            services,
            addService,
            updateService,
            deleteService,
            refreshServices: fetchServices
        }}>
            {children}
        </ServiceDirectoryContext.Provider>
    );
};

export const useServiceDirectory = () => {
    const context = useContext(ServiceDirectoryContext);
    if (!context) throw new Error('useServiceDirectory must be used within ServiceDirectoryProvider');
    return context;
};
