import React, { useState } from 'react';
import { useServiceDirectory } from '../context/ServiceDirectoryContext';
import { 
    HardHat, Phone, Mail , Search, ExternalLink, 
    ShieldCheck, Home, Calendar, Package, MessageSquare, AlertCircle, ChevronRight, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServiciosResidentesPage: React.FC = () => {
    const { services } = useServiceDirectory();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = services.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const mainModules = [

        { id: 1, name: 'Reserva Espacios Comunes', path: '/reservas', icon: Calendar, color: 'bg-indigo-500', desc: 'Quinchos, piscina, sala de eventos.' },
        { id: 2, name: 'Solicitud de Insumos', path: '/solicitud-insumos', icon: Package, color: 'bg-emerald-500', desc: 'Solicitud de materiales, EPP y artículos.' },
        { id: 3, name: 'Atención y Soporte', path: '/tickets', icon: MessageSquare, color: 'bg-amber-500', desc: 'Gestión de reclamos, sugerencias y consultas.' },
        { id: 4, name: 'Números de Emergencia', path: '/emergencias', icon: AlertCircle, color: 'bg-rose-500', desc: 'Contactos críticos y seguridad.' },
        { id: 5, name: 'Reporte de Turnos', path: '/bitacora-turnos', icon: ClipboardList, color: 'bg-blue-600', desc: 'Registro y control de novedades por jornada.' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header with Title & Portal Units Button */}
            <div className="relative overflow-hidden bg-indigo-600 rounded-[3rem] p-12 text-white">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-5xl font-black mb-4 flex items-center gap-4 tracking-tighter">
                            <ShieldCheck className="w-12 h-12" />
                            Soporte y Servicios
                        </h1>
                        <p className="text-indigo-100 font-bold max-w-xl text-lg opacity-90">
                            Central de gestiones, servicios contratados y contactos de emergencia para residentes.
                        </p>
                    </div>
                    <Link 
                        to="/unidades-disponibles" 
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white hover:text-indigo-600 transition-all shadow-xl"
                    >
                        <div className="w-14 h-14 bg-white/20 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center text-white group-hover:text-indigo-600">
                            <Home className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Portal Inmobiliario</p>
                            <h3 className="text-xl font-black">Unidades Disponibles</h3>
                        </div>
                        <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Main Action Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainModules.map((m) => (
                    <Link 
                        key={m.id} 
                        to={m.path}
                        className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
                    >
                        <div className={`w-16 h-16 ${m.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${m.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                            <m.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{m.name}</h3>
                        <p className="text-sm font-bold text-gray-400 leading-relaxed">{m.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Services List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Maestro de Servicios Externos</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Proveedores Certificados</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Buscar servicio (Gasfitería, Eléctrico, etc.)"
                            className="w-full pl-16 pr-4 py-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(c => (
                            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <HardHat className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Especialidad</p>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{c.category}</h3>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-indigo-600 dark:text-white mb-6 leading-tight">{c.name}</h2>

                                    <div className="space-y-4">
                                        <a
                                            href={`tel:${c.contact_phone}`}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-gray-900 rounded-xl text-emerald-500 shadow-sm">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-gray-900 dark:text-white">{c.contact_phone}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                                        </a>

                                        <a
                                            href={`mailto:${c.contact_email}`}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-gray-900 rounded-xl text-indigo-500 shadow-sm">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-gray-900 dark:text-white truncate max-w-[150px]">{c.contact_email}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                                        </a>
                                    </div>

                                    {c.description && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-bold text-gray-400 leading-relaxed italic">
                                                "{c.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <HardHat className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-400">No se encontraron proveedores</h3>
                        <p className="text-sm font-bold text-gray-300 mt-2">Intente con otra búsqueda o especialidad</p>
                    </div>
                )}
            </div>
        </div>
    );
};
