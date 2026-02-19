import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, AuthState } from '../types';

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

    useEffect(() => {
        localStorage.setItem('auth', JSON.stringify(auth));
    }, [auth]);

    const login = async (username: string, pass: string) => {
        // Hardcoded admin/admin as requested in original requirements
        if (username === 'admin' && pass === 'admin') {
            const adminUser = {
                isAuthenticated: true,
                user: { name: 'Admin User', role: 'admin' }
            };
            setAuth(adminUser);
            return true;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: pass }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuth(data);
                return true;
            }
            // The provided snippet seems to be from a component that *uses* the login function,
            // not from within the login function definition itself.
            // Inserting it directly here would cause syntax errors and logical issues
            // (e.g., recursive call to login, undefined variables like navigate, setError, setLoading).
            // Therefore, to maintain a syntactically correct file, this specific snippet cannot be
            // inserted as-is into the AuthProvider's login function.
            // The original `return false;` for non-ok responses is kept.
            return false;
        } catch (error) {
            console.error('Login error:', error);
            // Returning false on network/server error for the caller to handle
            return false;
        }
    };

    const logout = () => {
        setAuth({ isAuthenticated: false, user: null });
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
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
