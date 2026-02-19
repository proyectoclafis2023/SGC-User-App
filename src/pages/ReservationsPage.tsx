import React, { useState } from 'react';
import { useCommonSpaces } from '../context/CommonSpaceContext';
import { useReservations } from '../context/ReservationContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Calendar, Plus, CheckCircle, XCircle, Clock, Save, X, Search, Filter, Trash2 } from 'lucide-react';
import type { Reservation } from '../types';

export const ReservationsPage: React.FC = () => {
    const { spaces } = useCommonSpaces();
    const { reservations, addReservation, updateReservation, deleteReservation } = useReservations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [spaceId, setSpaceId] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addReservation({
            spaceId,
            date,
            startTime,
            endTime,
            status: 'pending',
            userId: 'admin' // Por ahora hardcoded
        });
        setIsModalOpen(false);
        setSpaceId('');
        setDate('');
        setStartTime('');
        setEndTime('');
    };

    const handleStatusUpdate = async (reservation: Reservation, status: 'approved' | 'rejected') => {
        await updateReservation({ ...reservation, status });
    };

    const getSpaceName = (id: string) => {
        const space = spaces.find(s => s.id === id);
        return space ? space.name : 'Espacio no encontrado';
    };

    const filteredReservations = reservations.filter(r =>
        getSpaceName(r.spaceId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        Reservas de Espacios
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona y aprueba el uso de las áreas comunes.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Reserva
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 transition-colors">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por espacio..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs h-[42px]">
                        <Filter className="w-4 h-4 mr-2" /> Filto Avanzado
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Espacio / Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horario</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredReservations.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{getSpaceName(res.spaceId)}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(res.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            <span>{res.startTime} - {res.endTime}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${res.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            res.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse'
                                            }`}>
                                            {res.status === 'approved' ? 'Aprobada' : res.status === 'rejected' ? 'Rechazada' : 'Por Aprobar'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(res, 'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Aprobar">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(res, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Rechazar">
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => deleteReservation(res.id)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                Nueva Solicitud de Reserva
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Espacio Común</label>
                                <select
                                    value={spaceId}
                                    onChange={(e) => setSpaceId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    required
                                >
                                    <option value="">Seleccione un espacio...</option>
                                    {spaces.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                                    ))}
                                </select>
                            </div>
                            <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Hora Inicio" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                <Input label="Hora Fin" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit"><Save className="w-4 h-4 mr-2" /> Solicitar Reserva</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
