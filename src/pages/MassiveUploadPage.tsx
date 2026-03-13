import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useArticles } from '../context/ArticleContext';
import { usePersonnel } from '../context/PersonnelContext';
import { useResidents } from '../context/ResidentContext';
import { useOwners } from '../context/OwnerContext';
import { useBanks } from '../context/BankContext';
import { useFixedAssets } from '../context/FixedAssetContext';
import { useHealthProviders } from '../context/HealthProviderContext';
import { usePensionFunds } from '../context/PensionFundContext';
import { useSpecialConditions } from '../context/SpecialConditionContext';
import { useUnitTypes } from '../context/UnitTypeContext';
import { useCommonExpenses } from '../context/CommonExpenseContext';
import { Upload, Download, FileSpreadsheet, AlertCircle, Info, CheckCircle2, XCircle, History, Database, FileText, Package, Users, ShieldCheck, Building2, Landmark, LifeBuoy, AlertTriangle, Banknote } from 'lucide-react';

import * as XLSX from 'xlsx';

type EntityType = 'articles' | 'personnel' | 'residents' | 'owners' | 'banks' | 'assets' | 'health' | 'afp' | 'conditions' | 'units' | 'extra_funds' | 'income' | 'community_expenses';

interface ProcessingError {
    row: number;
    message: string;
}

