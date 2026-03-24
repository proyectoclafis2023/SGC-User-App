import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Upload, Download, AlertCircle, Info, CheckCircle2, XCircle, History, Database, FileText, Package, Users, ShieldCheck, Building2, Landmark, LifeBuoy, AlertTriangle, Banknote, Home, Tag, LineChart, Phone, Mail, Smartphone, Calendar, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import * as XLSX from 'xlsx';

import { useArticles } from '../context/ArticleContext';
import { usePersonnel } from '../context/PersonnelContext';
import { useResidents } from '../context/ResidentContext';
import { useOwners } from '../context/OwnerContext';
import { useBanks } from '../context/BankContext';
import { useFixedAssets } from '../context/FixedAssetContext';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useCommonExpenses } from '../context/CommonExpenseContext';
import { useCommonSpaces } from '../context/CommonSpaceContext';
import { useParkings } from '../context/ParkingContext';
import { useSystemParameters } from '../context/SystemParameterContext';
import { useIPCProjections } from '../context/IPCProjectionContext';
import { useInfrastructureItems } from '../context/InfrastructureItemContext';
import { useEquipmentItems } from '../context/EquipmentItemContext';
import { useSystemMessages } from '../context/SystemMessageContext';
import { useEmergencyNumbers } from '../context/EmergencyNumberContext';
import { useAFC } from '../context/AFCContext';
import { useHolidays } from '../context/HolidayContext';
import { useCommunications } from '../context/CommunicationContext';
import { useCameras } from '../context/CameraContext';

type EntityType = 'articulos_personal' | 'personnel' | 'residents' | 'owners' | 'bancos' | 'assets' | 'previsiones' | 'afps' | 'conditions' | 'tipos_unidad' | 'extra_funds' | 'income' | 'community_expenses' | 'towers' | 'departments' | 'espacios' | 'estacionamientos' | 'maestro_categorias_articulos' | 'ipc' | 'infra_items' | 'equip_items' | 'messages' | 'maestro_emergencias' | 'afc_master' | 'holiday_master' | 'comm_templates' | 'cameras';

interface ProcessingError {
    row: number;
    module: string;
    field?: string;
    value?: string;
    error: string;
    sheet?: string;
}

interface BulkUploadLog {
    id: string;
    module: string;
    processed: number;
    created: number;
    updated: number;
    status: string;
    dryRun: boolean;
    errors: any[];
    created_at: string;
}

const LOAD_HIERARCHY = [
    { step: 1, title: 'Infraestructura', entities: ['towers', 'unit_types', 'departments', 'parking'], description: 'Base física necesaria para asignar unidades.' },
    { step: 2, title: 'Maestros Base', entities: ['banks', 'pension_funds', 'health_providers', 'article_categories', 'emergency_numbers'], description: 'Catálogos requeridos por otros módulos.' },
    { step: 3, title: 'Comunidad', entities: ['residents', 'owners'], description: 'Habitantes vinculados a la infraestructura.' },
    { step: 4, title: 'Módulos Dependientes', entities: ['personnel', 'articles', 'assets'], description: 'Operaciones diarias y equipamiento.' }
];

