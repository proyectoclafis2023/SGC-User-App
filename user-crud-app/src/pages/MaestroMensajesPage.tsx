import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Plus, Trash2, Edit2, X, MessageSquare, Info, AlertCircle, Save
} from 'lucide-react';
import type { CommunicationTemplate } from '../types';

export const MaestroMensajesPage: React.FC = () => {
    const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<CommunicationTemplate> | null>(null);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/maestro_mensajes`);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching message templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem?.name || !editingItem?.message || !editingItem?.subject) {
            alert('Por favor complete todos los campos');
            return;
        }

        const method = editingItem.id ? 'PUT' : 'POST';
        const url = editingItem.id 
            ? `${API_BASE_URL}/maestro_mensajes/${editingItem.id}` 
            : `${API_BASE_URL}/maestro_mensajes`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            });

            if (response.ok) {
                fetchTemplates();
                setIsModalOpen(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error saving message template:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar esta plantilla?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/maestro_mensajes/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchTemplates();
            }
        } catch (error) {
            console.error('Error deleting message template:', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-colors">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-indigo-600" />
                        Maestro de Mensajes Prefijados
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic text-sm">Configura plantillas de mensajes rápidos para respuestas frecuentes en tickets y comunicaciones.</p>
                </div>
                <Button onClick={() => { setEditingItem({ type: 'general' }); setIsModalOpen(true); }} className="relative z-10 shadow-lg shadow-indigo-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                    {template.type || 'General'}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(template);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all scale-95 hover:scale-100"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-all scale-95 hover:scale-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight mb-2">{template.name}</h3>
                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-tighter">Asunto: {template.subject}</p>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 font-sans leading-relaxed line-clamp-4 italic">
                                "{template.message}"
                            </p>
                        </div>
                        
                        <div className="relative z-10 mt-6 pt-6 border-t dark:border-gray-800 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Info className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <span>{new Date(template.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className="text-gray-300">ID: {template.id.split('-')[0]}</span>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center opacity-60">
                        <MessageSquare className="w-16 h-16 text-gray-300 mb-6" />
                        <p className="text-sm font-black text-gray-400 italic">No hay plantillas de mensajes registradas.</p>
                        <Button onClick={() => { setEditingItem({}); setIsModalOpen(true); }} className="mt-6" variant="secondary">Crear Primera Plantilla</Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none uppercase tracking-widest">
                                    {editingItem?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-6">
                                <Input
                                    label="Nombre Interno de la Plantilla"
                                    value={editingItem?.name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    placeholder="Ej: Saludo de bienvenida"
                                    required
                                />
                                <Input
                                    label="Asunto del Mensaje"
                                    value={editingItem?.subject || ''}
                                    onChange={e => setEditingItem({ ...editingItem, subject: e.target.value })}
                                    placeholder="Ej: Bienvenido a la comunidad"
                                    required
                                />
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Mensaje</label>
                                    <select
                                        value={editingItem?.type || 'general'}
                                        onChange={e => setEditingItem({ ...editingItem, type: e.target.value as any })}
                                        className="w-full h-12 px-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all transition-colors"
                                    >
                                        <option value="general">Mensaje General</option>
                                        <option value="arrears">Cobranza / Mora</option>
                                        <option value="emergency">Emergencias</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cuerpo del Mensaje</label>
                                    <textarea
                                        value={editingItem?.message || ''}
                                        onChange={e => setEditingItem({ ...editingItem, message: e.target.value })}
                                        className="w-full h-40 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all italic text-gray-700 dark:text-gray-300"
                                        placeholder="Escriba el cuerpo del mensaje aquí..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0" />
                                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-normal uppercase italic tracking-tighter">
                                    Consejo: Use estas plantillas para enviar respuestas rápidas a residentes por correo o comunicados internos.
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
