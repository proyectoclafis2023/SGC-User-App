import React, { useState } from 'react';
import { useCommunications } from '../context/CommunicationContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    Plus, Trash2, Edit2, X, Mail, BookOpen, 
    Save, AlertCircle
} from 'lucide-react';
import type { CommunicationTemplate } from '../types';

export const MessageMasterPage: React.FC = () => {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useCommunications();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);

    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<CommunicationTemplate['type']>('general');

    const handleOpenModal = (tpl?: CommunicationTemplate) => {
        if (tpl) {
            setEditingTemplate(tpl);
            setName(tpl.name);
            setSubject(tpl.subject);
            setMessage(tpl.message);
            setType(tpl.type);
        } else {
            setEditingTemplate(null);
            setName('');
            setSubject('');
            setMessage('');
            setType('general');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name,
            subject,
            message,
            type
        };
        if (editingTemplate) {
            await updateTemplate({ ...editingTemplate, ...data });
        } else {
            await addTemplate(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Maestro de Mensajes
                    </h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Gestión de plantillas para comunicaciones masivas.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.filter(t => !t.isArchived).map((tpl) => (
                    <div key={tpl.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    tpl.type === 'arrears' ? 'bg-amber-100 text-amber-700' : 
                                    tpl.type === 'emergency' ? 'bg-red-100 text-red-700' : 
                                    'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {tpl.type}
                                </span>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1">{tpl.name}</h3>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asunto</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-1">{tpl.subject}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cuerpo del Mensaje</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-4 italic">"{tpl.message}"</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                            <button
                                onClick={() => handleOpenModal(tpl)}
                                className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-black uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                                onClick={() => deleteTemplate(tpl.id)}
                                className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-indigo-600">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Mail className="w-6 h-6" />
                                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Nombre de Referencia" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Aviso de Mora Nivel 1" />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <select 
                                        value={type} 
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all dark:text-gray-200"
                                    >
                                        <option value="general">Mensaje General</option>
                                        <option value="arrears">Cobranza / Mora</option>
                                        <option value="emergency">Emergencia / Crítico</option>
                                    </select>
                                </div>
                            </div>
                            <Input label="Asunto del Correo" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Ej: [IMPORTANTE] Aviso de Deuda Pendiente" />
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contenido del Mensaje</label>
                                    <span className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 cursor-help group relative">
                                        <AlertCircle className="w-3 h-3" /> Ver Placeholders
                                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white rounded-xl text-[9px] font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-2xl">
                                            Usa estos códigos para datos automáticos:<br/>
                                            <span className="text-indigo-400 font-black">[DIA_LIMITE]</span> - Día tope de pago<br/>
                                            <span className="text-indigo-400 font-black">[MAX_MESES]</span> - Meses límite mora<br/>
                                            <span className="text-indigo-400 font-black">[MULTA]</span> - Monto de multa fija<br/>
                                            <span className="text-indigo-400 font-black">[MESES]</span> - Meses de mora de la unidad
                                        </div>
                                    </span>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Estimado copropietario..."
                                    className="w-full min-h-[200px] rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all dark:text-gray-200 resize-none shadow-inner"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 shadow-xl shadow-indigo-500/20">
                                    <Save className="w-4 h-4 mr-2" /> Guardar Plantilla
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