export const CargaMasivaPage: React.FC = () => {
    // Entities and Icons (Keep for UI selection and template generation)
    const { articles } = useArticles();
    const { personnel } = usePersonnel();
    const { residents } = useResidents();
    const { owners } = useOwners();
    const { banks } = useBanks();
    const { assets } = useFixedAssets();
    const { providers } = useHealthProviders();
    const { funds } = usePensionFunds();
    const { unitTypes } = useUnitTypes();
    const { towers, departments } = useInfrastructure();
    const { spaces } = useCommonSpaces();
    const { parkings } = useParkings();
    const { parameters } = useSystemParameters();
    const { projections } = useIPCProjections();
    const { items: infraItems } = useInfrastructureItems();
    const { items: equipItems } = useEquipmentItems();
    const { messages: systemMessages } = useSystemMessages();
    const { numbers: emergencyNumbers } = useEmergencyNumbers();
    const { afcs } = useAFC();
    const { holidays } = useHolidays();
    const { templates: commTemplates } = useCommunications();
    const { cameras: localCameras } = useCameras();
    const { communityExpenses } = useCommonExpenses();

    const [selectedEntity, setSelectedEntity] = useState<EntityType>('articulos_personal');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<ProcessingError[]>([]);
    const [isDryRun, setIsDryRun] = useState(true);
    const [stats, setStats] = useState({ created: 0, updated: 0, processed: 0, isSimulated: false });
    const [pendingSheets, setPendingSheets] = useState<{ entityValue: EntityType; label: string; data: any[]; selected: boolean }[]>([]);
    const [showSelectionPanel, setShowSelectionPanel] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<BulkUploadLog[]>([]);

    const entities: { value: EntityType; label: string; icon: any; requiredHeaders: string[]; description: string; category: string }[] = [
        { value: 'towers', label: 'Edificios (Torres)', icon: Building2, requiredHeaders: ['nombre'], description: 'Estructuras principales.', category: 'Infraestructura' },
        { value: 'tipos_unidad', label: 'Tipos de Unidad', icon: Tag, requiredHeaders: ['nombre'], description: 'Clasificación de unidades.', category: 'Infraestructura' },
        { value: 'departments', label: 'Departamentos (Unidades)', icon: Home, requiredHeaders: ['numero', 'torre'], description: 'Unidades vinculadas a torre.', category: 'Infraestructura' },
        { value: 'estacionamientos', label: 'Estacionamientos', icon: Smartphone, requiredHeaders: ['numero'], description: 'Plazas de estacionamiento.', category: 'Infraestructura' },
        { value: 'bancos', label: 'Bancos', icon: Landmark, requiredHeaders: ['nombre'], description: 'Instituciones bancarias.', category: 'Maestros Base' },
        { value: 'afps', label: 'AFPs', icon: FileText, requiredHeaders: ['nombre'], description: 'Fondos de pensiones.', category: 'Maestros Base' },
        { value: 'previsiones', label: 'Previsiones / Salud', icon: LifeBuoy, requiredHeaders: ['nombre'], description: 'Isapres y Fonasa.', category: 'Maestros Base' },
        { value: 'maestro_categorias_articulos', label: 'Categorías de Insumos', icon: Tag, requiredHeaders: ['nombre'], description: 'Clasificación para insumos.', category: 'Maestros Base' },
        { value: 'maestro_emergencias', label: 'Emergencias', icon: Phone, requiredHeaders: ['nombre', 'telefono'], description: 'Números de emergencia.', category: 'Maestros Base' },
        { value: 'residents', label: 'Residentes', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Habitantes actuales.', category: 'Comunidad' },
        { value: 'owners', label: 'Propietarios', icon: ShieldCheck, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Dueños legales.', category: 'Comunidad' },
        { value: 'personnel', label: 'Maestro Personal', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Personal operativo.', category: 'Operaciones' },
        { value: 'articulos_personal', label: 'Insumos y EPP', icon: Package, requiredHeaders: ['nombre'], description: 'Artículos de bodega.', category: 'Operaciones' },
        { value: 'assets', label: 'Activo Fijo', icon: Database, requiredHeaders: ['descripcion'], description: 'Bienes del condominio.', category: 'Operaciones' }
    ];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setStatus('idle');
            setMessage('');
            setErrors([]);
            setStats({ created: 0, updated: 0, processed: 0, isSimulated: false });
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const foundSheets: any[] = [];
                
                workbook.SheetNames.forEach((sheetName: string) => {
                    const entity = entities.find(ent => ent.label.toLowerCase() === sheetName.trim().toLowerCase());
                    if (entity) {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
                        if (jsonData.length > 0) {
                            foundSheets.push({ entityValue: entity.value, label: entity.label, data: jsonData, selected: true });
                        }
                    }
                });

                if (foundSheets.length > 0) {
                    setPendingSheets(foundSheets);
                    setShowSelectionPanel(true);
                    setMessage(`Se detectaron ${foundSheets.length} maestros en el archivo.`);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const processFile = async () => {
        if (!file) return;
        setStatus('processing');
        setErrors([]);
        
        let sheetsToProcess: { entity: EntityType; data: any[]; label: string }[] = [];
        if (pendingSheets.length > 0) {
            sheetsToProcess = pendingSheets.filter(ps => ps.selected).map(ps => ({ entity: ps.entityValue, data: ps.data, label: ps.label }));
        } else {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.SheetNames[0];
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
                sheetsToProcess = [{ entity: selectedEntity, data: jsonData, label: firstSheet }];
                await sendToBackend(sheetsToProcess);
            };
            reader.readAsArrayBuffer(file);
            return;
        }
        await sendToBackend(sheetsToProcess);
    };

    const sendToBackend = async (sheets: { entity: EntityType; data: any[]; label: string }[]) => {
        let totalCreated = 0, totalUpdated = 0, totalProcessed = 0;
        const allErrors: ProcessingError[] = [];
        setErrors([]);
        setStats({ created: 0, updated: 0, processed: 0, isSimulated: isDryRun });

        for (const sheet of sheets) {
            try {
                const response = await fetch(`${API_BASE_URL}/${sheet.entity}/upload?dryRun=${isDryRun}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: sheet.data })
                });

                const result = await response.json();
                if (response.ok) {
                    totalCreated += result.created || 0;
                    totalUpdated += result.updated || 0;
                    totalProcessed += result.processed || 0;
                    if (result.errors && result.errors.length > 0) {
                        allErrors.push(...result.errors.map((e: any) => ({ ...e, sheet: sheet.label })));
                    }
                } else {
                    allErrors.push({ row: 0, module: sheet.entity, error: result.error || 'Error de servidor', sheet: sheet.label });
                }
            } catch (err: any) {
                allErrors.push({ row: 0, module: sheet.entity, error: err.message, sheet: sheet.label });
            }
        }

        setStats({ created: totalCreated, updated: totalUpdated, processed: totalProcessed, isSimulated: isDryRun });
        setErrors(allErrors);
        setStatus('success');
        setMessage(allErrors.length > 0 
            ? `Finalizado con ${allErrors.length} advertencias${isDryRun ? ' (SIMULACIÓN)' : ''}.` 
            : `Carga finalizada con éxito${isDryRun ? ' (SIMULACIÓN)' : ''}.`);
        setFile(null);
        setPendingSheets([]);
    };

    const getEntityExportData = (entity: EntityType) => {
        let headers: string[] = [];
        let data: any[][] = [];

        switch (entity) {
            case 'articulos_personal': 
                headers = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'stock_minimo', 'activo']; 
                articles?.forEach((a: any) => data.push([a.name, a.description, a.category, a.price, a.stock, a.minStock, a.isActive ? 'SI' : 'NO']));
                break;
            case 'personnel': 
                headers = ['nombres', 'apellidos', 'rut', 'cargo', 'direccion', 'honorario', 'sueldo_base', 'dias_vacaciones', 'telefono', 'email']; 
                personnel?.forEach((p: any) => data.push([p.names, p.lastNames, p.dni, p.position, p.address, p.isHonorary ? 'SI' : 'NO', p.baseSalary, p.vacationDays, p.phone, p.email]));
                break;
            case 'residents': 
                headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono', 'integrantes', 'mascotas', 'arrendatario', 'monto_arriendo', 'observaciones'];
                residents?.forEach((r: any) => data.push([r.names, r.lastNames, r.dni, r.email, r.phone, r.familyCount, r.hasPets ? 'SI' : 'NO', r.isTenant ? 'SI' : 'NO', r.rentAmount, r.notes]));
                break;
            case 'owners': 
                headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono', 'notificaciones', 'ver_deudas'];
                owners?.forEach((o: any) => data.push([o.names, o.lastNames, o.dni, o.email, o.phone, o.receiveResidentNotifications ? 'SI' : 'NO', o.canResidentSeeArrears ? 'SI' : 'NO']));
                break;
            case 'towers': 
                headers = ['nombre'];
                towers?.forEach((t: any) => data.push([t.name]));
                break;
            case 'tipos_unidad': 
                headers = ['nombre', 'gasto_base', 'm2_defecto'];
                unitTypes?.forEach((u: any) => data.push([u.name, u.baseCommonExpense, u.defaultM2]));
                break;
            case 'departments': 
                headers = ['numero', 'piso', 'torre', 'tipo_unidad', 'm2', 'm2_terreno', 'valor', 'dormitorios', 'banos', 'estacionamientos', 'ano_construccion', 'disponible', 'tipo_publicacion', 'rol_sii'];
                departments?.forEach((d: any) => {
                    const towerName = towers?.find((t: any) => t.id === d.towerId)?.name || '';
                    const unitTypeName = unitTypes?.find((u: any) => u.id === d.unit_type_id)?.name || '';
                    data.push([ d.number, d.floor, towerName, unitTypeName, d.m2, d.terrainM2, d.value, d.dormitorios, d.banos, d.estacionamientos, d.yearBuilt, d.isAvailable ? 'SI' : 'NO', d.publishType, d.propertyRole ]);
                });
                break;
            case 'estacionamientos': 
                headers = ['numero', 'ubicacion', 'discapacitado', 'unidad'];
                parkings?.forEach((p: any) => {
                    const deptNum = departments?.find((d: any) => d.id === p.departmentId)?.number || '';
                    data.push([p.number, p.location, p.isHandicapped ? 'SI' : 'NO', deptNum]);
                });
                break;
            case 'bancos': 
                headers = ['nombre'];
                banks?.forEach((b: any) => data.push([b.name]));
                break;
            case 'afps': 
                headers = ['nombre', 'tasa'];
                funds?.forEach((f: any) => data.push([f.name, f.discountRate]));
                break;
            case 'previsiones': 
                headers = ['nombre', 'tipo', 'tasa'];
                providers?.forEach((p: any) => data.push([p.name, p.type, p.discountRate]));
                break;
            case 'maestro_categorias_articulos': 
                headers = ['nombre', 'descripcion'];
                parameters?.filter((p: any) => p.type === 'article_category').forEach((p: any) => data.push([p.name, p.description]));
                break;
            case 'maestro_emergencias': 
                headers = ['nombre', 'telefono', 'descripcion', 'categoria'];
                emergencyNumbers?.forEach((n: any) => data.push([n.name, n.phone, n.description, n.category]));
                break;
            case 'assets': 
                headers = ['descripcion', 'modelo', 'precio_compra', 'valor_depreciado', 'fecha_compra', 'detalles', 'cantidad'];
                assets?.forEach((a: any) => data.push([a.description, a.model, a.purchasePrice, a.depreciatedValue, a.purchaseDate, a.details, a.quantity]));
                break;
        }
        return [headers, ...data];
    };

    const downloadExcelTemplate = () => {
        const fullData = getEntityExportData(selectedEntity);
        const ws = XLSX.utils.aoa_to_sheet(fullData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `template_${selectedEntity}.xlsx`);
    };

    const fetchHistory = async () => {
        try {
            const resp = await fetch(`${API_BASE_URL}/bulk_upload_logs`);
            if (resp.ok) setHistory(await resp.json());
            setShowHistory(true);
        } catch (e) {
            console.error("Error fetching history", e);
        }
    };

    const deleteLog = async (id: string) => {
        if (!confirm('¿Eliminar este registro de auditoría?')) return;
        try {
            const resp = await fetch(`${API_BASE_URL}/bulk_upload_logs/${id}`, { method: 'DELETE' });
            if (resp.ok) setHistory(history.filter(log => log.id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 italic">
                        <Upload className="w-8 h-8 text-indigo-600" />
                        8.1.0 Carga Masiva (Backend-Driven)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-11 uppercase text-[10px] tracking-widest font-black italic">
                        Migrado a estándar SGC v1.0
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchHistory} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <History className="w-4 h-4 mr-2" />
                        Ver Historial de Cargas
                    </Button>
                    <Button variant="secondary" onClick={() => window.location.reload()} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        Refrescar
                    </Button>
                </div>
            </div>

            {/* Hierarchy Guide */}
            <div className="bg-indigo-600 shadow-2xl shadow-indigo-500/20 p-8 rounded-[3rem] text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Info className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Jerarquía de Carga Obligatoria</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {LOAD_HIERARCHY.map(h => (
                        <div key={h.step} className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10 relative group hover:bg-white/20 transition-all">
                            <span className="absolute -top-3 -left-3 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-black shadow-lg">{h.step}</span>
                            <h3 className="font-black text-sm mb-1 uppercase text-indigo-100">{h.title}</h3>
                            <p className="text-[10px] opacity-70 leading-tight">{h.description}</p>
                            {h.step < 4 && <ArrowRight className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-30" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Seleccionar Maestro</h3>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {Array.from(new Set(entities.map(e => e.category))).map((cat) => (
                                <div key={cat} className="space-y-2">
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 dark:border-indigo-900 pb-1 mb-2 italic">{cat}</div>
                                    <div className="space-y-1">
                                        {entities.filter(e => e.category === cat).map(ent => (
                                            <button
                                                key={ent.value}
                                                onClick={() => setSelectedEntity(ent.value)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedEntity === ent.value ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                            >
                                                <ent.icon className={`w-4 h-4 ${selectedEntity === ent.value ? 'text-white' : 'text-indigo-500'}`} />
                                                <span className="text-xs font-bold">{ent.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl min-h-[450px] flex flex-col items-center justify-center text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${status === 'processing' ? 'animate-pulse bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                            {status === 'success' ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <Upload className="w-12 h-12" />}
                        </div>
                        
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 italic">
                            {status === 'processing' ? 'Procesando Maestros...' : 'Cargador Universal SGC'}
                        </h2>
                        <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                            {message || 'Suba un archivo Excel. La resolución de relaciones y validaciones se ejecutarán en el servidor.'}
                        </p>

                        <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <input 
                                type="checkbox" 
                                id="dryRunToggle"
                                checked={isDryRun} 
                                onChange={(e) => setIsDryRun(e.target.checked)}
                                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                            />
                            <label htmlFor="dryRunToggle" className="text-xs font-black text-gray-700 dark:text-gray-300 cursor-pointer uppercase tracking-tighter">
                                Modo Simulación (Validar sin guardar cambios)
                            </label>
                        </div>

                        {!file && status !== 'processing' && (
                            <label className="group relative">
                                <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
                                <div className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform cursor-pointer">
                                    Seleccionar Excel
                                </div>
                            </label>
                        )}

                        {showSelectionPanel && (
                            <div className="mt-8 w-full bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800">
                                <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-4 tracking-tighter italic">Hojas Detectadas</h4>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {pendingSheets.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200">
                                            <input type="checkbox" checked={s.selected} onChange={() => {
                                                const up = [...pendingSheets]; up[idx].selected = !up[idx].selected; setPendingSheets(up);
                                            }} className="accent-indigo-600" />
                                            <span className="text-[10px] font-black truncate">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="secondary" onClick={() => { setFile(null); setShowSelectionPanel(false); }} className="rounded-2xl text-[10px]">Cancelar</Button>
                                    <Button onClick={processFile} className={`rounded-2xl text-[10px] ${isDryRun ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                        {isDryRun ? 'Ejecutar Validación' : 'Iniciar Carga Real'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-lg italic">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400">PROCESADOS</p>
                                    <p className="text-xl font-black">{stats.processed}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-emerald-600">{stats.isSimulated ? 'DETECTADOS NUEVOS' : 'CREADOS'}</p>
                                    <p className="text-xl font-black text-emerald-600">{stats.created}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-600">{stats.isSimulated ? 'DETECTADOS EXISTENTES' : 'ACTUALIZADOS'}</p>
                                    <p className="text-xl font-black text-blue-600">{stats.updated}</p>
                                </div>
                            </div>
                        )}

                        {errors.length > 0 && (
                            <div className="mt-8 w-full text-left bg-red-50 p-6 rounded-[2rem] border border-red-100">
                                <h4 className="text-xs font-black text-red-600 uppercase mb-4 flex items-center gap-2 italic">
                                    <XCircle className="w-4 h-4" /> Errores Estructurados ({errors.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {errors.map((e, idx) => (
                                        <div key={idx} className="text-[10px] border-b border-red-200 pb-2 italic">
                                            <div className="flex justify-between font-black mb-1">
                                                <span>FILA {e.row} - [{e.sheet}]</span>
                                                <span className="text-red-800 uppercase">{e.module}</span>
                                            </div>
                                            <p className="text-red-700 font-bold">{e.error}</p>
                                            <p className="opacity-50 mt-1 truncate">VALOR: {e.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between p-2">
                        <Button variant="secondary" onClick={downloadExcelTemplate} className="text-[10px] font-black h-10 px-6 rounded-2xl italic">
                            <Download className="w-3 h-3 mr-2" /> Plantilla de {selectedEntity.toUpperCase()}
                        </Button>
                        <Button variant="secondary" onClick={() => window.open(API_BASE_URL + '/health')} className="text-[10px] font-black h-10 px-6 rounded-2xl italic">
                            <CheckCircle2 className="w-3 h-3 mr-2" /> Verificar Salud API
                        </Button>
                    </div>
                </div>
            </div>

            {/* History Overlay */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black italic flex items-center gap-3">
                                <History className="w-6 h-6 text-indigo-600" />
                                Historial de Auditoría (8.1.0)
                            </h2>
                            <Button variant="secondary" onClick={() => setShowHistory(false)} className="rounded-2xl">Cerrar</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">No hay registros de carga real disponibles.</div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(log => (
                                        <div key={log.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 group relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                            log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                                                            log.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase italic">{log.module}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white">
                                                        {new Date(log.created_at).toLocaleString('es-CL')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen</p>
                                                    <p className="text-sm font-black">+{log.created} | ~{log.updated}</p>
                                                </div>
                                            </div>
                                            {log.errors && log.errors.length > 0 && (
                                                <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-50 dark:border-red-900/10">
                                                    <p className="text-[10px] font-black text-red-600 mb-2 uppercase flex items-center gap-2 italic">
                                                        <AlertTriangle className="w-3 h-3" /> {log.errors.length} Errores registrados
                                                    </p>
                                                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                        {log.errors.map((e, idx) => (
                                                            <p key={idx} className="text-[10px] text-gray-500 italic border-l-2 border-red-200 pl-2">
                                                                Fila {e.row}: <span className="text-red-800 font-bold">{e.error}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => deleteLog(log.id)}
                                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
