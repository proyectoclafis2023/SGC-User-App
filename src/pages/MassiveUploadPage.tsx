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
import { Upload, Download, AlertCircle, Info, CheckCircle2, XCircle, History, Database, FileText, Package, Users, ShieldCheck, Building2, Landmark, LifeBuoy, AlertTriangle, Banknote, Home, Tag, LineChart, Phone, Mail, Smartphone } from 'lucide-react';
import type { 
    Article, Personnel, Resident, Owner, Bank, FixedAsset, HealthProvider, 
    PensionFund, SpecialCondition, UnitType, Tower, Department, 
    CommonSpace, Parking, SystemParameter, 
    InfrastructureItem, EquipmentItem, SystemMessage, EmergencyNumber,
    CommunityExpense, SpecialFund
} from '../types';
import type { IPCProjection } from '../context/IPCProjectionContext';
import { useInfrastructure } from '../context/InfrastructureContext';
import { useCommonSpaces } from '../context/CommonSpaceContext';
import { useParkings } from '../context/ParkingContext';
import { useSystemParameters } from '../context/SystemParameterContext';
import { useIPCProjections } from '../context/IPCProjectionContext';
import { useInfrastructureItems } from '../context/InfrastructureItemContext';
import { useEquipmentItems } from '../context/EquipmentItemContext';
import { useSystemMessages } from '../context/SystemMessageContext';
import { useEmergencyNumbers } from '../context/EmergencyNumberContext';

import * as XLSX from 'xlsx';

