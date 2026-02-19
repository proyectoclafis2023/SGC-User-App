import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
    LogOut,
    LayoutDashboard,
    Settings,
    Sun,
    Moon,
    Users,
    ShieldCheck,
    Building2,
    Calendar,
    Layout as LayoutIcon,
    ChevronLeft,
    Menu,
    MessageSquare,
    Bookmark
} from 'lucide-react';

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings, toggleTheme } = useSettings();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItemClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 ${isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 z-30 shadow-xl shadow-gray-200/50 dark:shadow-none`}>
                <div className={`p-6 border-b border-gray-100 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative`}>
                    <div className={`flex items-center ${isCollapsed ? 'hidden' : 'space-x-3 animate-in fade-in duration-300'}`}>
                        {settings.systemLogo ? (
                            <img src={settings.systemLogo} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-3 transition-transform shadow-lg shadow-indigo-500/20 text-white font-bold text-lg shrink-0">
                                {settings.systemIcon}
                            </div>
                        )}
                        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight whitespace-normal">
                            {settings.systemName}
                        </span>
                    </div>
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl shrink-0">
                            {settings.systemIcon}
                        </div>
                    )}
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md text-gray-500 hover:text-indigo-600 transition-all z-40 hidden md:block"
                >
                    {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavLink to="/" end className={navItemClasses} title={isCollapsed ? "Panel de Control" : ""}>
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Panel de Control</span>}
                    </NavLink>

                    {user?.role === 'admin' && (
                        <>
                            <div className={`pt-4 pb-2 px-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestión Personal</span>
                            </div>

                            <NavLink to="/personal" className={navItemClasses} title={isCollapsed ? "Maestro Personal" : ""}>
                                <Users className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Maestro Personal</span>}
                            </NavLink>
                        </>
                    )}

                    <div className={`pt-4 pb-2 px-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comunidad</span>
                    </div>

                    <NavLink to="/residentes" className={navItemClasses} title={isCollapsed ? "Maestro Residentes" : ""}>
                        <div className="relative">
                            <Bookmark className="w-5 h-5 shrink-0" />
                        </div>
                        {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Maestro Residentes</span>}
                    </NavLink>

                    <NavLink to="/infraestructura" className={navItemClasses} title={isCollapsed ? "Torres y Deptos" : ""}>
                        <Building2 className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Torres y Deptos</span>}
                    </NavLink>

                    <NavLink to="/espacios" className={navItemClasses} title={isCollapsed ? "Espacios Comunes" : ""}>
                        <LayoutIcon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Espacios Comunes</span>}
                    </NavLink>

                    <NavLink to="/reservas" className={navItemClasses} title={isCollapsed ? "Reservas" : ""}>
                        <Calendar className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Reservas</span>}
                    </NavLink>

                    {user?.role === 'admin' && (
                        <>
                            <NavLink to="/mensajes" className={navItemClasses} title={isCollapsed ? "Maestro Mensajes" : ""}>
                                <MessageSquare className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Maestro Mensajes</span>}
                            </NavLink>

                            <div className={`pt-4 pb-2 px-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ajustes</span>
                            </div>

                            <NavLink to="/perfiles" className={navItemClasses} title={isCollapsed ? "Maestro Perfiles" : ""}>
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200">Maestro Perfiles</span>}
                            </NavLink>

                            <NavLink to="/configuracion" className={navItemClasses} title={isCollapsed ? "Sistema" : ""}>
                                <Settings className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-200 text-sm">Configuración</span>}
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className={`p-4 border-t border-gray-100 dark:border-gray-800 transition-all ${isCollapsed ? 'px-2' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-2" title={user?.name}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-2 w-full'} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium group`}
                        title={isCollapsed ? "Cerrar Sesión" : ""}
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1 shrink-0" />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center space-x-2 md:hidden">
                        {settings.systemLogo ? (
                            <img src={settings.systemLogo} alt="Logo" className="h-7 w-auto object-contain" />
                        ) : (
                            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {settings.systemIcon}
                            </div>
                        )}
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{settings.systemName}</span>
                    </div>

                    <div className="hidden md:block">
                        <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Sistema de Gestión de Comunidades
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={settings.darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        >
                            {settings.darkMode ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-indigo-500" />
                            )}
                        </button>
                        <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 md:hidden">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
