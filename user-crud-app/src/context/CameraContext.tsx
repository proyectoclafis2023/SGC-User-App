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

    const addCamera = async (camera: Omit<Camera, 'id' | 'created_at'>) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...camera, created_at: new Date().toISOString() })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al agregar la cámara');
        }
        await fetchCameras();
    };

    const updateCamera = async (camera: Camera) => {
        const response = await fetch(`${API_URL}/${camera.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(camera)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al actualizar la cámara');
        }
        await fetchCameras();
    };

    const deleteCamera = async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al eliminar la cámara');
        }
        await fetchCameras();
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