type EntityType = 'articles' | 'personnel' | 'residents' | 'owners' | 'banks' | 'assets' | 'health' | 'afp' | 'conditions' | 'units' | 'extra_funds' | 'income' | 'community_expenses' | 'towers' | 'departments' | 'common_spaces' | 'parking' | 'article_categories' | 'ipc' | 'infra_items' | 'equip_items' | 'messages' | 'emergency_numbers';

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
    const [pendingSheets, setPendingSheets] = useState<{ entityValue: EntityType; label: string; data: any[]; selected: boolean }[]>([]);
    const [showSelectionPanel, setShowSelectionPanel] = useState(false);

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
    const { towers, addTower, updateTower, departments, addDepartment, updateDepartment } = useInfrastructure();
    const { spaces, addSpace, updateSpace } = useCommonSpaces();
    const { parkings, addParking, updateParking } = useParkings();
    const { parameters, addParameter, updateParameter } = useSystemParameters();
    const { projections, addProjection, updateProjection } = useIPCProjections();
    const { items: infraItems, addItem: addInfraItem, updateItem: updateInfraItem } = useInfrastructureItems();
    const { items: equipItems, addItem: addEquipItem, updateItem: updateEquipItem } = useEquipmentItems();
    const { messages: systemMessages, addMessage: addSystemMessage, updateMessage: updateSystemMessage } = useSystemMessages();
    const { numbers: emergencyNumbers, addNumber, updateNumber } = useEmergencyNumbers();

    const entities: { value: EntityType; label: string; icon: any; requiredHeaders: string[]; description: string; category: string }[] = [
        // Operaciones y Soporte
        { value: 'infra_items', label: 'Bitácora (Instalaciones)', icon: Building2, requiredHeaders: ['nombre'], description: 'Puntos de control para la bitácora de instalaciones (Ascensores, Bombas, etc).', category: 'Operaciones y Soporte' },
        { value: 'equip_items', label: 'Bitácora (Equipamiento)', icon: Smartphone, requiredHeaders: ['nombre'], description: 'Puntos de control para equipamiento crítico (Cámaras, Radios, etc).', category: 'Operaciones y Soporte' },
        { value: 'emergency_numbers', label: 'Números Emergencia', icon: Phone, requiredHeaders: ['nombre', 'telefono'], description: 'Directorio de servicios de emergencia y soporte técnico.', category: 'Operaciones y Soporte' },
        { value: 'common_spaces', label: 'Espacios Comunes', icon: Landmark, requiredHeaders: ['nombre', 'ubicacion'], description: 'Áreas de uso común como quinchos, gimnasios o salas multiuso.', category: 'Operaciones y Soporte' },
        
        // Comunidad
        { value: 'residents', label: 'Residentes', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Habitantes actuales de las unidades del condominio.', category: 'Comunidad y Administración' },
        { value: 'owners', label: 'Propietarios', icon: ShieldCheck, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Dueños legales de las unidades.', category: 'Comunidad y Administración' },
        { value: 'conditions', label: 'Condiciones Especiales', icon: ShieldCheck, requiredHeaders: ['nombre'], description: 'Condiciones médicas o de movilidad reducida.', category: 'Comunidad y Administración' },
        { value: 'messages', label: 'Mensajes del Sistema', icon: Mail, requiredHeaders: ['contenido'], description: 'Avisos del sistema para la marquesina o avisos generales.', category: 'Comunidad y Administración' },

        // Recursos Humanos y Maestros
        { value: 'personnel', label: 'Maestro Personal', icon: Users, requiredHeaders: ['nombres', 'apellidos', 'rut'], description: 'Funcionarios, conserjes y personal operativo.', category: 'Recursos Humanos' },
        { value: 'articles', label: 'Insumos y EPP', icon: Package, requiredHeaders: ['nombre'], description: 'Artículos de bodega y elementos de protección.', category: 'Recursos Humanos' },
        { value: 'article_categories', label: 'Categorías de Insumos', icon: Tag, requiredHeaders: ['nombre'], description: 'Clasificación para el maestro de insumos.', category: 'Recursos Humanos' },
        { value: 'health', label: 'Previsiones / Salud', icon: LifeBuoy, requiredHeaders: ['nombre'], description: 'Isapres y Fonasa.', category: 'Recursos Humanos' },
        { value: 'afp', label: 'AFPs', icon: FileText, requiredHeaders: ['nombre'], description: 'Administradoras de Fondos de Pensiones.', category: 'Recursos Humanos' },
        { value: 'banks', label: 'Bancos', icon: Landmark, requiredHeaders: ['nombre'], description: 'Instituciones bancarias.', category: 'Recursos Humanos' },

        // Infraestructura
        { value: 'towers', label: 'Edificios (Torres)', icon: Building2, requiredHeaders: ['nombre'], description: 'Estructuras principales del condominio.', category: 'Infraestructura' },
        { value: 'departments', label: 'Departamentos (Unidades)', icon: Home, requiredHeaders: ['numero', 'torre'], description: 'Unidades habitacionales vinculadas a una torre.', category: 'Infraestructura' },
        { value: 'parking', label: 'Estacionamientos', icon: Smartphone, requiredHeaders: ['numero'], description: 'Plazas de estacionamiento.', category: 'Infraestructura' },
        { value: 'units', label: 'Tipos de Unidad', icon: Building2, requiredHeaders: ['nombre'], description: 'Clasificación de las unidades (Unidad, Bodega, etc).', category: 'Infraestructura' },

        // Finanzas
        { value: 'community_expenses', label: 'Carga Egresos GC', icon: Landmark, requiredHeaders: ['descripcion', 'monto', 'fecha'], description: 'Egresos mensuales que componen el Gasto Común.', category: 'Finanzas y Contabilidad' },
        { value: 'income', label: 'Carga Ingresos Pagos', icon: Banknote, requiredHeaders: ['rut', 'monto', 'mes', 'año'], description: 'Carga de pagos realizados por residentes.', category: 'Finanzas y Contabilidad' },
        { value: 'extra_funds', label: 'Maestro Fondos Especiales', icon: Landmark, requiredHeaders: ['nombre', 'codigo_fondo'], description: 'Fondos de reserva o emergencia.', category: 'Finanzas y Contabilidad' },
        { value: 'assets', label: 'Activo Fijo', icon: Database, requiredHeaders: ['descripcion'], description: 'Bienes del condominio sujetos a depreciación.', category: 'Finanzas y Contabilidad' },
        { value: 'ipc', label: 'Maestro IPC', icon: LineChart, requiredHeaders: ['nombre', 'tasa'], description: 'Índices de corrección monetaria.', category: 'Finanzas y Contabilidad' },
    ];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setStatus('idle');
            setMessage('');
            setErrors([]);
            setSuccessCount(0);
            setPendingSheets([]);
            setShowSelectionPanel(false);

            // Pre-scan the file for multiple sheets
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const foundSheets: { entityValue: EntityType; label: string; data: any[]; selected: boolean }[] = [];
                
                workbook.SheetNames.forEach((sheetName: string) => {
                    const entity = entities.find(ent => ent.label.toLowerCase() === sheetName.trim().toLowerCase());
                    if (entity) {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
                        if (jsonData.length > 0) {
                            foundSheets.push({
                                entityValue: entity.value,
                                label: entity.label,
                                data: jsonData,
                                selected: true
                            });
                        }
                    }
                });

                if (foundSheets.length > 1) {
                    setPendingSheets(foundSheets);
                    setShowSelectionPanel(true);
                    setMessage(`Se encontraron ${foundSheets.length} maestros en el archivo. Seleccione cuáles desea cargar.`);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const processFile = async () => {
        if (!file) return;

        setStatus('processing');
        setErrors([]);
        setSuccessCount(0);
        setShowSelectionPanel(false);
        
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                let sheetsToProcess: { entity: EntityType; data: any[] }[] = [];

                if (pendingSheets.length > 0) {
                    sheetsToProcess = pendingSheets
                        .filter((ps: any) => ps.selected)
                        .map((ps: any) => ({ entity: ps.entityValue, data: ps.data }));
                } else {
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
                    if (jsonData.length === 0) throw new Error('El archivo está vacío o no tiene el formato correcto.');
                    sheetsToProcess = [{ entity: selectedEntity, data: jsonData }];
                }

                if (sheetsToProcess.length === 0) throw new Error('No hay maestros seleccionados para procesar.');

                let totalSuccess = 0;
                let allErrors: ProcessingError[] = [];

                for (const sheet of sheetsToProcess) {
                    const entityConfig = entities.find(ent => ent.value === sheet.entity);
                    const jsonData = sheet.data;

                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i] as any;
                        const rowNumber = i + 2; 

                        const obj: any = {};
                        Object.keys(row).forEach(key => {
                            obj[key.trim().toLowerCase()] = row[key];
                        });

                        try {
                            switch (sheet.entity) {
                                case 'articles':
                                    if (!obj.nombre) throw new Error('Nombre del artículo es obligatorio');
                                    const existingArticle = articles.find((a: Article) => a.name.toLowerCase() === String(obj.nombre).toLowerCase());
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
                                    const existingPerson = personnel.find((p: Personnel) => p.dni === String(obj.rut));
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
                                    const existingResident = residents.find((r: Resident) => r.dni === String(obj.rut));
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
                                    const existingOwner = owners.find((o: Owner) => o.dni === String(obj.rut));
                                    const ownerData = {
                                        names: String(obj.nombres),
                                        lastNames: String(obj.apellidos || ''),
                                        dni: String(obj.rut),
                                        email: String(obj.email || ''),
                                        phone: String(obj.telefono || ''),
                                        status: 'active' as any
                                    };
                                    if (existingOwner) {
                                        await updateOwner({ ...existingOwner, ...ownerData });
                                    } else {
                                        await addOwner(ownerData);
                                    }
                                    break;
                                case 'units':
                                    if (!obj.nombre) throw new Error('Nombre del tipo de unidad es obligatorio');
                                    const existingUnit = unitTypes.find((u: UnitType) => u.name.toLowerCase() === String(obj.nombre).toLowerCase());
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
                                    const existingBank = banks.find((b: Bank) => b.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    if (existingBank) {
                                        await updateBank({ ...existingBank, name: String(obj.nombre) });
                                    } else {
                                        await addBank({ name: String(obj.nombre) });
                                    }
                                    break;
                                case 'assets':
                                    if (!obj.descripcion) throw new Error('Descripción del activo es obligatorio');
                                    const existingAsset = assets.find((a: FixedAsset) => a.description.toLowerCase() === String(obj.descripcion).toLowerCase());
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
                                    const existingProvider = providers.find((p: HealthProvider) => p.name.toLowerCase() === String(obj.nombre).toLowerCase());
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
                                    const existingAFPFund = funds.find((f: PensionFund) => f.name.toLowerCase() === String(obj.nombre).toLowerCase());
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
                                    const existingCondition = conditions.find((c: SpecialCondition) => c.name.toLowerCase() === String(obj.nombre).toLowerCase());
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
                                    const existingSpecialFund = specialFunds.find((f: SpecialFund) => f.fundCode === Number(obj.codigo_fondo));
                                    const extraFundData = {
                                        name: String(obj.nombre),
                                        description: String(obj.descripcion || ''),
                                        fundCode: Number(obj.codigo_fondo),
                                        type: (obj.tipo || 'reserve') as any,
                                        totalAmountPerUnit: Number(obj.monto_por_unidad || 0),
                                        isActive: true,
                                        deadline: obj.fecha_limite ? String(obj.fecha_limite) : undefined
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
                                    const resident = residents.find((r: Resident) => r.dni === String(obj.rut));
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
                                        category: (obj.categoria || 'Otros') as any
                                    });
                                    break;
                                case 'towers':
                                    if (!obj.nombre) throw new Error('Nombre de la torre es obligatorio');
                                    const existingTower = towers.find((t: Tower) => t.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    if (existingTower) {
                                        await updateTower({ ...existingTower, name: String(obj.nombre) });
                                    } else {
                                        await addTower({ name: String(obj.nombre), departments: [] });
                                    }
                                    break;
                                case 'departments': {
                                    if (!obj.numero || !obj.torre) throw new Error('Número y Torre son obligatorios');
                                    const tower = towers.find((t: Tower) => t.name.toLowerCase() === String(obj.torre).toLowerCase());
                                    if (!tower) throw new Error(`Torre '${obj.torre}' no encontrada. Créela primero.`);
                                    
                                    const unitType = unitTypes.find((u: UnitType) => u.name.toLowerCase() === String(obj.tipo_unidad || '').toLowerCase());
                                    
                                    const existingDept = departments.find((d: Department) => d.number === String(obj.numero) && d.towerId === tower.id);
                                    const deptData = {
                                        number: String(obj.numero),
                                        floor: Number(obj.piso || 1),
                                        towerId: tower.id,
                                        unitTypeId: unitType?.id,
                                        m2: Number(obj.m2 || 60)
                                    };
                                    if (existingDept) {
                                        await updateDepartment({ ...existingDept, ...deptData });
                                    } else {
                                        await addDepartment(deptData);
                                    }
                                    break;
                                }
                                case 'common_spaces':
                                    if (!obj.nombre || !obj.ubicacion) throw new Error('Nombre y Ubicación son obligatorios');
                                    const existingSpace = spaces.find((s: CommonSpace) => s.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    const spaceData = {
                                        name: String(obj.nombre),
                                        location: String(obj.ubicacion),
                                        rentalValue: Number(obj.valor_arriendo || 0),
                                        durationHours: Number(obj.duracion || 1),
                                        conditions: String(obj.condiciones || '')
                                    };
                                    if (existingSpace) {
                                        await updateSpace({ ...existingSpace, ...spaceData });
                                    } else {
                                        await addSpace(spaceData);
                                    }
                                    break;
                                case 'parking': {
                                    if (!obj.numero) throw new Error('Número de estacionamiento es obligatorio');
                                    const existingParking = parkings.find((p: Parking) => p.number === String(obj.numero));
                                    const dept = departments.find((d: Department) => d.number === String(obj.unidad));
                                    const pData = {
                                        number: String(obj.numero),
                                        location: String(obj.ubicacion || ''),
                                        isHandicapped: obj.discapacitado === 'SI' || obj.discapacitado === true,
                                        departmentId: dept?.id,
                                        notes: String(obj.notas || '')
                                    };
                                    if (existingParking) {
                                        await updateParking({ ...existingParking, ...pData });
                                    } else {
                                        await addParking(pData);
                                    }
                                    break;
                                }
                                case 'article_categories':
                                    if (!obj.nombre) throw new Error('Nombre de la categoría es obligatorio');
                                    const existingCat = parameters.find((p: SystemParameter) => p.type === 'article_category' && p.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    if (existingCat) {
                                        await updateParameter(existingCat.id, { ...existingCat, name: String(obj.nombre), description: String(obj.descripcion || '') });
                                    } else {
                                        await addParameter({ type: 'article_category', name: String(obj.nombre), description: String(obj.descripcion || ''), isActive: true });
                                    }
                                    break;
                                case 'ipc':
                                    if (!obj.nombre || obj.tasa === undefined) throw new Error('Nombre y Tasa son obligatorios');
                                    const existingIPC = projections.find((p: IPCProjection) => p.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    const ipcData = {
                                        name: String(obj.nombre),
                                        ipcRate: Number(obj.tasa),
                                        description: String(obj.descripcion || ''),
                                        isActive: true
                                    };
                                    if (existingIPC) {
                                        await updateProjection({ ...existingIPC, ...ipcData });
                                    } else {
                                        await addProjection(ipcData);
                                    }
                                    break;
                                case 'infra_items':
                                    if (!obj.nombre) throw new Error('Nombre de la instalación es obligatorio');
                                    const existingInfra = infraItems.find((i: InfrastructureItem) => i.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    const infraData = {
                                        name: String(obj.nombre),
                                        isMandatory: obj.obligatorio === 'SI' || obj.obligatorio === true,
                                        isArchived: false
                                    };
                                    if (existingInfra) {
                                        await updateInfraItem({ ...existingInfra, ...infraData });
                                    } else {
                                        await addInfraItem(infraData);
                                    }
                                    break;
                                case 'equip_items':
                                    if (!obj.nombre) throw new Error('Nombre del equipamiento es obligatorio');
                                    const existingEquip = equipItems.find((e: EquipmentItem) => e.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    const equipData = {
                                        name: String(obj.nombre),
                                        isMandatory: obj.obligatorio === 'SI' || obj.obligatorio === true,
                                        isArchived: false
                                    };
                                    if (existingEquip) {
                                        await updateEquipItem({ ...existingEquip, ...equipData });
                                    } else {
                                        await addEquipItem(equipData);
                                    }
                                    break;
                                case 'messages':
                                    if (!obj.contenido) throw new Error('Contenido es obligatorio');
                                    const existingMsg = systemMessages.find((m: SystemMessage) => m.text.toLowerCase() === String(obj.contenido).toLowerCase());
                                    const msgData = {
                                        text: String(obj.contenido),
                                        type: (obj.tipo || 'info') as any,
                                        isActive: true
                                    };
                                    if (existingMsg) {
                                        await updateSystemMessage({ ...existingMsg, ...msgData });
                                    } else {
                                        await addSystemMessage(msgData);
                                    }
                                    break;
                                case 'emergency_numbers':
                                    if (!obj.nombre || !obj.telefono) throw new Error('Nombre y Teléfono son obligatorios');
                                    const existingNum = emergencyNumbers.find((n: EmergencyNumber) => n.name.toLowerCase() === String(obj.nombre).toLowerCase());
                                    const numData = {
                                        category: String(obj.categoria || 'General'),
                                        name: String(obj.nombre),
                                        phone: String(obj.telefono),
                                        description: String(obj.descripcion || '')
                                    };
                                    if (existingNum) {
                                        await updateNumber(existingNum.id, numData);
                                    } else {
                                        await addNumber(numData);
                                    }
                                    break;
                            }
                            totalSuccess++;
                        } catch (err: any) {
                            allErrors.push({
                                row: rowNumber,
                                message: `[${entityConfig?.label}] ${err.message || 'Error desconocido'}`
                            });
                        }
                    }
                }

                setSuccessCount(totalSuccess);
                setErrors(allErrors);
                setStatus('success');
                setMessage(allErrors.length > 0 
                    ? `Procesamiento finalizado con ${allErrors.length} advertencias.` 
                    : `Carga exitosa de ${totalSuccess} registros en total.`);
                setFile(null);
                setPendingSheets([]);
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

    const getEntityExportData = (entity: EntityType) => {
        let headers: string[] = [];
        let data: any[][] = [];

        switch (entity) {
            case 'articles': 
                headers = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'stock_minimo', 'activo']; 
                articles.forEach((a: Article) => data.push([a.name, a.description, a.category, a.price, a.stock, a.minStock, a.isActive ? 'SI' : 'NO']));
                break;
            case 'personnel': 
                headers = ['nombres', 'apellidos', 'rut', 'cargo', 'direccion', 'honorario', 'sueldo_base', 'dias_vacaciones', 'telefono', 'email']; 
                personnel.forEach((p: Personnel) => data.push([p.names, p.lastNames, p.dni, p.position, p.address, p.isHonorary ? 'SI' : 'NO', p.baseSalary, p.vacationDays, p.phone, p.email]));
                break;
            case 'residents': 
                headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono', 'integrantes', 'mascotas', 'arrendatario'];
                residents.forEach((r: Resident) => data.push([r.names, r.lastNames, r.dni, r.email, r.phone, r.familyCount, r.hasPets ? 'SI' : 'NO', r.isTenant ? 'SI' : 'NO']));
                break;
            case 'owners': 
                headers = ['nombres', 'apellidos', 'rut', 'email', 'telefono'];
                owners.forEach((o: Owner) => data.push([o.names, o.lastNames, o.dni, o.email, o.phone]));
                break;
            case 'units': 
                headers = ['nombre', 'gasto_base', 'm2'];
                unitTypes.forEach((u: UnitType) => data.push([u.name, u.baseCommonExpense, u.defaultM2]));
                break;
            case 'banks': 
                headers = ['nombre'];
                banks.forEach((b: Bank) => data.push([b.name]));
                break;
            case 'assets': 
                headers = ['descripcion', 'modelo', 'precio_compra', 'valor_depreciado', 'fecha_compra', 'detalles', 'cantidad'];
                assets.forEach((a: FixedAsset) => data.push([a.description, a.model, a.purchasePrice, a.depreciatedValue, a.purchaseDate, a.details, a.quantity]));
                break;
            case 'health': 
                headers = ['nombre', 'tipo', 'tasa'];
                providers.forEach((p: HealthProvider) => data.push([p.name, p.type, p.discountRate]));
                break;
            case 'afp': 
                headers = ['nombre', 'tasa'];
                funds.forEach((f: PensionFund) => data.push([f.name, f.discountRate]));
                break;
            case 'conditions': 
                headers = ['nombre', 'descripcion'];
                conditions.forEach((c: SpecialCondition) => data.push([c.name, c.description]));
                break;
            case 'extra_funds': 
                headers = ['nombre', 'descripcion', 'codigo_fondo', 'tipo', 'monto_por_unidad', 'deadline'];
                specialFunds.forEach((f: SpecialFund) => data.push([f.name, f.description, f.fundCode, f.type, f.totalAmountPerUnit, f.deadline || '']));
                break;
            case 'income': 
                headers = ['rut', 'monto', 'mes', 'año', 'fecha_pago', 'metodo_pago'];
                data.push(['1-1', 1000, 1, 2024, '2024-01-01', 'Transferencia']);
                break;
            case 'community_expenses': 
                headers = ['descripcion', 'monto', 'fecha', 'categoria'];
                communityExpenses.forEach((e: CommunityExpense) => data.push([e.description, e.amount, e.date, e.category]));
                break;
            case 'towers': 
                headers = ['nombre'];
                towers.forEach((t: Tower) => data.push([t.name]));
                break;
            case 'departments': 
                headers = ['numero', 'piso', 'torre', 'tipo_unidad', 'm2'];
                departments.forEach((d: Department) => {
                    const towerName = towers.find((t: Tower) => t.id === d.towerId)?.name || '';
                    const unitTypeName = unitTypes.find((u: UnitType) => u.id === d.unitTypeId)?.name || '';
                    data.push([d.number, d.floor, towerName, unitTypeName, d.m2]);
                });
                break;
            case 'common_spaces': 
                headers = ['nombre', 'ubicacion', 'valor_arriendo', 'duracion', 'condiciones'];
                spaces.forEach((s: CommonSpace) => data.push([s.name, s.location, s.rentalValue, s.durationHours, s.conditions || '']));
                break;
            case 'parking': 
                headers = ['numero', 'ubicacion', 'discapacitado', 'unidad', 'notas'];
                parkings.forEach((p: Parking) => {
                    const deptNum = departments.find((d: Department) => d.id === p.departmentId)?.number || '';
                    data.push([p.number, p.location, p.isHandicapped ? 'SI' : 'NO', deptNum, p.notes || '']);
                });
                break;
            case 'article_categories': 
                headers = ['nombre', 'descripcion'];
                parameters.filter((p: SystemParameter) => p.type === 'article_category').forEach((p: SystemParameter) => data.push([p.name, p.description]));
                break;
            case 'ipc': 
                headers = ['nombre', 'tasa', 'descripcion'];
                projections.forEach((p: IPCProjection) => data.push([p.name, p.ipcRate, p.description]));
                break;
            case 'infra_items': 
                headers = ['nombre', 'obligatorio'];
                infraItems.forEach((i: InfrastructureItem) => data.push([i.name, i.isMandatory ? 'SI' : 'NO']));
                break;
            case 'equip_items': 
                headers = ['nombre', 'obligatorio'];
                equipItems.forEach((e: EquipmentItem) => data.push([e.name, e.isMandatory ? 'SI' : 'NO']));
                break;
            case 'messages': 
                headers = ['contenido', 'tipo'];
                systemMessages.forEach((m: SystemMessage) => data.push([m.text, m.type]));
                break;
            case 'emergency_numbers': 
                headers = ['nombre', 'telefono', 'descripcion', 'categoria'];
                emergencyNumbers.forEach((n: EmergencyNumber) => data.push([n.name, n.phone, n.description, n.category]));
                break;
        }

        return [headers, ...data];
    };

    const downloadExcelTemplate = () => {
        const fullData = getEntityExportData(selectedEntity);
        const ws = XLSX.utils.aoa_to_sheet(fullData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        XLSX.writeFile(wb, `maestro_${selectedEntity}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadAllMasters = () => {
        const wb = XLSX.utils.book_new();
        entities.forEach(entity => {
            const fullData = getEntityExportData(entity.value);
            const ws = XLSX.utils.aoa_to_sheet(fullData);
            XLSX.utils.book_append_sheet(wb, ws, entity.label.substring(0, 31)); 
        });
        XLSX.writeFile(wb, `TODOS_LOS_MAESTROS_SGC_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    <Button variant="secondary" onClick={downloadAllMasters} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6 bg-emerald-600/10 text-emerald-600 border-emerald-600/20 hover:bg-emerald-600/20">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Todo (.xlsx)
                    </Button>
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
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 px-2">Paso 1: Seleccionar Maestro</h3>
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {Array.from(new Set(entities.map(e => e.category))).map((category: string) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{category}</span>
                                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow" />
                                    </div>
                                    <div className="space-y-1">
                                        {entities.filter(e => e.category === category).map((entity) => (
                                            <button
                                                key={entity.value}
                                                onClick={() => setSelectedEntity(entity.value)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${selectedEntity === entity.value
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-950 scale-[1.02]'
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <entity.icon className={`w-4 h-4 ${selectedEntity === entity.value ? 'text-white' : 'text-indigo-500'}`} />
                                                <span className="text-sm font-bold">{entity.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
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

                        {showSelectionPanel && (
                            <div className="mt-8 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/30 p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <Database className="w-4 h-4 text-indigo-600" />
                                        Maestros Detectados en el Excel
                                    </h4>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-full uppercase">
                                        {pendingSheets.filter(p => p.selected).length} seleccionados
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-6">
                                    {pendingSheets.map((sheet: any, idx: number) => (
                                        <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${sheet.selected ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-60'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={sheet.selected} 
                                                onChange={() => {
                                                    const updated = [...pendingSheets];
                                                    updated[idx].selected = !updated[idx].selected;
                                                    setPendingSheets(updated);
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{sheet.label}</span>
                                                <span className="text-[10px] text-gray-500 font-bold">{sheet.data.length} registros</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="secondary" onClick={() => { setFile(null); setShowSelectionPanel(false); setPendingSheets([]); }} className="text-[10px]">Descartar</Button>
                                    <Button onClick={processFile} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-[10px]">
                                        Confirmar y Cargar Seleccionados
                                    </Button>
                                </div>
                            </div>
                        )}

                        {file && status === 'processing' && (
                            <div className="flex flex-col items-center gap-4">
                                <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></span>
                                <span className="font-black text-gray-600 uppercase text-xs tracking-widest">Validando y Procesando maestros...</span>
                            </div>
                        )}

                        {file && status === 'idle' && !showSelectionPanel && (
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
