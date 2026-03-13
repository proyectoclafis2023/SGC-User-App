import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { EmergencyTicker } from './EmergencyTicker';
import {
    LogOut,
    LayoutDashboard,
    Settings,
    Users,
    Building2,
    Menu,
    Package,
    Video,
    HardHat,
    FileText,
    History,
    Phone,
    ChevronDown,
    ChevronRight,
    Sun,
    Moon,
    Landmark,
    Database,
    Zap,
    LifeBuoy,
    ShieldCheck,
    Briefcase,
    Banknote,
    Calendar,
    Wallet,
    Home,
    Mail,
    Shield,
    UploadCloud,
    BarChart3,
    ClipboardCheck,
    Bell
} from 'lucide-react';

interface SubMenuItem {
    label: string;
    path?: string;
    icon?: any;
    isHeader?: boolean;
}

interface NavItemProps {
    to?: string;
    icon: any;
    label: string;
    isCollapsed: boolean;
    children?: SubMenuItem[];
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isCollapsed, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedHeaders, setExpandedHeaders] = useState<string[]>([]);
    const { settings } = useSettings();
    const location = useLocation();
    const hasChildren = children && children.length > 0;

    const isChildActive = hasChildren && children.some(child => child.path && location.pathname === child.path);
    const isActive = to ? location.pathname === to : isChildActive;

    useEffect(() => {
        if (isChildActive) {
            setIsOpen(true);
            // Auto-expand the header containing the active child
            const activeChild = children?.find(child => child.path && location.pathname === child.path);
            if (activeChild) {
                // Find the header preceding this child
                let headerFound = '';
                for (const child of children || []) {
                    if (child.isHeader) headerFound = child.label;
                    if (child.path && location.pathname === child.path) break;
                }
                if (headerFound) setExpandedHeaders(prev => prev.includes(headerFound) ? prev : [...prev, headerFound]);
            }
        }
    }, [isChildActive, children, location.pathname]);

    const toggleHeader = (headerLabel: string) => {
        setExpandedHeaders(prev => 
            prev.includes(headerLabel) 
                ? prev.filter(h => h !== headerLabel) 
                : [...prev, headerLabel]
        );
    };

    const baseClasses = `flex items-center w-full rounded-2xl font-black transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3`;
    const activeClasses = `shadow-lg shadow-indigo-500/30 ${settings.theme === 'modern' ? 'bg-white text-indigo-900' : 'bg-indigo-600 text-white'}`;
    const inactiveClasses = `${settings.theme === 'modern' ? 'text-indigo-200 hover:bg-white/10 hover:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400'}`;

    if (hasChildren && !isCollapsed) {
        // Group items by header
        const sections: { header?: SubMenuItem; items: SubMenuItem[] }[] = [];
        let currentSection: { header?: SubMenuItem; items: SubMenuItem[] } = { items: [] };

        children.forEach(child => {
            if (child.isHeader) {
                if (currentSection.items.length > 0 || currentSection.header) {
                    sections.push(currentSection);
                }
                currentSection = { header: child, items: [] };
            } else {
                currentSection.items.push(child);
            }
        });
        sections.push(currentSection);

        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left text-[12px] uppercase tracking-[0.2em] font-black">{label}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 shrink-0 transition-transform" /> : <ChevronRight className="w-4 h-4 shrink-0 transition-transform text-gray-400" />}
                </button>
                {isOpen && (
                    <div className="ml-9 border-l-2 border-indigo-100 dark:border-indigo-900/30 pl-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {sections.map((section, sIdx) => (
                            <div key={sIdx} className="space-y-1">
                                {section.header && (
                                    <button
                                        onClick={() => toggleHeader(section.header!.label)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 group/header ${
                                            expandedHeaders.includes(section.header.label)
                                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-400 dark:text-gray-500'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                expandedHeaders.includes(section.header.label) ? 'bg-indigo-500 scale-110' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-left">
                                                {section.header.label}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${
                                            expandedHeaders.includes(section.header.label) ? 'rotate-0' : '-rotate-90'
                                        }`} />
                                    </button>
                                )}
                                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${
                                    (!section.header || expandedHeaders.includes(section.header.label)) ? 'max-h-[1200px] opacity-100 py-1' : 'max-h-0 opacity-0'
                                }`}>
                                    {section.items.map((child, idx) => (
                                        <NavLink
                                            key={idx}
                                            to={child.path || '#'}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${isActive
                                                    ? (settings.theme === 'modern' ? 'bg-white text-indigo-900 shadow-md translate-x-1' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1')
                                                    : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/5 hover:translate-x-1'
                                                }`
                                            }
                                        >
                                            {child.icon && <child.icon className="w-3 h-3" />}
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                title={isCollapsed ? label : ""}
            >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-[12px] uppercase tracking-[0.2em] font-black">{label}</span>}
            </NavLink>
        );
    }

    return null;
};

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings, toggleTheme } = useSettings();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';
    const isWorker = user?.role === 'worker';
    const isResidentOrOwner = user?.role === 'resident' || user?.role === 'owner';

    return (
        <div className={`min-h-screen font-sans selection:bg-indigo-500/30 flex transition-colors duration-300 ${settings.theme === 'modern' ? 'bg-[#f0f2ff]' : 'bg-[#f4f6f8] dark:bg-black'}`}>
            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                ${isCollapsed ? 'w-20' : 'w-72'} 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${settings.theme === 'modern' ? 'bg-[#1e1b4b] border-indigo-900/40 text-indigo-100' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}
                border-r flex flex-col fixed md:sticky top-0 h-screen transition-all duration-500 z-50 
                shadow-2xl shadow-gray-200/20 dark:shadow-none
            `}>
                <div className={`p-8 border-b border-gray-50 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative`}>
                    <div className={`flex items-center ${isCollapsed ? 'hidden' : 'space-x-3 animate-in fade-in duration-500'}`}>
                        {settings.systemLogo ? (
                            <img src={settings.systemLogo} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="w-10 h-10 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center transform -rotate-3 transition-transform shadow-xl shadow-indigo-500/20 text-white font-black text-xl shrink-0">
                                {settings.systemIcon}
                            </div>
                        )}
                        <span className="text-[14px] font-black text-gray-900 dark:text-white tracking-widest uppercase leading-tight">
                            PLATAFORMA DE GESTIÓN COMUNITARIA
                        </span>
                    </div>
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl shrink-0">
                            {settings.systemIcon}
                        </div>
                    )}
                </div>
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />

                    {/* SECCIÓN OPERACIONES */}
                    {(isAdmin || isWorker) && (
                        <NavItem 
                            icon={Zap} 
                            label="Operaciones" 
                            isCollapsed={isCollapsed}
                            children={[
                                { label: 'Reporte Diario', path: '/reporte-diario', icon: FileText },
                                { label: 'Bitácora Turnos', path: '/bitacora-turnos', icon: History },
                                { label: 'Controles', isHeader: true },
                                { label: 'Visitas', path: '/visitas', icon: Users },
                                { label: 'Encomiendas', path: '/correspondencia', icon: Package },
                                { label: 'Contratistas', path: '/registro-contratistas', icon: HardHat },
                                { label: 'Solicitud Insumos', path: '/solicitud-insumos', icon: Package },
                                { label: 'Cámaras / Grabaciones', path: '/camaras', icon: Video },
                            ]}
                        />
                    )}

                    {/* SECCIÓN MI HOGAR */}
                    {isResidentOrOwner && (
                        <NavItem 
                            icon={Home} 
                            label="Mi Hogar" 
                            isCollapsed={isCollapsed} 
                            children={[
                                { label: 'Mis Pagos', path: '/gastos-comunes', icon: Wallet },
                            ]}
                        />
                    )}

                    {/* SECCIÓN SOPORTE & SERVICIOS */}
                    <NavItem 
                        icon={LifeBuoy} 
                        label="Soporte y Servicios" 
                        isCollapsed={isCollapsed}
                        children={[
                            { label: 'Atención y Soporte', path: '/reclamos', icon: LifeBuoy },
                            { label: 'Reserva Espacios Comunes', path: '/reservas', icon: Calendar },
                            { label: 'Directorio de Servicios', path: '/servicios-residentes', icon: HardHat },
                            { label: 'Números Emergencia', path: '/emergencias', icon: Phone },
                        ]}
                    />

                    {/* SECCIÓN ADMINISTRACIÓN */}
                    {isAdmin && (
                        <NavItem 
                            icon={Shield} 
                            label="Administración" 
                            isCollapsed={isCollapsed}
                            children={[
                                { label: 'Gestión Estratégica', path: '/dashboard-kpi', icon: BarChart3 },
                                { label: 'Centro de Gestiones', path: '/tickets', icon: ClipboardCheck },
                                
                                { label: 'Comunidad', isHeader: true },
                                { label: 'Residentes', path: '/residentes', icon: Users },
                                { label: 'Propietarios', path: '/propietarios', icon: ShieldCheck },
                                { label: 'Directiva', path: '/directiva', icon: Landmark },
                                { label: 'Mensajes Dirigidos', path: '/mensajes-dirigidos', icon: Mail },
                                { label: 'Avisos del Sistema', path: '/mensajes', icon: Bell },

                                { label: 'Recursos Humanos', isHeader: true },
                                { label: 'Maestro Personal', path: '/personal', icon: Briefcase },
                                { label: 'Servicios / Contratistas', path: '/contratistas', icon: HardHat },
                                { label: 'Gestión de Nómina', path: '/liquidaciones', icon: Banknote },
                                { label: 'Entrega de EPP', path: '/entregas-articulos', icon: Package },
                                { label: 'Maestro Insumos y EPP', path: '/articulos-personal', icon: ShieldCheck },
                                { label: 'Certificados', path: '/certificados', icon: FileText },

                                { label: 'Finanzas', isHeader: true },
                                { label: 'Gastos Comunes Admin', path: '/gastos-comunes', icon: Banknote },
                                { label: 'Registro de Egresos', path: '/registro-gastos', icon: Wallet },
                                { label: 'Reglas de Cobro', path: '/reglas-gastos-comunes', icon: Settings },
                                { label: 'Fondos Especiales', path: '/maestro-fondos', icon: Database },
                                { label: 'Activo Fijo', path: '/activo-fijo', icon: Landmark },
                            ]}
                        />
                    )}

                    {/* SECCIÓN AJUSTES DE SISTEMA */}
                    {isAdmin && (
                        <NavItem 
                            icon={Settings} 
                            label="Ajustes de Sistema" 
                            isCollapsed={isCollapsed}
                            children={[
                                { label: 'Configuración Comunidad', path: '/configuracion', icon: Building2 },
                                { label: 'Configuración Email', path: '/maestro-correos', icon: Mail },
                            ]}
                        />
                    )}

                    {/* SECCIÓN MAESTROS BASE */}
                    {isAdmin && (
                        <NavItem 
                            icon={Database} 
                            label="Maestros Base" 
                            isCollapsed={isCollapsed}
                            children={[
                                { label: 'Infraestructura', isHeader: true },
                                { label: 'Edificios y propiedades', path: '/infraestructura', icon: Building2 },
                                { label: 'Tipos de Unidad', path: '/tipos-unidad', icon: Home },
                                { label: 'Espacios Comunes', path: '/espacios', icon: Landmark },
                                { label: 'Estacionamientos', path: '/estacionamientos', icon: Zap },

                                { label: 'Recursos Humanos', isHeader: true },
                                { label: 'Previsiones', path: '/previsiones', icon: Briefcase },
                                { label: 'AFPs', path: '/afps', icon: ShieldCheck },

                                { label: 'Finanzas y Operación', isHeader: true },
                                { label: 'Bancos', path: '/bancos', icon: Landmark },
                                { label: 'Maestro IPC', path: '/maestro-ipc', icon: BarChart3 },
                                { label: 'Bitácora y Cámaras', path: '/maestros-operativos', icon: History },
                                { label: 'Mensajes Prefijados', path: '/maestro-mensajes', icon: Mail },
                                { label: 'Números Emergencia', path: '/maestro-emergencias', icon: Phone },
                                { label: 'Condiciones Especiales', path: '/condiciones-especiales', icon: Shield },
                            ]}
                        />
                    )}

                    {/* SECCIÓN SUPER ADMIN */}
                    {isAdmin && (
                        <NavItem 
                            icon={ShieldCheck} 
                            label="Super Admin" 
                            isCollapsed={isCollapsed}
                            children={[
                                { label: 'Carga Masiva de Datos', path: '/carga-masiva', icon: UploadCloud },
                                { label: 'Parámetros Generales', path: '/parametros', icon: Settings },
                                { label: 'Perfiles de Acceso', path: '/perfiles', icon: ShieldCheck },
                            ]}
                        />
                    )}
                </nav>

                <div className={`p-6 border-t border-gray-50 dark:border-gray-800 transition-all ${isCollapsed ? 'px-2' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center space-x-3 px-4 py-4 mb-3 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700/50 animate-in fade-in duration-300">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[9px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-black mt-0.5">{user?.role === 'admin' ? 'Administrador' : user?.role === 'global_admin' ? 'Global Admin' : user?.role === 'worker' ? 'Funcionario' : 'Residente'}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-3" title={user?.name}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 w-full'} text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-colors text-[9px] font-black uppercase tracking-widest group shadow-sm hover:shadow-rose-500/10`}
                        title={isCollapsed ? "Cerrar Sesión" : ""}
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1 shrink-0" />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <header className={`h-20 backdrop-blur-xl border-b flex items-center justify-between px-8 sticky top-0 z-20 ${settings.theme === 'modern' ? 'bg-[#1e1b4b]/80 border-indigo-900/40 shadow-sm' : 'bg-white/80 dark:bg-[#020617]/80 border-gray-100 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className={`hidden lg:block font-black text-[10px] uppercase tracking-[0.2em] ${settings.theme === 'modern' ? 'text-indigo-200' : 'text-gray-400'}`}>Plataforma de Gestion Comunitaria</span>
                    </div>

                    <div className="flex items-center gap-4">

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-2xl text-gray-400 border border-gray-100 dark:border-gray-800 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            {settings.theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : settings.theme === 'modern' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Zap className="w-5 h-5 text-indigo-600" />}
                            {settings.theme === 'modern' && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Modern</span>}
                        </button>
                        <div className="lg:hidden w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-[1600px] w-full mx-auto flex-1">
                    <EmergencyTicker />
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
