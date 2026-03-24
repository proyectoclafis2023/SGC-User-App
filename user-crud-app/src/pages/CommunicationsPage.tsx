import React, { useState, useMemo, useRef } from 'react';
import { 
    Send, 
    Users, 
    Building2, 
    Home, 
    Layers, 
    Mail, 
    Paperclip, 
    Eye, 
    CheckCircle2, 
    X,
    Info,
    ShieldCheck,
    Printer,
    History,
    Save,
    Trash2,
    BookOpen
} from 'lucide-react';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useOwners } from '../context/OwnerContext';
import { useResidents } from '../context/ResidentContext';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useSettings } from '../context/SettingsContext';
import { useCommunications } from '../context/CommunicationContext';
import { Button } from '../components/Button';
import type { Department, Owner, Resident, UnitType, Tower, CommunicationTemplate, CommunicationHistory } from '../types';

export const CommunicationsPage: React.FC = () => {
    const { towers, departments } = useInfrastructure();
    const { owners } = useOwners();
    const { residents } = useResidents();
    const { unit_types } = useUnitTypes();
    const { settings } = useSettings();
    const { templates, history, addHistory, addTemplate, deleteTemplate } = useCommunications();

    // Tabs
    const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');

    // Form State
    const [targetType, setTargetType] = useState<'all' | 'tower' | 'floor' | 'unit' | 'unit_type'>('all');
    const [selectedTowerId, setSelectedTowerId] = useState('');
    const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [selectedUnitTypeId, setSelectedUnitTypeId] = useState('');
    const [recipientType, setRecipientType] = useState<'owners' | 'residents' | 'both'>('both');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Filter Logic
    const targetedDepartments = useMemo(() => {
        let filtered = departments.filter((d: Department) => !d.is_archived);
        
        if (targetType === 'tower' && selectedTowerId) {
            filtered = filtered.filter((d: Department) => d.tower_id === selectedTowerId);
        } else if (targetType === 'floor' && selectedTowerId && selectedFloor !== '') {
            filtered = filtered.filter((d: Department) => d.tower_id === selectedTowerId && d.floor === selectedFloor);
        } else if (targetType === 'unit' && selectedTowerId && selectedUnitId) {
            filtered = filtered.filter((d: Department) => d.tower_id === selectedTowerId && d.id === selectedUnitId);
        } else if (targetType === 'unit_type' && selectedUnitTypeId) {
            filtered = filtered.filter((d: Department) => d.unit_type_id === selectedUnitTypeId);
        }
        
        return filtered;
    }, [departments, targetType, selectedTowerId, selectedFloor, selectedUnitId, selectedUnitTypeId]);

    const recipientSummary = useMemo(() => {
        const emails = new Set<string>();
        let ownerCount = 0;
        let residentCount = 0;

        targetedDepartments.forEach((dept: Department) => {
            if (recipientType === 'owners' || recipientType === 'both') {
                const owner = owners.find((o: Owner) => o.id === dept.owner_id);
                if (owner && owner.email) {
                    emails.add(owner.email);
                    ownerCount++;
                }
            }
            if (recipientType === 'residents' || recipientType === 'both') {
                const resident = residents.find((r: Resident) => r.id === dept.resident_id);
                if (resident && resident.email) {
                    emails.add(resident.email);
                    residentCount++;
                }
            }
        });

        return {
            totalEmails: emails.size,
            ownerCount,
            residentCount,
            emails: Array.from(emails)
        };
    }, [targetedDepartments, recipientType, owners, residents]);

    const handleSend = async () => {
        if (!subject || !message) {
            alert('Por favor complete el asunto y el mensaje.');
            return;
        }
        if (recipientSummary.totalEmails === 0) {
            alert('No hay destinatarios con correo electrónico para los filtros seleccionados.');
            return;
        }

        setIsSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save to history
        await addHistory({
            subject,
            message,
            recipients: recipientSummary.emails,
            sender_id: 'current-user', // Should be dynamic
            target_filter: `${targetType} - ${recipientType}`,
            attachment_url: attachment?.name
        });

        setIsSending(false);
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 5000);
        
        // Reset form partially
        setSubject('');
        setMessage('');
        setAttachment(null);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        if (!windowPrint) return;

        windowPrint.document.write(`
            <html>
                <head>
                    <title>Circular - ${subject}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 4px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; text-align: center; }
                        .logo { max-height: 80px; margin-bottom: 10px; }
                        .meta { display: flex; justify-content: space-between; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 40px;}
                        .subject { color: #4338ca; font-size: 24px; font-weight: 900; margin-bottom: 10px; }
                        .content { line-height: 1.6; font-size: 14px; white-space: pre-wrap; }
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; text-align: center; color: #999; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${settings.systemLogo ? `<img src="${settings.systemLogo}" class="logo" />` : `<div style="font-size: 40px; font-weight: 900; color: #4f46e5;">${settings.systemIcon || '🏙️'}</div>`}
                        <div style="font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${settings.system_name || 'Comunidad SGC'}</div>
                    </div>
                    <div class="meta">
                        <span>FECHA: ${new Date().toLocaleDateString()}</span>
                        <span>SANTIAGO, CHILE</span>
                    </div>
                    <div class="subject">${subject}</div>
                    <div class="content">${message}</div>
                    <div class="footer">
                        Este es un documento oficial emitido por la Administración.
                    </div>
                </body>
            </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        windowPrint.print();
        windowPrint.close();
    };

    const applyTemplate = (tpl: CommunicationTemplate) => {
        setSubject(tpl.subject);
        // Enhanced placeholder replacement
        let msg = tpl.message;
        msg = msg.replace(/\[DIA_LIMITE\]/g, settings.paymentDeadlineDay?.toString() || 'X');
        msg = msg.replace(/\[MAX_MESES\]/g, settings.maxArrearsMonths?.toString() || 'X');
        msg = msg.replace(/\[MULTA\]/g, settings.arrearsFineAmount?.toLocaleString() || 'X');
        // If it's a specific unit, we could potentially inject more, 
        // but for bulk mail it's better to keep it generic or use these global ones.
        setMessage(msg);
        setActiveTab('send');
    };

    const floorsForSelectedTower = useMemo(() => {
        if (!selectedTowerId) return [];
        const towerDepts = departments.filter((d: Department) => d.tower_id === selectedTowerId && d.floor);
        const uniqueFloors = Array.from(new Set(towerDepts.map((d: Department) => d.floor as number))).sort((a: any, b: any) => a - b);
        return uniqueFloors;
    }, [selectedTowerId, departments]);

    const unitsForSelectedTower = useMemo(() => {
        if (!selectedTowerId) return [];
        return departments.filter((d: Department) => d.tower_id === selectedTowerId).sort((a: any, b: any) => a.number.localeCompare(b.number));
    }, [selectedTowerId, departments]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                     <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                            <Send className="w-6 h-6 text-white" />
                        </div>
                        Mensajes Dirigidos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        Envía comunicados, gestiona plantillas y revisa el historial de envíos.
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl gap-1">
                    <button 
                        onClick={() => setActiveTab('send')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'send' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <Send className="w-4 h-4" /> Enviar
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <History className="w-4 h-4" /> Historial
                    </button>
                    <button 
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <BookOpen className="w-4 h-4" /> Plantillas
                    </button>
                </div>
            </div>

            {activeTab === 'send' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 space-y-8">
                            
                            {/* 1. Target Selection */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">1</div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Destinatarios y Filtros</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Tipo de Filtro</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {[
                                                { id: 'all', label: 'Todos', icon: Users },
                                                { id: 'tower', label: 'Edificio', icon: Building2 },
                                                { id: 'floor', label: 'Piso', icon: Layers },
                                                { id: 'unit', label: 'Unidad', icon: Home },
                                                { id: 'unit_type', label: 'Tipo Und.', icon: Info }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTargetType(t.id as any)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all ${
                                                        targetType === t.id 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <t.icon className="w-3.5 h-3.5" />
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(targetType === 'tower' || targetType === 'floor' || targetType === 'unit') && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Seleccionar Edificio</label>
                                                <select 
                                                    value={selectedTowerId}
                                                    onChange={(e) => {
                                                        setSelectedTowerId(e.target.value);
                                                        setSelectedFloor('');
                                                        setSelectedUnitId('');
                                                    }}
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-gray-200"
                                                >
                                                    <option value="">Seleccione Edificio...</option>
                                                    {towers.map((t: Tower) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {targetType === 'floor' && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Piso</label>
                                                <select 
                                                    value={selectedFloor}
                                                    onChange={(e) => setSelectedFloor(e.target.value === '' ? '' : Number(e.target.value))}
                                                    disabled={!selectedTowerId}
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none dark:text-gray-200 disabled:opacity-50"
                                                >
                                                    <option value="">Elegir...</option>
                                                    {floorsForSelectedTower.map(f => <option key={f} value={f}>Piso {f}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {targetType === 'unit' && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Unidad</label>
                                                <select 
                                                    value={selectedUnitId}
                                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                                    disabled={!selectedTowerId}
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none dark:text-gray-200 disabled:opacity-50"
                                                >
                                                    <option value="">Elegir Unidad...</option>
                                                    {unitsForSelectedTower.map((d: Department) => (
                                                        <option key={d.id} value={d.id}>Unidad {d.number}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {targetType === 'unit_type' && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Tipo de Unidad</label>
                                                <select 
                                                    value={selectedUnitTypeId}
                                                    onChange={(e) => setSelectedUnitTypeId(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none dark:text-gray-200"
                                                >
                                                    <option value="">Elegir Tipo...</option>
                                                    {unit_types.map((t: UnitType) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Enviar a:</label>
                                    <div className="flex gap-4 mt-3">
                                        {[
                                            { id: 'owners', label: 'Propietarios' },
                                            { id: 'residents', label: 'Residentes' },
                                            { id: 'both', label: 'Ambos' }
                                        ].map(r => (
                                            <label key={r.id} className="flex items-center gap-2 cursor-pointer group">
                                                <div 
                                                    onClick={() => setRecipientType(r.id as any)}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                                        recipientType === r.id 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                        : 'border-gray-200 dark:border-gray-700 bg-transparent'
                                                    }`}
                                                >
                                                    {recipientType === r.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">{r.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Message Content */}
                            <div className="space-y-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">2</div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Contenido del Mensaje</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Asunto del Correo</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Ej: Aviso de Suspensión de Agua Programado"
                                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Cuerpo del Mensaje</label>
                                        <textarea 
                                            rows={8}
                                            placeholder="Escriba el contenido de la circular aquí..."
                                            className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white resize-none font-medium"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-400 italic mt-1">Sugerencia: Usa plantillas para temas recurrentes como Gastos Comunes o Mantenciones.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Archivo Adjunto (Opcional)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-1 group">
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                />
                                                <div className="w-full h-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-indigo-400 transition-colors flex items-center justify-between bg-white dark:bg-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs text-gray-500 truncate">{attachment ? attachment.name : 'Subir PDF, Imagen o Documento...'}</span>
                                                    </div>
                                                    <Button size="sm" variant="secondary" className="h-8 text-[10px]">Elegir Archivo</Button>
                                                </div>
                                            </div>
                                            {attachment && (
                                                <button 
                                                    onClick={() => setAttachment(null)}
                                                    className="p-2 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <Button 
                                    variant="secondary" 
                                    className="gap-2"
                                    onClick={() => setIsPreviewOpen(true)}
                                    disabled={!subject || !message}
                                >
                                    <Eye className="w-4 h-4" /> Previsualizar
                                 </Button>
                                <Button 
                                    className="h-12 px-8 rounded-2xl gap-2 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20"
                                    onClick={handleSend}
                                    disabled={isSending || !subject || !message || recipientSummary.totalEmails === 0}
                                >
                                    {isSending ? 'Enviando...' : (
                                        <>
                                            <Send className="w-4 h-4" /> Enviar Mensaje
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Recipient Statistics */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" />
                                Resumen de Envío
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Destinatarios Totales</div>
                                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{recipientSummary.totalEmails} <span className="text-sm font-bold text-indigo-400 ml-1">e-mails</span></div>
                                </div>

                                <div className="space-y-4 px-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Propietarios</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{recipientSummary.ownerCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Residentes</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{recipientSummary.residentCount}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Unidades Focalizadas</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{targetedDepartments.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Plantillas Rápidas</p>
                                <div className="space-y-2">
                                    {templates.map(tpl => (
                                        <button 
                                            key={tpl.id}
                                            onClick={() => applyTemplate(tpl)}
                                            className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all group"
                                        >
                                            <p className="text-[10px] font-black text-indigo-600 truncate">{tpl.name}</p>
                                            <p className="text-[9px] text-gray-400 truncate mt-0.5">{tpl.subject}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Formatting Info */}
                        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/20 space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                                <h3 className="font-bold text-sm tracking-tight">Formato Automático</h3>
                            </div>
                            <p className="text-[11px] leading-relaxed text-indigo-100 font-medium opacity-90">
                                Los mensajes incluyen automáticamente el logotipo del condominio y el pie de firma profesional configurado.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <History className="w-6 h-6 text-indigo-600" />
                            Historial de Mensajes Enviados
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{history.length} Mensajes Registrados</span>
                    </div>

                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                    <Mail className="w-10 h-10" />
                                </div>
                                <p className="text-gray-500 font-bold">No hay registros de envíos recientes.</p>
                            </div>
                        ) : (
                            history.map((item: CommunicationHistory) => (
                                <div key={item.id} className="group p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4 flex-1">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-widest">{item.target_filter}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
                                                </div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{item.subject}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.message}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {item.recipients.length} Destinatarios
                                                </div>
                                                {item.attachment_url && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                                                        <Paperclip className="w-3.5 h-3.5" />
                                                        {item.attachment_url}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="secondary" onClick={() => {
                                                setSubject(item.subject);
                                                setMessage(item.message);
                                                setActiveTab('send');
                                            }} className="gap-2">
                                                <Send className="w-3 h-3" /> Reenviar
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => {
                                                setSubject(item.subject);
                                                setMessage(item.message);
                                                setIsPreviewOpen(true);
                                            }} className="gap-2">
                                                <Eye className="w-3 h-3" /> Ver
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                            Gestión de Plantillas
                        </h2>
                        <Button onClick={() => {
                            const name = prompt('Nombre de la plantilla:');
                            if (name) {
                                addTemplate({
                                    name,
                                    subject: subject || '',
                                    message: message || '',
                                    type: 'general'
                                });
                            }
                        }} variant="secondary" className="gap-2 shadow-lg shadow-indigo-100 dark:shadow-none">
                            <Save className="w-4 h-4" /> Guardar actual como plantilla
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {templates.map((tpl: CommunicationTemplate) => (
                            <div key={tpl.id} className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 space-y-4 hover:border-indigo-500 transition-all group relative">
                                <div className="space-y-1 pr-10">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{tpl.type}</p>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{tpl.name}</h3>
                                    <p className="text-[11px] font-bold text-gray-400">{tpl.subject}</p>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-3 italic truncate-pre">{tpl.message}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => applyTemplate(tpl)} className="flex-1 rounded-xl">Usar Plantilla</Button>
                                    <button 
                                        onClick={() => deleteTemplate(tpl.id)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-500">Vista Previa</h3>
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                >
                                    <Printer className="w-3 h-3" /> Imprimir Documento
                                </button>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-12 bg-gray-100" ref={printRef}>
                            {/* The Email Template */}
                            <div className="bg-white shadow-lg mx-auto max-w-2xl border border-gray-200 overflow-hidden">
                                {/* Email Header */}
                                <div className="p-8 border-b-4 border-indigo-600 flex flex-col items-center text-center space-y-4">
                                    {settings.systemLogo ? (
                                        <img src={settings.systemLogo} alt="Logo" className="h-16 w-auto" />
                                    ) : (
                                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                                            {settings.systemIcon || '🏙️'}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">{'Comunidad SGC'}</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Circular Informativa No. {new Date().getFullYear()}-001</p>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="p-10 space-y-8 min-h-[400px]">
                                    <div className="flex justify-between items-start text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Fecha: {new Date().toLocaleDateString()}</span>
                                        <span>Santiago, Chile</span>
                                    </div>

                                    <div className="space-y-4">
                                        <h1 className="text-2xl font-black text-indigo-700 tracking-tight">{subject || 'Sin Asunto'}</h1>
                                        <div className="h-1 w-20 bg-indigo-100 rounded-full"></div>
                                    </div>

                                    <div className="text-sm text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                                        <p className="font-bold">Estimado(a) Copropietario y/o Residente:</p>
                                        <p>{message || '[Contenido del mensaje aquí]'}</p>
                                    </div>

                                    {attachment && (
                                        <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center gap-3">
                                            <Paperclip className="w-5 h-5 text-indigo-500" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{attachment.name}</p>
                                                <p className="text-[10px] text-gray-500">Documento Adjunto • {(attachment.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Email Footer */}
                                <div className="p-8 bg-gray-50 border-t border-gray-100 text-center space-y-4">
                                    <p className="text-[10px] text-gray-400 font-medium px-10 leading-relaxed">
                                        Este es un correo automático enviado a través de la Plataforma de Gestión Comunitaria. Por favor no responder a esta dirección.
                                    </p>
                                    <div className="flex justify-center flex-wrap gap-4 text-[10px] items-center text-indigo-600 font-black uppercase tracking-tighter">
                                        <span>Administración</span>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        <span>Conserjería 24/7</span>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        <span>{'contacto@sgc.cl'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t flex justify-center">
                            <Button className="h-12 px-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setIsPreviewOpen(false)}>
                                Cerrar Vista Previa
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {sendSuccess && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">¡Enviado con Éxito!</p>
                            <p className="text-[11px] text-emerald-100 opacity-90">Los correos han sido puestos en cola de envío satisfactoriamente.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
