import React, { createContext, useContext, useState, useEffect } from 'react';
import { crudService } from '../services/crudService';

interface BoardMember {
    id: string;
    name: string;
    position: string;
    dni: string;
    address: string;
    email?: string;
    phone?: string;
    photo?: string;
    signature_photo?: string;
    is_archived: boolean;
    created_at: string;
}

interface CondoBoardContextType {
    members: BoardMember[];
    loading: boolean;
    fetchMembers: () => Promise<void>;
    addMember: (data: any) => Promise<void>;
    updateMember: (id: string, data: any) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
}

const CondoBoardContext = createContext<CondoBoardContextType | undefined>(undefined);

export const CondoBoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [members, setMembers] = useState<BoardMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await crudService.getAll('condo_board');
            setMembers((Array.isArray(data) ? data : []).filter((m: any) => !m.is_archived));
        } catch (error) {
            console.error('Error fetching board members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const addMember = async (data: any) => {
        await crudService.create('condo_board', data);
        await fetchMembers();
    };

    const updateMember = async (id: string, data: any) => {
        await crudService.update('condo_board', id, data);
        await fetchMembers();
    };

    const deleteMember = async (id: string) => {
        await crudService.remove('condo_board', id);
        await fetchMembers();
    };

    return (
        <CondoBoardContext.Provider value={{ members, loading, fetchMembers, addMember, updateMember, deleteMember }}>
            {children}
        </CondoBoardContext.Provider>
    );
};

export const useCondoBoard = () => {
    const context = useContext(CondoBoardContext);
    if (context === undefined) {
        throw new Error('useCondoBoard must be used within a CondoBoardProvider');
    }
    return context;
};
