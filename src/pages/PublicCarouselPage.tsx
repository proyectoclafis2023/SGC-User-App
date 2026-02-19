import React, { useState, useEffect } from 'react';
import { useSystemMessages } from '../context/SystemMessageContext';
import { useSettings } from '../context/SettingsContext';
import { Bell, ShieldAlert, Info, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { SystemMessage } from '../types';

export const PublicCarouselPage: React.FC = () => {
    const { messages } = useSystemMessages();
    const { settings } = useSettings();
    const activeMessages = messages.filter(m => m.isActive);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (currentIndex >= activeMessages.length && activeMessages.length > 0) {
            setCurrentIndex(0);
        }
    }, [activeMessages.length, currentIndex]);

    useEffect(() => {
        if (activeMessages.length <= 1) {
            setCurrentIndex(0);
            return;
        }

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeMessages.length);
        }, 8000); // 8 segundos por mensaje

        return () => clearInterval(timer);
    }, [activeMessages.length]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getMessageAssets = (type: SystemMessage['type']) => {
        switch (type) {
            case 'danger': return {
                icon: <ShieldAlert className="w-24 h-24 mb-6 animate-pulse" />,
                bg: 'bg-red-600',
                accent: 'bg-red-700',
                label: 'Aviso Crítico'
            };
            case 'warning': return {
                icon: <AlertTriangle className="w-24 h-24 mb-6" />,
                bg: 'bg-amber-500',
                accent: 'bg-amber-600',
                label: 'Advertencia'
            };
            case 'success': return {
                icon: <CheckCircle2 className="w-24 h-24 mb-6" />,
                bg: 'bg-emerald-600',
                accent: 'bg-emerald-700',
                label: 'Información Importante'
            };
            default: return {
                icon: <Info className="w-24 h-24 mb-6" />,
                bg: 'bg-blue-600',
                accent: 'bg-blue-700',
                label: 'Comunicado Personal'
            };
        }
    };

    if (activeMessages.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-6">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <Bell className="w-12 h-12 text-gray-500" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">{settings.systemName}</h1>
                    <p className="text-xl text-gray-400">Sin avisos pendientes por mostrar en este momento.</p>
                </div>
            </div>
        );
    }

    const currentMsg = activeMessages[currentIndex];
    const assets = getMessageAssets(currentMsg.type);

    return (
        <div className={`min-h-screen ${assets.bg} flex flex-col transition-colors duration-1000 text-white overflow-hidden relative`}>
            {/* Fondo Decorativo Dinámico */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white opacity-20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-black opacity-10 blur-[150px]" />
            </div>

            {/* Header del Carrusel */}
            <header className={`${assets.accent} px-12 py-8 flex items-center justify-between shadow-2xl relative z-10`}>
                <div className="flex items-center space-x-6">
                    {settings.systemLogo ? (
                        <img src={settings.systemLogo} alt="Logo" className="h-16 w-auto object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl font-bold text-3xl shrink-0">
                            {settings.systemIcon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase">{settings.systemName}</h1>
                        <p className="text-sm font-bold tracking-widest opacity-80 uppercase">Plataforma de Comunicación Comunitaria</p>
                    </div>
                </div>
                <div className="flex items-center bg-black/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 shadow-inner">
                    <Clock className="w-8 h-8 mr-4 opacity-80" />
                    <div className="text-right">
                        <p className="text-3xl font-black tracking-widest leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">
                            {currentTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col items-center justify-center px-12 relative z-10">
                <div className="max-w-7xl w-full flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-700">
                    <div className={`${assets.accent} p-10 rounded-[4rem] shadow-2xl shadow-black/20 mb-12 border border-white/10`}>
                        {assets.icon}
                    </div>

                    <div className="space-y-6">
                        <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-black uppercase tracking-[0.3em] border border-white/30">
                            {assets.label}
                        </span>
                        <p className="text-7xl lg:text-8xl font-black leading-tight tracking-tight drop-shadow-2xl">
                            {currentMsg.text}
                        </p>
                    </div>
                </div>
            </main>

            {/* Indicadores de Progreso / Footer */}
            <footer className="px-12 py-12 flex items-center justify-between relative z-10">
                <div className="flex space-x-4">
                    {activeMessages.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-4 rounded-full transition-all duration-500 border border-white/20 ${idx === currentIndex ? 'w-24 bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'w-4 bg-white/30'}`}
                        />
                    ))}
                </div>

                <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-sm font-bold tracking-widest uppercase">
                    <span className="opacity-60 mr-4">Aviso</span>
                    <span className="text-2xl mr-4">{currentIndex + 1}</span>
                    <span className="opacity-30 mr-4">/</span>
                    <span className="opacity-60 mr-4">Total</span>
                    <span className="text-2xl">{activeMessages.length}</span>
                </div>
            </footer>

            {/* Barra de Tiempo para el siguiente cambio */}
            <div className="absolute bottom-0 left-0 h-2 bg-white/40 z-20 transition-all duration-100 ease-linear"
                style={{ width: '100%', animation: activeMessages.length > 1 ? `progressLoop 8s linear infinite` : 'none' }}>
            </div>

            <style>{`
                @keyframes progressLoop {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};
