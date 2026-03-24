import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, AuthState } from '../types';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        try {
            const stored = localStorage.getItem('auth');
            return stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };
        } catch (e) {
            console.error('Error parsing auth state:', e);
            localStorage.removeItem('auth');
            return { isAuthenticated: false, user: null };
        }
    });

    const updateUserAuthData = (data: Partial<NonNullable<AuthState['user']>>) => {
        setAuth(prev => {
            if (!prev.user) return prev;
            return { ...prev, user: { ...prev.user, ...data } };
        });
    };

    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(auth));
    }, [auth]);

    const login = async (username: string, pass: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setAuth({
                    isAuthenticated: true,
                    user: data.user
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const changePassword = async (newPassword: string) => {
        if (!auth.user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/users/${auth.user.id}/change-password`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });

            if (response.ok) {
                setAuth(prev => ({
                    ...prev,
                    user: prev.user ? { ...prev.user, mustChangePassword: false } : null
                }));
            }
        } catch (e) {
            console.error('Error changing password:', e);
        }
    };

    const loginWithGoogle = async (email: string, name: string, photoUrl?: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, photoUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuth(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            return false;
        }
    };

    const logout = () => {
        setAuth({ isAuthenticated: false, user: null });
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, loginWithGoogle, logout, updateUserAuthData, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
