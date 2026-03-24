import React, { useState, useMemo, useEffect } from 'react';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useHistoryLogs } from '../context/HistoryLogContext';
import { useOwners } from '../context/OwnerContext';
import { useResidents } from '../context/ResidentContext';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useSpecialConditions } from '../context/SpecialConditionContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
    Building2, Plus, Copy, Trash2, Edit2, Dog,
    AlertTriangle, Save, X, Home, Droplets, Zap,
    Flame, UserCheck, Clock, Search, UserPlus,
    Map, Camera
} from 'lucide-react';
import { formatRUT } from '../utils/formatters';
import { useSettings } from '../context/SettingsContext';
import type { Department, Tower, Owner, Resident, UnitType, SpecialCondition, HistoryLog } from '../types';

export const InfraestructuraPage: React.FC = () => {
    const { towers, addTower, deleteTower, updateTower, duplicateTower, addDepartment, updateDepartment, deleteDepartment } = useInfrastructure();
    const { getLogsByUnit } = useHistoryLogs();
    const { owners, addOwner } = useOwners();
    const { residents, addResident } = useResidents();
    const { unit_types } = useUnitTypes();
    const { conditions } = useSpecialConditions();
    const { settings } = useSettings();

    const handleDeleteDept = (_tower_id: string, deptId: string, number: string) => {
        if (window.confirm(`¿Está seguro de eliminar la unidad ${number}?`)) {
            deleteDepartment(deptId);
        }
    };

    const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isQuickCreateOwnerOpen, setIsQuickCreateOwnerOpen] = useState(false);
    const [isQuickCreateResidentOpen, setIsQuickCreateResidentOpen] = useState(false);

    const [currentTower, setCurrentTower] = useState<Tower | null>(null);
    const [editingDept, setEditingDept] = useState<{ tower_id: string; dept: Department } | null>(null);
    const [historyDept, setHistoryDept] = useState<Department | null>(null);
    const [towerName, setTowerName] = useState('');

    const [ownerSearch, setOwnerSearch] = useState('');
    const [residentSearch, setResidentSearch] = useState('');

    const [deptNumber, setDeptNumber] = useState('');
    const [unit_type_id, setUnitTypeId] = useState('');
    const [property_role, setPropertyRole] = useState('');
    const [m2, setM2] = useState(0);
    const [floor, setFloor] = useState<number | ''>('');
    const [water_client_id, setWaterClientId] = useState('');

    useEffect(() => {
        if (unit_type_id) {
            const type = unit_types.find((t: UnitType) => t.id === unit_type_id);
            if (type && type.default_m2) {
                if (m2 === 0 || !editingDept) {
                    setM2(type.default_m2);
                }
            }
        }
    }, [unit_type_id, unit_types, editingDept]);
    const [electricity_client_id, setElectricityClientId] = useState('');
    const [gas_client_id, setGasClientId] = useState('');
    const [owner_id, setOwnerId] = useState('');
    const [resident_id, setResidentId] = useState('');

    const [value, setValue] = useState(0);
    const [dormitorios, setDormitorios] = useState(0);
    const [banos, setBanos] = useState(0);
    const [estacionamientos, setEstacionamientos] = useState(0);
    const [terrain_m2, setTerrainM2] = useState(0);
    const [year_built, setYearBuilt] = useState(new Date().getFullYear());
    const [is_available, setIsAvailable] = useState(false);
    const [publish_type, setPublishType] = useState<'venta' | 'arriendo'>('venta');
    const [image, setImage] = useState('');
    const [location_map_url, setLocationMapUrl] = useState('');

    const [quickNames, setQuickNames] = useState('');
    const [quickLastNames, setQuickLastNames] = useState('');
    const [quickDni, setQuickDni] = useState('');
    const [quickPhone, setQuickPhone] = useState('');
    const [quickEmail, setQuickEmail] = useState('');

    const filteredOwners = useMemo(() => {
        const activeOwners = owners.filter((o: Owner) => !o.is_archived);
        if (!ownerSearch.trim()) return [];
        const q = ownerSearch.toLowerCase();
        return activeOwners.filter((o: Owner) =>
            `${o.names} ${o.lastNames}`.toLowerCase().includes(q) ||
            o.dni.toLowerCase().includes(q)
        );
    }, [owners, ownerSearch]);

    const filteredResidents = useMemo(() => {
        const activeResidents = residents.filter((r: Resident) => !r.is_archived);
        if (!residentSearch.trim()) return [];
        const q = residentSearch.toLowerCase();
        return activeResidents.filter((r: Resident) =>
            `${r.names} ${r.lastNames}`.toLowerCase().includes(q) ||
            r.dni.toLowerCase().includes(q)
        );
    }, [residents, residentSearch]);

    const handleOpenTowerModal = (tower?: Tower) => {
        if (tower) {
            setCurrentTower(tower);
            setTowerName(tower.name);
        } else {
            setCurrentTower(null);
            setTowerName('');
        }
        setIsTowerModalOpen(true);
    };

    const handleSaveTower = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentTower) {
            await updateTower({ ...currentTower, name: towerName });
        } else {
            await addTower({ name: towerName, departments: [] });
        }
        setIsTowerModalOpen(false);
    };

    const handleOpenDeptModal = (tower_id: string, dept?: Department) => {
        setOwnerSearch('');
        setResidentSearch('');
        if (dept) {
            setEditingDept({ tower_id, dept });
            setDeptNumber(dept.number);
            setUnitTypeId(dept.unit_type_id || '');
            setPropertyRole(dept.property_role || '');
            setM2(dept.m2 || 0);
            setFloor(dept.floor || '');
            setWaterClientId(dept.water_client_id || '');
            setElectricityClientId(dept.electricity_client_id || '');
            setGasClientId(dept.gas_client_id || '');
            setOwnerId(dept.owner_id || '');
            setResidentId(dept.resident_id || '');
            setValue(dept.value || 0);
            setDormitorios(dept.dormitorios || 0);
            setBanos(dept.banos || 0);
            setEstacionamientos(dept.estacionamientos || 0);
            setTerrainM2(dept.terrain_m2 || 0);
            setYearBuilt(dept.year_built || new Date().getFullYear());
            setIsAvailable(dept.is_available || false);
            setPublishType(dept.publish_type || 'venta');
            setImage(dept.image || '');
            setLocationMapUrl(dept.location_map_url || '');
        } else {
            setCurrentTower(towers.find((t: Tower) => t.id === tower_id) || null);
            setEditingDept(null);
            setDeptNumber('');
            setUnitTypeId('');
            setPropertyRole('');
            setM2(0);
            setFloor('');
            setWaterClientId('');
            setElectricityClientId('');
            setGasClientId('');
            setOwnerId('');
            setResidentId('');
            setValue(0);
            setDormitorios(0);
            setBanos(0);
            setEstacionamientos(0);
            setTerrainM2(0);
            setYearBuilt(new Date().getFullYear());
            setIsAvailable(false);
            setPublishType('venta');
            setImage('');
            setLocationMapUrl('');
        }
        setIsDeptModalOpen(true);
    };

    const handleSaveDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (m2 < 0) {
            alert('Los metros cuadrados no pueden ser negativos.');
            return;
        }
        const tower_id = editingDept ? editingDept.tower_id : currentTower?.id;
        if (!tower_id) {
            alert('Debe seleccionar un edificio primero.');
            return;
        }

        const deptData: any = {
            tower_id,
            number: deptNumber,
            unit_type_id,
            property_role,
            m2: Number(m2),
            floor: floor !== '' ? Number(floor) : undefined,
            water_client_id,
            electricity_client_id,
            gas_client_id,
            owner_id: owner_id || undefined,
            resident_id: resident_id || undefined,
            value: Number(value),
            dormitorios: Number(dormitorios),
            banos: Number(banos),
            estacionamientos: Number(estacionamientos),
            terrain_m2: Number(terrain_m2),
            year_built: Number(year_built),
            is_available,
            publish_type,
            image,
            location_map_url
        };

        try {
            if (editingDept) {
                await updateDepartment({ ...deptData, id: editingDept.dept.id });
            } else {
                await addDepartment(deptData);
            }
            setIsDeptModalOpen(false);
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Error al guardar la unidad.');
        }
    };

    const handleQuickCreateOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const id = await addOwner({
                names: quickNames,
                lastNames: quickLastNames,
                dni: quickDni,
                phone: quickPhone,
                email: quickEmail,
                notes: 'Creado desde InfraestructuraPage'
            });
            if (id) {
                setOwnerId(id);
                setOwnerSearch('');
            }
            setIsQuickCreateOwnerOpen(false);
            setQuickNames(''); setQuickLastNames(''); setQuickDni(''); setQuickPhone(''); setQuickEmail('');
        } catch (error) {
            console.error('Error in quick create owner:', error);
            alert('No se pudo crear el propietario.');
        }
    };

    const handleQuickCreateResident = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = await addResident({
            names: quickNames,
            lastNames: quickLastNames,
            dni: quickDni,
            phone: quickPhone,
            email: quickEmail,
            familyCount: 1,
            hasPets: false,
            conditionIds: [],
            isTenant: false,
            notes: 'Creado desde InfraestructuraPage'
        });
        setResidentId(id);
        setIsQuickCreateResidentOpen(false);
    };

    const handleDuplicateOwnerToResident = async () => {
        if (!owner_id) return;
        const owner = owners.find((o: Owner) => o.id === owner_id);
        if (!owner) return;
        const id = await addResident({
            names: owner.names,
            lastNames: owner.lastNames,
            dni: owner.dni,
            phone: owner.phone,
            email: owner.email,
            familyCount: 1,
            hasPets: false,
            conditionIds: [],
            isTenant: false,
            notes: 'Duplicado automáticamente del propietario.'
        });
        setResidentId(id);
    };

    const getOwnerName = (id?: string) => owners.find((o: Owner) => o.id === id) ? `${owners.find((o: Owner) => o.id === id)?.names} ${owners.find((o: Owner) => o.id === id)?.lastNames}` : 'Sin asignar';
    const getResidentName = (id?: string) => residents.find((r: Resident) => r.id === id) ? `${residents.find((r: Resident) => r.id === id)?.names} ${residents.find((r: Resident) => r.id === id)?.lastNames}` : 'Sin asignar';
    const getUnitTypeName = (id?: string) => unit_types.find((t: UnitType) => t.id === id)?.nombre || 'Sin tipo';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-black flex items-center gap-2 ${settings.theme === 'modern' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Maestro Edificios y Propiedades
                    </h1>
                    <p className={`text-sm mt-1 font-bold ${settings.theme === 'modern' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>Gestión de edificios, propiedades y tipos de unidad.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => window.location.href = '/propietarios'}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Maestro Propietarios
                    </Button>
                    <Button variant="secondary" onClick={() => handleOpenDeptModal('')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Unidad
                    </Button>
                    <Button onClick={() => handleOpenTowerModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Edificio
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {(towers || []).filter((t: Tower) => !t.is_archived).sort((a: Tower, b: Tower) => (a.name || '').localeCompare(b.name || '')).map((tower: Tower) => (
                    <div key={tower.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Building2 className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        {tower.name}
                                        {tower.departments.filter((d: Department) => !d.is_archived).length === 0 && (
                                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-200 flex items-center gap-1 animate-pulse">
                                                <AlertTriangle className="w-3 h-3" /> Sin Unidades
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        ID: {tower.id} • {tower.departments.filter((d: Department) => !d.is_archived).length} UNIDADES REGISTRADAS
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => duplicateTower(tower.id, `${tower.name} (Copia)`)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Duplicar
                                </button>
                                <button
                                    onClick={() => handleOpenTowerModal(tower)}
                                    className="p-3 text-gray-400 hover:text-indigo-600 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-100 shadow-sm transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`¿Está seguro de eliminar la ${tower.name}? Se perderán todas sus unidades.`)) {
                                            deleteTower(tower.id);
                                        }
                                    }}
                                    className="p-3 text-red-300 hover:text-red-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-100 shadow-sm transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {((tower as any).departments || []).filter((d: Department) => !d.is_archived).map((dept: Department) => {
                                    const resInfo = residents.find((r: Resident) => r.id === dept.resident_id);
                                    const censusFrequency = settings.censusFrequencyYears || 1;
                                    const isCensusOverdue = !dept.last_census_date || 
                                        new Date(dept.last_census_date).getTime() + (censusFrequency * 365 * 24 * 60 * 60 * 1000) < new Date().getTime();

                                    return (
                                        <div key={dept.id} className={`p-4 rounded-xl border ${isCensusOverdue ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50'} hover:shadow-md transition-all group relative`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 ${isCensusOverdue ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-lg`}>
                                                        <Home className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block text-sm">Unidad {dept.number}</span>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded font-bold uppercase tracking-tighter">{getUnitTypeName(dept.unit_type_id)}</span>
                                                            {isCensusOverdue && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded font-black uppercase tracking-widest animate-pulse border border-rose-200">Sin Censo</span>
                                                            )}
                                                            {!dept.resident_id && (
                                                                <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-black uppercase tracking-widest border border-amber-200">Sin Residente</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button onClick={() => { setHistoryDept(dept); setIsHistoryModalOpen(true); }} className="p-1 text-gray-400 hover:text-indigo-600"><Clock className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleOpenDeptModal(tower.id, dept)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteDept(tower.id, dept.id, dept.number)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-3 text-[11px]">
                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg space-y-1">
                                                    <p className="truncate text-gray-700 dark:text-gray-300 transition-colors"><span className="text-gray-400 font-bold uppercase mr-1">Dueño:</span> {getOwnerName(dept.owner_id)}</p>
                                                    <p className="truncate text-gray-700 dark:text-gray-300 transition-colors"><span className="text-gray-400 font-bold uppercase mr-1">Res:</span> {getResidentName(dept.resident_id)}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-1">
                                                    {resInfo && (resInfo.conditionIds || []).length > 0 && (
                                                        <div className="flex gap-0.5">
                                                            {(resInfo.conditionIds || []).map((cid: string) => (
                                                                <span key={cid} title={conditions.find((c: SpecialCondition) => c.id === cid)?.name}><AlertTriangle className="w-3 h-3 text-red-500" /></span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {resInfo?.hasPets && <Dog className="w-3 h-3 text-amber-500" />}
                                                    <span className="ml-auto text-[10px] text-gray-500 font-bold">{dept.m2} m²</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button onClick={() => handleOpenDeptModal(tower.id)} className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 h-32">
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Nueva Unidad</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tower Modal */}
            {isTowerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-600" /> {currentTower ? 'Editar Edificio' : 'Nuevo Edificio'}</h2>
                            <button onClick={() => setIsTowerModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X /></button>
                        </div>
                        <form onSubmit={handleSaveTower} className="p-6 space-y-4">
                            <Input label="Nombre del Edificio" value={towerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTowerName(e.target.value)} required placeholder="Ej: Torre A" />
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button type="button" variant="secondary" onClick={() => setIsTowerModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Edificio</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Department Modal */}
            {isDeptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-indigo-600">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Home className="w-6 h-6" />
                                {editingDept ? `Unidad ${editingDept.dept.number}` : 'Añadir Nueva Unidad'}
                            </h2>
                            <button onClick={() => setIsDeptModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSaveDept} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ficha Técnica</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Número" value={deptNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeptNumber(e.target.value)} required />
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Edificio</label>
                                            <select
                                                value={editingDept ? editingDept.tower_id : currentTower?.id || ''}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentTower(towers.find((t: Tower) => t.id === e.target.value) || null)}
                                                className="w-full h-[42px] px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none transition-all"
                                                disabled={!!editingDept}
                                                required
                                            >
                                                <option value="">Seleccionar Edificio...</option>
                                                {towers.filter(t => !t.is_archived).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tipo de Unidad</label>
                                            <select value={unit_type_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUnitTypeId(e.target.value)} className="w-full h-[42px] px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none transition-all" required>
                                                <option value="">Seleccionar...</option>
                                                {unit_types.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Metros²" type="number" value={m2} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setM2(Number(e.target.value))} required min="0" />
                                        <Input label="Piso" type="number" value={floor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloor(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej: 5" />
                                    </div>
                                    <Input label="Rol SII" value={property_role} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPropertyRole(e.target.value)} />
                                    
                                    <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Información Comercial y Portal</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Valor Comercial ($)" type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tipo Publicación</label>
                                                <select value={publish_type} onChange={(e) => setPublishType(e.target.value as any)} className="w-full h-[42px] px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none transition-all">
                                                    <option value="venta">Venta</option>
                                                    <option value="arriendo">Arriendo</option>
                                                </select>
                                            </div>
                                            <Input label="Dormitorios" type="number" value={dormitorios} onChange={(e) => setDormitorios(Number(e.target.value))} min="0" />
                                            <Input label="Baños" type="number" value={banos} onChange={(e) => setBanos(Number(e.target.value))} min="0" />
                                            <Input label="Estacionamientos" type="number" value={estacionamientos} onChange={(e) => setEstacionamientos(Number(e.target.value))} min="0" />
                                            <Input label="m² Terreno" type="number" value={terrain_m2} onChange={(e) => setTerrainM2(Number(e.target.value))} min="0" />
                                            <Input label="Año Construcción" type="number" value={year_built} onChange={(e) => setYearBuilt(Number(e.target.value))} />
                                            <div className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Disponible</label>
                                                <input type="checkbox" checked={is_available} onChange={(e) => setIsAvailable(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 space-y-4">
                                            <div className="relative">
                                                <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="URL Mapa (Google Maps / Waze)" 
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                                    value={location_map_url}
                                                    onChange={(e) => setLocationMapUrl(e.target.value)}
                                                />
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                <div className="relative group flex-1">
                                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                                        {image ? (
                                                            <img src={image} className="w-full h-full object-cover" alt="Vista previa" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Camera className="w-8 h-8 text-gray-300" />
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subir Foto Unidad</span>
                                                            </div>
                                                        )}
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setImage(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }} 
                                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        />
                                                    </div>
                                                    {image && (
                                                        <button type="button" onClick={() => setImage('')} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Servicios Básicos</h3>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                            <input
                                                type="text"
                                                placeholder="N° Cliente Agua"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                value={water_client_id}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWaterClientId(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                                            <input
                                                type="text"
                                                placeholder="N° Cliente Electricidad"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                                                value={electricity_client_id}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setElectricityClientId(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                            <input
                                                type="text"
                                                placeholder="N° Cliente Gas"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                                value={gas_client_id}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGasClientId(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold uppercase text-gray-400">Propietario / Dueño</label>
                                        <button type="button" onClick={() => setIsQuickCreateOwnerOpen(true)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                            <Plus className="w-3 h-3" /> Crear Nuevo
                                        </button>
                                    </div>
                                    <div className="relative">
                                        {owner_id ? (
                                            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                    <UserCheck className="w-4 h-4" />
                                                    {getOwnerName(owner_id)}
                                                </div>
                                                <button type="button" onClick={() => setOwnerId('')} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-full text-indigo-400 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Escriba nombres, apellidos o DNI para buscar..."
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/10"
                                                        value={ownerSearch}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOwnerSearch(e.target.value)}
                                                    />
                                                </div>
                                                {ownerSearch.trim() && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                                        {filteredOwners.length > 0 ? (
                                                            filteredOwners.map((o: Owner) => (
                                                                <button
                                                                    key={o.id}
                                                                    type="button"
                                                                    onClick={() => { setOwnerId(o.id); setOwnerSearch(''); }}
                                                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors"
                                                                >
                                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{o.names} {o.lastNames}</div>
                                                                    <div className="text-[10px] text-gray-400 font-mono">{o.dni} • {o.phone || 'Sin fono'}</div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-gray-500 italic">No se encontraron resultados para "{ownerSearch}"</div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold uppercase text-gray-400">Residente Actual</label>
                                        <div className="flex gap-3 items-center">
                                            {owner_id && (
                                                <button type="button" onClick={handleDuplicateOwnerToResident} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                                                    <UserCheck className="w-3 h-3" /> Mismo Propietario
                                                </button>
                                            )}
                                            <button type="button" onClick={() => setIsQuickCreateResidentOpen(true)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                                <Plus className="w-3 h-3" /> Crear Nuevo
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        {resident_id ? (
                                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                                                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                    <UserCheck className="w-4 h-4" />
                                                    {getResidentName(resident_id)}
                                                </div>
                                                <button type="button" onClick={() => setResidentId('')} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-full text-emerald-400 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Escriba nombres, apellidos o DNI para buscar..."
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/10"
                                                        value={residentSearch}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResidentSearch(e.target.value)}
                                                    />
                                                </div>
                                                {residentSearch.trim() && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                                        {filteredResidents.length > 0 ? (
                                                            filteredResidents.map((r: Resident) => (
                                                                <button
                                                                    key={r.id}
                                                                    type="button"
                                                                    onClick={() => { setResidentId(r.id); setResidentSearch(''); }}
                                                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors"
                                                                >
                                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{r.names} {r.lastNames}</div>
                                                                    <div className="text-[10px] text-gray-400 font-mono">{r.dni} • {r.phone || 'Sin fono'}</div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-gray-500 italic">No se encontraron resultados para "{residentSearch}"</div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsDeptModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600">
                                    <Save className="w-4 h-4 mr-2" /> Guardar Unidad
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Create Modals */}
            {(isQuickCreateOwnerOpen || isQuickCreateResidentOpen) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in zoom-in-95 duration-200 transition-all">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20">
                        <div className="p-6 border-b flex items-center justify-between"><h2 className="text-lg font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600" />{isQuickCreateOwnerOpen ? 'Nuevo Propietario' : 'Nuevo Residente'}</h2><button onClick={() => { setIsQuickCreateOwnerOpen(false); setIsQuickCreateResidentOpen(false); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={isQuickCreateOwnerOpen ? handleQuickCreateOwner : handleQuickCreateResident} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4"><Input label="Nombres" value={quickNames} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickNames(e.target.value)} required /><Input label="Apellidos" value={quickLastNames} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickLastNames(e.target.value)} required /></div>
                            <Input label="RUT / DNI" value={quickDni} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickDni(formatRUT(e.target.value))} required />
                            <div className="grid grid-cols-2 gap-4"><Input label="Teléfono" value={quickPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickPhone(e.target.value)} required /><Input label="Email" type="email" value={quickEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickEmail(e.target.value)} required /></div>
                            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={() => { setIsQuickCreateOwnerOpen(false); setIsQuickCreateResidentOpen(false); }}>Cancelar</Button><Button type="submit" className="bg-emerald-600 text-white">Crear y Seleccionar</Button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && historyDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 transition-all">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl border border-white/20">
                        <div className="p-6 border-b flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Historial Unidad {historyDept.number}</h2><button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X /></button></div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {(() => {
                                const unitLogs = getLogsByUnit(historyDept.id);
                                if (unitLogs.length === 0) return <p className="text-center text-gray-400 py-10 font-bold italic">Sin registros históricos para esta unidad.</p>;
                                
                                return unitLogs.map((log: HistoryLog) => (
                                    <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex justify-between items-center transition-hover hover:border-indigo-200">
                                        <div className="space-y-1 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                    log.entityType === 'resident' ? 'bg-emerald-100 text-emerald-700' : 
                                                    log.entityType === 'owner' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {log.entityType}
                                                </span>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.action}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug">"{log.details}"</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] text-gray-400 font-black uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-gray-300 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        <div className="p-6 border-t flex justify-end"><Button onClick={() => setIsHistoryModalOpen(false)}>Cerrar</Button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
