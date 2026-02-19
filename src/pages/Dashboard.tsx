import React, { useState } from 'react';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';
import { Button } from '../components/Button';
import { useUsers } from '../context/UserContext';
import { usePersonnel } from '../context/PersonnelContext';
import { useResidents } from '../context/ResidentContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useReservations } from '../context/ReservationContext';
import { useSystemMessages } from '../context/SystemMessageContext';
import type { User } from '../types';
import { Plus, Search, Users as UsersIcon, ShieldCheck, UserCheck, Building2, Calendar, MessageSquare, Briefcase } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { personnel } = usePersonnel();
    const { residents } = useResidents();
    const { towers } = useInfrastructure();
    const { reservations } = useReservations();
    const { messages } = useSystemMessages();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (id: string, name: string) => {
        if (window.confirm(`¿Está seguro de eliminar a ${name}?`)) {
            deleteUser(id);
        }
    };

    const handleSubmit = (userData: Omit<User, 'id' | 'createdAt'>, id?: string) => {
        if (id) {
            updateUser(id, userData);
        } else {
            addUser(userData);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Usuarios Sistema', value: users.length, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Personal Total', value: personnel.length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Residentes Censo', value: residents.length, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Torres / Deptos', value: `${towers.length} / ${towers.reduce((acc, t) => acc + t.departments.length, 0)}`, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Reservas Pendientes', value: reservations.filter(r => r.status === 'pending').length, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { label: 'Avisos Activos', value: messages.filter(m => m.isActive).length, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Panel de Control</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen general de la administración comunitaria.</p>
                </div>
                <div className="text-sm font-bold px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                    SGC v1.2.0 - Activo
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className={`p-3 rounded-2xl w-fit mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Section: User Management */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-indigo-600" />
                        Control de Accesos Administrativos
                    </h2>
                    <Button onClick={handleAddUser} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Filtrar administradores..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <UserList
                    users={filteredUsers}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                />
            </div>

            <UserForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingUser}
            />
        </div>
    );
};
