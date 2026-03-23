import React, { useState } from 'react';
import { useParkings } from '../context/ParkingContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Trash2, Edit2, X, Car, MapPin, Accessibility, Link } from 'lucide-react';
import type { Parking, Department } from '../types';

export const EstacionamientosPage: React.FC = () => {
    const { parkings, addParking, updateParking, deleteParking } = useParkings();
    const { towers, departments } = useInfrastructure();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParking, setEditingParking] = useState<Parking | null>(null);

    const [number, setNumber] = useState('');
    const [location, setLocation] = useState('');
    const [is_handicapped, setIsHandicapped] = useState(false);
    const [notes, setNotes] = useState('');
    const [department_id, setDepartmentId] = useState('');
    const [selectedTowerId, setSelectedTowerId] = useState('');

    const handleOpenModal = (p?: Parking) => {
        if (p) {
            setEditingParking(p);
            setNumber(p.number);
            setLocation(p.location || '');
            setIsHandicapped(p.is_handicapped || false);
            setNotes(p.notes || '');
            setDepartmentId(p.department_id || '');
            const dept = departments.find((d: Department) => d.id === p.department_id);
            if (dept) setSelectedTowerId(dept.tower_id);
            else setSelectedTowerId('');
        } else {
            setEditingParking(null);
            setNumber('');
            setLocation('');
            setIsHandicapped(false);
            setNotes('');
            setDepartmentId('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const related_unit = departments.find((d: Department) => d.id === department_id)?.number || '';
        const data = { number, location, is_handicapped, notes, department_id, related_unit };
        if (editingParking) {
            await updateParking({ ...editingParking, ...data });
        } else {
            await addParking(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Car className="text-indigo-600 w-8 h-8" /> Estacionamientos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Maestro de espacios de estacionamiento disponibles.</p>
                </div>
                <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Nuevo Estacionamiento</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {parkings.filter((p: Parking) => !p.is_archived).map((p: Parking) => (
                    <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm relative group hover:shadow-md transition-all">
                        <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(p)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteParking(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className={`p-4 rounded-3xl mb-4 ${p.is_handicapped ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                                <Car className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">N° {p.number}</h3>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                    <MapPin className="w-3 h-3 text-indigo-500" />
                                    <span>{p.location || 'Sin Ubicación'}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 mt-2">
                                    <Link className="w-3 h-3 text-indigo-500" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.department_id ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500 animate-pulse'}`}>
                                        {p.related_unit ? `${towers.find(t => t.id === departments.find(d => d.id === p.department_id)?.tower_id)?.name || ''} - Unidad ${p.related_unit}` : 'Sin Asociar'}
                                    </span>
                                </div>
                            </div>
                            {p.is_handicapped && (
                                <div className="mt-3 flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-200">
                                    <Accessibility className="w-3 h-3" /> Preferencial
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                    <Car className="w-5 h-5" />
                                </div>
                                {editingParking ? 'Editar Espacio' : 'Nuevo Estacionamiento'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Número / Código" value={number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumber(e.target.value)} required placeholder="Ej: E-101" />
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edificio / Torre</label>
                                    <select
                                        value={selectedTowerId}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setSelectedTowerId(e.target.value);
                                            setDepartmentId('');
                                        }}
                                        className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {towers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad Asociada</label>
                                <select
                                    value={department_id}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
                                    className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                    disabled={!selectedTowerId}
                                >
                                    <option value="">-- Seleccionar Unidad --</option>
                                    {departments.filter(d => d.tower_id === selectedTowerId).map((d: Department) => (
                                        <option key={d.id} value={d.id}>Unidad {d.number}</option>
                                    ))}
                                </select>
                            </div>

                            <Input label="Ubicación" value={location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} placeholder="Ej: Piso -1 (Subterráneo)" />

                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${is_handicapped ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                                        <Accessibility className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Preferencial</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">¿Es para discapacidad?</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsHandicapped(!is_handicapped)}
                                    className={`w-14 h-8 rounded-full transition-all relative p-1 ${is_handicapped ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-sm ${is_handicapped ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notas del Espacio</label>
                                <textarea
                                    value={notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                    className="w-full h-24 rounded-[2rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                                    placeholder="Detalles sobre el acceso, pilares, etc."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="secondary" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20">Guardar Cambios</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
