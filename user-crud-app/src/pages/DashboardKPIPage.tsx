import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useResidents } from '../context/ResidentContext';
import { useCommonExpenses } from '../context/CommonExpenseContext';
import { usePersonnel } from '../context/PersonnelContext';
import { useArticles } from '../context/ArticleContext';
import { useShiftReport } from '../context/ShiftReportContext';
import { useArticleDeliveries } from '../context/ArticleDeliveryContext';
import { useSettings } from '../context/SettingsContext';
import {
    Activity, Users, Home, HardHat, Package, TrendingUp, TrendingDown,
    AlertCircle, CheckCircle2, LayoutDashboard, ArrowUpRight, ArrowDownRight, 
    Boxes, Landmark, LineChart, Wallet, ClipboardCheck
} from 'lucide-react';
import { Button } from '../components/Button';
import type { Department, Article, Personnel, ShiftReport, ArticleDelivery, CommonExpensePayment, CommunityExpense } from '../types';

export const DashboardKPIPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'general' | 'residencia' | 'personal' | 'inventario' | 'finanzas'>('general');
    const { towers, departments } = useInfrastructure();
    const { residents } = useResidents();
    const { personnel } = usePersonnel();
    const { articles } = useArticles();
    const { reports: shiftReports } = useShiftReport();
    const { deliveries } = useArticleDeliveries();
    const { payments, communityExpenses } = useCommonExpenses();
    const { settings } = useSettings();

    // -- RESIDENCIA CALCULATIONS --
    const totalUnits = departments.length;
    const occupiedUnits = departments.filter((d: Department) => d.resident_id).length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    const censusFrequency = settings.censusFrequencyYears || 1;
    const needsCensus = departments.filter((d: Department) => {
        if (!d.resident_id) return false;
        if (!d.lastCensusDate) return true;
        const last = new Date(d.lastCensusDate);
        const diffYears = (new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return diffYears >= censusFrequency;
    });

    // -- PERSONAL CALCULATIONS --
    const totalStaff = personnel.length;
    const activeStaff = personnel.filter((p: Personnel) => p.status === 'active').length;
    const pendingSignatures = deliveries.filter((d: ArticleDelivery) => !d.signed_document).length;

    const today = new Date().toISOString().split('T')[0];
    const todayReports = shiftReports.filter((r: ShiftReport) => r.shiftDate === today);
    const dayReports = todayReports.filter((r: ShiftReport) => r.shiftType === 'Mañana').length;
    const afternoonReports = todayReports.filter((r: ShiftReport) => r.shiftType === 'Tarde').length;
    const nightReports = todayReports.filter((r: ShiftReport) => r.shiftType === 'Noche').length;
    const shiftCompliance = ((dayReports + afternoonReports + nightReports) / 3) * 100;

    // -- INVENTARIO CALCULATIONS --
    const lowStockItems = articles.filter((a: Article) => a.stock <= a.minStock);
    const totalInventoryValue = articles.reduce((acc: number, a: Article) => acc + (a.stock * (a.price || 0)), 0);
    const pendingArticleRequests = articles.filter(a => a.stock < a.minStock).length; // Simulated logic or from actual requests

    // -- FINANZAS CALCULATIONS --
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYearNum = now.getFullYear();

    const gcCollected = payments
        .filter((p: CommonExpensePayment) => p.period_month === currentMonthNum && p.period_year === currentYearNum)
        .reduce((acc: number, p: CommonExpensePayment) => acc + p.amount_paid, 0);

    const totalExpenses = communityExpenses
        .filter((e: CommunityExpense) => {
            const d = new Date(e.date);
            return (d.getMonth() + 1) === currentMonthNum && d.getFullYear() === currentYearNum && !e.is_archived && !e.isProjected;
        })
        .reduce((acc: number, e: CommunityExpense) => acc + e.amount, 0);

    const cashMargin = gcCollected - totalExpenses;
    const marginPercentage = gcCollected > 0 ? (cashMargin / gcCollected) * 100 : 0;


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Activity className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <Activity className="w-7 h-7" />
                        </div>
                        Centro de Gestiones KPI
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold italic">Panel consolidado de rendimiento operativo y estratégico de la comunidad.</p>
                </div>
                <Button onClick={() => navigate('/')} variant="secondary" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs">
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Ir al Panel Principal
                </Button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-[2.5rem] w-full lg:w-fit border border-gray-200 dark:border-gray-800 custom-scrollbar">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Resumen General
                </button>
                <button
                    onClick={() => setActiveTab('residencia')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'residencia' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400'}`}
                >
                    <Home className="w-5 h-5" />
                    Gestión Residencia
                </button>
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'personal' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400'}`}
                >
                    <HardHat className="w-5 h-5" />
                    Gestión Personal
                </button>
                <button
                    onClick={() => setActiveTab('inventario')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'inventario' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400'}`}
                >
                    <Package className="w-5 h-5" />
                    Control Inventario
                </button>
                <button
                    onClick={() => setActiveTab('finanzas')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'finanzas' ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl' : 'text-gray-400'}`}
                >
                    <Landmark className="w-5 h-5" />
                    Finanzas & Proyecciones
                </button>
            </div>


            {/* TAB CONTENT: GENERAL SUMMARY */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer" onClick={() => setActiveTab('residencia')}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Home className="w-7 h-7" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ocupación</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{occupancyRate.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">{occupiedUnits} Unidades Habitadas</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer" onClick={() => setActiveTab('personal')}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <ClipboardCheck className="w-7 h-7" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Operatividad</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{shiftCompliance.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">Cumplimiento Bitácora Hoy</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer" onClick={() => setActiveTab('inventario')}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Package className="w-7 h-7" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 transition-colors" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Crítico</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{lowStockItems.length}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">Artículos por Reponer</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer" onClick={() => setActiveTab('finanzas')}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-rose-600 transition-colors" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Margen Caja</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{marginPercentage.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">Eficiencia del Mes</p>
                    </div>

                    {/* Quick Overview Section */}
                    <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                            <Activity className="w-6 h-6 text-indigo-600" />
                            Principales Indicadores de Salud Operativa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Residencia & Habitabilidad</p>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{vacantUnits}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unidades Vacantes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="w-2 h-10 bg-rose-500 rounded-full"></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{needsCensus.length}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Censos Vencidos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestión Humana & RRHH</p>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{activeStaff}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal en Turno</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{pendingSignatures}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Firmas Pendientes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recupero & Recaudación</p>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">${gcCollected.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recaudado Mes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-10 bg-purple-500 rounded-full"></div>
                                            <div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">${(totalExpenses * 1.045).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Egreso Proyectado</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: RESIDENCIA */}
            {activeTab === 'residencia' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                                <Users className="w-9 h-9" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tasa de Ocupación</h3>
                            <p className="text-5xl font-black text-gray-900 dark:text-white leading-tight">{occupancyRate.toFixed(1)}%</p>
                            <p className="text-xs font-bold text-gray-400 mt-2">{occupiedUnits} de {totalUnits} Unidades</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-black text-rose-600 flex items-center gap-3 mb-6">
                                <AlertCircle className="w-6 h-6" />
                                Alertas de Censo
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                    <span className="text-xs font-black text-rose-700 dark:text-rose-400">REQUIEREN CENSO</span>
                                    <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{needsCensus.length}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed">
                                    * Basado en frecuencia de {censusFrequency} año(s). Indica unidades con datos de residentes desactualizados.
                                </p>
                                <Button onClick={() => navigate('/infraestructura')} className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] bg-rose-600 hover:bg-rose-700">Ver Unidades Pendientes</Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <Home className="w-6 h-6 text-indigo-600" />
                                Unidades sin Residentes Asignados
                            </h3>
                            <span className="px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-black uppercase">Vacantes: {vacantUnits}</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar space-y-3">
                            {departments.filter(d => !d.resident_id).length === 0 ? (
                                <div className="text-center py-20 opacity-40">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Todas las unidades tienen residente asignado</p>
                                </div>
                            ) : (
                                departments.filter(d => !d.resident_id).map(unit => (
                                    <div key={unit.id} className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 dark:border-amber-900/30">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 dark:text-white leading-none">Unidad {unit.number}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    Piso {unit.floor} • Torre {towers.find(t => t.id === unit.tower_id)?.name || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button onClick={() => navigate('/infraestructura')} size="sm" className="rounded-xl px-6">Asignar Residente</Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PERSONAL */}
            {activeTab === 'personal' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                            <ClipboardCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cumplimiento Turnos</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{shiftCompliance.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2">Día actual: {dayReports + afternoonReports + nightReports} / 3 reportes</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">EPP Pendiente Firma</h3>
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{pendingSignatures}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2">Entregas de artículos sin respaldo</p>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col justify-center">
                        <div className="flex items-center gap-6">
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20">
                                <p className="text-4xl font-black text-emerald-600">{activeStaff}</p>
                                <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Personal Activo</p>
                            </div>
                            <div className="h-20 w-px bg-gray-100 dark:bg-gray-800"></div>
                            <div className="flex-1 space-y-4">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dotación Total: {totalStaff}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold text-indigo-500">
                                        <span>Operatividad</span>
                                        <span>{((activeStaff / (totalStaff || 1)) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${(activeStaff / (totalStaff || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => navigate('/personal')} className="mt-6 w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10" variant="secondary">Gestionar Personal</Button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: INVENTARIO */}
            {activeTab === 'inventario' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2.5rem] flex items-center justify-center mb-6 border border-amber-100 dark:border-amber-900/30">
                            <Boxes className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white italic">Stock Crítico</h3>
                        <p className="text-5xl font-black text-amber-600 mt-2">{lowStockItems.length}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Artículos bajo el Stock Mínimo</p>
                        <Button onClick={() => navigate('/articulos-personal')} className="mt-8 rounded-2xl w-full h-12 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-amber-500/10" variant="secondary">Ver Maestro Insumos</Button>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                            <TrendingDown className="w-6 h-6 text-rose-500" />
                            Alertas de Reposición
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {lowStockItems.length === 0 ? (
                                <div className="text-center py-20 opacity-40">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Existencias óptimas en todo el inventario</p>
                                </div>
                            ) : (
                                lowStockItems.map(art => (
                                    <div key={art.id} className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{art.name}</p>
                                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase mt-1">StockActual: {art.stock} | Mínimo: {art.minStock}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-3 py-1.5 rounded-full">REQUIERE COMPRA</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: FINANZAS */}
            {activeTab === 'finanzas' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ingresos Recaudados (GC)</h3>
                            <p className="text-4xl font-black text-emerald-600 leading-tight">${gcCollected.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Periodo Actual: {currentMonthNum}/{currentYearNum}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingDown className="w-24 h-24" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Egresos Comunidad</h3>
                            <p className="text-4xl font-black text-rose-600 leading-tight">${totalExpenses.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Pagiduría y Operaciones</p>
                        </div>

                        <div className={`p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden ${marginPercentage < 10 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20'}`}>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Wallet className="w-24 h-24" />
                            </div>
                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${marginPercentage < 10 ? 'text-rose-600' : 'text-indigo-600'}`}>Margen de Caja</h3>
                            <p className={`text-4xl font-black leading-tight ${marginPercentage < 10 ? 'text-rose-700' : 'text-indigo-700 dark:text-indigo-400'}`}>{marginPercentage.toFixed(1)}%</p>
                            {marginPercentage < 10 && (
                                <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-900/40 w-fit px-3 py-1 rounded-full border border-rose-200">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    ALERTA DE CAJA: MARGEN INSUFICIENTE
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                    <LineChart className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">Proyección Financiera Teoríca</h3>
                                    <p className="text-gray-500 mt-2 font-bold italic">Simulación de comportamiento de caja aplicando IPC Ponderado y margen proyectivo.</p>
                                </div>
                            </div>
                            <Button onClick={() => navigate('/maestro-ipc')} variant="secondary" className="rounded-2xl px-8 h-12 uppercase text-[10px] font-black tracking-widest">Configurar IPC</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 bg-gray-50 dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Escenario Actual</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold text-gray-500">Saldo Disponible</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">${cashMargin.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold text-gray-500">Costo Operativo</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20 relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                                        <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Proyección Próx. Período</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold text-indigo-400">IPC Estimado</span>
                                        <span className="text-sm font-black text-indigo-600">+4.5%</span>
                                    </div>
                                    <div className="h-px bg-indigo-200/30"></div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-bold text-indigo-400">Egresos Proyectados</span>
                                        <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">${(totalExpenses * 1.045).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                                        <ArrowDownRight className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest">Ajuste Sugerido por Margen</span>
                                </div>
                                {marginPercentage < 10 ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-2xl border border-purple-200">
                                            <p className="text-xs font-black text-purple-800 dark:text-purple-300 leading-tight">
                                                Se recomienda un aumento del <span className="text-indigo-600 font-black text-sm">{(10 - marginPercentage).toFixed(1)}%</span> en la recaudación base para asegurar un margen operativo de seguridad del 10%.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-center opacity-40">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Margen saludable. No se sugieren ajustes inmediatos.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
