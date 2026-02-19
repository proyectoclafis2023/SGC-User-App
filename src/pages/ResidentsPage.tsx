import React, { useState } from 'react';
import { useResidents } from '../context/ResidentContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Search, Phone, Mail, FileText, Trash2, Edit2, X, Bookmark } from 'lucide-react';
import type { Resident } from '../types';
import { formatRUT } from '../utils/formatters';

export const ResidentsPage: React.FC = () => {
    const { residents, addResident, updateResident, deleteResident } = useResidents();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [names, setNames] = useState('');
    const [lastNames, setLastNames] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');

    const handleOpenModal = (res?: Resident) => {
        if (res) {
            setEditingResident(res);
            setNames(res.names);
            setLastNames(res.lastNames);
            setDni(res.dni);
            setPhone(res.phone);
            setEmail(res.email);
            setNotes(res.notes || '');
        } else {
            setEditingResident(null);
            setNames('');
            setLastNames('');
            setDni('');
            setPhone('');
            setEmail('');
            setNotes('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { names, lastNames, dni, phone, email, notes };
        if (editingResident) {
            await updateResident({ ...editingResident, ...data });
        } else {
            await addResident(data);
        }
        setIsModalOpen(false);
    };

    const filteredResidents = residents.filter(r => {
        const normalizedSearch = searchTerm.toLowerCase().replace(/[^0-9kK]/g, '');
        const normalizedDni = r.dni.toLowerCase().replace(/[^0-9kK]/g, '');

        return `${r.names} ${r.lastNames}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizedDni.includes(normalizedSearch) ||
            r.dni.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bookmark className="w-8 h-8 text-indigo-600" />
                        Maestro de Residentes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Censo y contacto de propietarios y arrendatarios.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Residente
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 ml-auto hidden md:block">
                    Total: <span className="font-bold text-indigo-600">{filteredResidents.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResidents.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                {r.names.charAt(0)}{r.lastNames.charAt(0)}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(r)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteResident(r.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{r.names} {r.lastNames}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">RUT: {r.dni}</p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                <span>{r.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span className="truncate">{r.email}</span>
                            </div>
                            {r.notes && (
                                <div className="flex items-start gap-2 text-sm text-gray-500 italic mt-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                    <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{r.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-indigo-600" />
                                {editingResident ? 'Editar Residente' : 'Nuevo Residente'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Nombres" value={names} onChange={(e) => setNames(e.target.value)} required />
                                <Input label="Apellidos" value={lastNames} onChange={(e) => setLastNames(e.target.value)} required />
                            </div>
                            <Input label="RUT / DNI" value={dni} onChange={(e) => setDni(formatRUT(e.target.value))} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Observaciones</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full min-h-[100px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    placeholder="Información adicional relevante..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Residente</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
