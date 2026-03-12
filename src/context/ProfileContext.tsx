import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Profile, ProfileContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/profiles`;

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const fetchProfiles = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setProfiles(data);
            }
        } catch (e) {
            console.error('Error fetching profiles:', e);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const addProfile = async (profile: Omit<Profile, 'id'>) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (response.ok) await fetchProfiles();
        } catch (e) { console.error('Error adding profile:', e); }
    };

    const updateProfile = async (profile: Profile) => {
        try {
            const response = await fetch(`${API_URL}/${profile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (response.ok) await fetchProfiles();
        } catch (e) { console.error('Error updating profile:', e); }
    };

    const deleteProfile = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) await fetchProfiles();
        } catch (e) { console.error('Error deleting profile:', e); }
    };

    return (
        <ProfileContext.Provider value={{ profiles, addProfile, updateProfile, deleteProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfiles = () => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error('useProfiles must be used within ProfileProvider');
    return context;
};
