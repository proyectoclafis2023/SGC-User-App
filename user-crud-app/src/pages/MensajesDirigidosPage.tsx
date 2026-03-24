import React, { useState } from 'react';
import { useDirectedMessages } from '../context/DirectedMessageContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    Plus, Trash2, X, MessageSquare, 
    Save, Building2, Bell
} from 'lucide-react';
import type { DirectedMessage } from '../types';

export const MensajesDirigidosPage: React.FC = () => {
    const { messages, addMessage, deleteMessage } = useDirectedMessages();
    const { departments } = useInfrastructure();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [text, setText] = useState('');
    const [type, setType] = useState<DirectedMessage['type']>('info');
    const [unitId, setUnitId] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addMessage({
            text,
            type,
            unitId: unitId || undefined,
            isActive: true
        });
        setIsModalOpen(false);
        setText('');
        setUnitId('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-indigo-600" />
                        Mensajes Dirigidos
                    </h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Mensajes específicos para unidades.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Mensaje Dirigido
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messages.map((msg) => {
                    const dept = departments.find((d) => d.id === msg.unitId);
                    return (
                        <div key={msg.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${
                                msg.type === 'danger' ? 'bg-red-500' : 
                                msg.type === 'warning' ? 'bg-amber-500' : 
                                msg.type === 'success' ? 'bg-emerald-500' : 
                                'bg-indigo-500'
                            } opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    msg.type === 'danger' ? 'bg-red-100 text-red-700' : 
                                    msg.type === 'warning' ? 'bg-amber-100 text-amber-700' : 
                                    msg.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                                    'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {msg.type}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                                    <Building2 className="w-3 h-3" />
                                    {dept ? `Unidad ${dept.number}` : 'Global'}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6 italic">"{msg.text}"</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-indigo-600">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Bell className="w-6 h-6" />
                                Nuevo Mensaje
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad Destino (Opcional)</label>
                                <select 
                                    value={unitId} 
                                    onChange={(e) => setUnitId(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-gray-200"
                                >
                                    <option value="">Todos los residentes</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.number}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Aviso</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['info', 'warning', 'danger', 'success'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                                type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Texto del Mensaje</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full min-h-[120px] rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-gray-200 resize-none"
                                    placeholder="Ej: Estimado, se ha detectado una filtración en su unidad..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600">
                                    <Save className="w-4 h-4 mr-2" /> Enviar Mensaje
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
