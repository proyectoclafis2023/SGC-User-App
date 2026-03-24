import React, { useState, useEffect } from 'react';
import type { Personnel, AssignedArticle } from '../types';
import { Input } from './Input';
import { Button } from './Button';
import { X, Landmark, ShieldCheck, Users as UsersIcon, HeartPulse, AlertCircle, Eye, Banknote, FileText, Printer, Upload, CheckCircle2, Calendar, Clock, History as HistoryIcon, Trash2 } from 'lucide-react';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import { useBanks } from '../context/BankContext';
import { useArticleDeliveries } from '../context/ArticleDeliveryContext';
import { useJornadaGroups } from '../context/JornadaGroupContext';
import { useArticles } from '../context/ArticleContext';
import { formatRUT } from '../utils/formatters';
import { usePayslips } from '../context/PayslipContext';
import { useSettings } from '../context/SettingsContext';
import { useHistoryLogs } from '../context/HistoryLogContext';
import { compressImage } from '../utils/imageCompression';
import { PayslipDocument } from './PayslipDocument';
import { AdvanceReceipt } from './AdvanceReceipt';
import type { Payslip, Advance } from '../types';

interface PersonnelFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (person: Omit<Personnel, 'id' | 'created_at' | 'status'>, id?: string) => void;
    initialData?: Personnel | null;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { providers } = useHealthProviders();
    const { funds } = usePensionFunds();
    const { banks, addBank } = useBanks();
    const { articles } = useArticles();
    const { deliveries, updateDelivery } = useArticleDeliveries();
    const { payslips, advances } = usePayslips();
    const { settings } = useSettings();
    const { getLogsByEntity } = useHistoryLogs();
    const { groups: jornadaGroups } = useJornadaGroups();

    const [names, setNames] = useState('');
    const [lastNames, setLastNames] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [base_salary, setBaseSalary] = useState(0);
    const [vacation_days, setVacationDays] = useState(0);
    // const [assignedShift, setAssignedShift] = useState<'Mañana' | 'Tarde' | 'Noche' | ''>(''); // Removed Redundant field
    const [health_provider_id, setHealthProviderId] = useState('');
    const [hasComplementaryInsurance, setHasComplementaryInsurance] = useState(false);
    const [pension_fund_id, setPensionFundId] = useState('');
    const [hasAPV, setHasAPV] = useState(false);
    const [address, setAddress] = useState('');
    const [hasEmergencyContact, setHasEmergencyContact] = useState(false);
    const [emergencyNames, setEmergencyNames] = useState('');
    const [emergencyLastNames, setEmergencyLastNames] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [complementaryInsuranceType, setComplementaryInsuranceType] = useState<'percentage' | 'amount'>('percentage');
    const [complementaryInsuranceValue, setComplementaryInsuranceValue] = useState(0);
    const [apvType, setApvType] = useState<'percentage' | 'amount'>('percentage');
    const [apvValue, setApvValue] = useState(0);
    const [medicalInfo, setMedicalInfo] = useState('');
    const [photo, setPhoto] = useState<string>('');
    const [position, setPosition] = useState('');
    const [contractType, setContractType] = useState<'honorarios' | 'plazo' | 'indefinido'>('indefinido');
    const [bank_id, setBankId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [jornada_group_id, setJornadaGroupId] = useState('');
    const [assignedArticles, setAssignedArticles] = useState<AssignedArticle[]>([]);

    // Quick add bank states
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [newBankName, setNewBankName] = useState('');

    // Preview states for history
    const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
    const [viewingAdvance, setViewingAdvance] = useState<Advance | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setNames(initialData.names || '');
            setLastNames(initialData.last_names || '');
            setDni(initialData.dni || '');
            setBaseSalary(initialData.base_salary || 0);
            setVacationDays(initialData.vacation_days || 0);
            setHealthProviderId(initialData.health_provider_id || '');
            setHasComplementaryInsurance(!!initialData.has_complementary_insurance);
            setPensionFundId(initialData.pension_fund_id || '');
            setHasAPV(!!initialData.has_apv);
            setAddress(initialData.address || '');
            setHasEmergencyContact(!!initialData.has_emergency_contact);
            if (initialData.emergency_contact) {
                setEmergencyNames(initialData.emergency_contact.names || '');
                setEmergencyLastNames(initialData.emergency_contact.last_names || '');
                setEmergencyPhone(initialData.emergency_contact.phone || '');
            } else {
                setEmergencyNames('');
                setEmergencyLastNames('');
                setEmergencyPhone('');
            }
            setMedicalInfo(initialData.medical_info || '');
            setComplementaryInsuranceType(initialData.complementary_insurance_type || 'percentage');
            setComplementaryInsuranceValue(initialData.complementary_insurance_value || 0);
            setApvType(initialData.apv_type || 'percentage');
            setApvValue(initialData.apv_value || 0);
            setPhoto(initialData.photo || '');
            setPosition(initialData.role || '');
            const initialContractType = initialData.contract_type || (initialData.is_honorary ? 'honorarios' : 'indefinido');
            setContractType(initialContractType as any);
            setBankId(initialData.bank_id || '');
            setAccountNumber(initialData.account_number || '');
            setJornadaGroupId(initialData.jornada_group_id || '');
            setEmail(initialData.email || '');
            setPhone(initialData.phone || '');
            setAssignedArticles(initialData.assigned_articles || []);
        } else {
            setNames('');
            setLastNames('');
            setDni('');
            setEmail('');
            setPhone('');
            setBaseSalary(0);
            setVacationDays(0);
            setHealthProviderId('');
            setHasComplementaryInsurance(false);
            setPensionFundId('');
            setHasAPV(false);
            setAddress('');
            setHasEmergencyContact(false);
            setEmergencyNames('');
            setEmergencyLastNames('');
            setEmergencyPhone('');
            setMedicalInfo('');
            setComplementaryInsuranceType('percentage');
            setComplementaryInsuranceValue(0);
            setApvType('percentage');
            setApvValue(0);
            setPhoto('');
            setPosition('');
            setContractType('indefinido');
            setBankId('');
            setAccountNumber('');
            setJornadaGroupId('');
            setAssignedArticles([]);
        }
    }, [initialData, isOpen]);

    const handleQuickAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBankName.trim()) {
            const id = await addBank({ name: newBankName.trim() });
            setBankId(id);
            setNewBankName('');
            setIsAddingBank(false);
        }
    };

    const handleViewDocument = (document: string) => {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`<iframe src="${document}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            names,
            last_names: lastNames,
            dni,
            email,
            phone,
            base_salary: Number(base_salary),
            vacation_days: Number(vacation_days),
            address,
            has_emergency_contact: hasEmergencyContact,
            emergency_contact: hasEmergencyContact ? {
                names: emergencyNames,
                last_names: emergencyLastNames,
                phone: emergencyPhone
            } : undefined,
            medical_info: medicalInfo,
            complementary_insurance_type: complementaryInsuranceType,
            complementary_insurance_value: Number(complementaryInsuranceValue),
            apv_type: apvType,
            apv_value: Number(apvValue),
            photo,
            role: position,
            is_honorary: contractType === 'honorarios',
            contract_type: contractType,
            bank_id: bank_id,
            account_number: accountNumber,
            assigned_articles: assignedArticles, 
            health_provider_id: contractType === 'honorarios' ? undefined : health_provider_id,
            pension_fund_id: contractType === 'honorarios' ? undefined : pension_fund_id,
            has_complementary_insurance: contractType === 'honorarios' ? false : hasComplementaryInsurance,
            has_apv: contractType === 'honorarios' ? false : hasAPV,
            jornada_group_id: jornada_group_id || undefined,
        }, initialData?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-gray-800 transition-colors my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-indigo-600" />
                        {initialData ? 'Editar Ficha de Personal' : 'Registrar Nuevo Personal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] md:max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                        <div className="md:col-span-3 space-y-6">
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3 ml-1">Tipo de Contratación</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['honorarios', 'plazo', 'indefinido'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                setContractType(type);
                                                if (type === 'honorarios') {
                                                    setHealthProviderId('');
                                                    setPensionFundId('');
                                                    setHasComplementaryInsurance(false);
                                                    setHasAPV(false);
                                                }
                                            }}
                                            className={`py-2.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                contractType === type 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-900' 
                                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                        >
                                            {type === 'honorarios' ? 'Honorarios' : type === 'plazo' ? 'Plazo' : 'Indefinido'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Nombres" value={names} onChange={(e) => setNames(e.target.value)} required placeholder="ej. Juan Pablo" />
                                <Input label="Apellidos" value={lastNames} onChange={(e) => setLastNames(e.target.value)} required placeholder="ej. Pérez Soto" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Cargo / Función"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    required
                                    placeholder="ej. Conserje"
                                />
                                <Input
                                    label="DNI / RUT"
                                    value={dni}
                                    onChange={(e) => setDni(formatRUT(e.target.value))}
                                    required
                                    placeholder="ej. 12.345.678-9"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Días de Vacaciones"
                                    type="number"
                                    step="0.01"
                                    value={vacation_days}
                                    onChange={(e) => setVacationDays(Number(e.target.value))}
                                    min="0"
                                />
                                <Input
                                    label="Sueldo Total Haberes ($)"
                                    type="number"
                                    value={base_salary}
                                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Email (Opcional)"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ej. juan@gmail.com"
                                />
                                <Input
                                    label="Teléfono (Opcional)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="ej. +569 1234 5678"
                                />
                            </div>

                            <Input
                                label="Dirección de Domicilio"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="ej. Pasaje Las Rosas 456, Santiago"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-6 shadow-inner">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-900 dark:text-white ml-2 flex items-center gap-2">
                                        <UsersIcon className="w-4 h-4 text-indigo-500" />
                                        Foto de Perfil
                                    </label>
                                    <div className="relative group mx-auto w-40 h-40">
                                        <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] rotate-6 opacity-10 group-hover:rotate-12 transition-transform"></div>
                                        <label className="relative flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[3rem] cursor-pointer bg-white dark:bg-gray-900 hover:border-indigo-500 hover:bg-indigo-50/50 shadow-sm transition-all overflow-hidden group/upload">
                                            {photo ? (
                                                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Upload className="w-6 h-6 text-gray-300 mb-2 group-hover/upload:text-indigo-600" />
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subir Foto</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const compressed = await compressImage(file);
                                                        setPhoto(compressed);
                                                    } catch (err) {
                                                        console.error('Error compressing image:', err);
                                                    }
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Asignar Jornada</label>
                                                {jornada_group_id && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setJornadaGroupId('')}
                                                        className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Quitar
                                                    </button>
                                                )}
                                            </div>
                                            <select
                                                value={jornada_group_id}
                                                onChange={(e) => setJornadaGroupId(e.target.value)}
                                                className="w-full h-12 px-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 text-sm font-bold shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                            >
                                                <option value="">Seleccione jornada...</option>
                                                {jornadaGroups.filter(g => !g.is_archived).map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {jornada_group_id && (
                                            <div className="animate-in zoom-in-95 duration-300">
                                                {(() => {
                                                    const selectedJornada = jornadaGroups.find(g => g.id === jornada_group_id);
                                                    if (!selectedJornada) return null;

                                                    const calculateWeeklyHours = (item: any) => {
                                                        let totalMinutes = 0;
                                                        const schedules = item.schedules && item.schedules.length > 0 
                                                            ? item.schedules 
                                                            : [{ days: item.workDays || [], start_time: item.start_time, end_time: item.end_time }];

                                                        schedules.forEach((s: any) => {
                                                            if (!s.start_time || !s.end_time || !s.days || !s.start_time.includes(':') || !s.end_time.includes(':')) return;
                                                            const [startH, startM] = s.start_time.split(':').map(Number);
                                                            const [endH, endM] = s.end_time.split(':').map(Number);
                                                            if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return;
                                                            let diff = (endH * 60 + endM) - (startH * 60 + startM);
                                                            if (diff < 0) diff += 24 * 60;
                                                            totalMinutes += (diff - (item.breakMinutes || 0)) * s.days.length;
                                                        });
                                                        return (totalMinutes / 60).toFixed(1);
                                                    };

                                                    return (
                                                        <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                                                            <div className="flex flex-col items-center justify-center py-3 border-b border-gray-50 dark:border-gray-800 space-y-4">
                                                                <div className="flex items-center gap-2 text-gray-400">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Horarios y Jornadas</p>
                                                                </div>
                                                                
                                                                <div className="flex flex-col gap-4 w-full px-2">
                                                                    {(!selectedJornada.schedules || selectedJornada.schedules.length === 0) ? (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                                                                {selectedJornada.start_time} - {selectedJornada.end_time}
                                                                            </p>
                                                                            <div className="grid grid-cols-7 gap-1 w-full justify-center">
                                                                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, dIdx) => {
                                                                                    const isActive = (selectedJornada.workDays || []).includes(dIdx);
                                                                                    return (isActive && 
                                                                                        <div key={dIdx} className="w-6 h-6 flex items-center justify-center rounded-lg text-[9px] font-black bg-indigo-600 text-white shadow-sm">
                                                                                            {day}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-4">
                                                                            {selectedJornada.schedules.map((s: any, idx: number) => (
                                                                                <div key={idx} className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                                                                                        <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                                                                                            Tanda {idx + 1}: {s.start_time} - {s.end_time}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, dIdx) => {
                                                                                            const isActive = (s.days || []).includes(dIdx);
                                                                                            return isActive && (
                                                                                                <div key={dIdx} className="w-6 h-6 flex items-center justify-center rounded-lg text-[9px] font-black bg-indigo-600 text-white shadow-sm">
                                                                                                    {day}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Semanal:</p>
                                                                    <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">{calculateWeeklyHours(selectedJornada)}h</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {contractType !== 'honorarios' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                                            <HeartPulse className="w-4 h-4 text-emerald-500" />
                                            Previsión (Salud)
                                        </label>
                                        <select
                                            value={health_provider_id}
                                            onChange={(e) => setHealthProviderId(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                            required={contractType !== 'honorarios'}
                                        >
                                            <option value="">Seleccione previsión...</option>
                                            {providers.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.type.toUpperCase()} - {p.discount_rate}%)</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center space-x-2 cursor-pointer mt-2 ml-1">
                                            <input
                                                type="checkbox"
                                                checked={hasComplementaryInsurance}
                                                onChange={(e) => setHasComplementaryInsurance(e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Seguro Complementario</span>
                                        </label>
                                        {hasComplementaryInsurance && (
                                            <div className="flex gap-2 mt-2 ml-1 animate-in slide-in-from-left-2">
                                                <select
                                                    value={complementaryInsuranceType}
                                                    onChange={(e) => setComplementaryInsuranceType(e.target.value as 'percentage' | 'amount')}
                                                    className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                                                >
                                                    <option value="percentage">%</option>
                                                    <option value="amount">$</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={complementaryInsuranceValue}
                                                    onChange={(e) => setComplementaryInsuranceValue(Number(e.target.value))}
                                                    placeholder={complementaryInsuranceType === 'percentage' ? 'ej. 2' : 'ej. 15000'}
                                                    className="text-xs w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                            AFP
                                        </label>
                                        <select
                                            value={pension_fund_id}
                                            onChange={(e) => setPensionFundId(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                            required={contractType !== 'honorarios'}
                                        >
                                            <option value="">Seleccione AFP...</option>
                                            {funds.map(f => (
                                                <option key={f.id} value={f.id}>{f.name} ({f.discount_rate}%)</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center space-x-2 cursor-pointer mt-2 ml-1">
                                            <input
                                                type="checkbox"
                                                checked={hasAPV}
                                                onChange={(e) => setHasAPV(e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Tiene APV</span>
                                        </label>
                                        {hasAPV && (
                                            <div className="flex gap-2 mt-2 ml-1 animate-in slide-in-from-left-2">
                                                <select
                                                    value={apvType}
                                                    onChange={(e) => setApvType(e.target.value as 'percentage' | 'amount')}
                                                    className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                                                >
                                                    <option value="percentage">%</option>
                                                    <option value="amount">$</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={apvValue}
                                                    onChange={(e) => setApvValue(Number(e.target.value))}
                                                    placeholder={apvType === 'percentage' ? 'ej. 5' : 'ej. 50000'}
                                                    className="text-xs w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between ml-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-amber-500" />
                                    Información Bancaria
                                </p>
                                {!isAddingBank ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingBank(true)}
                                        className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                                    >
                                        + Agregar Nuevo Banco
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingBank(false)}
                                        className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>

                            {isAddingBank && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 flex gap-2 animate-in slide-in-from-top-2">
                                    <Input
                                        label="Nombre del Nuevo Banco"
                                        value={newBankName}
                                        onChange={(e) => setNewBankName(e.target.value)}
                                        placeholder="Ej: Banco Falabella"
                                        className="flex-1"
                                    />
                                    <div className="flex items-end pb-0.5">
                                        <Button type="button" onClick={handleQuickAddBank}>Crear</Button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Banco</label>
                                    <select
                                        value={bank_id}
                                        onChange={(e) => setBankId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                    >
                                        <option value="">Seleccione banco...</option>
                                        {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <Input
                                    label="Número de Cuenta"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="ej. 123456789"
                                />
                            </div>
                        </div>


                    {/* Información Médica */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Información Médica Importante</label>
                        <textarea
                            value={medicalInfo}
                            onChange={(e) => setMedicalInfo(e.target.value)}
                            placeholder="Antecedentes, medicamentos, condiciones médicas o alergias..."
                            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm"
                        />
                    </div>

                    {/* Contacto de Emergencia */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setHasEmergencyContact(!hasEmergencyContact)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasEmergencyContact ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasEmergencyContact ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiene contacto de emergencia</span>
                        </div>

                        {hasEmergencyContact && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Nombres (Contacto)"
                                    value={emergencyNames}
                                    onChange={(e) => setEmergencyNames(e.target.value)}
                                    required={hasEmergencyContact}
                                    placeholder="ej. María"
                                />
                                <Input
                                    label="Apellidos (Contacto)"
                                    value={emergencyLastNames}
                                    onChange={(e) => setEmergencyLastNames(e.target.value)}
                                    required={hasEmergencyContact}
                                    placeholder="ej. Pérez"
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Teléfono de Emergencia"
                                        value={emergencyPhone}
                                        onChange={(e) => setEmergencyPhone(e.target.value)}
                                        required={hasEmergencyContact}
                                        placeholder="ej. +56 9 1234 5678"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historial de Entregas (EPP) */}
                    {initialData && (
                        <div className="space-y-4 pt-6 mt-6 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                Artículos de Protección Personal (EPP)
                            </h3>
                            <div className="space-y-2">
                                {(() => {
                                    const personalDeliveries = deliveries.filter(d => d.personnel_id === initialData.id);
                                    if (personalDeliveries.length === 0) {
                                        return (
                                            <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-bold text-gray-400">No hay registros de entrega para este funcionario.</p>
                                            </div>
                                        );
                                    }
                                    return personalDeliveries.map(delivery => (
                                        <div key={delivery.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${delivery.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                                                    {delivery.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5 text-red-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                        {new Date(delivery.delivery_date).toLocaleDateString()}
                                                        {delivery.status === 'voided' && <span className="ml-2 text-red-500 font-black">— ANULADA</span>}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {delivery.articles.map((a, i) => {
                                                            const art = articles.find(ar => ar.id === a.article_id);
                                                            return (
                                                                <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-bold">
                                                                    {art?.name || 'Art.'} x{a.quantity}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    REF: #{delivery.id.toUpperCase()}
                                                </div>
                                                <label className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer transition-all border border-transparent hover:border-indigo-200" title="Subir cargo firmado">
                                                    <Upload className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    updateDelivery({ ...delivery, signed_document: reader.result as string });
                                                                    alert('Documento de respaldo subido con éxito.');
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                {delivery.signed_document && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDocument(delivery.signed_document!)}
                                                        className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                                                        title="Ver documento cargado"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Historial de Liquidaciones y Adelantos */}
                    {initialData && (
                        <div className="space-y-4 pt-6 mt-6 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                <HistoryIcon className="w-5 h-5 text-indigo-500" />
                                Historial de Vacaciones
                            </h3>
                            <div className="space-y-3">
                                {(() => {
                                    const vacationLogs = getLogsByEntity('personnel', initialData.id)
                                        .filter(l => l.details.toLowerCase().includes('vacaciones'));

                                    if (vacationLogs.length === 0) {
                                        return (
                                            <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-bold text-gray-400">No hay historial de movimientos de vacaciones.</p>
                                            </div>
                                        );
                                    }

                                    return vacationLogs.map(log => (
                                        <div key={log.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{log.details}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Historial de Liquidaciones y Adelantos */}
                    {initialData && (
                        <div className="space-y-4 pt-6 mt-6 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                <Banknote className="w-5 h-5 text-indigo-500" />
                                Historial de Remuneraciones y Adelantos
                            </h3>
                            <div className="space-y-3">
                                {(() => {
                                    const personalPayslips = payslips.filter(p => p.personnelId === initialData.id);
                                    const personalAdvances = advances.filter(a => a.personnelId === initialData.id);

                                    if (personalPayslips.length === 0 && personalAdvances.length === 0) {
                                        return (
                                            <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-bold text-gray-400">No hay registros de pagos para este funcionario.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Payslips Column */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Liquidaciones Generadas</p>
                                                {personalPayslips.map(payslip => (
                                                    <div key={payslip.id} className="p-3 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40 rounded-xl shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all cursor-pointer group"
                                                        onClick={() => {
                                                            setViewingPayslip(payslip);
                                                            setViewingAdvance(null);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-black text-indigo-900 dark:text-white">FOLIO #{payslip.folio}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(payslip.generatedAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <Eye className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Advances Column */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Comprobantes de Adelanto</p>
                                                {personalAdvances.map(adv => (
                                                    <div key={adv.id} className="p-3 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 rounded-xl shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all cursor-pointer group"
                                                        onClick={() => {
                                                            setViewingAdvance(adv);
                                                            setViewingPayslip(null);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-black text-emerald-900 dark:text-white">${adv.amount.toLocaleString()}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(adv.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${adv.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                {adv.status === 'pending' ? 'PENDIENTE' : 'DESCONTADO'}
                                                            </span>
                                                            <Eye className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 z-10 py-4">
                        {/* Aviso de Compromiso de Entrega */}
                        {(assignedArticles.length > 0) && (
                            <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-1">COMPROMISO DE ENTREGA FÍSICA</p>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                        Al guardar, la dotación seleccionada será considerada como <span className="underline">entregada físicamente</span> al funcionario.
                                        Asegúrese de contar con el respaldo firmado antes de confirmar.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={onClose} className="dark:text-gray-300">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                {initialData ? 'Guardar Cambios' : 'Registrar Personal'}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Modal for viewing documents */}
                {
                    isPreviewOpen && (
                        <div className="fixed inset-0 z-[60] flex flex-col bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="flex items-center justify-between p-6 md:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-xl font-black uppercase tracking-tight">Vista Previa de Documento</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewingPayslip ? 'Liquidación de Sueldo' : 'Comprobante de Adelanto'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => window.print()}
                                        className="px-6 py-3 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Imprimir
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            setViewingPayslip(null);
                                            setViewingAdvance(null);
                                        }}
                                        className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto w-full pb-20 print:p-0 print:m-0 print:overflow-visible custom-scrollbar-white">
                                {viewingPayslip && (
                                    <PayslipDocument
                                        payslip={viewingPayslip}
                                        person={initialData || undefined}
                                        health={providers.find(p => p.id === (initialData?.health_provider_id))}
                                        fund={funds.find(f => f.id === (initialData?.pension_fund_id))}
                                        settings={settings}
                                    />
                                )}
                                {viewingAdvance && (
                                    <AdvanceReceipt
                                        advance={viewingAdvance}
                                        person={initialData || undefined}
                                        settings={settings}
                                    />
                                )}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};
