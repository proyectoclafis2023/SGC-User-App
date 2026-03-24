import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Certificate, CertificateContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/certificates`;

export const CertificateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    const fetchCertificates = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setCertificates(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const addCertificate = async (certificate: Omit<Certificate, 'id' | 'folio' | 'generated_at'>) => {
        try {
            const folio = `CERT-${Date.now()}`;
            const generated_at = new Date().toISOString();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...certificate, folio, generated_at })
            });
            if (response.ok) {
                const newCert = await response.json();
                await fetchCertificates();
                return newCert;
            }
        } catch (error) {
            console.error('Error adding certificate:', error);
        }
        throw new Error('Failed to create certificate');
    };

    const deleteCertificate = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchCertificates();
        } catch (error) {
            console.error('Error deleting certificate:', error);
        }
    };

    return (
        <CertificateContext.Provider value={{ certificates, addCertificate, deleteCertificate }}>
            {children}
        </CertificateContext.Provider>
    );
};

export const useCertificates = () => {
    const context = useContext(CertificateContext);
    if (!context) throw new Error('useCertificates must be used within CertificateProvider');
    return context;
};
