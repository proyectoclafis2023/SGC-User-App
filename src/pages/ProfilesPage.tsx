import React, { useState } from 'react';
import { useProfiles } from '../context/ProfileContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ShieldCheck, Plus, Search, Shield, Save, X, Trash2, Edit2 } from 'lucide-react';
import type { Profile, ProfilePermissions } from '../types';

export const ProfilesPage: React.FC = () => {
    const { profiles, addProfile, updateProfile, deleteProfile } = useProfiles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<ProfilePermissions>({
        canViewPersonnel: true,
        canManagePersonnel: true,
        canViewPrevisiones: true,
        canManagePrevisiones: true,
        canViewAFPs: true,
        canManageAFPs: true,
        canViewUsers: true,
        canManageUsers: true,
        canViewSettings: true,
        canManageSettings: true,
    });

    const resetForm = () => {
        setName('');
        setPermissions({
            canViewPersonnel: true,
            canManagePersonnel: true,
            canViewPrevisiones: true,
            canManagePrevisiones: true,
            canViewAFPs: true,
            canManageAFPs: true,
            canViewUsers: true,
            canManageUsers: true,
            canViewSettings: true,
            canManageSettings: true,
        });
        setEditingProfile(null);
    };

    const handleOpenModal = (profile?: Profile) => {
        if (profile) {
            setEditingProfile(profile);
            setName(profile.name);
            setPermissions(profile.permissions);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProfile) {
            await updateProfile({ ...editingProfile, name, permissions });
        } else {
            await addProfile({ name, permissions });
        }
        setIsModalOpen(false);
        resetForm();
    };

    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const togglePermission = (key: keyof ProfilePermissions) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Maestro de Perfiles
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Configura niveles de acceso y permisos granulares.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="shadow-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Perfil
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar perfil..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(profile)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteProfile(profile.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                            <div className="mt-4 space-y-2">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Permisos Clave</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.permissions.canManagePersonnel && <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">Personal</span>}
                                    {profile.permissions.canManagePrevisiones && <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">Salud</span>}
                                    {profile.permissions.canManageUsers && <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md">Usuarios</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                {editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <Input
                                label="Nombre del Perfil"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ej. Supervisor de RRHH"
                                required
                            />

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Configuración de Accesos</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Ver Personal', key: 'canViewPersonnel' },
                                        { label: 'Gestionar Personal', key: 'canManagePersonnel' },
                                        { label: 'Ver Previsiones', key: 'canViewPrevisiones' },
                                        { label: 'Gestionar Previsiones', key: 'canManagePrevisiones' },
                                        { label: 'Ver AFPs', key: 'canViewAFPs' },
                                        { label: 'Gestionar AFPs', key: 'canManageAFPs' },
                                        { label: 'Ver Usuarios', key: 'canViewUsers' },
                                        { label: 'Gestionar Usuarios', key: 'canManageUsers' },
                                        { label: 'Ver Configuración', key: 'canViewSettings' },
                                        { label: 'Gestionar Configuración', key: 'canManageSettings' },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-indigo-300 transition-all">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                            <input
                                                type="checkbox"
                                                checked={permissions[item.key as keyof ProfilePermissions]}
                                                onChange={() => togglePermission(item.key as keyof ProfilePermissions)}
                                                className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-gray-900 border-gray-300 focus:ring-indigo-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingProfile ? 'Guardar Cambios' : 'Crear Perfil'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
