import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SystemSettings, SettingsContextType } from '../types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SystemSettings = {
    systemName: 'Administración GAG',
    systemIcon: 'G',
    darkMode: false
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        try {
            const stored = localStorage.getItem('system_settings');
            return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        } catch (e) {
            console.error('Error parsing settings:', e);
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem('system_settings', JSON.stringify(settings));
        document.title = settings.systemName;

        // Apply theme to document
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply favicon on initial load and settings change
        if (settings.systemFavicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.systemFavicon;
        }
    }, [settings]);

    const updateSettings = (newSettings: SystemSettings) => {
        setSettings(newSettings);
        localStorage.setItem('system_settings', JSON.stringify(newSettings)); // Explicitly update localStorage here as well

        // Actualizar Favicon dinámicamente
        if (newSettings.systemFavicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = newSettings.systemFavicon;
        }
    };

    const toggleTheme = () => {
        setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, toggleTheme }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
