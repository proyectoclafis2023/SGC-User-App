import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/users`;

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const addUser = async (user: Omit<User, 'id' | 'created_at'>) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, created_at: new Date().toISOString() })
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const updateUser = async (id: string, user: Omit<User, 'id' | 'created_at'>) => {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const resetPassword = async (id: string, newPassword: string) => {
        try {
            await fetch(`${API_URL}/${id}/change-password`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    return (
        <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, resetPassword }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUsers must be used within UserProvider');
    return context;
};
