import React, { useState, useMemo } from 'react';
import { useTickets, Ticket } from '../context/TicketContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { 
    KanbanSquare, CheckCircle, Clock, AlertCircle, Search, Filter, 
    Eye, MoreVertical, ThumbsUp, BarChart3, TrendingUp
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
    const { tickets, updateTicket, acknowledgeTicket } = useTickets();
    const { settings } = useSettings();
    const { user } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    
    const activeAdminId = user?.id || 'admin_unknown';

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'read': return 'Notificado/Leído';
            case 'attended': return 'En Revisión';
            case 'solved': return 'Solucionado';
            case 'acknowledged': return 'Dada en Conocimiento';
            default: return status;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'complaint': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'suggestion': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'shift_report': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'camera_request': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'reservation': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'complaint': return 'Reclamo';
            case 'suggestion': return 'Sugerencia';
            case 'shift_report': return 'Reporte Turno';
            case 'camera_request': return 'Solicitud Cámara';
            case 'reservation': return 'Reserva';
            default: return 'Gestión General';
        }
    };

    // Derived lists
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  t.folio.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [tickets, searchTerm, filterType]);

    // Kanban columns mapping
    const columns = [
        { id: 'pending', title: 'Nuevos / Pendientes', color: 'border-rose-200 bg-rose-50/30' },
        { id: 'read', title: 'Notificados (En Proceso)', color: 'border-blue-200 bg-blue-50/30' },
        { id: 'attended', title: 'En Revisión', color: 'border-amber-200 bg-amber-50/30' },
        { id: 'solved', title: 'Solucionado', color: 'border-emerald-200 bg-emerald-50/30' },
        { id: 'acknowledged', title: 'Dada en Conocimiento', color: 'border-indigo-200 bg-indigo-50/30' }
    ];

    const stats = {
        total: tickets.length,
        acknowledged: tickets.filter(t => t.status === 'acknowledged').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        resolutionRate: tickets.length ? Math.round((tickets.filter(t => ['solved', 'acknowledged'].includes(t.status)).length / tickets.length) * 100) : 0
    };

    const handleAcknowledge = async (id: string) => {
        await acknowledgeTicket(id, activeAdminId);
    };

    const handleStatusChange = async (id: string, newStatus: Ticket['status']) => {
        await updateTicket(id, { status: newStatus });
    };

    const renderTicketCard = (ticket: Ticket) => (
        <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${getTypeColor(ticket.type)}`}>
                    {getTypeText(ticket.type)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(ticket.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 leading-tight">
                {ticket.subject.length > 50 ? ticket.subject.substring(0, 50) + '...' : ticket.subject}
            </h4>
            
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                {ticket.description}
            </p>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] font-mono font-bold text-gray-400">
                    {ticket.folio}
                </span>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ticket.status !== 'acknowledged' && (
                        <button 
                            title="Dar por Enterado / Acknowledge"
                            onClick={() => handleAcknowledge(ticket.id)}
                            className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {ticket.status === 'pending' && (
                        <button 
                            title="Mover a Leído"
                            onClick={() => handleStatusChange(ticket.id, 'read')}
                            className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                    )}
                     {ticket.status === 'read' && (
                         <button 
                             title="Mover a Resuelto"
                             onClick={() => handleStatusChange(ticket.id, 'solved')}
                             className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                         >
                             <CheckCircle className="w-3.5 h-3.5" />
                         </button>
                     )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-black flex items-center gap-2 ${settings.theme === 'modern' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        <KanbanSquare className="w-8 h-8 text-indigo-600" />
                        CENTRO DE GESTIONES (KPIs)
                    </h1>
                    <p className={`text-sm mt-1 font-bold ${settings.theme === 'modern' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        Control cuantitativo de tareas administrativas y operativas del condominio.
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Total Gestiones</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ThumbsUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Dadas en Conocimiento</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.acknowledged}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Pendientes (Nuevas)</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.pending}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">Tasa Resolución</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.resolutionRate}%</h3>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar por asunto, descripción o folio..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10"
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 text-xs font-black uppercase text-gray-600 focus:ring-4 focus:ring-indigo-500/10"
                    >
                        <option value="all">Filtro: Todo</option>
                        <option value="complaint">Reclamos</option>
                        <option value="suggestion">Sugerencias</option>
                        <option value="shift_report">Turnos</option>
                        <option value="camera_request">Cámaras</option>
                        <option value="reservation">Reservas</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {columns.map(col => {
                    const colTickets = filteredTickets.filter(t => t.status === col.id);
                    return (
                        <div key={col.id} className={`flex flex-col rounded-[2rem] border-2 bg-white dark:bg-gray-900 overflow-hidden ${col.color}`}>
                            <div className="p-4 border-b border-inherit bg-inherit/50 backdrop-blur-sm flex justify-between items-center">
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300">
                                    {col.title}
                                </h3>
                                <span className="bg-white/50 dark:bg-black/20 text-xs font-bold px-2 py-0.5 rounded-lg border border-inherit">
                                    {colTickets.length}
                                </span>
                            </div>
                            <div className="p-3 flex-1 overflow-y-auto max-h-[600px] space-y-3">
                                {colTickets.map(renderTicketCard)}
                                {colTickets.length === 0 && (
                                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Sin gestiones</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
