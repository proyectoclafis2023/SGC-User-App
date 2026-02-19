import React, { useState, useEffect } from 'react';
import type { Personnel } from '../types';
import { Input } from './Input';
import { Button } from './Button';
import { X } from 'lucide-react';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import { formatRUT } from '../utils/formatters';

interface PersonnelFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (person: Omit<Personnel, 'id' | 'createdAt'>, id?: string) => void;
    initialData?: Personnel | null;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const { providers } = useHealthProviders();
    const { funds } = usePensionFunds();
    const [names, setNames] = useState('');
    const [lastNames, setLastNames] = useState('');
    const [dni, setDni] = useState('');
    const [baseSalary, setBaseSalary] = useState(0);
    const [vacationDays, setVacationDays] = useState(0);
    const [healthInsuranceId, setHealthInsuranceId] = useState('');
    const [hasComplementaryInsurance, setHasComplementaryInsurance] = useState(false);
    const [pensionFundId, setPensionFundId] = useState('');
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
    const [isHonorary, setIsHonorary] = useState(false);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        if (initialData) {
            setNames(initialData.names);
            setLastNames(initialData.lastNames);
            setDni(initialData.dni);
            setBaseSalary(initialData.baseSalary || 0);
            setVacationDays(initialData.vacationDays);
            setHealthInsuranceId(initialData.healthInsuranceId || '');
            setHasComplementaryInsurance(!!initialData.hasComplementaryInsurance);
            setPensionFundId(initialData.pensionFundId || '');
            setHasAPV(!!initialData.hasAPV);
            setAddress(initialData.address);
            setHasEmergencyContact(!!initialData.hasEmergencyContact);
            if (initialData.emergencyContact) {
                setEmergencyNames(initialData.emergencyContact.names);
                setEmergencyLastNames(initialData.emergencyContact.lastNames);
                setEmergencyPhone(initialData.emergencyContact.phone);
            } else {
                setEmergencyNames('');
                setEmergencyLastNames('');
                setEmergencyPhone('');
            }
            setMedicalInfo(initialData.medicalInfo || '');
            setComplementaryInsuranceType(initialData.complementaryInsuranceType || 'percentage');
            setComplementaryInsuranceValue(initialData.complementaryInsuranceValue || 0);
            setApvType(initialData.apvType || 'percentage');
            setApvValue(initialData.apvValue || 0);
            setPhoto(initialData.photo || '');
            setIsHonorary(!!initialData.isHonorary);
            setBankName(initialData.bankName || '');
            setAccountNumber(initialData.accountNumber || '');
        } else {
            setNames('');
            setLastNames('');
            setDni('');
            setBaseSalary(0);
            setVacationDays(0);
            setHealthInsuranceId('');
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
            setIsHonorary(false);
            setBankName('');
            setAccountNumber('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            names,
            lastNames,
            dni,
            baseSalary: Number(baseSalary),
            vacationDays: Number(vacationDays),
            address,
            hasEmergencyContact,
            emergencyContact: hasEmergencyContact ? {
                names: emergencyNames,
                lastNames: emergencyLastNames,
                phone: emergencyPhone
            } : undefined,
            medicalInfo,
            complementaryInsuranceType,
            complementaryInsuranceValue,
            apvType,
            apvValue,
            photo,
            isHonorary,
            bankName,
            accountNumber,
            // Si es honorarios, no enviamos salud ni afp
            healthInsuranceId: isHonorary ? undefined : healthInsuranceId,
            pensionFundId: isHonorary ? undefined : pensionFundId,
            hasComplementaryInsurance: isHonorary ? false : hasComplementaryInsurance,
            hasAPV: isHonorary ? false : hasAPV,
        }, initialData?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-gray-800 transition-colors my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500">
                                {photo ? (
                                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">Subir Foto</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPhoto(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {photo && (
                                <button
                                    type="button"
                                    onClick={() => setPhoto('')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Tipo de Contratación</p>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Marque si el personal trabaja a honorarios.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isHonorary}
                                onChange={(e) => setIsHonorary(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nombres"
                            value={names}
                            onChange={(e) => setNames(e.target.value)}
                            required
                            placeholder="ej. Juan Antonio"
                        />
                        <Input
                            label="Apellidos"
                            value={lastNames}
                            onChange={(e) => setLastNames(e.target.value)}
                            required
                            placeholder="ej. Pérez García"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="DNI / RUT"
                            value={dni}
                            onChange={(e) => setDni(formatRUT(e.target.value))}
                            required
                            placeholder="ej. 12.345.678-9"
                        />
                        <Input
                            label="Sueldo Base ($)"
                            type="number"
                            value={baseSalary}
                            onChange={(e) => setBaseSalary(Number(e.target.value))}
                            required
                            min="0"
                        />
                        <Input
                            label="Días Vacaciones"
                            type="number"
                            value={vacationDays}
                            onChange={(e) => setVacationDays(Number(e.target.value))}
                            required
                            min="0"
                        />
                    </div>

                    <div className="space-y-4">

                        {!isHonorary && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Previsión (Salud)</label>
                                        <select
                                            value={healthInsuranceId}
                                            onChange={(e) => setHealthInsuranceId(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                            required={!isHonorary}
                                        >
                                            <option value="">Seleccione previsión...</option>
                                            {providers.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.type.toUpperCase()} - {p.discountRate}%)</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center space-x-2 cursor-pointer mt-2 ml-1">
                                            <input
                                                type="checkbox"
                                                checked={hasComplementaryInsurance}
                                                onChange={(e) => setHasComplementaryInsurance(e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Seguro Complementario</span>
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
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">AFP</label>
                                        <select
                                            value={pensionFundId}
                                            onChange={(e) => setPensionFundId(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                            required={!isHonorary}
                                        >
                                            <option value="">Seleccione AFP...</option>
                                            {funds.map(f => (
                                                <option key={f.id} value={f.id}>{f.name} ({f.discountRate}%)</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center space-x-2 cursor-pointer mt-2 ml-1">
                                            <input
                                                type="checkbox"
                                                checked={hasAPV}
                                                onChange={(e) => setHasAPV(e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Tiene APV</span>
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

                        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-bold text-gray-900 dark:text-white ml-1">Información Bancaria</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Banco"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="ej. Banco Estado"
                                />
                                <Input
                                    label="Número de Cuenta"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="ej. 123456789"
                                />
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Dirección Particular"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="ej. Av. Siempre Viva 123"
                    />

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

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="ghost" onClick={onClose} className="dark:text-gray-300">
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {initialData ? 'Guardar Cambios' : 'Registrar Personal'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
