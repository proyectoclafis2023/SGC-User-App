import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Profile, ProfileContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/profiles`;

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const fetchProfiles = async () => {
        try {
            const [profilesRes, permsRes] = await Promise.all([
                fetch(API_URL),
                fetch(`${API_BASE_URL}/profile_permissions`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
            ]);
            
            if (profilesRes.ok && permsRes.ok) {
                const profilesData = await profilesRes.json();
                const permsData = await permsRes.json();
                
                const combined = profilesData.map((p: any) => ({
                    ...p,
                    permissions: permsData.find((pr: any) => pr.profileId === p.id) || {}
                }));
                
                setProfiles(Array.isArray(combined) ? combined : []);
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
            const { permissions, ...rest } = profile as any;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(rest)
            });
            if (response.ok) {
                const newProfile = await response.json();
                if (permissions) {
                    await fetch(`${API_BASE_URL}/profile_permissions`, {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...permissions, profileId: newProfile.id })
                    });
                }
                await fetchProfiles();
            }
        } catch (e) { console.error('Error adding profile:', e); }
    };

    const updateProfile = async (profile: Profile) => {
        try {
            const { permissions, ...rest } = profile as any;
            const response = await fetch(`${API_URL}/${profile.id}`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                body: JSON.stringify(rest)
            });
            if (response.ok) {
                if (permissions) {
                    // Try to update first, if fail (404/500 if not exist), could create but usually exists
                    await fetch(`${API_BASE_URL}/profile_permissions/${profile.id}`, {
                        method: 'PUT',
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...permissions, profileId: profile.id })
                    });
                }
                await fetchProfiles();
            }
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
