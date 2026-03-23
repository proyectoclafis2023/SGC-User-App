import React, { useState } from 'react';
import { useSystemParameters } from '../context/SystemParameterContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Plus, Trash2, Edit2, X, Settings2,
    Video, History, Clock
} from 'lucide-react';
import type { SystemParameter } from '../types';

export const MaestrosOperativosPage: React.FC = () => {
    const { parameters, addParameter, updateParameter, deleteParameter } = useSystemParameters();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SystemParameter | null>(null);
    const [activeTab, setActiveTab] = useState<'camera_request_reason' | 'shift_report_category' | 'jornada_group'>('camera_request_reason');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleOpenModal = (item?: SystemParameter) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setDescription(item.description || '');
        } else {
            setEditingItem(null);
            setName('');
            setDescription('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name,
            description,
            type: activeTab,
            is_active: true
        };

        if (editingItem) {
            await updateParameter(editingItem.id, data);
        } else {
            await addParameter(data as any);
        }
        setIsModalOpen(false);
    };

    const filteredItems = parameters.filter(p => p.type === activeTab);

    const tabs = [
        { id: 'camera_request_reason', label: 'Motivos CCTV', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'shift_report_category', label: 'Categorías Bitácora', icon: History, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'jornada_group', label: 'Grupos de Jornada', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Settings2 className="w-8 h-8 text-white" />
                        </div>
                        Maestros Operativos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-1">Configuración de parámetros para módulos de bitácora, CCTV y RRHH.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Registro
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-2 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`p-5 rounded-2xl ${tabs.find(t => t.id === activeTab)?.bg} ${tabs.find(t => t.id === activeTab)?.color} shadow-sm`}>
                                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings2, { className: 'w-8 h-8' })}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg leading-tight">{item.name}</h3>
                                {item.description && <p className="text-xs text-gray-400 font-bold mt-1 max-w-[200px] truncate">{item.description}</p>}
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[8px] font-black text-gray-400 uppercase tracking-widest rounded-lg border border-gray-100 dark:border-gray-700">ID: {item.id.split('-')[0]}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                            <button onClick={() => handleOpenModal(item)} className="p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-2xl border border-indigo-100 dark:border-indigo-800 transition-colors">
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteParameter(item.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl border border-red-100 dark:border-red-800 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <Settings2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No hay registros en esta categoría</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Settings2 className="w-6 h-6 text-indigo-600" />
                                {editingItem ? 'Editar Registro' : 'Nuevo Registro'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-400 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Input 
                                    label="Nombre del Registro" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    placeholder="Ej: Accidente, Mantenimiento, etc." 
                                />
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full h-32 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                        placeholder="Detalles adicionales sobre este registro..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
                                <Button type="button" variant="secondary" className="h-12 px-8 rounded-2xl uppercase text-[10px] font-black tracking-widest" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="h-12 px-8 rounded-2xl uppercase text-[10px] font-black tracking-widest shadow-lg shadow-indigo-600/20">Guardar Registro</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