export const MassiveUploadPage: React.FC = () => {
    const [selectedEntity, setSelectedEntity] = useState<EntityType>('articles');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<ProcessingError[]>([]);
    const [successCount, setSuccessCount] = useState(0);

    const { articles, addArticle, updateArticle } = useArticles();
    const { personnel, addPersonnel, updatePersonnel } = usePersonnel();
    const { residents, addResident, updateResident } = useResidents();
    const { owners, addOwner, updateOwner } = useOwners();
    const { banks, addBank, updateBank } = useBanks();
    const { assets, addAsset, updateAsset } = useFixedAssets();
    const { providers, addProvider, updateProvider } = useHealthProviders();
    const { funds, addFund, updateFund } = usePensionFunds();
    const { conditions, addCondition, updateCondition } = useSpecialConditions();
    const { unitTypes, addUnitType, updateUnitType } = useUnitTypes();
    const { funds: specialFunds, addFund: addSpecialFund, updateFund: updateSpecialFund, addPayment: addIncome, communityExpenses, addCommunityExpense } = useCommonExpenses();

    const entities: { value: EntityType; label: string; icon: any; requiredHeaders: string[]; description: string }[] = [
        { value: 'articles', label: 'Insumos y EPP', icon: Package, requiredHeaders: ['nombre'], description: 'Artículos de bodega, insumos de aseo y elementos de protección personal.' },
        { value: 'personnel', label: 'Maestro Personal', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Funcionarios, conserjes, mayordomos y personal de aseo.' },
        { value: 'residents', label: 'Residentes', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Habitantes actuales de las unidades del condominio (arrendatarios o dueños que viven ahí).' },
        { value: 'owners', label: 'Propietarios', icon: ShieldCheck, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Dueños legales de las unidades. Si viven en el condominio, también deben estar en Residentes.' },
        { value: 'units', label: 'Tipos de Unidad', icon: Building2, requiredHeaders: ['nombre'], description: 'Clasificación de las unidades (Unidad, Bodega, Estacionamiento) con su gasto base y m2.' },
        { value: 'banks', label: 'Bancos', icon: Landmark, requiredHeaders: ['nombre'], description: 'Instituciones bancarias para los pagos de remuneraciones.' },
        { value: 'assets', label: 'Activo Fijo', icon: Database, requiredHeaders: ['descripcion'], description: 'Bienes del condominio sujetos a depreciación y control de inventario valorizado.' },
        { value: 'health', label: 'Previsiones / Salud', icon: LifeBuoy, requiredHeaders: ['nombre'], description: 'Isapres y Fonasa para el cálculo de remuneraciones.' },
        { value: 'afp', label: 'AFPs', icon: FileText, requiredHeaders: ['nombre'], description: 'Administradoras de Fondos de Pensiones vigentes.' },
        { value: 'conditions', label: 'Condiciones Especiales', icon: ShieldCheck, requiredHeaders: ['nombre'], description: 'Condiciones médicas o de movilidad reducida de los residentes.' },
        { value: 'extra_funds', label: 'Maestro Fondos Especiales', icon: Landmark, requiredHeaders: ['nombre', 'codigo_fondo'], description: 'Fondos de reserva, emergencia u otros fondos especiales del condominio.' },
        { value: 'income', label: 'Carga Ingresos (Pagos GC)', icon: Banknote, requiredHeaders: ['rut', 'monto', 'mes', 'año'], description: 'Carga masiva de pagos realizados por residentes para saldar deudas de gastos comunes.' },
        { value: 'community_expenses', label: 'Carga Egresos (Gastos Comunes)', icon: Landmark, requiredHeaders: ['descripcion', 'monto', 'fecha'], description: 'Egresos mensuales que componen el gasto común (Mantenimiento, Servicios, etc).' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
            setErrors([]);
            setSuccessCount(0);
        }
    };

    const processFile = async () => {
        if (!file) return;

        setStatus('processing');
        setErrors([]);
        setSuccessCount(0);
        
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

                if (jsonData.length === 0) throw new Error('El archivo está vacío o no tiene el formato correcto.');

                // 1. Validate Headers
                const firstRow = jsonData[0] as any;
                const fileHeaders = Object.keys(firstRow).map(h => h.trim().toLowerCase());
                const entityConfig = entities.find(e => e.value === selectedEntity);
                
                const missingHeaders = entityConfig?.requiredHeaders.filter(h => !fileHeaders.includes(h));
                
                if (missingHeaders && missingHeaders.length > 0) {
                    throw new Error(`Faltan columnas obligatorias: ${missingHeaders.join(', ')}`);
                }

                let currentSuccess = 0;
                let currentErrors: ProcessingError[] = [];

                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i] as any;
                    const rowNumber = i + 2; // +1 zero base, +1 headers

                    const obj: any = {};
                    Object.keys(row).forEach(key => {
                        obj[key.trim().toLowerCase()] = row[key];
                    });

                    try {
                        // 2. Data Validation
                        switch (selectedEntity) {
                            case 'articles':
                                if (!obj.nombre) throw new Error('Nombre del artículo es obligatorio');
                                const existingArticle = articles.find(a => a.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                const articleData = {
                                    name: String(obj.nombre),
                                    description: String(obj.descripcion || ''),
                                    category: (obj.categoria || 'EPP') as any,
                                    price: Number(obj.precio || 0),
                                    stock: Number(obj.stock || 0),
                                    minStock: Number(obj.stock_minimo || 0),
                                    isActive: obj.activo === 'SI' || obj.activo === true
                                };
                                if (existingArticle) {
                                    await updateArticle({ ...existingArticle, ...articleData });
                                } else {
                                    await addArticle(articleData);
                                }
                                break;
                            case 'personnel':
                                if (!obj.nombres || !obj.rut) throw new Error('Nombres y RUT son obligatorios');
                                const existingPerson = personnel.find(p => p.dni === String(obj.rut));
                                const personData = {
                                    names: String(obj.nombres),
                                    lastNames: String(obj.apellidos || ''),
                                    dni: String(obj.rut),
                                    position: String(obj.cargo || ''),
                                    address: String(obj.direccion || ''),
                                    isHonorary: obj.honorario === 'SI' || obj.honorario === true,
                                    baseSalary: Number(obj.sueldo_base || 0),
                                    vacationDays: Number(obj.dias_vacaciones || 0),
                                    phone: String(obj.telefono || ''),
                                    email: String(obj.email || '')
                                };
                                if (existingPerson) {
                                    await updatePersonnel({ ...existingPerson, ...personData });
                                } else {
                                    await addPersonnel({ ...personData, hasEmergencyContact: false });
                                }
                                break;
                            case 'residents':
                                if (!obj.nombres || !obj.rut) throw new Error('Nombres y RUT son obligatorios');
                                const existingResident = residents.find(r => r.dni === String(obj.rut));
                                const residentData = {
                                    names: String(obj.nombres),
                                    lastNames: String(obj.apellidos || ''),
                                    dni: String(obj.rut),
                                    email: String(obj.email || ''),
                                    phone: String(obj.telefono || ''),
                                    familyCount: Number(obj.integrantes || 1),
                                    hasPets: obj.mascotas === 'SI' || obj.mascotas === true,
                                    isTenant: obj.arrendatario === 'SI' || obj.arrendatario === true
                                };
                                if (existingResident) {
                                    await updateResident({ ...existingResident, ...residentData });
                                } else {
                                    await addResident({ ...residentData, conditionIds: [] });
                                }
                                break;
                            case 'owners':
                                if (!obj.nombres || !obj.rut) throw new Error('Nombres y RUT son obligatorios');
                                const existingOwner = owners.find(o => o.dni === String(obj.rut));
                                const ownerData = {
                                    names: String(obj.nombres),
                                    lastNames: String(obj.apellidos || ''),
                                    dni: String(obj.rut),
                                    email: String(obj.email || ''),
                                    phone: String(obj.telefono || '')
                                };
                                if (existingOwner) {
                                    await updateOwner({ ...existingOwner, ...ownerData });
                                } else {
                                    await addOwner(ownerData);
                                }
                                break;
                            case 'units':
                                if (!obj.nombre) throw new Error('Nombre del tipo de unidad es obligatorio');
                                const existingUnit = unitTypes.find(u => u.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                const unitData = {
                                    name: String(obj.nombre),
                                    baseCommonExpense: Number(obj.gasto_base || 0),
                                    defaultM2: Number(obj.m2 || 60)
                                };
                                if (existingUnit) {
                                    await updateUnitType({ ...existingUnit, ...unitData });
                                } else {
                                    await addUnitType(unitData);
                                }
                                break;
                            case 'banks':
                                if (!obj.nombre) throw new Error('Nombre del banco es obligatorio');
                                const existingBank = banks.find(b => b.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                if (existingBank) {
                                    await updateBank({ ...existingBank, name: String(obj.nombre) });
                                } else {
                                    await addBank({ name: String(obj.nombre) });
                                }
                                break;
                            case 'assets':
                                if (!obj.descripcion) throw new Error('Descripción del activo es obligatorio');
                                const existingAsset = assets.find(a => a.description.toLowerCase() === String(obj.descripcion).toLowerCase());
                                const assetData = {
                                    description: String(obj.descripcion),
                                    model: String(obj.modelo || ''),
                                    purchasePrice: Number(obj.precio_compra || 0),
                                    depreciatedValue: Number(obj.valor_depreciado || 0),
                                    purchaseDate: String(obj.fecha_compra || new Date().toISOString().split('T')[0]),
                                    details: String(obj.detalles || ''),
                                    quantity: Number(obj.cantidad || 1),
                                    isActive: true
                                };
                                if (existingAsset) {
                                    await updateAsset({ ...existingAsset, ...assetData });
                                } else {
                                    await addAsset(assetData);
                                }
                                break;
                            case 'health':
                                if (!obj.nombre) throw new Error('Nombre de la previsión es obligatorio');
                                const existingProvider = providers.find(p => p.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                const providerData = {
                                    name: String(obj.nombre),
                                    type: (obj.tipo || 'isapre') as any,
                                    discountRate: Number(obj.tasa || 7)
                                };
                                if (existingProvider) {
                                    await updateProvider({ ...existingProvider, ...providerData });
                                } else {
                                    await addProvider(providerData);
                                }
                                break;
                            case 'afp': {
                                if (!obj.nombre) throw new Error('Nombre de la AFP es obligatorio');
                                const existingAFPFund = funds.find(f => f.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                const fundData = {
                                    name: String(obj.nombre),
                                    discountRate: Number(obj.tasa || 0)
                                };
                                if (existingAFPFund) {
                                    await updateFund({ ...existingAFPFund, ...fundData });
                                } else {
                                    await addFund(fundData);
                                }
                                break;
                            }
                            case 'conditions': {
                                if (!obj.nombre) throw new Error('Nombre de la condición es obligatorio');
                                const existingCondition = conditions.find(c => c.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                const conditionData = {
                                    name: String(obj.nombre),
                                    description: String(obj.descripcion || '')
                                };
                                if (existingCondition) {
                                    await updateCondition({ ...existingCondition, ...conditionData });
                                } else {
                                    await addCondition(conditionData);
                                }
                                break;
                            }
                            case 'extra_funds': {
                                if (!obj.nombre || obj.codigo_fondo === undefined) throw new Error('Nombre y Código de Fondo son obligatorios');
                                const existingSpecialFund = specialFunds.find(f => f.fundCode === Number(obj.codigo_fondo));
                                const extraFundData = {
                                    name: String(obj.nombre),
                                    description: String(obj.descripcion || ''),
                                    fundCode: Number(obj.codigo_fondo),
                                    type: (obj.tipo || 'reserve') as any,
                                    totalAmountPerUnit: Number(obj.monto_por_unidad || 0),
                                    isActive: true,
                                    deadline: obj.fecha_limite ? String(obj.deadline) : undefined
                                };
                                if (existingSpecialFund) {
                                    await updateSpecialFund({ ...existingSpecialFund, ...extraFundData });
                                } else {
                                    await addSpecialFund(extraFundData);
                                }
                                break;
                            }
                            case 'income':
                                if (!obj.rut || !obj.monto || !obj.mes || !obj.año) throw new Error('RUT, Monto, Mes y Año son obligatorios');
                                const resident = residents.find(r => r.dni === String(obj.rut));
                                if (!resident) throw new Error(`Residente con RUT ${obj.rut} no encontrado`);
                                await addIncome({
                                    departmentId: resident.unitId || 'unknown',
                                    amountPaid: Number(obj.monto),
                                    periodMonth: Number(obj.mes),
                                    periodYear: Number(obj.año),
                                    paymentDate: obj.fecha_pago ? String(obj.fecha_pago) : new Date().toISOString().split('T')[0],
                                    status: 'paid',
                                    paymentMethod: String(obj.metodo_pago || 'Transferencia'),
                                    isElectronic: true,
                                    notes: 'Carga masiva de implementación'
                                });
                                break;
                            case 'community_expenses':
                                if (!obj.descripcion || !obj.monto || !obj.fecha) throw new Error('Descripción, Monto y Fecha son obligatorios');
                                await addCommunityExpense({
                                    description: String(obj.descripcion),
                                    amount: Number(obj.monto),
                                    date: String(obj.fecha),
                                    category: (obj.categoria || 'Mantenimiento') as any,
                                    isRecurring: obj.recurrente === 'SI' || obj.recurrente === true,
                                    status: 'paid'
                                });
                                break;
                        }
                        currentSuccess++;
                    } catch (err: any) {
                        currentErrors.push({
                            row: rowNumber,
                            message: err.message || 'Error desconocido'
                        });
                    }
                }

                setSuccessCount(currentSuccess);
                setErrors(currentErrors);
                setStatus('success');
                setMessage(currentErrors.length > 0 
                    ? `Carga completada con algunas advertencias.` 
                    : `Carga exitosa de ${currentSuccess} registros.`);
                setFile(null);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Error crítico al procesar el archivo.');
            }
        };

        reader.onerror = () => {
            setStatus('error');
            setMessage('Error al leer el archivo desde el disco.');
        };

        reader.readAsArrayBuffer(file);
    };

    const downloadExcelTemplate = () => {
        const entityConfig = entities.find(e => e.value === selectedEntity);
        if (!entityConfig) return;
        
        // Ensure data is fresh by using what's in context
        // If the array is empty but we know there should be data, we might need to wait for fetch
        
        let headers: string[] = [];
        switch (selectedEntity) {
            case 'articles': headers = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'stock_minimo', 'activo']; break;
            case 'personnel': headers = ['nombres', 'apellidos', 'rut', 'cargo', 'direccion', 'honorario', 'sueldo_base', 'dias_vacaciones', 'telefono', 'email']; break;
            case 'residents': headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono', 'integrantes', 'mascotas', 'arrendatario']; break;
            case 'owners': headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono']; break;
            case 'units': headers = ['nombre', 'gasto_base', 'm2']; break;
            case 'banks': headers = ['nombre']; break;
            case 'assets': headers = ['descripcion', 'modelo', 'precio_compra', 'valor_depreciado', 'fecha_compra', 'detalles', 'cantidad']; break;
            case 'health': headers = ['nombre', 'tipo', 'tasa']; break;
            case 'afp': headers = ['nombre', 'tasa']; break;
            case 'conditions': headers = ['nombre', 'descripcion']; break;
            case 'extra_funds': headers = ['nombre', 'descripcion', 'codigo_fondo', 'tipo', 'monto_por_unidad', 'deadline']; break;
            case 'income': headers = ['rut', 'monto', 'mes', 'año', 'fecha_pago', 'metodo_pago']; break;
            case 'community_expenses': headers = ['descripcion', 'monto', 'fecha', 'categoria', 'recurrente']; break;
        }

        let data: any[][] = [headers];

        switch (selectedEntity) {
            case 'articles':
                articles.forEach(a => data.push([a.name, a.description, a.category, a.price, a.stock, a.minStock, a.isActive ? 'SI' : 'NO']));
                break;
            case 'personnel':
                personnel.forEach(p => data.push([p.names, p.lastNames, p.dni, p.position, p.address, p.isHonorary ? 'SI' : 'NO', p.baseSalary, p.vacationDays, p.phone, p.email]));
                break;
            case 'residents':
                residents.forEach(r => data.push([r.names, r.lastNames, r.dni, r.email, r.phone, r.familyCount, r.hasPets ? 'SI' : 'NO', r.isTenant ? 'SI' : 'NO']));
                break;
            case 'owners':
                owners.forEach(o => data.push([o.names, o.lastNames, o.dni, o.email, o.phone]));
                break;
            case 'units':
                unitTypes.forEach(u => data.push([u.name, u.baseCommonExpense, u.defaultM2]));
                break;
            case 'banks':
                banks.forEach(b => data.push([b.name]));
                break;
            case 'assets':
                assets.forEach(a => data.push([a.description, a.model, a.purchasePrice, a.depreciatedValue, a.purchaseDate, a.details, a.quantity]));
                break;
            case 'health':
                providers.forEach(p => data.push([p.name, p.type, p.discountRate]));
                break;
            case 'afp':
                funds.forEach(f => data.push([f.name, f.discountRate]));
                break;
            case 'conditions':
                conditions.forEach(c => data.push([c.name, c.description]));
                break;
            case 'extra_funds':
                specialFunds.forEach(f => data.push([f.name, f.description, f.fundCode, f.type, f.totalAmountPerUnit, f.deadline || '']));
                break;
            case 'community_expenses':
                communityExpenses.forEach(e => data.push([e.description, e.amount, e.date, e.category, e.isRecurring ? 'SI' : 'NO']));
                break;
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        XLSX.writeFile(wb, `maestro_${selectedEntity}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const refreshData = async () => {
        // Simple trick to force a refresh of all masters used here
        // In a real app with react-query this would be invalidateQueries
        window.location.reload(); 
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 italic">
                        <Upload className="w-8 h-8 text-indigo-600" />
                        Gestión Masiva de Maestros
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium ml-11 uppercase text-[10px] tracking-widest font-black">
                        Carga y Descarga de información crítica del sistema
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={refreshData} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <History className="w-4 h-4 mr-2" />
                        Refrescar Datos
                    </Button>
                </div>
            </div>

            <div className="bg-indigo-600 dark:bg-indigo-900 shadow-2xl shadow-indigo-500/20 p-8 rounded-[3rem] mb-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform">
                    <Database className="w-48 h-48" />
                </div>
                <div className="flex gap-6 items-start relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Info className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight mb-2">Reseña de Operación Masiva</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-indigo-50">
                            <div className="space-y-2">
                                <p className="text-sm font-black flex items-center gap-2">
                                    <Download className="w-4 h-4" /> DESCARGA DE MAESTRO
                                </p>
                                <p className="text-xs opacity-80 leading-relaxed">
                                    Permite exportar la base de datos actual a Excel. Es ideal para realizar auditorías, 
                                    limpieza de datos o para usarla como base para nuevas cargas. 
                                    <span className="block mt-1 text-white font-bold">Si el archivo aparece vacío, asegúrese de tener registros creados en el módulo correspondiente.</span>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> CARGA DE DATOS
                                </p>
                                <p className="text-xs opacity-80 leading-relaxed">
                                    El sistema procesará su archivo validando que el RUT sea correcto y que no existan duplicados críticos. 
                                    Los campos vacíos pueden generar errores de validación. 
                                    Se recomienda descargar la plantilla primero.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-amber-900 uppercase tracking-tight mb-2">Herramienta de Carga de Implementación</h2>
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            Esta funcionalidad está diseñada exclusivamente para la <strong>fase de implementación inicial</strong> del sistema por parte del Superadmin. 
                            Su propósito es poblar la base de datos de manera masiva y rápida. 
                            <br /><br />
                            <span className="bg-amber-200/50 px-2 py-0.5 rounded font-black text-amber-950">¡ATENCIÓN!</span> 
                            Cualquier dato cargado que ya exista (identificado por RUT o Nombre) será <strong>puesto a cero o sobreescrito (pisado)</strong> con la nueva información del archivo. 
                            Use esta herramienta con precaución, ya que la integridad de los datos históricos manuales podría verse afectada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Paso 1: Seleccionar Maestro</h3>
                        <div className="space-y-2">
                            {entities.map((entity) => (
                                <button
                                    key={entity.value}
                                    onClick={() => setSelectedEntity(entity.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedEntity === entity.value
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-950'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <entity.icon className="w-4 h-4" />
                                    <span className="text-sm font-bold">{entity.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Seguridad y Validación</h4>
                                <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                                    El sistema valida que todas las columnas requeridas existan y que no haya datos vacíos en campos críticos (RUT, Nombres, etc.).
                                </p>
                                <div className="mt-3 flex flex-col gap-2">
                                    <button
                                        onClick={downloadExcelTemplate}
                                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black hover:underline"
                                    >
                                        <Download className="w-3 h-3" /> Descargar Plantilla (.xlsx)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all ${status === 'success' ? (errors.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600') :
                            status === 'error' ? 'bg-red-100 text-red-600' :
                                file ? 'bg-indigo-100 text-indigo-600 animate-bounce' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {status === 'success' ? (errors.length > 0 ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />) :
                                status === 'error' ? <XCircle className="w-12 h-12" /> :
                                    <Upload className="w-12 h-12" />}
                        </div>

                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            {status === 'success' ? (errors.length > 0 ? 'Carga con Advertencias' : '¡Carga Exitosa!') :
                                status === 'error' ? 'Error Crítico' :
                                    file ? file.name : 'Subir Archivo de Maestro'}
                        </h2>

                        <p className="text-gray-500 text-sm text-center max-w-sm mb-8 font-medium">
                            {message}
                            {!file && status === 'idle' && 'Seleccione un archivo Excel para validar y cargar los datos.'}
                        </p>

                        {!file && status !== 'processing' && (
                            <label className="cursor-pointer">
                                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                                <div className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform active:scale-95">
                                    {status === 'success' || status === 'error' ? 'Seleccionar otro archivo' : 'Seleccionar Archivo'}
                                </div>
                            </label>
                        )}

                        {file && status === 'processing' && (
                            <div className="flex flex-col items-center gap-4">
                                <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></span>
                                <span className="font-black text-gray-600 uppercase text-xs tracking-widest">Validando y Procesando...</span>
                            </div>
                        )}

                        {file && status === 'idle' && (
                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={() => setFile(null)}>Cancelar</Button>
                                <Button onClick={processFile}>
                                    Validar y Cargar
                                </Button>
                            </div>
                        )}

                        {/* Error Report */}
                        {errors.length > 0 && (
                            <div className="mt-8 w-full max-w-md bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/20">
                                <h4 className="text-xs font-black text-red-800 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Errores encontrados ({errors.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                    {errors.map((err, idx) => (
                                        <div key={idx} className="text-[10px] text-red-700 dark:text-red-500 flex justify-between">
                                            <span className="font-bold">Fila {err.row}:</span>
                                            <span>{err.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {successCount > 0 && status === 'success' && (
                            <div className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                ✓ {successCount} registros procesados correctamente.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Maestro Destino</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white italic">
                                {entities.find(e => e.value === selectedEntity)?.label}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Columnas Obligatorias</p>
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                {entities.find(e => e.value === selectedEntity)?.requiredHeaders.join(', ').toUpperCase()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm md:col-span-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descripción del Maestro</p>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {entities.find(e => e.value === selectedEntity)?.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
