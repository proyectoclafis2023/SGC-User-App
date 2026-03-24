import React from 'react';
import { Edit2, Trash2, User as UserIcon, Calendar, ShieldCheck, Home, PhoneCall, AlertCircle, Banknote, Landmark, ShieldPlus, TrendingUp, Phone, Mail, Briefcase, FileText, Clock } from 'lucide-react';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import { useBanks } from '../context/BankContext';
import { useJornadaGroups } from '../context/JornadaGroupContext';

import type { Personnel } from '../types';

interface PersonnelListProps {
    personnel: Personnel[];
    onEdit: (person: Personnel) => void;
    onDelete: (id: string, name: string) => void;
    viewMode?: 'cards' | 'grid';
    canManage?: boolean;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ personnel, onEdit, onDelete, viewMode = 'cards', canManage = true }) => {
    const { providers } = useHealthProviders();
    const { funds } = usePensionFunds();
    const { banks } = useBanks();
    const { groups: jornadaGroups } = useJornadaGroups();


    if (personnel.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay registros de personal</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Registra al primer trabajador para comenzar.</p>
            </div>
        );
    }

    const getHealthProviderName = (id: string) => {
        const provider = providers.find(p => p.id === id);
        return provider ? `${provider.name} (${provider.type.toUpperCase()})` : 'No asignada';
    };

    const getPensionFundName = (id: string) => {
        const fund = funds.find(f => f.id === id);
        return fund ? fund.name : 'No asignada';
    };

    const getBankName = (id: string) => {
        const bank = banks.find(b => b.id === id);
        return bank ? bank.name : 'No registrado';
    };

    const getJornadaName = (id: string) => {
        const group = jornadaGroups.find(g => g.id === id);
        return group ? group.name : 'No asignada';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    if (viewMode === 'grid') {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Personal</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">DNI / RUT</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Cargo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Sueldo Base</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contrato</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {personnel.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                                {person.photo ? (
                                                    <img src={person.photo} alt={person.names} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs">{person.names.charAt(0)}{person.last_names.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{person.names}</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{person.last_names}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{person.dni}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{person.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {person.phone && (
                                                <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3" /> {person.phone}
                                                </p>
                                            )}
                                            {person.email && (
                                                <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3" /> {person.email}
                                                </p>
                                            )}
                                            {!person.phone && !person.email && <span className="text-gray-300 italic text-[11px]">No registrado</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(person.base_salary)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            person.is_honorary 
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        }`}>
                                            {person.is_honorary ? 'Honorarios' : person.contract_type || 'Indefinido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canManage && (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(person)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(person.id, `${person.names} ${person.last_names}`)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 pb-20">
            {personnel.map((person) => (
                <div key={person.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col hover:shadow-md transition-all group overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-6 flex-1">
                                <div className="h-20 w-20 md:h-28 md:w-28 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-[1.5rem] border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 font-bold overflow-hidden shadow-sm group-hover:border-indigo-500 transition-colors">
                                    {person.photo ? (
                                        <img src={person.photo} alt={person.names} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{person.names.charAt(0)}{person.last_names.charAt(0)}</span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 pt-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-tight">{person.names} <br /> {person.last_names}</h3>
                                        {person.is_honorary && (
                                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black rounded-lg uppercase tracking-widest">Honorarios</span>
                                        )}
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            DNI: {person.dni}
                                        </p>
                                        {person.phone && (
                                            <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 capitalize">
                                                <Phone className="w-3 h-3 text-indigo-500" /> {person.phone}
                                            </p>
                                        )}
                                    </div>

                                    {canManage && (
                                        <div className="flex mt-4 gap-2">
                                            <button
                                                onClick={() => onEdit(person)}
                                                className="p-1 px-3 text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all hover:bg-indigo-600 hover:text-white flex items-center gap-1.5"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Editar Ficha
                                            </button>
                                            <button
                                                onClick={() => onDelete(person.id, `${person.names} ${person.last_names}`)}
                                                className="p-1 px-3 text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all hover:bg-red-600 hover:text-white flex items-center gap-1.5"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Borrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="truncate">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Cargo / Función</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate text-xs" title={person.role}>{person.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Tipo de Contrato</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                                        {person.is_honorary ? 'Honorarios' : person.contract_type || 'Planta / Indefinido'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Jornada Asignada</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{getJornadaName(person.jornada_group_id || '')}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                    <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Teléfono</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{person.phone || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="truncate">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Correo Electrónico</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate text-xs" title={person.email}>{person.email || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Sueldo Base</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(person.base_salary)}</p>
                                </div>
                            </div>

                            {!person.is_honorary ? (
                                <>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Previsión / Seguro</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight text-xs">
                                                {getHealthProviderName(person.health_provider_id || '')}
                                                {person.has_complementary_insurance && (
                                                    <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-0.5">
                                                        <ShieldPlus className="w-3 h-3 mr-0.5" />
                                                        + Complementario ({person.complementary_insurance_type === 'percentage' ? `${person.complementary_insurance_value}%` : formatCurrency(person.complementary_insurance_value || 0)})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">AFP / APV</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight text-xs">
                                                {getPensionFundName(person.pension_fund_id || '')}
                                                {person.has_apv && (
                                                    <span className="ml-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center mt-0.5">
                                                        <TrendingUp className="w-3 h-3 mr-0.5" />
                                                        + APV ({person.apv_type === 'percentage' ? `${person.apv_value}%` : formatCurrency(person.apv_value || 0)})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-1 sm:col-span-2 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Contrato a honorarios: Exento de cotizaciones previsionales en planillas SGC.</p>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Datos Bancarios</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 uppercase text-[10px]">
                                        {person.bank_id ? `${getBankName(person.bank_id)} - ${person.account_number}` : 'No registrados'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Vacaciones</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{person.vacation_days} días disponibles</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Home className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="truncate">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Dirección</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs" title={person.address}>{person.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <PhoneCall className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Emergencia</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                        {person.has_emergency_contact && person.emergency_contact
                                            ? `${person.emergency_contact.names} (${person.emergency_contact.phone})`
                                            : 'No registra'}
                                    </p>
                                </div>
                            </div>
                        </div>



                        {person.medical_info && (
                            <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-red-500/70 dark:text-red-400/70">Información Médica</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{person.medical_info}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

