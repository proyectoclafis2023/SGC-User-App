import React, { useState } from 'react';
import { useServiceDirectory } from '../context/ServiceDirectoryContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    Plus, Search, Trash2, Edit2, X, HardHat, 
    Wrench, Phone, Mail, FileText 
} from 'lucide-react';
import type { ServiceDirectory } from '../types';

export const MaestroServiciosPage: React.FC = () => {
    const { services, addService, updateService, deleteService } = useServiceDirectory();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceDirectory | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [contact_phone, setContactPhone] = useState('');
    const [contact_email, setContactEmail] = useState('');
    const [description, setDescription] = useState('');

    const filtered = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setName('');
        setCategory('');
        setContactPhone('');
        setContactEmail('');
        setDescription('');
        setEditingService(null);
    };

    const handleEdit = (s: ServiceDirectory) => {
        setEditingService(s);
        setName(s.name);
        setCategory(s.category);
        setContactPhone(s.contact_phone || '');
        setContactEmail(s.contact_email || '');
        setDescription(s.description || '');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, category, contact_phone, contact_email, description };
        if (editingService) {
            await updateService(editingService.id, data);
        } else {
            await addService(data);
        }
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        Maestro de Servicios Externos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-1">Catálogo de proveedores y servicios técnicos para residentes.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Servicio
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(s => (
                    <div key={s.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group relative flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                    <HardHat className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(s)} className="p-3 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if (confirm('¿Eliminar servicio?')) deleteService(s.id); }} className="p-3 text-gray-400 hover:text-rose-600 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{s.name}</h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">{s.category}</span>
                            {s.description && (
                                <p className="text-xs font-bold text-gray-500 italic leading-relaxed line-clamp-2 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                                    {s.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <Input label="Nombre del Proveedor" value={name} onChange={e => setName(e.target.value)} required />
                            <Input label="Categoría / Especialidad" value={category} onChange={e => setCategory(e.target.value)} required placeholder="Ej: Gasfitería, Eléctrico" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Teléfono de Contacto" value={contact_phone} onChange={e => setContactPhone(e.target.value)} />
                                <Input label="Email de Contacto" value={contact_email} onChange={e => setContactEmail(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-widest">Descripción / Notas</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold min-h-[100px]"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
