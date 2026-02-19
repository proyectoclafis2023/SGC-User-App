import { Edit2, Trash2, User as UserIcon, Calendar, ShieldCheck, Home, PhoneCall, AlertCircle, Banknote, Landmark, ShieldPlus, TrendingUp } from 'lucide-react';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import type { Personnel } from '../types';

interface PersonnelListProps {
    personnel: Personnel[];
    onEdit: (person: Personnel) => void;
    onDelete: (id: string, name: string) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ personnel, onEdit, onDelete }) => {
    const { providers } = useHealthProviders();
    const { funds } = usePensionFunds();

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 pb-20">
            {personnel.map((person) => (
                <div key={person.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col hover:shadow-md transition-all group overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 overflow-hidden">
                                    {person.photo ? (
                                        <img src={person.photo} alt={person.names} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{person.names.charAt(0)}{person.lastNames.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{person.names} {person.lastNames}</h3>
                                        {person.isHonorary && (
                                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] md:text-[10px] font-bold rounded-full uppercase tracking-wider">Honorarios</span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400">DNI: {person.dni}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(person)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                                    title="Editar ficha"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(person.id, `${person.names} ${person.lastNames}`)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                                    title="Eliminar registro"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Sueldo Base</p>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(person.baseSalary)}</p>
                                </div>
                            </div>

                            {!person.isHonorary ? (
                                <>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Previsión / Seguro</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
                                                {getHealthProviderName(person.healthInsuranceId || '')}
                                                {person.hasComplementaryInsurance && (
                                                    <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-0.5">
                                                        <ShieldPlus className="w-3 h-3 mr-0.5" />
                                                        + Complementario ({person.complementaryInsuranceType === 'percentage' ? `${person.complementaryInsuranceValue}%` : formatCurrency(person.complementaryInsuranceValue || 0)})
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
                                            <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
                                                {getPensionFundName(person.pensionFundId || '')}
                                                {person.hasAPV && (
                                                    <span className="ml-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center mt-0.5">
                                                        <TrendingUp className="w-3 h-3 mr-0.5" />
                                                        + APV ({person.apvType === 'percentage' ? `${person.apvValue}%` : formatCurrency(person.apvValue || 0)})
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
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {person.bankName ? `${person.bankName} - ${person.accountNumber}` : 'No registrados'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Vacaciones</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{person.vacationDays} días disponibles</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Home className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="truncate">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Dirección</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate" title={person.address}>{person.address}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <PhoneCall className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Emergencia</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {person.hasEmergencyContact && person.emergencyContact
                                            ? `${person.emergencyContact.names} (${person.emergencyContact.phone})`
                                            : 'No registra'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {person.medicalInfo && (
                            <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-red-500/70 dark:text-red-400/70">Información Médica</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{person.medicalInfo}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
