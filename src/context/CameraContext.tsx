import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Camera, CameraContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CameraContext = createContext<CameraContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/cameras`;

export const CameraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cameras, setCameras] = useState<Camera[]>([]);

    const fetchCameras = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setCameras(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch cameras:', error);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const addCamera = async (camera: Omit<Camera, 'id' | 'createdAt'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...camera, createdAt: new Date().toISOString() })
            });
            await fetchCameras();
        } catch (error) {
            console.error('Error adding camera:', error);
        }
    };

    const updateCamera = async (camera: Camera) => {
        try {
            await fetch(`${API_URL}/${camera.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(camera)
            });
            await fetchCameras();
        } catch (error) {
            console.error('Error updating camera:', error);
        }
    };

    const deleteCamera = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchCameras();
        } catch (error) {
            console.error('Error deleting camera:', error);
        }
    };

    return (
        <CameraContext.Provider value={{ cameras, addCamera, updateCamera, deleteCamera }}>
            {children}
        </CameraContext.Provider>
    );
};

export const useCameras = () => {
    const context = useContext(CameraContext);
    if (!context) throw new Error('useCameras must be used within CameraProvider');
    return context;
};
