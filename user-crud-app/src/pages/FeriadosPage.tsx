import React, { useState } from 'react';
import { useHolidays } from '../context/HolidayContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';
import type { Holiday } from '../types';

export const FeriadosPage: React.FC = () => {
    const { holidays, addHoliday, updateHoliday, deleteHoliday } = useHolidays();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const handleAdd = () => {
        setEditingHoliday(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (holiday: Holiday) => {
        setEditingHoliday(holiday);
        setFormData({
            date: new Date(holiday.date).toISOString().split('T')[0],
            description: holiday.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, description: string) => {
        if (window.confirm(`¿Está seguro de eliminar el feriado "${description}"?`)) {
            await deleteHoliday(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingHoliday) {
                await updateHoliday({ ...editingHoliday, ...formData });
            } else {
                await addHoliday(formData);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredHolidays = holidays.filter(h =>
        h.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        Maestro de Feriados
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de días feriados para cálculos de remuneraciones y turnos.</p>
                </div>
                <Button onClick={handleAdd} className="shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Feriado
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar feriado..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredHolidays.map((holiday) => (
                                <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                        {new Date(holiday.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {holiday.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(holiday)}
                                                className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(holiday.id, holiday.description)}
                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
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
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {editingHoliday ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                                {editingHoliday ? 'Editar Feriado' : 'Nuevo Feriado'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input
                                label="Fecha"
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <Input
                                label="Descripción"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Ej: Año Nuevo, Fiestas Patrias..."
                            />
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingHoliday ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
