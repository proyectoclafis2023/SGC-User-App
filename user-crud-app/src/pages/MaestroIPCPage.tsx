import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    LineChart, Plus, Trash2, Save, X, Edit2, TrendingUp, AlertCircle
} from 'lucide-react';
import type { IPCProjection } from '../types';

export const MaestroIPCPage: React.FC = () => {
    const [parameters, setParameters] = useState<IPCProjection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<IPCProjection> | null>(null);

    const fetchParameters = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/maestro_ipc`);
            if (response.ok) {
                const data = await response.json();
                setParameters(data);
            }
        } catch (error) {
            console.error('Error fetching IPC parameters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParameters();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem?.name || editingItem?.ipc_rate === undefined) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const method = editingItem.id ? 'PUT' : 'POST';
        const url = editingItem.id 
            ? `${API_BASE_URL}/maestro_ipc/${editingItem.id}` 
            : `${API_BASE_URL}/maestro_ipc`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            });

            if (response.ok) {
                fetchParameters();
                setIsModalOpen(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error saving IPC parameter:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar este parámetro?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/maestro_ipc/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchParameters();
            }
        } catch (error) {
            console.error('Error deleting IPC parameter:', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <LineChart className="w-8 h-8 text-indigo-600" />
                        IPC y IPC Ponderado
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic text-sm">Gestiona los índices de inflación oficiales y proyectados para el cálculo de presupuestos.</p>
                </div>
                <Button onClick={() => { setEditingItem({ is_active: true }); setIsModalOpen(true); }} className="relative z-10 shadow-lg shadow-indigo-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Registro
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parameters.map((param) => (
                    <div key={param.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all opacity-10">
                            <TrendingUp className="w-20 h-20 text-indigo-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">{param.name}</h3>
                                {!param.is_active && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-gray-200">Inactivo</span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IPC Real</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-indigo-600">{(param.ipc_rate * 100).toFixed(2)}</span>
                                        <span className="text-xs font-black text-indigo-400 font-sans">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Ponderado</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-purple-600">{(param.ponderado_rate * 100).toFixed(2)}</span>
                                        <span className="text-xs font-black text-purple-400 font-sans">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t dark:border-gray-800 pt-6">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(param.created_at).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(param);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-3 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-2xl transition-all"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(param.id)}
                                        className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {parameters.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center opacity-60">
                        <LineChart className="w-16 h-16 text-gray-300 mb-6" />
                        <p className="text-sm font-black text-gray-400 italic">No hay registros de IPC.</p>
                        <Button onClick={() => { setEditingItem({ is_active: true }); setIsModalOpen(true); }} className="mt-6" variant="secondary">Crear Primer Registro</Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                    {editingItem?.id ? 'Editar Registro' : 'Nuevo Registro IPC'}
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <Input
                                label="Nombre / Periodo"
                                value={editingItem?.name || ''}
                                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                placeholder="Ej: Año 2024, Marzo 2024"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="IPC Real (%)"
                                    type="number"
                                    step="0.0001"
                                    value={editingItem?.ipc_rate !== undefined ? editingItem.ipc_rate : ''}
                                    onChange={e => setEditingItem({ ...editingItem, ipc_rate: Number(e.target.value) })}
                                    required
                                />
                                <Input
                                    label="IPC Ponderado (%)"
                                    type="number"
                                    step="0.0001"
                                    value={editingItem?.ponderado_rate !== undefined ? editingItem.ponderado_rate : ''}
                                    onChange={e => setEditingItem({ ...editingItem, ponderado_rate: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-normal lowercase first-letter:uppercase italic">
                                    Indique el valor oficial (Real) y la proyección estimada (Ponderado) para el periodo seleccionado.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" className="flex-1 h-14 rounded-2xl uppercase font-black text-xs tracking-widest" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button className="flex-1 h-14 rounded-2xl uppercase font-black text-xs tracking-widest shadow-xl shadow-indigo-500/20" type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
