import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useResidents } from '../context/ResidentContext';
import { SecurityModal } from '../components/SecurityModal';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useSpecialConditions } from '../context/SpecialConditionContext';
import { useHistoryLogs } from '../context/HistoryLogContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Plus, Search, Phone, Mail, Trash2, Edit2, X, Users,
    CheckCircle2, Camera, User, Heart, History, Key, ShieldCheck,
    ChevronRight, MapPin, Info, List, LayoutGrid
} from 'lucide-react';
import type { Resident, HistoryLog } from '../types';
import { formatRUT } from '../utils/formatters';
import { useUsers } from '../context/UserContext';
import { compressImage } from '../utils/imageCompression';

export const ResidentesPage: React.FC = () => {
    const location = useLocation();
    const { residents, addResident, updateResident, deleteResident } = useResidents();
    const { users, addUser, updateUser, resetPassword, deleteUser } = useUsers();
    const { getLogsByEntity } = useHistoryLogs();
    const { towers } = useInfrastructure();
    const { conditions } = useSpecialConditions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLogs, setSelectedLogs] = useState<HistoryLog[] | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [showInactive, setShowInactive] = useState(false);
    const [credentialsPopup, setCredentialsPopup] = useState<{user: string, pass: string, name: string} | null>(null);
    const [associatedPendingUser, setAssociatedPendingUser] = useState<any>(null);

    useEffect(() => {
        if (location.state?.pendingUser) {
            const pu = location.state.pendingUser;
            setAssociatedPendingUser(pu);
            handleOpenModal();
            const nameParts = pu.name.split(' ');
            setNames(nameParts[0] || '');
            setLastNames(nameParts.slice(1).join(' ') || '');
            setEmail(pu.email || '');
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const [names, setNames] = useState('');
    const [last_names, setLastNames] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [notes, setNotes] = useState('');
    const [tower_id, setTowerId] = useState('');
    const [unit_id, setUnitId] = useState('');
    const [family_count, setFamilyCount] = useState(0);
    const [has_pets, setHasPets] = useState(false);
    const [condition_ids, setConditionIds] = useState<string[]>([]);
    const [parking_ids, setParkingIds] = useState<string[]>([]);
    const [is_tenant, setIsTenant] = useState(false);
    const [rent_amount, setRentAmount] = useState<number | undefined>(undefined);

    const handleViewLogs = (resident: Resident) => {
        const logs = getLogsByEntity('resident', resident.id);
        setSelectedLogs(logs);
    };

    const handleOpenModal = (res?: Resident) => {
        if (res) {
            setEditingResident(res);
            setNames(res.names);
            setLastNames(res.last_names);
            setDni(res.dni);
            setPhone(res.phone);
            setEmail(res.email);
            setPhoto(res.photo);
            setNotes(res.notes || '');
            setTowerId(res.tower_id || '');
            setUnitId(res.unit_id || '');
            setFamilyCount(res.family_count || 0);
            setHasPets(res.has_pets || false);
            setConditionIds(res.condition_ids || []);
            setParkingIds(res.parking_ids || []);
            setIsTenant(res.is_tenant || false);
            setRentAmount(res.rent_amount);
        } else {
            setEditingResident(null);
            setNames('');
            setLastNames('');
            setDni('');
            setPhone('');
            setEmail('');
            setPhoto(undefined);
            setNotes('');
            setTowerId('');
            setUnitId('');
            setFamilyCount(0);
            setHasPets(false);
            setConditionIds([]);
            setParkingIds([]);
            setIsTenant(false);
            setRentAmount(undefined);
            if (!location.state?.pendingUser) {
                setAssociatedPendingUser(null);
            }
        }
        setIsModalOpen(true);
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setPhoto(compressed);
            } catch (err) {
                console.error('Error compressing image:', err);
            }
        }
    };

    const toggleCondition = (id: string) => {
        setConditionIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            names, last_names, dni, phone, email, photo, notes,
            tower_id: tower_id || undefined,
            unit_id: unit_id || undefined,
            family_count: Number(family_count),
            has_pets, condition_ids, parking_ids, is_tenant,
            rent_amount: is_tenant ? Number(rent_amount) : undefined
        };
        if (editingResident) {
            await updateResident({ ...editingResident, ...data });
        } else {
            await addResident(data);
            if (associatedPendingUser) {
                await updateUser(associatedPendingUser.id, {
                    ...associatedPendingUser,
                    role: 'resident',
                    status: 'active',
                    name: `${names} ${last_names}` 
                });
            }
        }
        setIsModalOpen(false);
        setAssociatedPendingUser(null);
    };

    const selectedTower = towers.find(t => t.id === tower_id);
    const availableUnits = selectedTower ? selectedTower.departments : [];

    const getUnitInfo = (tId?: string, uId?: string) => {
        if (!tId || !uId) return null;
        const tower = towers.find(t => t.id === tId);
        if (!tower) return null;
        const unit = tower.departments.find(d => d.id === uId);
        if (!unit) return null;
        return `Unidad ${unit.number}`;
    };

    const filteredResidents = residents.filter(r => {
        if (showInactive) {
            if (!r.is_archived && r.status !== 'inactive') return false;
        } else {
            if (r.is_archived || r.status === 'inactive') return false;
        }
        const cleanSearch = searchTerm.toLowerCase().trim();
        const cleanDniSearch = searchTerm.replace(/[^0-9kK]/g, '').toLowerCase();
        const matchName = `${r.names} ${r.last_names}`.toLowerCase().includes(cleanSearch);
        const matchDni = r.dni.replace(/[^0-9kK]/g, '').toLowerCase().includes(cleanDniSearch);
        return matchName || (cleanDniSearch.length > 0 && matchDni);
    });

    const cleanRutForPassword = (rut: string) => {
        const clean = rut.replace(/[^0-9kK]/g, '');
        return clean.slice(0, -1);
    };

    const handleCreateUser = async (res: Resident) => {
        const initialPassword = cleanRutForPassword(res.dni);
        await addUser({
            name: `${res.names} ${res.last_names}`,
            email: res.email,
            role: 'resident',
            status: 'active',
            relatedId: res.id,
            mustChangePassword: true,
            password: initialPassword
        });
        setCredentialsPopup({ 
            user: res.email, 
            pass: initialPassword, 
            name: `${res.names} ${res.last_names}` 
        });
    };

    const handleResetPassword = async (res: Resident) => {
        const user = users.find(u => u.relatedId === res.id);
        if (!user) return;
        const initialPassword = cleanRutForPassword(res.dni);
        await resetPassword(user.id, initialPassword);
        setCredentialsPopup({ 
            user: user.email, 
            pass: initialPassword, 
            name: `${res.names} ${res.last_names}` 
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <Users className="w-6 h-6" />
                        </div>
                        Maestro de Residentes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold px-1">Censo y contacto de propietarios y arrendatarios.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => handleOpenModal()} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Residente
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md ml-2">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            className="w-full pl-14 pr-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mr-2 gap-1 items-center">
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.2em] ${showInactive ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        {showInactive ? 'Viendo Inactivos' : 'Ver Inactivos'}
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm shadow-indigo-500/10' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm shadow-indigo-500/10' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResidents.map((r) => (
                        <div key={r.id} className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleOpenModal(r)} className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setResidentToDelete(r); setIsDeleteModalOpen(true); }} className="p-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-6">
                                {r.photo ? (
                                    <img src={r.photo} alt={r.names} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl uppercase shadow-xl group-hover:scale-105 transition-transform">
                                        {r.names.charAt(0)}{r.last_names.charAt(0)}
                                    </div>
                                )}
                                <div className="mt-6 text-center">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{r.names} {r.last_names}</h3>
                                    <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">{r.dni}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {r.unit_id && (
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/40">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{getUnitInfo(r.tower_id, r.unit_id)}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-indigo-300" />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
                                        <Phone className="w-4 h-4 text-emerald-500 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full px-1">{r.phone}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
                                        <Mail className="w-4 h-4 text-blue-500 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full px-1">{r.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Habitantes</span>
                                        <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{r.family_count || 0}</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Mascotas</span>
                                        <div className="flex items-center gap-1.5 leading-none">
                                            <span className={`text-lg font-black leading-none ${r.has_pets ? 'text-gray-900 dark:text-white' : 'text-gray-300'}`}>{r.has_pets ? 'SÍ' : 'NO'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">En sistema: {new Date(r.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => handleViewLogs(r)} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                        <History className="w-3.5 h-3.5" />
                                        Log
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 dark:border-gray-800 flex gap-3">
                                    {users.find(u => u.relatedId === r.id) ? (
                                        <Button variant="secondary" size="sm" className="w-full text-[10px] h-10 font-black uppercase tracking-widest rounded-2xl" onClick={() => handleResetPassword(r)}>
                                            <Key className="w-3.5 h-3.5 mr-2 text-amber-500" />
                                            Reset Clave
                                        </Button>
                                    ) : (
                                        <Button size="sm" className="w-full text-[10px] h-10 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-500/20" onClick={() => handleCreateUser(r)}>
                                            <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                                            Crear Acceso
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Residente</th>
                                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RUT</th>
                                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ubicación</th>
                                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacto</th>
                                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cuenta Acceso</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredResidents.map((r) => {
                                const user = users.find(u => u.relatedId === r.id);
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden">
                                                    {r.photo ? <img src={r.photo} className="w-full h-full object-cover" /> : `${r.names.charAt(0)}${r.last_names.charAt(0)}`}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{r.names} {r.last_names}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">{r.dni}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {r.unit_id ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{getUnitInfo(r.tower_id, r.unit_id)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No asignada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> {r.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <Mail className="w-3.5 h-3.5 text-blue-500" /> {r.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {user ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest break-all">
                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    Sin Cuenta
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleViewLogs(r)} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:text-indigo-600 transition-all">
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal(r)} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setResidentToDelete(r); setIsDeleteModalOpen(true); }} className="p-2.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-4xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                                <Plus className="w-6 h-6" />
                                {editingResident ? 'Editar Residente' : 'Nuevo Residente'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                <div className="md:col-span-4 lg:col-span-3 text-center">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-48 h-48 rounded-[3rem] bg-gray-50 dark:bg-gray-800 border-4 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                                            {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-gray-300" />}
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                                </div>
                                <div className="md:col-span-8 lg:col-span-9 space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Nombres" value={names} onChange={(e) => setNames(e.target.value)} required />
                                        <Input label="Apellidos" value={last_names} onChange={(e) => setLastNames(e.target.value)} required />
                                    </div>
                                    <Input label="RUT" value={dni} onChange={(e) => setDni(formatRUT(e.target.value))} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                                        <select value={tower_id} onChange={(e) => { setTowerId(e.target.value); setUnitId(''); }} className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold">
                                            <option value="">Seleccione Torre</option>
                                            {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <select value={unit_id} onChange={(e) => setUnitId(e.target.value)} disabled={!tower_id} className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold">
                                            <option value="">Seleccione Unidad</option>
                                            {availableUnits.map(u => <option key={u.id} value={u.id}>{u.number}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-8 border-t dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Registro</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {credentialsPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300 p-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-8">
                                <Key className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Credenciales de Acceso</h2>
                            <div className="w-full space-y-4 mb-8">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 text-left">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email / Usuario</div>
                                    <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{credentialsPopup.user}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 text-left">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contraseña Temporal</div>
                                    <div className="font-mono text-lg font-black text-emerald-600">{credentialsPopup.pass}</div>
                                </div>
                            </div>
                            <Button onClick={() => setCredentialsPopup(null)} className="w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 text-sm">Entendido, Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}

            <SecurityModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setResidentToDelete(null); }}
                onConfirm={() => {
                    if (residentToDelete) {
                        const user = users.find(u => u.relatedId === residentToDelete.id);
                        if (user) {
                            deleteUser(user.id);
                        }
                        deleteResident(residentToDelete.id);
                    }
                }}
                title="Eliminar Residente"
                description="¿Está seguro de eliminar a"
                itemName={residentToDelete ? `${residentToDelete.names} ${residentToDelete.last_names}` : ''}
                actionLabel="Eliminar Residente"
            />
        </div>
    );
};
