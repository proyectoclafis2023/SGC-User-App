import React, { useState, useEffect } from 'react';
import { usePersonnel } from '../context/PersonnelContext';
import { PersonnelList } from '../components/PersonnelList';
import { PersonnelForm } from '../components/PersonnelForm';
import { Button } from '../components/Button';
import { useUsers } from '../context/UserContext';
import { Plus, Search, Users as UsersIcon, Download, LayoutGrid, List, CheckCircle2, X } from 'lucide-react';
import type { Personnel, AssignedArticle } from '../types';
import { SecurityModal } from '../components/SecurityModal';
import { useArticleDeliveries } from '../context/ArticleDeliveryContext';
import { useArticles } from '../context/ArticleContext';
import { usePermissions } from '../hooks/usePermissions';

export const PersonnelPage: React.FC = () => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('personnel:manage');
    
    const { personnel, addPersonnel, updatePersonnel, deletePersonnel, uploadPersonnel } = usePersonnel();
    const { users, deleteUser } = useUsers();
    const { addDelivery } = useArticleDeliveries();
    const { decreaseStock } = useArticles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [personToDelete, setPersonToDelete] = useState<Personnel | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
    const [successToast, setSuccessToast] = useState<{show: boolean, message: string}>({ show: false, message: '' });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (successToast.show) {
            const timer = setTimeout(() => setSuccessToast({ show: false, message: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [successToast.show]);

    const handleAddPerson = () => {
        setEditingPerson(null);
        setIsModalOpen(true);
    };

    const handleEditPerson = (person: Personnel) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const handleDeletePerson = (id: string, _name: string) => {
        const person = personnel.find((p: Personnel) => p.id === id);
        if (person) {
            setPersonToDelete(person);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (personToDelete) {
            const user = users.find((u: any) => u.relatedId === personToDelete.id);
            if (user) {
                await deleteUser(user.id);
            }
            await deletePersonnel(personToDelete.id);
            setPersonToDelete(null);
            setIsDeleteModalOpen(false);
            setSuccessToast({ show: true, message: 'Ficha eliminada correctamente.' });
        }
    };

    const handleSubmit = async (data: Omit<Personnel, 'id' | 'created_at' | 'status'>, id?: string) => {
        let finalPersonnelId = id;

        // Determinar qué artículos son nuevos o incrementados para el historial
        const newArticlesForHistory: { articleId: string; quantity: number; size?: string }[] = [];

        if (id && editingPerson) {
            // Caso edición: comparar con lo que tenía antes
            (data.assigned_articles || []).forEach((newItem: AssignedArticle) => {
                const oldItem = editingPerson.assigned_articles?.find((a: AssignedArticle) => a.article_id === newItem.article_id);
                if (!oldItem) {
                    // Completamente nuevo
                    newArticlesForHistory.push({
                        articleId: newItem.article_id,
                        quantity: newItem.quantity,
                        size: newItem.size
                    });
                } else if (newItem.quantity > oldItem.quantity) {
                    // Cantidad incrementada
                    newArticlesForHistory.push({
                        articleId: newItem.article_id,
                        quantity: newItem.quantity - oldItem.quantity,
                        size: newItem.size
                    });
                }
            });
            await updatePersonnel({ ...data, id, created_at: editingPerson.created_at, status: editingPerson.status });
        } else {
            // Caso nuevo: todos los artículos asignados van al historial
            const newPerson = await addPersonnel(data);
            if (newPerson) finalPersonnelId = newPerson.id;
            if (data.assigned_articles && data.assigned_articles.length > 0) {
                data.assigned_articles.forEach((item: AssignedArticle) => {
                    newArticlesForHistory.push({
                        articleId: item.article_id,
                        quantity: item.quantity,
                        size: item.size
                    });
                });
            }
        }

        // Si hay artículos nuevos, registrar la entrega en el historial
        if (newArticlesForHistory.length > 0 && finalPersonnelId) {
            await addDelivery({
                personnel_id: finalPersonnelId,
                delivery_date: new Date().toISOString(),
                articles: newArticlesForHistory.map(a => ({ 
                    article_id: a.articleId, 
                    quantity: a.quantity, 
                    size: a.size 
                })),
                status: 'active',
                notes: id ? 'Actualización desde ficha de personal' : 'Entrega inicial al registrar personal'
            });

            // Deduct stock
            for (const art of newArticlesForHistory) {
                await decreaseStock(art.articleId, art.quantity);
            }
        }

        setSuccessToast({ 
            show: true, 
            message: id ? 'Cambios guardados con éxito.' : 'Personal registrado correctamente.' 
        });
        setIsModalOpen(false);
    };

    const filteredPersonnel = personnel.filter((p: Personnel) => {
        if (p.is_archived) return false;

        const cleanSearch = searchTerm.toLowerCase().trim();
        const cleanDniSearch = searchTerm.replace(/[^0-9kK]/g, '').toLowerCase();

        const matchName = `${p.names} ${p.last_names}`.toLowerCase().includes(cleanSearch);
        const matchDni = p.dni.replace(/[^0-9kK]/g, '').toLowerCase().includes(cleanDniSearch);

        return matchName || (cleanDniSearch.length > 0 && matchDni);
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Toast Notification */}
            {successToast.show && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-500">
                    <div className="bg-gray-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Sistema SGC</p>
                            <p className="text-sm font-bold uppercase tracking-tight">{successToast.message}</p>
                        </div>
                        <button 
                            onClick={() => setSuccessToast({ show: false, message: '' })}
                            className="ml-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-8 h-8 text-indigo-600" />
                        Maestro de Personal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Gestión de fichas, contratos y previsión del personal.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                try {
                                    const result = await uploadPersonnel(file);
                                    setSuccessToast({ show: true, message: result.message });
                                } catch (err: any) {
                                    alert(err.message);
                                }
                            }
                        }}
                    />
                    {canManage && (
                        <>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Carga Masiva
                            </Button>
                            <Button onClick={handleAddPerson} className="shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Trabajador
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Buscador y Controles de Vista */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-colors">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            viewMode === 'cards' 
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-gray-100 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Tarjetas
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            viewMode === 'grid' 
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-gray-100 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        Grilla
                    </button>
                </div>

                <div className="text-sm font-bold text-gray-400 ml-auto hidden md:block">
                    Personal activo: <span className="text-indigo-600">{filteredPersonnel.length}</span>
                </div>
            </div>

            <PersonnelList
                personnel={filteredPersonnel}
                onEdit={handleEditPerson}
                onDelete={handleDeletePerson}
                viewMode={viewMode}
                canManage={canManage}
            />

            <PersonnelForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingPerson}
            />

            <SecurityModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setPersonToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Personal"
                description="¿Está seguro de eliminar la ficha de"
                itemName={personToDelete ? `${personToDelete.names} ${personToDelete.last_names}` : ''}
                actionLabel="Eliminar Ficha"
            />
        </div>
    );
};

