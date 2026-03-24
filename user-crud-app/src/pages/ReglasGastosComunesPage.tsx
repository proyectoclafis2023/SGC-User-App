import React, { useState } from 'react';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useCommonExpenses } from '../context/CommonExpenseContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, Gavel, Calendar, Home, X, CheckCircle2, Percent, Calculator, Trash2 } from 'lucide-react';
import type { UnitType, ChargeRule } from '../types';
import { useInfrastructure } from '../context/InfrastructureContext';

export const ReglasGastosComunesPage: React.FC = () => {
    const { unit_types } = useUnitTypes();
    const { departments } = useInfrastructure();
    const { rules, chargeRules, addRule, addChargeRule, deleteChargeRule } = useCommonExpenses();
    const [activeTab, setActiveTab] = useState<'base' | 'charges'>('base');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

    // Common Rule Form
    const [unit_type_id, setUnitTypeId] = useState('');
    const [amount, setAmount] = useState(0);
    const [effective_from, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    // Charge Rule Form
    const [chargeName, setChargeName] = useState('');
    const [chargeType, setChargeType] = useState<ChargeRule['rule_type']>('fixed');
    const [chargeValue, setChargeValue] = useState(0);
    const [chargeAppliesTo, setChargeAppliesTo] = useState<ChargeRule['applies_to']>('global');
    const [chargeTargetId, setChargeTargetId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addRule({
            unit_type_id: unit_type_id || undefined,
            amount,
            effective_from,
            description
        });
        setIsModalOpen(false);
    };

    const handleChargeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addChargeRule({
            name: chargeName,
            rule_type: chargeType,
            value: chargeValue,
            applies_to: chargeAppliesTo,
            target_id: chargeTargetId || undefined,
            is_active: true,
            is_archived: false
        });
        setIsChargeModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2 text-gray-900 dark:text-white">
                        <Gavel className="text-indigo-600 w-8 h-8" /> Configuración de Cobros
                    </h1>
                    <p className="text-gray-500 font-bold">Administre montos base, recargos, multas e intereses del sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('base')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'base' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Montos Base
                        </button>
                        <button
                            onClick={() => setActiveTab('charges')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'charges' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Recargos y Multas
                        </button>
                    </div>
                    <Button onClick={() => activeTab === 'base' ? setIsModalOpen(true) : setIsChargeModalOpen(true)} className="shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        {activeTab === 'base' ? 'Nueva Regla Base' : 'Nuevo Recargo'}
                    </Button>
                </div>
            </div>

            {activeTab === 'base' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-[3.5rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-black italic text-lg">No hay reglas de cobro definidas.</p>
                        </div>
                    ) : (
                        rules.map(rule => (
                            <div key={rule.id} className="bg-white dark:bg-gray-900 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center">
                                        <Home className="text-indigo-600 w-8 h-8" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-indigo-600">${rule.amount.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Monto Base Mensual</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Aplica para</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">
                                            {rule.unit_type_id ? unit_types.find(ut => ut.id === rule.unit_type_id)?.nombre : 'Todas las Unidades (Global)'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-800/30">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Vigente desde</p>
                                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">
                                                {new Date(rule.effective_from).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {rule.description && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                                            <p className="text-xs text-gray-500 font-bold italic leading-relaxed">"{rule.description}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chargeRules.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-[3.5rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
                            <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-black italic text-lg">No hay recargos o multas definidas.</p>
                        </div>
                    ) : (
                        chargeRules.map(rule => (
                            <div key={rule.id} className="bg-white dark:bg-gray-900 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-4 ${rule.rule_type === 'percentage' ? 'bg-amber-500' : rule.rule_type === 'penalty' ? 'bg-rose-500' : 'bg-indigo-500'} text-white rounded-bl-[2rem] shadow-lg`}>
                                    {rule.rule_type === 'percentage' ? <Percent className="w-5 h-5 font-black" /> : <Calculator className="w-5 h-5 font-black" />}
                                </div>
                                
                                <div className="mb-6 pr-10">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 leading-tight">{rule.name}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${rule.rule_type === 'percentage' ? 'text-amber-600' : rule.rule_type === 'penalty' ? 'text-rose-600' : 'text-indigo-600'}`}>
                                        {rule.rule_type === 'fixed' ? 'Monto Fijo' : rule.rule_type === 'percentage' ? 'Cálculo Porcentual' : rule.rule_type === 'interest' ? 'Interés' : 'Multa'}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impacto</p>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                                            {rule.rule_type === 'percentage' ? `${rule.value}%` : `$${rule.value.toLocaleString()}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alcance</p>
                                        <p className="text-sm font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                                            {rule.applies_to === 'global' ? 'Global' : rule.applies_to === 'unit_type' ? 'Por Tipo' : 'Por Unidad'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteChargeRule(rule.id)}
                                    className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all rounded-3xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-inner"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar Política
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for Base Rules */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                        <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Nueva Regla Base</h2>
                                <p className="text-gray-500 font-bold text-sm">Monto fijo mensual para el periodo.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-rose-500 hover:text-white bg-gray-100 dark:bg-gray-800 rounded-3xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Tipo de Unidad Aplicable</label>
                                <select
                                    className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    value={unit_type_id}
                                    onChange={(e) => setUnitTypeId(e.target.value)}
                                >
                                    <option value="">Todas las Unidades (Global)</option>
                                    {unit_types.map((t: UnitType) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Monto Base ($)" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required className="p-5 rounded-[2rem]" />
                                <Input label="Vigente Desde" type="date" value={effective_from} onChange={(e) => setEffectiveFrom(e.target.value)} required className="p-5 rounded-[2rem]" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Observaciones</label>
                                <textarea
                                    className="w-full p-6 rounded-[2.5rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 min-h-[120px] transition-all"
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Motivo del monto o reajuste..."
                                />
                            </div>

                            <Button type="submit" className="w-full py-6 text-sm font-black uppercase tracking-widest rounded-3xl gap-3 shadow-xl shadow-indigo-500/30">
                                <CheckCircle2 className="w-6 h-6" /> Guardar Regla Mensual
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Charge Rules */}
            {isChargeModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                        <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Nueva Política de Cobro</h2>
                                <p className="text-gray-500 font-bold text-sm">Recargos, multas e intereses adicionales.</p>
                            </div>
                            <button onClick={() => setIsChargeModalOpen(false)} className="p-3 hover:bg-rose-500 hover:text-white bg-gray-100 dark:bg-gray-800 rounded-3xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleChargeSubmit} className="p-10 space-y-8">
                            <Input label="Identificación del Cargo" value={chargeName} onChange={(e) => setChargeName(e.target.value)} placeholder="Ej: Recargo por Conserjería Extra" required />
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Metodología</label>
                                    <select
                                        className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                        value={chargeType}
                                        onChange={(e) => setChargeType(e.target.value as any)}
                                    >
                                        <option value="fixed">Monto Fijo</option>
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="penalty">Multa</option>
                                        <option value="interest">Interés de Mora</option>
                                    </select>
                                </div>
                                <Input label={chargeType === 'percentage' ? "Valor (%)" : "Impacto ($)"} type="number" value={chargeValue} onChange={(e) => setChargeValue(Number(e.target.value))} required />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Segmento de Aplicación</label>
                                <select
                                    className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    value={chargeAppliesTo}
                                    onChange={(e) => setChargeAppliesTo(e.target.value as any)}
                                >
                                    <option value="global">Toda la Comunidad (Global)</option>
                                    <option value="unit_type">Agrupado por Tipo de Unidad</option>
                                    <option value="department">Departamento Específico</option>
                                </select>
                            </div>

                            {chargeAppliesTo === 'unit_type' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Seleccionar Tipo</label>
                                    <select
                                        className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                        value={chargeTargetId} onChange={(e) => setChargeTargetId(e.target.value)} required
                                    >
                                        <option value="">Seleccione Categoría...</option>
                                        {unit_types.map(ut => <option key={ut.id} value={ut.id}>{ut.nombre}</option>)}
                                    </select>
                                </div>
                            )}

                            {chargeAppliesTo === 'department' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-2 tracking-widest">Seleccionar Unidad</label>
                                    <select
                                        className="w-full p-5 rounded-[2rem] border-4 border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                        value={chargeTargetId} onChange={(e) => setChargeTargetId(e.target.value)} required
                                    >
                                        <option value="">Seleccione Unidad...</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>Depto {d.number} - Torre {d.tower?.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <Button type="submit" className="w-full py-6 text-sm font-black uppercase tracking-widest rounded-3xl gap-3 shadow-xl shadow-amber-500/30 bg-amber-600 border-amber-500 hover:bg-amber-700">
                                <Plus className="w-6 h-6" /> Activar Política de Cobro
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
