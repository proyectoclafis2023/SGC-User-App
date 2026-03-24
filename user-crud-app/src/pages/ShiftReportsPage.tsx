import React, { useState, useEffect } from 'react';
import { useShiftReport } from '../context/ShiftReportContext';
import { useAuth } from '../context/AuthContext';
import { usePersonnel } from '../context/PersonnelContext';
import { useInfrastructureItems } from '../context/InfrastructureItemContext';
import { useEquipmentItems } from '../context/EquipmentItemContext';
import { useTickets } from '../context/TicketContext';
import { Button } from '../components/Button';
import {
    ClipboardList, Plus, Search, X, Calendar, Clock,
    User, CheckCircle2, Save, BookOpen,
    Smartphone, Zap, Building2, ShieldAlert, FileText, Image as ImageIcon, Trash2, Upload, AlertTriangle
} from 'lucide-react';
import type { ShiftReport, Personnel, InfrastructureItem, EquipmentItem } from '../types';

export const ShiftReportsPage: React.FC = () => {
    const { reports, addReport, updateReport, closeShift, reopenShift, deleteReport } = useShiftReport();
    const { items: infraItems } = useInfrastructureItems();
    const { items: equipItems } = useEquipmentItems();
    const { user } = useAuth();
    const { personnel } = usePersonnel();
    const { addTicket } = useTickets();

    const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
    const [reopeningReport, setReopeningReport] = useState<ShiftReport | null>(null);
    const [reopenReason, setReopenReason] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, folio: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields for report
    const [shift_type, setShiftType] = useState<'Manana' | 'Tarde' | 'Noche'>('Manana');
    const [novedades, setNovedades] = useState('');
    const [has_incidents, setHasIncidents] = useState(false);
    const [incident_details, setIncidentDetails] = useState('');
    const [incident_attachments, setIncidentAttachments] = useState<string[]>([]);
    const [has_infrastructure_issues, setHasInfrastructureIssues] = useState(false);
    const [infraIssueTypes, setInfraIssueTypes] = useState<string[]>([]);
    const [infraDetails, setInfraDetails] = useState('');
    const [infrastructure_attachments, setInfrastructureAttachments] = useState<string[]>([]);
    const [has_equipment_issues, setHasEquipmentIssues] = useState(false);
    const [equipment_issue_types, setEquipmentIssueTypes] = useState<string[]>([]);
    const [equipmentDetails, setEquipmentDetails] = useState('');
    const [equipment_attachments, setEquipmentAttachments] = useState<string[]>([]);
    const [checkedMandatoryItems, setCheckedMandatoryItems] = useState<string[]>([]);

    const todayStr = new Date().toISOString().split('T')[0];
    const activeReport = reports.find((r: ShiftReport) => r.concierge_id === user?.id && r.shift_date === todayStr && r.status === 'open');

    const getCurrentShift = () => {
        const hour = new Date().getHours();
        if (hour >= 7 && hour < 15) return 'Manana';
        if (hour >= 15 && hour < 23) return 'Tarde';
        return 'Noche';
    };

    useEffect(() => {
        if (user?.relatedId && !activeReport) {
            const currentPersonnel = personnel.find((p: Personnel) => p.id === user.relatedId);
            if (currentPersonnel?.assigned_shift) {
                // Normalize 'Mañana' or any variation to 'Manana'
                const normalized = currentPersonnel.assigned_shift.includes('Ma') ? 'Manana' : currentPersonnel.assigned_shift;
                if (['Manana', 'Tarde', 'Noche'].includes(normalized)) {
                    setShiftType(normalized as 'Manana' | 'Tarde' | 'Noche');
                }
            } else {
                setShiftType(getCurrentShift());
            }
        } else if (!activeReport) {
            setShiftType(getCurrentShift());
        }
    }, [user, personnel, activeReport]);


    const infrastructureOptions = infraItems.filter((i: InfrastructureItem) => !i.is_archived).map((i: InfrastructureItem) => i.name);
    const equipmentOptions = equipItems.filter((i: EquipmentItem) => !i.is_archived).map((i: EquipmentItem) => i.name);

    const mandatoryInfra = infraItems.filter((i: InfrastructureItem) => !i.is_archived && i.isMandatory);
    const mandatoryEquip = equipItems.filter((i: EquipmentItem) => !i.is_archived && i.isMandatory);
    const totalMandatory = mandatoryInfra.length + mandatoryEquip.length;

    const resetForm = () => {
        setShiftType('Manana');
        setNovedades('');
        setHasIncidents(false);
        setIncidentDetails('');
        setIncidentAttachments([]);
        setHasInfrastructureIssues(false);
        setInfraIssueTypes([]);
        setInfraDetails('');
        setInfrastructureAttachments([]);
        setHasEquipmentIssues(false);
        setEquipmentIssueTypes([]);
        setEquipmentDetails('');
        setEquipmentAttachments([]);
        setCheckedMandatoryItems([]);
    };

    useEffect(() => {
        if (activeReport) {
            setShiftType(activeReport.shift_type);
            setNovedades(activeReport.novedades || '');
            setHasIncidents(activeReport.has_incidents || false);
            setIncidentDetails(activeReport.incident_details || '');
            setHasInfrastructureIssues(activeReport.has_infrastructure_issues || false);
            setInfraIssueTypes(activeReport.infrastructure_issue_types || []);
            setInfraDetails(activeReport.infrastructure_issue_details || '');
            setHasEquipmentIssues(activeReport.has_equipment_issues || false);
            setEquipmentIssueTypes(activeReport.equipment_issue_types || []);
            setEquipmentDetails(activeReport.equipment_issue_details || '');
            setIncidentAttachments(activeReport.incident_attachments || []);
            setInfrastructureAttachments(activeReport.infrastructure_attachments || []);
            setEquipmentAttachments(activeReport.equipment_attachments || []);
        }
    }, [activeReport]);

    const handleStartShift = async () => {
        const current = getCurrentShift();
        const existing = reports.find((r: ShiftReport) => 
            r.concierge_id === user?.id && 
            r.shift_date === todayStr && 
            r.shift_type === current
        );

        if (existing) {
            if (existing.status === 'closed') {
                alert(`Ya existe un reporte finalizado para la jornada de ${current} de hoy. No se pueden duplicar los reportes por jornada.`);
                return;
            }
            // Si está abierto, simplemente abrimos el modal
            setIsModalOpen(true);
            return;
        }

        await addReport({
            concierge_id: user?.id || 'unknown',
            concierge_name: user?.name || 'Usuario',
            shift_date: todayStr,
            shift_type: current as any,
            novedades: ''
        });

        // El modal se abrirá automáticamente vía useEffect cuando activeReport cambie, 
        // pero lo forzamos aquí también para una respuesta inmediata.
        setIsModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter((prev: string[]) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveDraft = async () => {
        if (activeReport) {
            setIsSaving(true);
            await updateReport(activeReport.id, {
                shift_type,
                novedades,
                has_incidents,
                incident_details,
                incident_attachments,
                has_infrastructure_issues,
                infrastructure_issue_types: infraIssueTypes,
                infrastructure_issue_details: infraDetails,
                infrastructure_attachments,
                has_equipment_issues,
                equipment_issue_types,
                equipment_issue_details: equipmentDetails,
                equipment_attachments
            });

            // Artificial delay to show "Saved" state since storage is instant
            setTimeout(() => {
                setIsSaving(false);
            }, 2000);
        }
    };

    const handleCloseShift = async (e: React.FormEvent) => {
        e.preventDefault();

        if (totalMandatory > 0 && checkedMandatoryItems.length < totalMandatory) {
            alert('Debe marcar todos los ítems de cierre obligatorio antes de finalizar el turno.');
            return;
        }

        if (activeReport) {
            await closeShift(activeReport.id, {
                shift_type,
                novedades,
                has_incidents,
                incident_details,
                incident_attachments,
                has_infrastructure_issues,
                infrastructure_issue_types: infraIssueTypes,
                infrastructure_issue_details: infraDetails,
                infrastructure_attachments,
                has_equipment_issues,
                equipment_issue_types,
                equipment_issue_details: equipmentDetails,
                equipment_attachments
            });
            
            // Register Ticket / KPI
            await addTicket({
                resident_id: user?.id || 'system',
                type: 'shift_report',
                subject: `Cierre Turno ${shift_type} - ${user?.name || 'Conserje'}`,
                description: `Folio Turno: ${activeReport.folio}. Novedades: ${novedades || 'Sin novedades'}. Incidencias: ${has_incidents ? 'Sí' : 'No'}. Instalaciones: ${has_infrastructure_issues ? 'Revisar' : 'OK'}. Equipamiento: ${has_equipment_issues ? 'Revisar' : 'OK'}.`,
                status: 'open'
            });

            setIsModalOpen(false);
            resetForm();
        }
    };

    const handleReopen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reopeningReport && reopenReason.trim()) {
            await reopenShift(reopeningReport.id, user?.name || 'Admin', reopenReason);
            setIsReopenModalOpen(false);
            setReopenReason('');
            setReopeningReport(null);
            alert("Turno reabierto con éxito.");
        }
    };

    const handleDeleteReport = (id: string) => {
        deleteReport(id);
        setDeleteConfirm(null);
    };

    const confirmDelete = (e: React.MouseEvent, id: string, folio: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ id, folio });
    };

    const filteredReports = reports.filter((r: ShiftReport) => {
        const matchesSearch = r.concierge_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.folio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || r.shift_date === dateFilter;
        return matchesSearch && matchesDate;
    }).sort((a: ShiftReport, b: ShiftReport) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const todayReports = reports.filter((r: ShiftReport) => r.shift_date === todayStr);
    const currentShiftType = getCurrentShift();
    const hasClosedCurrentShift = todayReports.some((r: ShiftReport) => r.shift_type === currentShiftType && r.status === 'closed');

    const AttachmentSection = ({ title, attachments, setter }: { title: string, attachments: string[], setter: React.Dispatch<React.SetStateAction<string[]>> }) => (
        <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    {title}
                </label>
                <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
                    <Upload className="w-3.5 h-3.5" /> Adjuntar Imagen
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setter)} />
                </label>
            </div>
            {attachments.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {attachments.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                            <img src={img} alt="attachment" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setter((prev: string[]) => prev.filter((_: string, i: number) => i !== idx))}
                                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
      const getShiftInfo = (type: 'Manana' | 'Tarde' | 'Noche') => {
        const report = todayReports.find(r => r.shift_type === type);
        if (!report) return { status: 'pending', label: '⚠ NO INFORMADO', color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-50/50', iconColor: 'bg-rose-500', subLabel: 'Pendiente de inicio' };
        if (report.status === 'open') return { status: 'open', label: '● EN CURSO', color: 'text-indigo-700 dark:text-indigo-400', bgColor: 'bg-indigo-50/50', iconColor: 'bg-indigo-500', subLabel: `Por: ${report.concierge_name}`, report };
        return { status: 'closed', label: '✓ REPORTADO', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50/50', iconColor: 'bg-emerald-500', subLabel: `Por: ${report.concierge_name}`, report };
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-10 h-10 text-indigo-600" />
                        Bitácora Turnos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 ml-1 text-sm uppercase tracking-widest">Control Operativo y Novedades de Jornada</p>
                </div>
                <div className="flex gap-2">
                    {!activeReport ? (
                        <Button onClick={handleStartShift}>
                            <Plus className="w-4 h-4 mr-2" /> Reporte de Turno
                        </Button>
                    ) : (
                        <Button onClick={() => { setIsModalOpen(true); }} className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar y Cerrar Turno
                        </Button>
                    )}
                </div>
            </div>

            {hasClosedCurrentShift && !activeReport && (
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-8 rounded-[3rem] text-rose-700 dark:text-rose-400 flex items-center gap-6 shadow-sm ring-1 ring-rose-100 dark:ring-rose-900/10">
                    <div className="w-16 h-16 bg-rose-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-rose-500/30 shrink-0">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest">Reporte Diario Finalizado</p>
                        <p className="text-xs font-bold opacity-80">Ya has enviado tu consolidado del día de hoy para esta jornada. No es necesario iniciar uno nuevo a menos que sea un turno diferente.</p>
                    </div>
                </div>
            )}

            {activeReport && (
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center shadow-inner shadow-white/20 border border-white/20">
                                <User className="w-10 h-10" />
                            </div>
                            <div>
                                 <p className="text-xs font-black uppercase tracking-widest text-indigo-100 mb-1 opacity-80">Conserje en Turno</p>
                                <h2 className="text-3xl font-black leading-none">{user?.name}</h2>
                                <p className="text-xs font-bold text-indigo-200 mt-2 uppercase tracking-widest flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                                    <Calendar className="w-3.5 h-3.5" /> {new Date(activeReport.shift_date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 flex flex-col items-center shadow-lg">
                            <p className="text-[10px] font-black uppercase text-indigo-100 mb-2 opacity-70">Estado</p>
                            <span className="flex items-center gap-2 px-6 py-2 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                Turno en Curso
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Consolidado Diario */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    Consolidado de Gestión Diaria ({new Date().toLocaleDateString()})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['Manana', 'Tarde', 'Noche'] as const).map(type => {
                        const info = getShiftInfo(type);
                        const isReported = info.status === 'closed';

                        return (
                            <div key={type} className={`p-6 rounded-[2.5rem] border-2 transition-all ${info.bgColor} ${info.status === 'pending' ? 'border-dashed' : 'border-solid'} border-opacity-30 shadow-sm flex items-center justify-between group`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${info.iconColor} text-white shadow-lg`}>
                                        <Zap className={`w-5 h-5 ${type === 'Tarde' ? 'rotate-45' : type === 'Noche' ? 'rotate-90' : ''}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Jornada {type}</p>
                                        <div className="flex flex-col">
                                            <p className={`text-sm font-black ${info.color}`}>
                                                {info.label}
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase italic">{info.subLabel}</p>
                                        </div>
                                    </div>
                                </div>
                                {info.status !== 'pending' ? (
                                    <div className="flex items-center gap-2">
                                        {isAdmin && info.report && (
                                            <button
                                                type="button"
                                                onClick={(e) => confirmDelete(e, info.report.id, info.report.folio)}
                                                className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-900/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 shadow-sm"
                                                title="Eliminar Reporte"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isReported ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 drop-shadow-md" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                                        )}
                                    </div>
                                ) : (
                                    <X className="w-6 h-6 text-rose-500 opacity-50" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por funcionario o folio..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative md:w-64">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="date"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
                {(searchTerm || dateFilter) && (
                    <Button variant="secondary" onClick={() => { setSearchTerm(''); setDateFilter(''); }}>
                        <X className="w-4 h-4 mr-2" /> Limpiar
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Historial Operativo
                    </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredReports.map(report => (
                        <div key={report.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group p-1 ring-1 ring-gray-100 dark:ring-gray-800">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-[1.5rem] ${report.status === 'open' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-gray-100 text-gray-400'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                             <h4 className="font-black text-gray-900 dark:text-white leading-tight">{report.concierge_name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="text-indigo-600 font-black">Turno {report.shift_type}</span>
                                                <span>•</span>
                                                <span>Folio {report.folio}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${report.status === 'open' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            {report.status === 'open' ? 'En Curso' : 'Finalizado'}
                                        </span>
                                        {isAdmin && report.status === 'closed' && (
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => {
                                                        setReopeningReport(report);
                                                        setIsReopenModalOpen(true);
                                                    }}
                                                    className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-50 transition-all"
                                                >
                                                    <AlertTriangle className="w-3.5 h-3.5" /> Reabrir para Corrección
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => confirmDelete(e, report.id, report.folio)}
                                                    className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar Registro
                                                </button>
                                            </div>
                                        )}
                                        {isAdmin && report.status === 'open' && (
                                            <button
                                                type="button"
                                                onClick={(e) => confirmDelete(e, report.id, report.folio)}
                                                className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-100 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar Registro
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-800 pb-6 ml-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" /> {new Date(report.shift_date).toLocaleDateString()}
                                        </div>
                                        {report.closed_at && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" /> {new Date(report.closed_at).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>

                                    {report.status === 'closed' && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FileText className="w-4 h-4 text-indigo-600" />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novedades Generales</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                                    {report.novedades || 'Sin novedades reportadas'}
                                                </p>
                                            </div>

                                            {report.has_incidents && (
                                                <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
                                                    <div className="flex items-center gap-2 text-rose-600 mb-3">
                                                        <ShieldAlert className="w-4 h-4" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Incidencias Críticas</p>
                                                    </div>
                                                    <p className="text-sm font-black text-rose-700 dark:text-rose-400 leading-relaxed">{report.incident_details}</p>
                                                    {report.incident_attachments && report.incident_attachments.length > 0 && (
                                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                                            {report.incident_attachments.map((img, i) => (
                                                                <img key={i} src={img} className="w-full aspect-square object-cover rounded-xl" alt="incidence" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {report.admin_reopen_reason && (
                                                <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-200 dark:border-amber-900/30">
                                                    <div className="flex items-center gap-2 text-amber-600 mb-3">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Observación Administrativa (Devolución para Corrección)</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400 italic">"{report.admin_reopen_reason}"</p>
                                                    <p className="text-[8px] font-black text-amber-600 uppercase mt-2">Devuelto por: {report.admin_reopened_by}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-4 rounded-[1.5rem] border ${report.has_infrastructure_issues ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' : 'bg-gray-50 border-gray-100 dark:bg-gray-800/20 dark:border-gray-700'}`}>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Instalaciones</p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {report.has_infrastructure_issues ? (
                                                            <>
                                                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                                                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400">{report.infrastructure_issue_types?.join(', ') || report.infrastructure_issue_type}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Sin Novedad</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {report.infrastructure_attachments && report.infrastructure_attachments.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-1 mt-2">
                                                            {report.infrastructure_attachments.slice(0, 3).map((img, i) => (
                                                                <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg" alt="infra" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`p-4 rounded-[1.5rem] border ${report.has_equipment_issues ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' : 'bg-gray-50 border-gray-100 dark:bg-gray-800/20 dark:border-gray-700'}`}>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Equipamiento</p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {report.has_equipment_issues ? (
                                                            <>
                                                                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                                                                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400">{report.equipment_issue_types?.join(', ') || report.equipment_issue_type}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Sin Novedad</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {report.equipment_attachments && report.equipment_attachments.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-1 mt-2">
                                                            {report.equipment_attachments.slice(0, 3).map((img, i) => (
                                                                <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg" alt="equip" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Cierre Estructurado */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    {!activeReport ? (
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 text-center animate-pulse">
                            <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
                            <p className="font-black uppercase tracking-widest text-sm text-gray-500">Iniciando Reporte...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] sm:rounded-[3.5rem] w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 sm:p-8 border-b dark:border-gray-800 flex items-center justify-between bg-amber-50/40 dark:bg-amber-950/20">
                            <div className="flex items-center gap-3 sm:gap-5">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-amber-600/30 ring-4 ring-amber-100 dark:ring-amber-900/30">
                                    <Save className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">
                                        Reporte de Turno
                                    </h2>
                                    <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest">Procedimiento Operativo</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-4 hover:bg-white dark:hover:bg-gray-800 rounded-2xl sm:rounded-3xl transition-colors text-gray-400 border border-gray-100 dark:border-gray-800">
                                <X className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="shift-report-form" onSubmit={handleCloseShift} className="p-6 sm:p-10 space-y-8 sm:space-y-10 pb-32">
                                {/* Paso 1: Turno */}
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4" /> 01. Identificación del Turno (Jornada)
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Manana', 'Tarde', 'Noche'].map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setShiftType(t as 'Manana' | 'Tarde' | 'Noche')}
                                                className={`p-6 rounded-[2rem] border-2 transition-all font-black text-sm uppercase tracking-widest flex flex-col items-center gap-3 ${shift_type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-indigo-200'}`}
                                            >
                                                <Zap className={`w-6 h-6 ${t === 'Tarde' ? 'rotate-45' : t === 'Noche' ? 'rotate-90' : ''}`} />
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Novedades Generales */}
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                        <FileText className="w-4 h-4" /> 02. Novedades Generales y Observaciones
                                    </h3>
                                    <textarea
                                        value={novedades}
                                        onChange={e => setNovedades(e.target.value)}
                                        className="w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[100px]"
                                        placeholder="Ingrese novedades generales del turno..."
                                    />
                                </section>

                                {/* Paso 3: Incidencias */}
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                        <ShieldAlert className="w-4 h-4" /> 03. Reporte de Incidencias
                                    </h3>
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-black text-gray-700 dark:text-gray-300">¿Existieron incidencias o emergencias?</label>
                                            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full w-fit border border-gray-200 dark:border-gray-600">
                                                <button type="button" onClick={() => setHasIncidents(true)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${has_incidents ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400'}`}>Sí</button>
                                                <button type="button" onClick={() => setHasIncidents(false)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${!has_incidents ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>No</button>
                                            </div>
                                        </div>
                                        {has_incidents && (
                                            <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                                                <textarea
                                                    value={incident_details}
                                                    onChange={e => setIncidentDetails(e.target.value)}
                                                    className="w-full rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-gray-900 p-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all min-h-[120px]"
                                                    placeholder="Detalle las incidencias ocurridas..."
                                                    required={has_incidents}
                                                />
                                                <AttachmentSection title="Evidencia de Incidencia" attachments={incident_attachments} setter={setIncidentAttachments} />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Paso 4: Instalaciones */}
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                        <Building2 className="w-4 h-4" /> 04. Estado de Instalaciones
                                    </h3>
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-black text-gray-700 dark:text-gray-300">¿Presentaron inconveniente?</label>
                                            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full w-fit border border-gray-200 dark:border-gray-600">
                                                <button type="button" onClick={() => setHasInfrastructureIssues(true)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${has_infrastructure_issues ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>Sí</button>
                                                <button type="button" onClick={() => setHasInfrastructureIssues(false)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${!has_infrastructure_issues ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>No</button>
                                            </div>
                                        </div>
                                        {has_infrastructure_issues && (
                                            <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {infrastructureOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => {
                                                                setInfraIssueTypes(prev =>
                                                                    prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                                                                );
                                                            }}
                                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${infraIssueTypes.includes(opt) ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-amber-200'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={infraDetails}
                                                    onChange={e => setInfraDetails(e.target.value)}
                                                    className="w-full rounded-3xl border border-amber-100 dark:border-amber-900/30 bg-white dark:bg-gray-900 p-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all min-h-[100px]"
                                                    placeholder="Detalle los reportado en instalaciones..."
                                                    required={has_infrastructure_issues}
                                                />
                                                <AttachmentSection title="Evidencia Instalaciones" attachments={infrastructure_attachments} setter={setInfrastructureAttachments} />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Paso 5: Equipamiento */}
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                        <Smartphone className="w-4 h-4" /> 05. Estado de Equipamiento
                                    </h3>
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-black text-gray-700 dark:text-gray-300">¿Algún inconveniente con el equipo?</label>
                                            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full w-fit border border-gray-200 dark:border-gray-600">
                                                <button type="button" onClick={() => setHasEquipmentIssues(true)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${has_equipment_issues ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>Sí</button>
                                                <button type="button" onClick={() => setHasEquipmentIssues(false)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all ${!has_equipment_issues ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>No</button>
                                            </div>
                                        </div>
                                        {has_equipment_issues && (
                                            <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {equipmentOptions.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => {
                                                                setEquipmentIssueTypes(prev =>
                                                                    prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                                                                );
                                                            }}
                                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all ${equipment_issue_types.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-amber-200'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={equipmentDetails}
                                                    onChange={e => setEquipmentDetails(e.target.value)}
                                                    className="w-full rounded-3xl border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-900 p-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[100px]"
                                                    placeholder="Detalle lo reportado en equipamiento..."
                                                    required={has_equipment_issues}
                                                />
                                                <AttachmentSection title="Evidencia Equipamiento" attachments={equipment_attachments} setter={setEquipmentAttachments} />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Checklist Obligatorio */}
                                {totalMandatory > 0 && (
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                            <CheckCircle2 className="w-4 h-4" /> 06. Verificación Cierre de Turno
                                        </h3>
                                        <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 space-y-6">
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirmo haber verificado presencialmente y/o mediante sistemas de control los siguientes ítems obligatorios:</p>

                                            {mandatoryInfra.length > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Instalaciones</p>
                                                    {mandatoryInfra.map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedMandatoryItems.includes(opt.id)}
                                                                onChange={e => {
                                                                    if (e.target.checked) setCheckedMandatoryItems([...checkedMandatoryItems, opt.id]);
                                                                    else setCheckedMandatoryItems(checkedMandatoryItems.filter(id => id !== opt.id));
                                                                }}
                                                                className="w-5 h-5 rounded-md text-rose-600 focus:ring-rose-500 bg-gray-50 dark:bg-gray-900 border-gray-200"
                                                            />
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {mandatoryEquip.length > 0 && (
                                                <div className="space-y-3 mt-4">
                                                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Equipamiento</p>
                                                    {mandatoryEquip.map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedMandatoryItems.includes(opt.id)}
                                                                onChange={e => {
                                                                    if (e.target.checked) setCheckedMandatoryItems([...checkedMandatoryItems, opt.id]);
                                                                    else setCheckedMandatoryItems(checkedMandatoryItems.filter(id => id !== opt.id));
                                                                }}
                                                                className="w-5 h-5 rounded-md text-rose-600 focus:ring-rose-500 bg-gray-50 dark:bg-gray-900 border-gray-200"
                                                            />
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                            </form>
                        </div>

                        <div className="p-6 sm:p-10 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full sm:flex-1 py-4 text-xs sm:text-sm font-black uppercase tracking-widest order-3 sm:order-1"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    className={`w-full sm:flex-1 py-4 text-xs sm:text-sm font-black uppercase tracking-widest border order-2 sm:order-2 transition-all duration-300 ${isSaving
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                        : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 dark:border-indigo-900/30'
                                        }`}
                                    onClick={handleSaveDraft}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Guardado
                                        </span>
                                    ) : (
                                        'Guardar'
                                    )}
                                </Button>
                                <Button
                                    type="submit"
                                    form="shift-report-form"
                                    className="w-full sm:flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 order-1 sm:order-3"
                                    disabled={isSaving}
                                >
                                    Finalizar Jornada
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
            {/* Modal de Reapertura (Admin) */}
            {isReopenModalOpen && reopeningReport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Reabrir Turno</h2>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{reopeningReport.folio} - {reopeningReport.concierge_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsReopenModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleReopen} className="p-8 space-y-6">
                            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                <p className="text-xs text-rose-700 dark:text-rose-400 font-bold leading-relaxed">
                                    <strong>ATENCIÓN:</strong> Está a punto de reabrir un reporte ya finalizado. Esto permitirá que el funcionario lo modifique y lo re-envíe. Se guardará un registro de esta acción.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Motivo de la Devolución</label>
                                <textarea
                                    value={reopenReason}
                                    onChange={e => setReopenReason(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all min-h-[120px]"
                                    placeholder="Explique por qué se está devolviendo el reporte para corrección..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" className="flex-1 py-4 text-xs font-black uppercase" onClick={() => setIsReopenModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase shadow-xl shadow-rose-600/20">Confirmar Apertura</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-md shadow-2xl border border-rose-200 dark:border-rose-900/30 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 mx-auto ring-8 ring-rose-50 dark:ring-rose-900/10">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Confirmar Eliminación</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold italic">
                                    ¿Está seguro de que desea eliminar el reporte <span className="text-rose-600 px-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg not-italic">{deleteConfirm.folio}</span>?
                                </p>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest leading-relaxed">
                                    Esta acción es irreversible y el registro se perderá permanentemente.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-600/20"
                                    onClick={() => handleDeleteReport(deleteConfirm.id)}
                                >
                                    Si, Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
