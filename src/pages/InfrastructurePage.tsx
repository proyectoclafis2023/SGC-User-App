import React, { useState } from 'react';
import { useInfrastructure } from '../context/InfrastructureContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Building2, Plus, Copy, Trash2, Edit2, Users, Dog, AlertTriangle, Save, X, Home } from 'lucide-react';
import type { Tower, Department } from '../types';

export const InfrastructurePage: React.FC = () => {
    const { towers, addTower, updateTower, deleteTower, duplicateTower } = useInfrastructure();
    const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [currentTower, setCurrentTower] = useState<Tower | null>(null);
    const [editingDept, setEditingDept] = useState<{ towerId: string; dept: Department } | null>(null);
    const [towerName, setTowerName] = useState('');

    // Form states for Department
    const [deptNumber, setDeptNumber] = useState('');
    const [residentName, setResidentName] = useState('');
    const [residentType, setResidentType] = useState<'owner' | 'tenant'>('owner');
    const [familyCount, setFamilyCount] = useState(0);
    const [hasPets, setHasPets] = useState(false);
    const [specialConditions, setSpecialConditions] = useState('');

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

    const handleDuplicate = async (id: string) => {
        const name = prompt('Nombre para la nueva torre:');
        if (name) await duplicateTower(id, name);
    };

    const handleOpenDeptModal = (towerId: string, dept?: Department) => {
        if (dept) {
            setEditingDept({ towerId, dept });
            setDeptNumber(dept.number);
            setResidentName(dept.residentName);
            setResidentType(dept.residentType);
            setFamilyCount(dept.familyCount);
            setHasPets(dept.hasPets);
            setSpecialConditions(dept.specialConditions);
        } else {
            setCurrentTower(towers.find(t => t.id === towerId) || null);
            setEditingDept(null);
            setDeptNumber('');
            setResidentName('');
            setResidentType('owner');
            setFamilyCount(0);
            setHasPets(false);
            setSpecialConditions('');
        }
        setIsDeptModalOpen(true);
    };

    const handleSaveDept = async (e: React.FormEvent) => {
        e.preventDefault();
        const towerId = editingDept ? editingDept.towerId : currentTower?.id;
        if (!towerId) return;

        const tower = towers.find(t => t.id === towerId);
        if (!tower) return;

        const deptData: Department = {
            id: editingDept ? editingDept.dept.id : Math.random().toString(36).substr(2, 9),
            number: deptNumber,
            residentName,
            residentType,
            familyCount: Number(familyCount),
            hasPets,
            specialConditions
        };

        const updatedDepts = editingDept
            ? tower.departments.map(d => d.id === deptData.id ? deptData : d)
            : [...tower.departments, deptData];

        await updateTower({ ...tower, departments: updatedDepts });
        setIsDeptModalOpen(false);
    };

    const handleDeleteDept = async (towerId: string, deptId: string) => {
        if (!confirm('¿Eliminar este departamento?')) return;
        const tower = towers.find(t => t.id === towerId);
        if (!tower) return;
        await updateTower({ ...tower, departments: tower.departments.filter(d => d.id !== deptId) });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        Infraestructura
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de torres, departamentos y residentes.</p>
                </div>
                <Button onClick={() => handleOpenTowerModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Torre
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {towers.map((tower) => (
                    <div key={tower.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tower.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{tower.departments.length} Departamentos</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDuplicate(tower.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Duplicar Torre">
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleOpenTowerModal(tower)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => deleteTower(tower.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {tower.departments.map((dept) => (
                                    <div key={dept.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all group relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">Depto {dept.number}</span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={() => handleOpenDeptModal(tower.id, dept)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteDept(tower.id, dept.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Residente</p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{dept.residentName || 'Sin asignar'}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${dept.residentType === 'owner' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                    {dept.residentType === 'owner' ? 'Dueño' : 'Arrendatario'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 border-t border-gray-50 dark:border-gray-700 pt-2">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Users className="w-3 h-3" />
                                                    <span className="text-xs font-bold">{dept.familyCount}</span>
                                                </div>
                                                {dept.hasPets && (
                                                    <div className="text-amber-600 dark:text-amber-500" title="Tiene mascotas">
                                                        <Dog className="w-3 h-3" />
                                                    </div>
                                                )}
                                                {dept.specialConditions && (
                                                    <div className="text-red-500" title={dept.specialConditions}>
                                                        <AlertTriangle className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleOpenDeptModal(tower.id)}
                                    className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-all bg-gray-50/30 dark:bg-gray-800/20 h-[140px]"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Añadir Depto</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tower Modal */}
            {isTowerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                {currentTower ? 'Editar Torre' : 'Nueva Torre'}
                            </h2>
                            <button onClick={() => setIsTowerModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTower} className="p-6 space-y-4">
                            <Input
                                label="Nombre de la Torre"
                                value={towerName}
                                onChange={(e) => setTowerName(e.target.value)}
                                placeholder="ej. Torre B"
                                required
                            />
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsTowerModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Torre</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Department Modal */}
            {isDeptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Home className="w-5 h-5 text-indigo-600" />
                                {editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}
                            </h2>
                            <button onClick={() => setIsDeptModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDept} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Número de Depto" value={deptNumber} onChange={(e) => setDeptNumber(e.target.value)} required />
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Tipo Residente</label>
                                    <select
                                        value={residentType}
                                        onChange={(e) => setResidentType(e.target.value as 'owner' | 'tenant')}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    >
                                        <option value="owner">Dueño</option>
                                        <option value="tenant">Arrendatario</option>
                                    </select>
                                </div>
                            </div>
                            <Input label="Nombre del Residente" value={residentName} onChange={(e) => setResidentName(e.target.value)} placeholder="Nombre completo" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Grupo Familiar (Cantidad)" type="number" value={familyCount} onChange={(e) => setFamilyCount(Number(e.target.value))} />
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">¿Tiene Mascotas?</label>
                                    <div className="flex items-center h-[42px] px-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <input type="checkbox" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Sí, tiene mascotas</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Condiciones Especiales</label>
                                <textarea
                                    value={specialConditions}
                                    onChange={(e) => setSpecialConditions(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[100px] transition-all shadow-sm"
                                    placeholder="ej. Electro-dependiente, uso de oxígeno, etc."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button type="button" variant="secondary" onClick={() => setIsDeptModalOpen(false)}>Cancelar</Button>
                                <Button type="submit"><Save className="w-4 h-4 mr-2" /> Guardar Depto</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
