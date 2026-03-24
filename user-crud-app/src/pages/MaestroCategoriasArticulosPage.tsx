import React, { useState } from 'react';
import { useSystemParameters } from '../context/SystemParameterContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Trash2, Edit2, X, Tag, Search, Package } from 'lucide-react';
import type { SystemParameter } from '../types';

export const MaestroCategoriasArticulosPage: React.FC = () => {
    const { parameters, addParameter, updateParameter, deleteParameter } = useSystemParameters();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SystemParameter | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleOpenModal = (cat?: SystemParameter) => {
        if (cat) {
            setEditingCategory(cat);
            setName(cat.name);
            setDescription(cat.description || '');
        } else {
            setEditingCategory(null);
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
            type: 'article_category' as const,
            isActive: true
        };

        if (editingCategory) {
            await updateParameter(editingCategory.id, data);
        } else {
            await addParameter(data);
        }
        setIsModalOpen(false);
    };

    const filteredCategories = parameters.filter(p =>
        p.type === 'article_category' &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Tag className="w-8 h-8 text-white" />
                        </div>
                        Maestro Categorías de Insumos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-1">Administra las categorías para clasificar E.P.P e insumos.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                    <div key={cat.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                                {cat.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{cat.description}</p>}
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteParameter(cat.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredCategories.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No hay categorías registradas.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Tag className="w-5 h-5 text-indigo-600" />
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input label="Nombre de la Categoría" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: EPP Pesado, Aseo Industrial..." />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Descripción</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="Detalles adicionales sobre esta categoría..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Categoría</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
