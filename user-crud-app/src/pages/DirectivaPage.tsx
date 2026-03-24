import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Trash2, Edit2, X, Users, Mail, Phone, Camera, ShieldCheck } from 'lucide-react';
import { useCondoBoard } from '../context/CondoBoardContext';

interface BoardMember {
    id: string;
    name: string;
    position: string;
    dni: string;
    address: string;
    email?: string;
    phone?: string;
    photo?: string;
    signature_photo?: string;
    is_archived: boolean;
    created_at: string;
}

export const DirectivaPage: React.FC = () => {
    const { members, loading: isLoading, addMember, updateMember, deleteMember } = useCondoBoard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | null>(null);

    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [dni, setDni] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [photo, setPhoto] = useState('');
    const [signature_photo, setSignaturePhoto] = useState('');

    const handleOpenModal = (member?: BoardMember) => {
        if (member) {
            setEditingMember(member);
            setName(member.name);
            setPosition(member.position);
            setDni(member.dni || '');
            setAddress(member.address || '');
            setEmail(member.email || '');
            setPhone(member.phone || '');
            setPhoto(member.photo || '');
            setSignaturePhoto(member.signature_photo || '');
        } else {
            setEditingMember(null);
            setName('');
            setPosition('');
            setDni('');
            setAddress('');
            setEmail('');
            setPhone('');
            setPhoto('');
            setSignaturePhoto('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, position, dni, address, email, phone, photo, signature_photo };
        
        try {
            if (editingMember) {
                await updateMember(editingMember.id, data);
            } else {
                await addMember(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving board member:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Está seguro de eliminar a este miembro de la directiva?')) {
            try {
                await deleteMember(id);
            } catch (error) {
                console.error('Error deleting board member:', error);
            }
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        Directiva del Condominio
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold italic">Administra los miembros de la mesa directiva y el comité.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="rounded-[1.5rem] px-8 py-6 h-auto shadow-xl shadow-indigo-500/20">
                    <Plus className="w-5 h-5 mr-3" />
                    Nuevo Miembro
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[3rem]"></div>
                    ))}
                </div>
            ) : members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                            <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
                                <div className="absolute -bottom-12 left-8">
                                    <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-gray-900 overflow-hidden shadow-2xl bg-gray-50">
                                        {member.photo ? (
                                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users className="w-10 h-10 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 flex gap-2">
                                    <button onClick={() => handleOpenModal(member)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(member.id)} className="p-3 bg-rose-500/20 backdrop-blur-md rounded-2xl text-rose-100 hover:bg-rose-500/40 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="pt-16 p-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{member.name}</h3>
                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6">{member.position}</p>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold truncate">RUT: {member.dni}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <Home className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold truncate">{member.address || 'Sin dirección'}</span>
                                    </div>
                                    {member.email && (
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold truncate">{member.email}</span>
                                        </div>
                                    )}
                                    {member.phone && (
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold">{member.phone}</span>
                                        </div>
                                    )}
                                    {member.signature_photo && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Firma Digital</p>
                                            <img src={member.signature_photo} alt="Firma" className="h-12 mx-auto grayscale opacity-50 contrast-125" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/10 rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
                    <Users className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">No hay miembros registrados</h3>
                    <p className="text-gray-400 dark:text-gray-500 font-bold mt-2">Comienza agregando al presidente o tesorero del comité.</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-amber-500" />
                                {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="flex justify-center mb-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500 shadow-inner">
                                        {photo ? (
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-10 h-10 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        )}
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    {photo && (
                                        <button type="button" onClick={() => setPhoto('')} className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Input label="Nombre Completo" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ej. Andres Bello" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Cargo" value={position} onChange={(e) => setPosition(e.target.value)} required placeholder="ej. Presidente" />
                                <Input label="RUT / DNI" value={dni} onChange={(e) => setDni(e.target.value)} required placeholder="12.345.678-9" />
                            </div>
                            
                            <Input label="Dirección Externa" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Siempre Viva 123" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                                <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9..." />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Firma Digital</label>
                                <div className="relative group">
                                    <div className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50">
                                        {signature_photo ? (
                                            <img src={signature_photo} alt="Firma Preview" className="h-full object-contain p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <Edit2 className="w-5 h-5 text-gray-300" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Subir Imagen de Firma</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setSignaturePhoto(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    {signature_photo && (
                                        <button type="button" onClick={() => setSignaturePhoto('')} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl py-4 font-black">Cancelar</Button>
                                <Button type="submit" className="flex-1 rounded-2xl py-4 font-black shadow-lg shadow-indigo-500/20">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
