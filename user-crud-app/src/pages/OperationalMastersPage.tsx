import React, { useState } from 'react';
import { useInfrastructureItems } from '../context/InfrastructureItemContext';
import { useEquipmentItems } from '../context/EquipmentItemContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Building2, Smartphone, Plus, Trash2,
    Save, X, LayoutGrid, CheckCircle2,
    Search, Edit2, AlertCircle, Calendar, Clock, LineChart, Coffee
} from 'lucide-react';
import { useJornadaGroups } from '../context/JornadaGroupContext';
import { useIPCProjections } from '../context/IPCProjectionContext';
import type { JornadaGroup } from '../types';

export const OperationalMastersPage: React.FC = () => {
    const { items: infraItems, addItem: addInfra, updateItem: updateInfra, deleteItem: deleteInfra } = useInfrastructureItems();
    const { items: equipItems, addItem: addEquip, updateItem: updateEquip, deleteItem: deleteEquip } = useEquipmentItems();
    const { groups: jornadaGroups, addGroup: addJornada, updateGroup: updateJornada, deleteGroup: deleteJornada } = useJornadaGroups();
    const { projections, addProjection, updateProjection, deleteProjection } = useIPCProjections();
    const [activeTab, setActiveTab] = useState<'infra' | 'equip' | 'jornadas' | 'ipc'>('infra');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemMandatory, setNewItemMandatory] = useState(false);
    const [newItemValue, setNewItemValue] = useState(0);
    const [newItemPonderadoValue, setNewItemPonderadoValue] = useState(0);
    const [newItemSchedules, setNewItemSchedules] = useState<any[]>([]);
    const [newItemBreakMinutes, setNewItemBreakMinutes] = useState(0);

    const getTabInfo = () => {
        switch (activeTab) {
            case 'infra': return {
                title: 'Instalaciones',
                description: 'Gestión de áreas críticas del edificio (ej: ascensores, calderas, bombas de agua).',
                placeholder: 'ej. Ascensores Torre A, Sala de Bombas...',
                icon: <Building2 className="w-4 h-4" />
            };
            case 'equip': return {
                title: 'Equipamiento',
                description: 'Control de activos móviles y herramientas asignadas al personal (ej: radios, llaves, smartphones).',
                placeholder: 'ej. Radio Motorola XPR, Llave Maestra Piso 1...',
                icon: <Smartphone className="w-4 h-4" />
            };
            case 'jornadas': return {
                title: 'Jornadas Laborales',
                description: 'Configuración de turnos horarios para el personal, permitiendo horarios mixtos por día y gestión de descansos.',
                placeholder: 'ej. Turno 4x4, Administrativo Lunes a Sábado...',
                icon: <Calendar className="w-4 h-4" />
            };
            case 'ipc': return {
                title: 'IPC y Proyecciones',
                description: 'Índices para el ajuste de gastos comunes. El IPC es el índice oficial, el IPC Ponderado es un ajuste proyectado basado en costos específicos.',
                placeholder: 'ej. IPC Enero 2024, Proyección Contrato Seguridad...',
                icon: <LineChart className="w-4 h-4" />
            };
        }
    };

    const filteredInfra = infraItems?.filter(i => !i.isArchived && i.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const filteredEquip = equipItems?.filter(i => !i.isArchived && i.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const filteredJornadas = jornadaGroups?.filter(g => !g.isArchived && g.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const filteredIPC = projections?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

    const calculateWeeklyHours = (item: any) => {
        let totalMinutes = 0;
        const schedules = item.schedules && item.schedules.length > 0 
            ? item.schedules 
            : [{ days: item.workDays || [], startTime: item.startTime, endTime: item.endTime }];

        schedules.forEach((s: any) => {
            if (!s.startTime || !s.endTime || !s.days) return;
            const [startH, startM] = s.startTime.split(':').map(Number);
            const [endH, endM] = s.endTime.split(':').map(Number);
            let diff = (endH * 60 + endM) - (startH * 60 + startM);
            if (diff < 0) diff += 24 * 60; // Horario nocturno
            
            // Restar descanso por cada día trabajado en este horario
            const dailyWork = diff - (item.breakMinutes || 0);
            totalMinutes += dailyWork * s.days.length;
        });

        return (totalMinutes / 60).toFixed(1);
    };

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        try {
            if (activeTab === 'infra') {
                await addInfra({ name: newItemName, description: newItemDescription, isMandatory: newItemMandatory });
            } else if (activeTab === 'equip') {
                await addEquip({ name: newItemName, description: newItemDescription, isMandatory: newItemMandatory });
            } else if (activeTab === 'jornadas') {
                await addJornada({
                    name: newItemName,
                    description: newItemDescription,
                    workDays: newItemSchedules.length > 0 ? [] : [0, 1, 2, 3, 4],
                    startTime: newItemSchedules.length > 0 ? '' : '08:00',
                    endTime: newItemSchedules.length > 0 ? '' : '18:00',
                    isActive: true,
                    schedules: newItemSchedules,
                    breakMinutes: newItemBreakMinutes
                });
            } else if (activeTab === 'ipc') {
                await addProjection({
                    name: newItemName,
                    ipcRate: newItemValue,
                    ponderadoRate: newItemPonderadoValue,
                    description: newItemDescription,
                    isActive: true
                });
            }
            setNewItemName('');
            setNewItemDescription('');
            setNewItemMandatory(false);
            setNewItemValue(0);
            setNewItemPonderadoValue(0);
            setNewItemSchedules([]);
            setNewItemBreakMinutes(0);
            setIsAddModalOpen(false);
        } catch (error: any) {
            alert(error.message || 'Error al agregar el ítem');
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem.name.trim()) return;
        try {
            if (activeTab === 'infra') await updateInfra(editingItem);
            else if (activeTab === 'equip') await updateEquip(editingItem);
            else if (activeTab === 'jornadas') await updateJornada(editingItem);
            else if (activeTab === 'ipc') await updateProjection(editingItem);
            setIsEditModalOpen(false);
            setEditingItem(null);
        } catch (error: any) {
            alert(error.message || 'Error al actualizar el ítem');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8 text-indigo-600" />
                        Maestros Operativos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-bold italic text-sm">Gestiona los parámetros base, jornadas e índices proyectivos del sistema.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="relative z-10 shadow-lg shadow-indigo-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Ítem
                </Button>
            </div>

            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-3xl w-full md:w-fit border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
                {(['infra', 'equip', 'jornadas', 'ipc'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'infra' && <Building2 className="w-4 h-4" />}
                        {tab === 'equip' && <Smartphone className="w-4 h-4" />}
                        {tab === 'jornadas' && <Calendar className="w-4 h-4" />}
                        {tab === 'ipc' && <LineChart className="w-4 h-4" />}
                        {tab === 'infra' ? 'Instalaciones' : tab === 'equip' ? 'Equipamiento' : tab === 'jornadas' ? 'Jornadas' : 'IPC y IPC Ponderado'}
                    </button>
                ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 md:p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/20">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest mb-1">{getTabInfo()?.title}</h4>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300 font-bold leading-relaxed">{getTabInfo()?.description}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={`Buscar en ${activeTab === 'infra' ? 'instalaciones' : activeTab === 'equip' ? 'equipamiento' : activeTab === 'jornadas' ? 'jornadas' : 'índices IPC'}...`}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'infra' ? filteredInfra : activeTab === 'equip' ? filteredEquip : activeTab === 'jornadas' ? filteredJornadas : filteredIPC).map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-200">
                                {activeTab === 'infra' ? <Building2 className="w-6 h-6" /> : activeTab === 'equip' ? <Smartphone className="w-6 h-6" /> : activeTab === 'jornadas' ? <Calendar className="w-6 h-6" /> : <LineChart className="w-6 h-6" />}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 pr-8">{item.name}</h3>
                            
                            {activeTab !== 'jornadas' && activeTab !== 'ipc' && item.isMandatory && (
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 w-fit px-3 py-1.5 rounded-full border border-rose-100 dark:border-rose-900/30">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Cierre Obligatorio
                                </p>
                            )}

                            {activeTab === 'ipc' && (
                                <div className="mb-6 grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                        <p className="text-2xl font-black text-indigo-600">+{item.ipcRate}%</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">IPC Real</p>
                                    </div>
                                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-2xl border border-purple-100/50 dark:border-purple-900/30">
                                        <p className="text-2xl font-black text-purple-600">+{item.ponderadoRate || 0}%</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">IPC Ponderado</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'jornadas' && (
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                            <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{calculateWeeklyHours(item)}h</p>
                                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Semanales</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Coffee className="w-3 h-3" />
                                                Descanso: {item.breakMinutes || 0}m
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold italic border-l-2 border-indigo-100 dark:border-indigo-900 pl-3 py-1">
                                        {item.description || 'Sin descripción adicional'}
                                    </p>
                                    
                                    {item.schedules && item.schedules.length > 0 ? (
                                        <div className="space-y-2">
                                            {item.schedules.map((sched: any, sIdx: number) => (
                                                <div key={sIdx} className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                    <div className="flex gap-1">
                                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, dIdx) => (
                                                            <span key={dIdx} className={`w-5 h-5 flex items-center justify-center rounded text-[8px] font-black ${sched.days.includes(dIdx) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                                {day}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                                                        <Clock className="w-3 h-3 text-indigo-400" />
                                                        {sched.startTime} - {sched.endTime}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                                                    <span key={day} className={`w-5 h-5 flex items-center justify-center rounded text-[8px] font-black ${item.workDays?.includes(idx) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                        {day}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                {item.startTime} - {item.endTime}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab !== 'jornadas' && item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4 italic line-clamp-2">{item.description}</p>
                            )}

                            <div className="flex items-center justify-between border-t dark:border-gray-800 pt-6">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {item.isActive !== false ? 'Activo' : 'Inactivo'}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-3 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-2xl transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'infra') deleteInfra(item.id);
                                            else if (activeTab === 'equip') deleteEquip(item.id);
                                            else if (activeTab === 'jornadas') deleteJornada(item.id);
                                            else deleteProjection(item.id);
                                        }}
                                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Agregar */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-y-auto max-h-[90vh] no-scrollbar animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">Nuevo Ítem</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {getTabInfo()?.title}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <Input
                                label="Nombre del Ítem"
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                placeholder={getTabInfo()?.placeholder}
                                autoFocus
                            />
                            <Input
                                label="Descripción Profesional"
                                value={newItemDescription}
                                onChange={e => setNewItemDescription(e.target.value)}
                                placeholder={`Describa detalladamente este/a ${getTabInfo()?.title}...`}
                            />

                            {activeTab === 'jornadas' && (
                                <div className="space-y-4">
                                    <Input
                                        label="Descanso Diario (Minutos)"
                                        type="number"
                                        value={newItemBreakMinutes}
                                        onChange={e => setNewItemBreakMinutes(Number(e.target.value))}
                                        placeholder="Minutos de colación/descanso"
                                    />
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Horarios Programados
                                            </p>
                                            <button 
                                                onClick={() => setNewItemSchedules([...newItemSchedules, { days: [0,1,2,3,4], startTime: '08:00', endTime: '18:00' }])}
                                                className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg hover:shadow-sm"
                                            >
                                                + Añadir Horario
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {newItemSchedules.map((sched, sIdx) => (
                                                <div key={sIdx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 relative group">
                                                    <button 
                                                        onClick={() => setNewItemSchedules(newItemSchedules.filter((_, i) => i !== sIdx))}
                                                        className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-rose-500 border border-rose-100 dark:border-rose-900/30 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
                                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, dIdx) => (
                                                            <button
                                                                key={dIdx}
                                                                onClick={() => {
                                                                    const newSchedules = [...newItemSchedules];
                                                                    const days = newSchedules[sIdx].days.includes(dIdx)
                                                                        ? newSchedules[sIdx].days.filter((d: number) => d !== dIdx)
                                                                        : [...newSchedules[sIdx].days, dIdx];
                                                                    newSchedules[sIdx].days = days;
                                                                    setNewItemSchedules(newSchedules);
                                                                }}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${sched.days.includes(dIdx) ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Entrada</p>
                                                            <input 
                                                                type="time" 
                                                                value={sched.startTime} 
                                                                onChange={e => {
                                                                    const newSchedules = [...newItemSchedules];
                                                                    newSchedules[sIdx].startTime = e.target.value;
                                                                    setNewItemSchedules(newSchedules);
                                                                }}
                                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none text-xs font-black rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Salida</p>
                                                            <input 
                                                                type="time" 
                                                                value={sched.endTime} 
                                                                onChange={e => {
                                                                    const newSchedules = [...newItemSchedules];
                                                                    newSchedules[sIdx].endTime = e.target.value;
                                                                    setNewItemSchedules(newSchedules);
                                                                }}
                                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none text-xs font-black rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {newItemSchedules.length === 0 && (
                                                <p className="text-[10px] text-gray-400 italic text-center py-4 bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-dashed dark:border-gray-800">
                                                    Utilice "Añadir Horario" para definir turnos mixtos (ej. Sábados con salida temprana).
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ipc' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="IPC Real (%)"
                                            type="number"
                                            step="0.01"
                                            value={newItemValue}
                                            onChange={e => setNewItemValue(parseFloat(e.target.value))}
                                        />
                                        <Input
                                            label="IPC Ponderado (%)"
                                            type="number"
                                            step="0.01"
                                            value={newItemPonderadoValue}
                                            onChange={e => setNewItemPonderadoValue(parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            Diferencia IPC vs Ponderado
                                        </p>
                                        <p className="text-xs text-amber-800 dark:text-amber-200 font-bold leading-relaxed">
                                            El **IPC** mide la inflación general. El **IPC Ponderado** es un ajuste para el edificio basado en la proporción real de costos (ej: luz 30%, sueldos 50%, etc).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab !== 'jornadas' && activeTab !== 'ipc' && (
                                <label className="flex items-center gap-3 p-5 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors shadow-inner">
                                    <input
                                        type="checkbox"
                                        checked={newItemMandatory}
                                        onChange={(e) => setNewItemMandatory(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"
                                    />
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-none">Cierre Obligatorio</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Requerido al finalizar turno</p>
                                    </div>
                                </label>
                            )}
                            
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" className="flex-1 rounded-2xl h-14" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                                <Button className="flex-1 rounded-2xl h-14 shadow-lg shadow-indigo-600/20" onClick={handleAddItem}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar */}
            {isEditModalOpen && editingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-y-auto max-h-[90vh] no-scrollbar animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                                    <Edit2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">Editar Ítem</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {getTabInfo()?.title}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <Input
                                label="Nombre del Ítem"
                                value={editingItem.name}
                                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                autoFocus
                            />
                            <Input
                                label="Descripción"
                                value={editingItem.description || ''}
                                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                            />

                            {activeTab === 'jornadas' && (
                                <div className="space-y-4">
                                    <Input
                                        label="Descanso Diario (Minutos)"
                                        type="number"
                                        value={editingItem.breakMinutes || 0}
                                        onChange={e => setEditingItem({ ...editingItem, breakMinutes: Number(e.target.value) })}
                                    />
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Horarios Programados</p>
                                            <button 
                                                onClick={() => {
                                                    const cur = editingItem.schedules || [];
                                                    setEditingItem({ ...editingItem, schedules: [...cur, { days: [5], startTime: '08:00', endTime: '14:00' }] });
                                                }}
                                                className="text-[10px] font-black text-indigo-600 uppercase"
                                            >
                                                + Añadir Horario
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {(editingItem.schedules || []).map((sched: any, sIdx: number) => (
                                                <div key={sIdx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 relative group">
                                                    <button 
                                                        onClick={() => {
                                                            const filtered = editingItem.schedules.filter((_: any, i: number) => i !== sIdx);
                                                            setEditingItem({ ...editingItem, schedules: filtered });
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-rose-500 border border-rose-100 dark:border-rose-900/30 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="flex gap-1.5 mb-3">
                                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, dIdx) => (
                                                            <button
                                                                key={dIdx}
                                                                onClick={() => {
                                                                    const newSchedules = [...editingItem.schedules];
                                                                    const days = newSchedules[sIdx].days.includes(dIdx)
                                                                        ? newSchedules[sIdx].days.filter((d: number) => d !== dIdx)
                                                                        : [...newSchedules[sIdx].days, dIdx];
                                                                    newSchedules[sIdx].days = days;
                                                                    setEditingItem({ ...editingItem, schedules: newSchedules });
                                                                }}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${sched.days.includes(dIdx) ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="time" 
                                                            value={sched.startTime} 
                                                            onChange={e => {
                                                                const newSchedules = [...editingItem.schedules];
                                                                newSchedules[sIdx].startTime = e.target.value;
                                                                setEditingItem({ ...editingItem, schedules: newSchedules });
                                                            }}
                                                            className="bg-gray-50 dark:bg-gray-800 border-none text-xs font-black rounded-xl p-2.5"
                                                        />
                                                        <input 
                                                            type="time" 
                                                            value={sched.endTime} 
                                                            onChange={e => {
                                                                const newSchedules = [...editingItem.schedules];
                                                                newSchedules[sIdx].endTime = e.target.value;
                                                                setEditingItem({ ...editingItem, schedules: newSchedules });
                                                            }}
                                                            className="bg-gray-50 dark:bg-gray-800 border-none text-xs font-black rounded-xl p-2.5"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {(!editingItem.schedules || editingItem.schedules.length === 0) && (
                                                <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border-2 border-dashed dark:border-gray-800">
                                                    <p className="text-[10px] text-gray-400 italic mb-3">Se usará el horario base L-V. Active horarios mixtos para mayor precisión.</p>
                                                    <div className="flex gap-1 mb-3">
                                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => {
                                                                    const current = editingItem.workDays || [];
                                                                    const updated = current.includes(idx) ? current.filter((d: number) => d !== idx) : [...current, idx];
                                                                    setEditingItem({ ...editingItem, workDays: updated });
                                                                }}
                                                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black ${editingItem.workDays?.includes(idx) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="time" 
                                                            value={editingItem.startTime} 
                                                            onChange={e => setEditingItem({ ...editingItem, startTime: e.target.value })}
                                                            className="bg-gray-100 dark:bg-gray-750 border-none text-xs font-black rounded-xl p-2"
                                                        />
                                                        <input 
                                                            type="time" 
                                                            value={editingItem.endTime} 
                                                            onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })}
                                                            className="bg-gray-100 dark:bg-gray-750 border-none text-xs font-black rounded-xl p-2"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ipc' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="IPC Real (%)"
                                        type="number"
                                        step="0.01"
                                        value={editingItem.ipcRate}
                                        onChange={e => setEditingItem({ ...editingItem, ipcRate: parseFloat(e.target.value) })}
                                    />
                                    <Input
                                        label="IPC Ponderado (%)"
                                        type="number"
                                        step="0.01"
                                        value={editingItem.ponderadoRate || 0}
                                        onChange={e => setEditingItem({ ...editingItem, ponderadoRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}

                            {activeTab !== 'jornadas' && activeTab !== 'ipc' && (
                                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 cursor-pointer shadow-inner">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.isMandatory || false}
                                        onChange={(e) => setEditingItem({ ...editingItem, isMandatory: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-indigo-500 bg-white"
                                    />
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-none">Cierre Obligatorio</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Registro requerido en bitácora</p>
                                    </div>
                                </label>
                            )}
                            
                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" className="flex-1 rounded-2xl h-14" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>Cancelar</Button>
                                <Button className="flex-1 rounded-2xl h-14 shadow-lg shadow-indigo-600/20 bg-amber-600 hover:bg-amber-700 border-none" onClick={handleUpdateItem}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
