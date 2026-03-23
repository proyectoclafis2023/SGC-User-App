import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useEmergencyNumbers } from '../context/EmergencyNumberContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    MessageSquare, 
    Send, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Search, 
    Filter, 
    History as HistoryIcon,
    AlertTriangle,
    LifeBuoy,
    ChevronRight,
    Phone,
    Calendar,
    Wrench,
    Shield,
    Flame,
    Activity,
    ExternalLink
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

export const CommunityRequestsPage: React.FC = () => {
    const { tickets, addTicket, updateTicketStatus, addSolutionNote } = useTickets();
    const { user } = useAuth();
    const { towers } = useInfrastructure();
    const { numbers } = useEmergencyNumbers();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [filterType, setFilterType] = useState<'all' | 'complaint' | 'suggestion'>('all');
    
    // Form State
    const [subject, setSubject] = useState('');
    const [type, setType] = useState<'complaint' | 'suggestion'>('suggestion');
    const [description, setDescription] = useState('');
    const [tower_id, setTowerId] = useState('');
    const [unit_id, setUnitId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';

    const filteredTickets = tickets.filter(t => {
        const matchesTab = activeTab === 'active' 
            ? t.status !== 'resolved' && t.status !== 'rejected'
            : t.status === 'resolved' || t.status === 'rejected';
        
        const matchesType = filterType === 'all' || t.type === filterType;
        const reflectsUser = isAdmin || t.resident_id === user?.id;
        
        return matchesTab && matchesType && reflectsUser;
    });

    const openCount = tickets.filter(t => t.status === 'open').length;
    const resolvedTodayCount = tickets.filter(t => t.status === 'resolved' && new Date(t.created_at).toDateString() === new Date().toDateString()).length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await addTicket({
                resident_id: user.id,
                type,
                subject,
                description,
                status: 'open',
                unit_id: unit_id ? `${tower_id} - ${unit_id}` : undefined
            });
            
            setSubject('');
            setDescription('');
            setTowerId('');
            setUnitId('');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Error submitting ticket:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'open': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'read': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'attended': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'SEGURIDAD': return Shield;
            case 'EMERGENCIA': return Flame;
            case 'SALUD': return Activity;
            case 'SERVICIOS_BASICOS': return Wrench;
            default: return Phone;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'SEGURIDAD': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            case 'EMERGENCIA': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
            case 'SALUD': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
            case 'SERVICIOS_BASICOS': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/50';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
                            <LifeBuoy className="w-7 h-7" />
                        </div>
                        Centro de Atención y Soporte
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Sugerencias, Reclamos y Guía de Servicios Comunitarios.</p>
                </div>

                {isAdmin && (
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                            <div className="text-right border-r border-gray-100 dark:border-gray-800 pr-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendientes</p>
                                <p className="text-xl font-black text-amber-600 leading-none">{openCount}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resueltos Hoy</p>
                                <p className="text-xl font-black text-emerald-600 leading-none">{resolvedTodayCount}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => navigate('/reservas')} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 cursor-pointer group hover:scale-[1.02] transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Reserva de Espacios</h3>
                            <p className="text-indigo-100/90 font-medium text-sm leading-relaxed">Reserva quinchos, lavandería o gimnasio de forma rápida y digital.</p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            Acceder Ahora <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div onClick={() => navigate('/servicios-residentes')} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 cursor-pointer group hover:scale-[1.02] transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <Wrench className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Directorio de Servicios</h3>
                            <p className="text-emerald-100/90 font-medium text-sm leading-relaxed">Encuentra técnicos, gasfíter y servicios recomendados por la comunidad.</p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            Ver Directorio <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">Emergencias</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">Acceso rápido a números de emergencia y servicios críticos del sector.</p>
                    </div>
                    <div className="mt-8">
                        <button onClick={() => {
                            const section = document.getElementById('emergency-guide');
                            section?.scrollIntoView({ behavior: 'smooth' });
                        }} className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-indigo-600">
                            Ver Teléfonos <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                <Send className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Nueva Solicitud</h2>
                        </div>

                        {showSuccess && (
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 text-xs font-bold border border-emerald-100 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                Mensaje enviado exitosamente. Revisaremos su solicitud a la brevedad.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setType('suggestion')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'suggestion' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                                >
                                    Sugerencia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('complaint')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'complaint' ? 'bg-white dark:bg-gray-700 shadow-sm text-rose-600' : 'text-gray-400'}`}
                                >
                                    Reclamo
                                </button>
                            </div>

                            <Input 
                                label="Asunto / Tema" 
                                placeholder="Ej: Ruido molesto, sugerencia de iluminación..." 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-widest">Torre / Edificio</label>
                                    <select 
                                        className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white"
                                        value={tower_id}
                                        onChange={(e) => setTowerId(e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {towers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-widest">Unidad</label>
                                    <select 
                                        className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white"
                                        value={unit_id}
                                        onChange={(e) => setUnitId(e.target.value)}
                                        required
                                        disabled={!tower_id}
                                    >
                                        <option value="">Seleccione...</option>
                                        {towers.find(t => t.name === tower_id)?.departments.map(d => (
                                            <option key={d.id} value={d.number}>{d.number}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-widest">Descripción Detallada</label>
                                <textarea 
                                    className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white min-h-[150px] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                    placeholder="Por favor, sea lo más descriptivo posible..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Ticket History Column */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm w-fit">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            Gestiones Activas
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            Historial
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'complaint', label: 'Reclamos' },
                            { id: 'suggestion', label: 'Sugerencias' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilterType(f.id as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterType === f.id ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-gray-50'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredTickets.length === 0 ? (
                            <div className="p-20 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-400 font-black uppercase tracking-widest">No hay tickets {activeTab === 'active' ? 'activos' : 'en el historial'}</h3>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <div key={ticket.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${ticket.type === 'complaint' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Folio #{ticket.id.slice(0, 4)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusStyles(ticket.status)}`}>
                                                        {ticket.status === 'open' ? 'Pendiente' : 
                                                         ticket.status === 'read' ? 'Leído' :
                                                         ticket.status === 'attended' ? 'En Curso' :
                                                         ticket.status === 'resolved' ? 'Resuelto' : 'Rechazado'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{ticket.subject}</h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">{ticket.unit_id || 'Sector Común'}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 leading-relaxed">
                                        {ticket.description}
                                    </p>

                                    {isAdmin && activeTab === 'active' && (
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                                            {ticket.status === 'open' && <Button size="sm" variant="secondary" onClick={() => updateTicketStatus(ticket.id, 'read')} className="text-[9px] h-9">Leído</Button>}
                                            {(ticket.status === 'read' || ticket.status === 'open') && <Button size="sm" variant="secondary" onClick={() => updateTicketStatus(ticket.id, 'attended')} className="text-[9px] h-9">Atender</Button>}
                                            {ticket.status === 'attended' && <Button size="sm" onClick={() => {
                                                const note = prompt('Nota de resolución:');
                                                if (note) {
                                                    addSolutionNote(ticket.id, note);
                                                    updateTicketStatus(ticket.id, 'resolved');
                                                }
                                            }} className="text-[9px] h-9 bg-emerald-600 hover:bg-emerald-700 text-white">Resolver</Button>}
                                        </div>
                                    )}

                                    {ticket.solutionNote && (
                                        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Nota de Resolución</p>
                                                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold">{ticket.solutionNote}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Dynamic Emergency Numbers Section */}
            <div id="emergency-guide" className="pt-12 border-t border-gray-100 dark:border-gray-800 space-y-8">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Guía de Emergencia y Servicios</h2>
                    <p className="text-gray-500 font-bold mt-2">Acceso rápido a los números de emergencia configurados en el sistema.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {numbers.length > 0 ? numbers.filter(n => !n.is_archived).map(num => {
                        const Icon = getCategoryIcon(num.category);
                        const colors = getCategoryColor(num.category);
                        return (
                            <div key={num.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                                <div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors} transition-transform group-hover:scale-110`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{num.name}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{num.category.replace('_', ' ')}</p>
                                    <p className="text-xs font-bold text-gray-500 italic mb-6 leading-relaxed line-clamp-2">{num.description}</p>
                                </div>
                                <div className="space-y-4">
                                    <a href={`tel:${num.phone}`} className="block w-full py-3 bg-gray-900 dark:bg-black text-white rounded-xl text-center text-lg font-black hover:bg-rose-600 transition-all shadow-lg active:scale-95">
                                        {num.phone}
                                    </a>
                                    {num.webUrl && (
                                        <a href={num.webUrl} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700">
                                            SITIO WEB <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                         <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                             <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                             <p className="text-gray-400 font-black uppercase tracking-widest">No hay contactos configurados.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
