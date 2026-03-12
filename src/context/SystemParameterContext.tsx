import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemParameter, SystemParameterContextType } from '../types';

const SystemParameterContext = createContext<SystemParameterContextType | undefined>(undefined);

const DEFAULT_PARAMETERS: SystemParameter[] = [
    // Job Positions
    { id: 'jp_1', type: 'job_position', name: 'Conserje', isActive: true },
    { id: 'jp_2', type: 'job_position', name: 'Mayordomo', isActive: true },
    { id: 'jp_3', type: 'job_position', name: 'Aseador', isActive: true },
    { id: 'jp_4', type: 'job_position', name: 'Administrador', isActive: true },
    // Shifts
    { id: 'sh_1', type: 'shift', name: 'Turno Mañana (07:00 - 15:00)', isActive: true },
    { id: 'sh_2', type: 'shift', name: 'Turno Tarde (15:00 - 23:00)', isActive: true },
    { id: 'sh_3', type: 'shift', name: 'Turno Noche (23:00 - 07:00)', isActive: true },
    // Specialties
    { id: 'sp_1', type: 'contractor_specialty', name: 'Gasfitería', isActive: true },
    { id: 'sp_2', type: 'contractor_specialty', name: 'Electricista', isActive: true },
    { id: 'sp_3', type: 'contractor_specialty', name: 'Ascensores', isActive: true },
    { id: 'sp_4', type: 'contractor_specialty', name: 'Jardinería', isActive: true },
    { id: 'sp_5', type: 'contractor_specialty', name: 'Piscinas', isActive: true },
    // Ticket Categories
    { id: 'tc_1', type: 'ticket_category', name: 'Filtración de Agua', isActive: true },
    { id: 'tc_2', type: 'ticket_category', name: 'Ruidos Molestos', isActive: true },
    { id: 'tc_3', type: 'ticket_category', name: 'Daño en Áreas Comunes', isActive: true },
    { id: 'tc_4', type: 'ticket_category', name: 'Problemas de Acceso', isActive: true },
    { id: 'tc_5', type: 'ticket_category', name: 'Aseo y Ornato', isActive: true },
    { id: 'tc_6', type: 'ticket_category', name: 'Sugerencia General', isActive: true },
    // Article Categories
    { id: 'ac_1', type: 'article_category', name: 'Aseo', isActive: true },
    { id: 'ac_2', type: 'article_category', name: 'EPP', isActive: true },
    { id: 'ac_3', type: 'article_category', name: 'Oficina y Librería', isActive: true },
    { id: 'ac_4', type: 'article_category', name: 'Ferretería y Herramientas', isActive: true },
    // Pet Types
    { id: 'pt_1', type: 'pet_type', name: 'Perro', isActive: true },
    { id: 'pt_2', type: 'pet_type', name: 'Gato', isActive: true },
    { id: 'pt_3', type: 'pet_type', name: 'Ave', isActive: true },
    { id: 'pt_4', type: 'pet_type', name: 'Roedor', isActive: true },
    // Vehicle Types
    { id: 'vt_1', type: 'vehicle_type', name: 'Sedán', isActive: true },
    { id: 'vt_2', type: 'vehicle_type', name: 'SUV / Camioneta', isActive: true },
    { id: 'vt_3', type: 'vehicle_type', name: 'Motocicleta', isActive: true },
    { id: 'vt_4', type: 'vehicle_type', name: 'Bicicleta', isActive: true },
];

export const SystemParameterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [parameters, setParameters] = useState<SystemParameter[]>(() => {
        const saved = localStorage.getItem('sgc_system_parameters');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure any new default parameters are added
            const existingIds = new Set(parsed.map((p: SystemParameter) => p.id));
            const missingDefaults = DEFAULT_PARAMETERS.filter(p => !existingIds.has(p.id));
            return [...parsed, ...missingDefaults];
        }
        return DEFAULT_PARAMETERS;
    });

    useEffect(() => {
        localStorage.setItem('sgc_system_parameters', JSON.stringify(parameters));
    }, [parameters]);

    const addParameter = async (param: Omit<SystemParameter, 'id'>) => {
        const newParam: SystemParameter = {
            ...param,
            id: Date.now().toString()
        };
        setParameters(prev => [...prev, newParam]);
    };

    const updateParameter = async (id: string, updates: Partial<SystemParameter>) => {
        setParameters(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteParameter = async (id: string) => {
        setParameters(prev => prev.filter(p => p.id !== id));
    };

    return (
        <SystemParameterContext.Provider value={{ parameters, addParameter, updateParameter, deleteParameter }}>
            {children}
        </SystemParameterContext.Provider>
    );
};

export const useSystemParameters = () => {
    const context = useContext(SystemParameterContext);
    if (!context) throw new Error('useSystemParameters must be used within a SystemParameterProvider');
    return context;
};
