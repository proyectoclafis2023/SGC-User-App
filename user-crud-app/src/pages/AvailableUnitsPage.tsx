import React, { useState, useMemo } from 'react';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
    Home, Search, Filter, Camera, BedDouble, Bath, 
    Maximize2, DollarSign, Building2, ChevronRight,
    MapPin, Info, CheckCircle2, Heart, Share2, ArrowRight, X
} from 'lucide-react';
import type { Department, Tower, UnitType } from '../types';

export const AvailableUnitsPage: React.FC = () => {
    const { towers } = useInfrastructure();
    const { unit_types } = useUnitTypes();
    const { settings } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, venta, arriendo
    const [selectedUnit, setSelectedUnit] = useState<Department | null>(null);

    const availableUnits = useMemo(() => {
        const units: (Department & { towerName: string; unit_typeName: string })[] = [];
        towers.forEach((tower) => {
            tower.departments.forEach((dept) => {
                if (dept.isAvailable) {
                    units.push({
                        ...dept,
                        towerName: tower.name,
                        unit_typeName: unit_types.find((t) => t.id === dept.unit_type_id)?.name || 'Unidad'
                    });
                }
            });
        });
        return units.filter(u => {
            const matchesSearch = u.number.includes(searchTerm) || u.towerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || u.publishType === filterType;
            return matchesSearch && matchesType;
        });
    }, [towers, unit_types, searchTerm, filterType]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
            {/* Header Section with Glassmorphism */}
            <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 text-white shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest mb-6">
                            <Building2 className="w-4 h-4 text-indigo-300" />
                            Portal Inmobiliario Interno
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
                            Descubre tu próximo <span className="text-indigo-300">hogar</span>.
                        </h1>
                        <p className="text-xl text-indigo-100 font-medium leading-relaxed opacity-90">
                            Explora las unidades disponibles para venta o arriendo dentro de nuestra comunidad {settings.condoName || 'SGC'}.
                        </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/20 shadow-2xl min-w-[320px]">
                        <div className="flex flex-col gap-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                <input 
                                    type="text"
                                    placeholder="¿Qué unidad buscas?"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 p-1 bg-black/20 rounded-2xl">
                                {['all', 'venta', 'arriendo'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filterType === t ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        {t === 'all' ? 'Todos' : t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Units */}
            {availableUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {availableUnits.map((unit) => (
                        <div key={unit.id} className="bg-white dark:bg-gray-900 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden group hover:-translate-y-3 transition-all duration-500">
                            {/* Image Placeholder or Carousel */}
                            <div className="relative h-72 overflow-hidden">
                                {unit.image ? (
                                    <img src={unit.image} alt={unit.number} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                        <Camera className="w-16 h-16 text-indigo-200 dark:text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${
                                        unit.publishType === 'venta' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'
                                    }`}>
                                        En {unit.publishType}
                                    </span>
                                </div>
                                <button className="absolute top-6 right-6 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-rose-500 transition-colors shadow-lg">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex justify-between items-center text-white shadow-2xl">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-300" />
                                        <span className="text-xs font-black uppercase tracking-widest">{unit.towerName}</span>
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest">Unidad {unit.number}</div>
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                                            {formatCurrency(unit.value || 0)}
                                        </h3>
                                        <p className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wide">
                                            <Maximize2 className="w-4 h-4 text-indigo-500" />
                                            {unit.m2} m² de superficie
                                        </p>
                                    </div>
                                    <button className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-1">
                                        <BedDouble className="w-6 h-6 text-indigo-500 mb-1" />
                                        <span className="text-xl font-black dark:text-white">{unit.dormitorios || 3}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Habitaciones</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-1">
                                        <Bath className="w-6 h-6 text-indigo-500 mb-1" />
                                        <span className="text-xl font-black dark:text-white">{unit.banos || 1}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Baños</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold">Gasto Común Base</span>
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white">{formatCurrency(unit.base_common_expense || 40000)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold">Año Propiedad</span>
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white">{unit.yearBuilt || 2021}</span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full py-6 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 group-hover:bg-indigo-700"
                                    onClick={() => setSelectedUnit(unit)}
                                >
                                    Ver Detalle Inmueble
                                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-gray-50/50 dark:bg-gray-800/10 rounded-[5rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-10">
                        <Home className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-300 dark:text-gray-700 uppercase tracking-tighter mb-4">No hay unidades publicadas</h3>
                    <p className="text-xl text-gray-400 dark:text-gray-600 font-bold max-w-md mx-auto">
                        Vuelve más tarde o contacta con administración para consultar por disponibilidad.
                    </p>
                </div>
            )}

            {/* Modal de Detalle (Opcional - Implementación ràpida) */}
            {selectedUnit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-gray-900 rounded-[4rem] w-full max-w-6xl max-h-[90vh] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                        <div className="w-full md:w-1/2 h-[40vh] md:h-full relative overflow-hidden">
                            {selectedUnit.image ? (
                                <img src={selectedUnit.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Camera className="w-20 h-20 text-gray-300" /></div>
                            )}
                            <button onClick={() => setSelectedUnit(null)} className="absolute top-8 left-8 p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all shadow-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 p-16 overflow-y-auto custom-scrollbar space-y-12">
                            <div>
                                <span className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
                                    {selectedUnit.publishType} habitacional
                                </span>
                                <h2 className="text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                                    Unidad {selectedUnit.number} • {selectedUnit.towerName}
                                </h2>
                                <p className="text-5xl font-black text-indigo-600 mt-4 leading-none">{formatCurrency(selectedUnit.value || 0)}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                                    <BedDouble className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                    <span className="block text-xl font-black dark:text-white">{selectedUnit.dormitorios}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Habits.</span>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                                    <Bath className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                    <span className="block text-xl font-black dark:text-white">{selectedUnit.banos}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Baños</span>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                                    <Maximize2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                    <span className="block text-xl font-black dark:text-white">{selectedUnit.m2}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Metros Útiles</span>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                                    <CheckCircle2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                    <span className="block text-xl font-black dark:text-white">1</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Estac.</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Características del Condominio</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        'Accesos controlados',
                                        'Bicicletero',
                                        'Cámaras de seguridad',
                                        'Estacionamiento visitas',
                                        'Portón eléctrico',
                                        'Quinchos',
                                        'Áreas verdes'
                                    ].map((feat) => (
                                        <div key={feat} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 flex flex-col gap-4">
                                <Button className="w-full py-6 rounded-2xl text-sm font-black uppercase tracking-widest">Contactar con Administración</Button>
                                <Button variant="secondary" className="w-full py-6 rounded-2xl text-sm font-black uppercase tracking-widest" onClick={() => setSelectedUnit(null)}>Cerrar Galería</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
