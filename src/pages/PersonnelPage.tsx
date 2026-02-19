import React, { useState } from 'react';
import { usePersonnel } from '../context/PersonnelContext';
import { PersonnelList } from '../components/PersonnelList';
import { PersonnelForm } from '../components/PersonnelForm';
import { Button } from '../components/Button';
import { Plus, Search, Users as UsersIcon, Download } from 'lucide-react';
import type { Personnel } from '../types';

export const PersonnelPage: React.FC = () => {
    const { personnel, addPersonnel, updatePersonnel, deletePersonnel } = usePersonnel();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddPerson = () => {
        setEditingPerson(null);
        setIsModalOpen(true);
    };

    const handleEditPerson = (person: Personnel) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const handleDeletePerson = async (id: string, name: string) => {
        if (window.confirm(`¿Está seguro de eliminar la ficha de ${name}?`)) {
            await deletePersonnel(id);
        }
    };

    const handleSubmit = async (data: Omit<Personnel, 'id' | 'createdAt'>, id?: string) => {
        if (id) {
            await updatePersonnel({ ...data, id, createdAt: editingPerson!.createdAt });
        } else {
            await addPersonnel(data);
        }
        setIsModalOpen(false);
    };

    const filteredPersonnel = personnel.filter(p => {
        const normalizedSearch = searchTerm.toLowerCase().replace(/[^0-9kK]/g, '');
        const normalizedDni = p.dni.toLowerCase().replace(/[^0-9kK]/g, '');

        return `${p.names} ${p.lastNames}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizedDni.includes(normalizedSearch) ||
            p.dni.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-8 h-8 text-indigo-600" />
                        Maestro de Personal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de fichas, contratos y previsión del personal.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                    <Button onClick={handleAddPerson} className="shadow-indigo-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Trabajador
                    </Button>
                </div>
            </div>

            {/* Buscador */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
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
                    Total personal: <span className="font-bold text-indigo-600">{filteredPersonnel.length}</span>
                </div>
            </div>

            <PersonnelList
                personnel={filteredPersonnel}
                onEdit={handleEditPerson}
                onDelete={handleDeletePerson}
            />

            <PersonnelForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingPerson}
            />
        </div>
    );
};
