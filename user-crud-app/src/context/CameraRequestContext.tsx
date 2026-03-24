import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CameraRequest, CameraRequestContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CameraRequestContext = createContext<CameraRequestContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/camera_requests`;

export const CameraRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<CameraRequest[]>([]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setRequests(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch camera requests:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const generateFolio = (prefix: string) => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${date}-${rand}`;
    };

    const addRequest = async (request: Omit<CameraRequest, 'id' | 'folio' | 'status' | 'created_at'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...request,
                    folio: generateFolio('CAM'),
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
            });
            await fetchRequests();
        } catch (error) {
            console.error('Error adding camera request:', error);
        }
    };

    const updateRequestStatus = async (id: string, status: CameraRequest['status'], admin_notes?: string) => {
        try {
            const req = requests.find(r => r.id === id);
            if (req) {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...req, status, admin_notes })
                });
                await fetchRequests();
            }
        } catch (error) {
            console.error('Error updating camera request status:', error);
        }
    };

    const deleteRequest = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchRequests();
        } catch (error) {
            console.error('Error deleting camera request:', error);
        }
    };

    return (
        <CameraRequestContext.Provider value={{ requests, addRequest, updateRequestStatus, deleteRequest }}>
            {children}
        </CameraRequestContext.Provider>
    );
};

export const useCameraRequests = () => {
    const context = useContext(CameraRequestContext);
    if (!context) throw new Error('useCameraRequests must be used within CameraRequestProvider');
    return context;
};
