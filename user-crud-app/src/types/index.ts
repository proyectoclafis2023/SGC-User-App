import React from 'react';

export interface SystemParameter {
    id: string;
    type: 'job_position' | 'shift' | 'contractor_specialty' | 'ticket_category' | 'article_category' | 'pet_type' | 'vehicle_type' | 'camera_request_reason' | 'shift_report_category' | 'jornada_group';
    name: string;
    description?: string;
    is_active: boolean;
}

export interface SystemParameterContextType {
    parameters: SystemParameter[];
    addParameter: (param: Omit<SystemParameter, 'id'>) => Promise<void>;
    updateParameter: (id: string, param: Partial<SystemParameter>) => Promise<void>;
    deleteParameter: (id: string) => Promise<void>;
}
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'global_admin' | 'admin' | 'resident' | 'worker' | 'owner' | 'user' | 'pending';
    profileId?: string;
    relatedId?: string; // ID of resident or personnel
    status: 'active' | 'inactive' | 'setting_up' | 'pending_approval';
    isArchived?: boolean;
    mustChangePassword?: boolean;
    password?: string;
    createdAt: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        photo?: string;
        relatedId?: string;
        profileId?: string;
        mustChangePassword?: boolean;
    } | null;
}

export interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    updateUser: (id: string, user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    resetPassword: (id: string, newPassword: string) => Promise<void>;
}

export interface SystemSettings {
    systemName: string;
    systemIcon: string;
    systemLogo?: string; // Base64 del logo personalizado
    systemFavicon?: string; // Base64 del favicon personalizado
    cameraBackupDays: number;
    darkMode: boolean;
    theme?: 'light' | 'dark' | 'modern';
    // Datos del Administrador/Condominio
    adminName?: string;
    adminRut?: string;
    condoRut?: string;
    condoAddress?: string;
    adminPhone?: string;
    adminSignature?: string; // Base64 de la firma
    deletionPassword?: string;
    vacationAccrualRate?: number;
    // Email Config
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpFrom?: string;
    smtpBcc?: string; // Correo en copia (registro)
    conciergeEmail?: string; // Correo para recibir notificaciones de conserjería
    emailTriggers?: {
        expenses?: boolean;
        visits?: boolean;
        correspondence?: boolean;
        reservations?: boolean;
        systemAnnouncements?: boolean;
        suggestions?: boolean;
    };
    // Gestión de Cobranza
    paymentDeadlineDay?: number; // Día del mes límite de pago
    maxArrearsMonths?: number; // Meses de mora máximos antes de alerta crítica
    arrearsFineAmount?: number; // Monto de multa fija por mora
    arrearsFinePercentage?: number; // % de multa por mora (si aplica)
    censusFrequencyYears?: number; // Frecuencia de censo en años
}

export interface IPCProjection {
    id: string;
    name: string;
    ipc_rate: number;      // Valor del IPC Real
    ponderado_rate: number; // Valor del IPC Ponderado
    description?: string;
    is_active: boolean;
    created_at: string;
}

export interface SettingsContextType {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark' | 'modern') => void;
}

export interface EmergencyContact {
    names: string;
    lastNames: string;
    phone: string;
}

export interface Personnel {
    id: string;
    names: string;
    lastNames: string;
    dni: string;
    phone?: string;
    email?: string;
    photo?: string; // Base64
    isHonorary: boolean;
    bankId?: string;
    accountNumber?: string;
    baseSalary: number;
    vacationDays: number;
    healthProviderId?: string;
    hasComplementaryInsurance?: boolean;
    complementaryInsuranceType?: 'percentage' | 'amount';
    complementaryInsuranceValue?: number;
    pensionFundId?: string;
    hasAPV?: boolean;
    apvType?: 'percentage' | 'amount';
    apvValue?: number;
    address: string;
    hasEmergencyContact: boolean;
    emergencyContact?: EmergencyContact;
    medicalInfo?: string;
    position?: string;
    contractType?: 'honorarios' | 'plazo' | 'indefinido';
    assignedShift?: 'Manana' | 'Tarde' | 'Noche';
    vacationLastUpdate?: string;
    assignedArticles?: AssignedArticle[];
    status: 'active' | 'inactive';
    isArchived?: boolean;
    createdAt: string;
    jornadaGroupId?: string;
}

export interface Bank {
    id: string;
    name: string;
    is_archived?: boolean;
}

export interface BankContextType {
    banks: Bank[];
    addBank: (bank: Omit<Bank, 'id'>) => Promise<string>;
    updateBank: (bank: Bank) => Promise<void>;
    deleteBank: (id: string) => Promise<void>;
}

export interface Article {
    id: string;
    name: string;
    description?: string;
    category: string;
    unit: string;
    price: number;
    stock: number;
    minStock: number;
    isActive: boolean;
    allowPersonnelRequest: boolean;
    isArchived?: boolean;
}

export interface AssignedArticle {
    id: string;
    articleId: string;
    size?: string; // Talla o número
    quantity: number;
    assignedAt: string;
    notes?: string;
}

export interface ArticleContextType {
    articles: Article[];
    addArticle: (article: Omit<Article, 'id'>) => Promise<void>;
    updateArticle: (article: Article) => Promise<void>;
    deleteArticle: (id: string) => Promise<void>;
    decreaseStock: (articleId: string, quantity: number) => Promise<void>;
}


export interface CommonSpace {
    id: string;
    name: string;
    location: string;
    rental_value: number; // Valor entero ($)
    duration_hours: number; // Duración por defecto en horas (entero)
    conditions?: string; // Leyenda con condiciones y reglas
    is_archived?: boolean;
}

export interface Reservation {
    id: string;
    folio: string;
    common_space_id: string;
    resident_id: string; // Quien reserva
    unit_id?: string;
    tower_id?: string;
    start_at: string; // ISO
    end_at: string; // ISO
    status: 'pending' | 'approved' | 'cancelled' | 'completed' | 'rejected';
    payment_status: 'pending' | 'paid';
    is_archived?: boolean;
    created_at: string; // Timestamp
    approval_user_id?: string;
    approval_date?: string;
    signed_document_url?: string;
    notes?: string;
}

export interface ReservationLog {
    id: string;
    reservation_id: string;
    resident_id: string; // The person who performed the action
    action: 'created' | 'approved' | 'rejected' | 'payment_confirmed' | 'cancelled' | 'updated';
    details: string;
    timestamp: string;
}

export interface HistoryLog {
    id: string;
    entityType: 'department' | 'owner' | 'resident' | 'personnel' | 'reservation';
    entityId: string;
    unitId?: string; // Vinculo permanente con la unidad física
    action: 'created' | 'updated' | 'deleted' | 'owner_change' | 'resident_change' | 'approval' | 'archived' | 'status_change';
    previousValue?: any;
    newValue?: any;
    details: string;
    timestamp: string;
}

export interface SpecialCondition {
    id: string;
    name: string;
    description?: string;
    is_archived?: boolean;
}

export interface UnitType {
    id: string;
    nombre: string;
    base_common_expense: number; // Monto base para gastos comunes
    default_m2?: number; // Metraje por defecto
    is_archived?: boolean;
}

export interface Department {
    id: string;
    tower_id?: string;
    number: string;
    floor?: number;
    unit_type_id?: string;
    property_role?: string;
    m2?: number;
    terrain_m2?: number;
    value?: number;
    dormitorios?: number;
    banos?: number;
    estacionamientos?: number;
    year_built?: number;
    is_available?: boolean;
    publish_type?: 'venta' | 'arriendo';
    image?: string;
    location_map_url?: string;
    water_client_id?: string;
    electricity_client_id?: string;
    gas_client_id?: string;
    owner_id?: string;
    resident_id?: string;
    last_census_date?: string; // Fecha del último censo
    is_archived?: boolean;
    history?: HistoryLog[];
}

export interface Tower {
    id: string;
    name: string;
    is_archived?: boolean;
    departments: Department[];
}

export interface Owner {
    id: string;
    names: string;
    last_names: string;
    dni: string;
    phone: string;
    email: string;
    notes?: string;
    status: 'active' | 'inactive';
    is_archived?: boolean;
    receive_resident_notifications?: boolean;
    can_resident_see_arrears?: boolean; // Permite que el residente vea el reporte de deudas
    created_at: string;
    departments?: Department[];
}

export interface Parking {
    id: string;
    number: string;
    location?: string;
    is_handicapped?: boolean;
    notes?: string;
    department_id?: string; // Unidad asociada
    related_unit?: string; // Nombre/Número de la unidad (para despliegue rápido)
    is_archived?: boolean;
    created_at: string;
    department?: Department;
}

export interface Resident {
    id: string;
    names: string;
    last_names: string;
    dni: string;
    phone: string;
    email: string;
    photo?: string; // Base64 image
    tower_id?: string;
    unit_id?: string;
    parking_ids?: string[]; // IDs for associated parking spots
    family_count: number;
    has_pets: boolean;
    condition_ids: string[]; // Maestra de condiciones especiales
    notes?: string;
    is_tenant: boolean;
    rent_amount?: number;
    status: 'active' | 'inactive';
    is_archived?: boolean;
    created_at: string;
    departments?: Department[];
}

export interface ParkingContextType {
    parkings: Parking[];
    addParking: (parking: Omit<Parking, 'id' | 'createdAt'>) => Promise<void>;
    updateParking: (parking: Parking) => Promise<void>;
    deleteParking: (id: string) => Promise<void>;
}

export interface SpecialConditionContextType {
    conditions: SpecialCondition[];
    addCondition: (condition: Omit<SpecialCondition, 'id'>) => Promise<void>;
    updateCondition: (condition: SpecialCondition) => Promise<void>;
    deleteCondition: (id: string) => Promise<void>;
}

export interface UnitTypeContextType {
    unitTypes: UnitType[];
    addUnitType: (unitType: Omit<UnitType, 'id'>) => Promise<UnitType | undefined>;
    updateUnitType: (unitType: UnitType) => Promise<void>;
    deleteUnitType: (id: string) => Promise<void>;
}

export interface OwnerContextType {
    owners: Owner[];
    addOwner: (owner: Omit<Owner, 'id' | 'createdAt' | 'status'>) => Promise<string>;
    updateOwner: (owner: Owner) => Promise<void>;
    deleteOwner: (id: string) => Promise<void>;
}

export interface ResidentContextType {
    residents: Resident[];
    addResident: (resident: Omit<Resident, 'id' | 'createdAt' | 'status'>) => Promise<Resident | undefined>;
    updateResident: (resident: Resident) => Promise<void>;
    deleteResident: (id: string) => Promise<void>;
    uploadResidents: (file: File) => Promise<{ message: string }>;
}

export interface CommonSpaceContextType {
    spaces: CommonSpace[];
    addSpace: (space: Omit<CommonSpace, 'id'>) => Promise<void>;
    updateSpace: (space: CommonSpace) => Promise<void>;
    deleteSpace: (id: string) => Promise<void>;
}

export interface ReservationContextType {
    reservations: Reservation[];
    reservationLogs: ReservationLog[];
    addReservation: (reservation: Omit<Reservation, 'id' | 'folio' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<void>;
    updateReservation: (reservation: Reservation) => Promise<void>;
    deleteReservation: (id: string) => Promise<void>;
    approveReservation: (id: string, adminId: string) => Promise<void>;
    rejectReservation: (id: string, adminId: string, reason: string) => Promise<void>;
    confirmPayment: (id: string, adminId: string) => Promise<void>;
    uploadSignedDocument: (id: string, url: string) => Promise<void>;
}

export interface Ticket {
    id: string;
    folio: string;
    resident_id: string;
    unit_id?: string;
    tower_id?: string;
    type: string;
    subject: string;
    description: string;
    image?: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    admin_notes?: string;
    acknowledged_at?: string;
    acknowledged_by?: string;
    is_archived?: boolean;
    created_at: string;
    updated_at: string;
}

export interface TicketContextType {
    tickets: Ticket[];
    addTicket: (ticket_data: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'folio' | 'is_archived'>) => Promise<Ticket>;
    updateTicket: (id: string, ticket_data: Partial<Ticket>) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
    updateTicketStatus: (id: string, status: Ticket['status']) => Promise<void>;
    addSolutionNote: (id: string, notes: string) => Promise<void>;
    refreshTickets: () => Promise<void>;
}

export interface ServiceDirectory {
    id: string;
    name: string;
    category: string;
    contact_phone?: string;
    contact_email?: string;
    description?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServiceDirectoryContextType {
    services: ServiceDirectory[];
    addService: (service: Omit<ServiceDirectory, 'id' | 'created_at' | 'updated_at' | 'is_archived'>) => Promise<void>;
    updateService: (id: string, service: Partial<ServiceDirectory>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    refreshServices: () => Promise<void>;
}

export interface CameraRequest {
    id: string;
    folio: string;
    userId: string;
    residentName?: string; // Nombre completo del residente
    unitId?: string; // Unidad (Ej: Torre A - 101)
    cameraId: string; // O ubicación de la cámara
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: 'pending' | 'attended' | 'rejected';
    createdAt: string;
    adminNotes?: string;
}

export interface CameraRequestContextType {
    requests: CameraRequest[];
    addRequest: (request: Omit<CameraRequest, 'id' | 'folio' | 'status' | 'createdAt'>) => Promise<void>;
    updateRequestStatus: (id: string, status: CameraRequest['status'], adminNotes?: string) => Promise<void>;
    deleteRequest: (id: string) => Promise<void>;
}

export interface InfrastructureContextType {
    towers: Tower[];
    departments: Department[];
    addTower: (tower: Omit<Tower, 'id'>) => Promise<Tower | undefined>;
    updateTower: (tower: Tower) => Promise<void>;
    deleteTower: (id: string) => Promise<void>;
    duplicateTower: (id: string, newName: string) => Promise<void>;
    addDepartment: (dept: Omit<Department, 'id'>) => Promise<Department | undefined>;
    updateDepartment: (dept: Department) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;
    fetchAll: () => Promise<void>;
}

export interface HealthProvider {
    id: string;
    name: string;
    type: 'fonasa' | 'isapre';
    discount_rate: number; // % de descuento
    is_archived?: boolean;
}

export interface PensionFund {
    id: string;
    name: string;
    discount_rate: number; // % de descuento fijo/variable
    is_archived?: boolean;
}

export interface AFC {
    id: string;
    name: string;
    fixed_term_rate: number;    // % Seguro Cesantía Trabajador a Plazo
    indefinite_term_rate: number; // % Seguro Cesantía Trabajador Indefinido
    is_active: boolean;
    created_at: string;
}

export interface Holiday {
    id: string;
    date: string;
    description: string;
    isArchived?: boolean;
    createdAt: string;
}

export interface HealthProviderContextType {
    providers: HealthProvider[];
    addProvider: (provider: Omit<HealthProvider, 'id'>) => Promise<void>;
    updateProvider: (provider: HealthProvider) => Promise<void>;
    deleteProvider: (id: string) => Promise<void>;
}

export interface PensionFundContextType {
    funds: PensionFund[];
    addFund: (fund: Omit<PensionFund, 'id'>) => Promise<void>;
    updateFund: (fund: PensionFund) => Promise<void>;
    deleteFund: (id: string) => Promise<void>;
}

export interface AFCContextType {
    afcs: AFC[];
    addAFC: (afc: Omit<AFC, 'id' | 'createdAt'>) => Promise<void>;
    updateAFC: (afc: AFC) => Promise<void>;
    deleteAFC: (id: string) => Promise<void>;
}

export interface HolidayContextType {
    holidays: Holiday[];
    addHoliday: (holiday: Omit<Holiday, 'id' | 'createdAt'>) => Promise<void>;
    updateHoliday: (holiday: Holiday) => Promise<void>;
    deleteHoliday: (id: string) => Promise<void>;
}

export interface ProfilePermissions {
    // Maestros y Configuración
    canViewPersonnel: boolean;
    canManagePersonnel: boolean;
    canViewPrevisiones: boolean;
    canManagePrevisiones: boolean;
    canViewAFPs: boolean;
    canManageAFPs: boolean;
    canViewUsers: boolean;
    canManageUsers: boolean;
    canViewProfiles: boolean;
    canManageProfiles: boolean;
    canViewSettings: boolean;
    canManageSettings: boolean;
    canViewInfrastructure: boolean;
    canManageInfrastructure: boolean;
    canViewResidents: boolean;
    canManageResidents: boolean;
    canViewOwners: boolean;
    canManageOwners: boolean;
    canViewUnitTypes: boolean;
    canManageUnitTypes: boolean;
    canViewParking: boolean;
    canManageParking: boolean;
    canViewCommonSpaces: boolean;
    canManageCommonSpaces: boolean;
    canViewArticles: boolean;
    canManageArticles: boolean;
    canViewContractors: boolean;
    canManageContractors: boolean;
    canViewFixedAssets: boolean;
    canManageFixedAssets: boolean;
    canViewEmergencyNumbers: boolean;
    canManageEmergencyNumbers: boolean;
    canViewOperationalMasters: boolean;
    canManageOperationalMasters: boolean;

    // Operativa y Gestión
    canViewCommonExpenses: boolean;
    canManageCommonExpenses: boolean;
    canViewCertificates: boolean;
    canManageCertificates: boolean;
    canViewVisitors: boolean;
    canManageVisitors: boolean;
    canViewShiftReports: boolean;
    canManageShiftReports: boolean;
    canViewCorrespondence: boolean;
    canManageCorrespondence: boolean;
    canViewTickets: boolean;
    canManageTickets: boolean;
    canViewCameraRequests: boolean;
    canManageCameraRequests: boolean;
    canViewReservations: boolean;
    canManageReservations: boolean;
    canViewSystemMessages: boolean;
    canManageSystemMessages: boolean;
    canViewArticleDeliveries: boolean;
    canManageArticleDeliveries: boolean;
    canViewPayslips: boolean;
    canManagePayslips: boolean;
}

export interface Profile {
    id: string;
    name: string;
    permissions: ProfilePermissions;
    isArchived?: boolean;
}

export interface ProfileContextType {
    profiles: Profile[];
    addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
}

export interface PersonnelContextType {
    personnel: Personnel[];
    addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt' | 'status'>) => Promise<Personnel | undefined>;
    updatePersonnel: (person: Personnel) => Promise<void>;
    deletePersonnel: (id: string) => Promise<void>;
    uploadPersonnel: (file: File) => Promise<{ message: string }>;
}

export interface SystemMessage {
    id: string;
    text: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    is_active: boolean;
    image?: string;
    youtube_url?: string;
    duration_seconds?: number;
    is_full_image?: boolean; // Si la imagen debe ocupar gran parte del aviso
    expires_at?: string;
    tags?: string[];
    is_archived?: boolean;
    created_at: string;
}

export interface SystemMessageContextType {
    messages: SystemMessage[];
    addMessage: (message: Omit<SystemMessage, 'id' | 'createdAt'>) => Promise<void>;
    updateMessage: (message: SystemMessage) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
    toggleMessageStatus: (id: string) => Promise<void>;
}

export interface DirectedMessage {
    id: string;
    unitId?: string;
    text: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    isActive: boolean;
    createdAt: string;
}

export interface DirectedMessageContextType {
    messages: DirectedMessage[];
    addMessage: (message: Omit<DirectedMessage, 'id' | 'createdAt'>) => Promise<void>;
    updateMessage: (message: DirectedMessage) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
}

export interface ArticleDelivery {
    id: string;
    folio: string;
    personnelId: string;
    deliveryDate: string; // Fecha en que se entregó físicamente
    createdAt: string;    // Fecha en que se registró en sistema
    articles: {
        articleId: string;
        quantity: number;
        size?: string;
    }[];
    notes?: string;
    status: 'active' | 'voided';
    signedDocument?: string; // Base64 of signed document
}

export interface ArticleDeliveryContextType {
    deliveries: ArticleDelivery[];
    addDelivery: (delivery: Omit<ArticleDelivery, 'id' | 'folio' | 'createdAt'>) => Promise<string>;
    updateDelivery: (delivery: ArticleDelivery) => Promise<void>;
    deleteDelivery: (id: string) => Promise<void>;
    setDeliveries: React.Dispatch<React.SetStateAction<ArticleDelivery[]>>;
}

export interface ExtraordinaryQuota {
    id: string;
    amount: number;
    description: string;
}

export interface FundUnitTypeConfig {
    unitTypeId: string;
    calculationType: 'fixed' | 'percentage';
    value: number; // Fixed amount or % of Base Common Expense
    isExempt: boolean;
}

export interface JornadaSchedule {
    days: number[]; // 0-6 (Sun-Sat)
    startTime: string;
    endTime: string;
}

export interface JornadaGroup {
    id: string;
    name: string;
    description?: string;
    workDays: number[]; // Mantener para compatibilidad
    startTime?: string;
    endTime?: string;
    isActive: boolean;
    isArchived?: boolean;
    schedules?: JornadaSchedule[];
    breakMinutes?: number;
}

export interface FundExpense {
    id: string;
    amount: number;
    description: string;
    date: string;
}

export interface SpecialFund {
    id: string;
    type: 'reserve' | 'extraordinary';
    name: string;
    description: string;
    totalAmountPerUnit: number; // Default amount per unit
    totalProjectAmount?: number; // Total amount to be collected (for proration)
    isActive: boolean;
    deadline?: string;
    unitConfigs?: FundUnitTypeConfig[];
    expenses?: FundExpense[];
    fundCode: number; // 0 for Gasto Común, 1+ for other funds
    isArchived?: boolean;
    createdAt: string;
}

export interface CommonExpenseRule {
    id: string;
    unitTypeId?: string;
    amount: number;
    effectiveFrom: string;
    description?: string;
    isArchived?: boolean;
    createdAt: string;
}

export interface FundContribution {
    fundId: string;
    amount: number;
}

export interface CommonExpensePayment {
    id: string;
    departmentId: string;
    periodMonth: number;
    periodYear: number;
    amountPaid: number;
    paymentDate: string;
    status: 'paid' | 'pending' | 'mora';
    paymentMethod?: string;
    receiptFolio?: string;
    evidenceImage?: string; // Captura manual
    notes?: string;
    isElectronic: boolean;
    fundContributions?: FundContribution[];
    createdAt: string;
}

export interface CommunityExpense {
    id: string;
    description: string;
    amount: number;
    category: 'Sueldos' | 'Mantención' | 'Seguros' | 'Servicios Básicos' | 'Administración' | 'Otros' | 'Reparaciones';
    date: string;
    receiptUrl?: string;
    receiptImages?: string[];
    isArchived?: boolean;
    isProjected?: boolean;
    createdAt: string;
}

export interface CommonExpenseContextType {
    payments: CommonExpensePayment[];
    funds: SpecialFund[];
    rules: CommonExpenseRule[];
    communityExpenses: CommunityExpense[];
    fetchPayments: () => Promise<void>;
    fetchFunds: (includeArchived?: boolean) => Promise<void>;
    fetchCommunityExpenses: (includeArchived?: boolean) => Promise<void>;
    addPayment: (payment: Omit<CommonExpensePayment, 'id' | 'createdAt'>) => Promise<void>;
    updatePayment: (payment: CommonExpensePayment) => Promise<void>;
    deletePayment: (id: string) => Promise<void>;
    addFund: (fund: Omit<SpecialFund, 'id' | 'createdAt'>) => Promise<void>;
    updateFund: (fund: SpecialFund) => Promise<void>;
    deleteFund: (id: string) => Promise<void>;
    restoreFund: (id: string) => Promise<void>;
    addRule: (rule: Omit<CommonExpenseRule, 'id' | 'createdAt'>) => Promise<void>;
    calculateAmount: (deptId: string) => Promise<{ suggestedAmount: number, ruleUsed: any }>;
    addCommunityExpense: (expense: Omit<CommunityExpense, 'id' | 'createdAt'>) => Promise<void>;
    deleteCommunityExpense: (id: string) => Promise<void>;
}

export interface MaintenanceRecord {
    id: string;
    folio: string;
    date: string;
    description: string;
    technicianName: string;
    cost?: number;
    observations?: string;
}

export interface FixedAsset {
    id: string;
    description: string;
    quantity: number;
    purchasePrice: number;
    depreciatedValue: number;
    model: string;
    details: string;
    isActive: boolean;
    image?: string;
    purchaseDate: string;
    requiresMaintenance?: boolean;
    nextMaintenanceDate?: string;
    maintenanceHistory?: MaintenanceRecord[];
    isArchived?: boolean;
    createdAt: string;
}

export interface FixedAssetContextType {
    assets: FixedAsset[];
    addAsset: (asset: Omit<FixedAsset, 'id' | 'createdAt'>) => Promise<void>;
    updateAsset: (asset: FixedAsset) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
}

export interface AuthContextType extends AuthState {
    login: (username: string, pass: string) => Promise<boolean>;
    loginWithGoogle: (email: string, name: string, photoUrl?: string) => Promise<boolean>;
    logout: () => void;
    updateUserAuthData: (data: Partial<NonNullable<AuthState['user']>>) => void;
    changePassword: (newPassword: string) => Promise<void>;
}

export interface Correspondence {
    id: string;
    folio: string;
    department_id: string;
    tower_id: string;
    type: 'package' | 'letter' | 'delivery' | 'other';
    addressee: string;
    received_by?: string; // Personnel ID or name
    courier?: string;
    details?: string;
    evidence_image?: string;
    status: 'pending' | 'received' | 'notified' | 'delivered' | 'expected';
    received_at?: string;
    delivered_at?: string;
    expected_date?: string;
    expected_time_range?: string;
    is_archived?: boolean;
    created_at: string;
}

export interface CorrespondenceContextType {
    items: Correspondence[];
    addItem: (item: Omit<Correspondence, 'id' | 'folio' | 'createdAt'>) => Promise<void>;
    updateItemStatus: (id: string, status: Correspondence['status'], deliveredAt?: string) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

export interface Contractor {
    id: string;
    folio: string;
    name: string;
    specialty: string; // Eléctrica, Hidropack, etc.
    monthlyPaymentAmount?: number;
    hoursOfService?: string;
    phone: string;
    email: string;
    escalationContact?: string; // Nombre de contacto para escalamiento
    escalationPhone?: string; // Teléfono de contacto para escalamiento
    notes?: string;
    isActive: boolean;
    maintenanceFrequency?: 'monthly' | 'half-yearly' | 'annual' | 'none';
    lastMaintenanceDate?: string;
    showToResidents?: boolean;
    createdAt: string;
}

export interface ContractorContextType {
    contractors: Contractor[];
    addContractor: (contractor: Omit<Contractor, 'id' | 'folio' | 'createdAt'>) => Promise<void>;
    updateContractor: (contractor: Contractor) => Promise<void>;
    deleteContractor: (id: string) => Promise<void>;
}

export interface ContractorVisit {
    id: string;
    folio: string;
    contractor_id?: string; // If registered in master
    names: string;
    dni: string;
    company: string;
    subject: string;
    entry_at: string;
    exit_at?: string;
    allowed_until?: string;
    department_id?: string;
    status: 'active' | 'exited' | 'expired';
    is_archived?: boolean;
    created_at: string;
}

export interface ContractorVisitContextType {
    visits: ContractorVisit[];
    addVisit: (visit: Omit<ContractorVisit, 'id' | 'folio' | 'createdAt' | 'status'>) => Promise<void>;
    updateVisitStatus: (id: string, status: ContractorVisit['status']) => Promise<void>;
}

export interface Visitor {
    id: string;
    folio: string;
    names: string;
    dni: string;
    tower_id: string;
    department_id: string;
    resident_id?: string;
    visit_date: string;
    visit_time?: string;
    is_pre_registered: boolean; // Si fue registrado por el residente
    status: 'scheduled' | 'entered' | 'exited' | 'cancelled';
    entry_at?: string;
    exit_at?: string;
    vehicle_plate?: string;
    notes?: string;
    is_archived?: boolean;
    created_at: string;
}

export interface VisitorContextType {
    visitors: Visitor[];
    addVisitor: (visitor: Omit<Visitor, 'id' | 'folio' | 'createdAt'>) => Promise<void>;
    updateVisitorStatus: (id: string, status: Visitor['status'], time?: string) => Promise<void>;
    deleteVisitor: (id: string) => Promise<void>;
}

export interface InfrastructureItem {
    id: string;
    name: string;
    isMandatory?: boolean;
    isArchived?: boolean;
    createdAt: string;
}

export interface EquipmentItem {
    id: string;
    name: string;
    isMandatory?: boolean;
    isArchived?: boolean;
    createdAt: string;
}

export interface InfrastructureItemContextType {
    items: InfrastructureItem[];
    addItem: (item: Omit<InfrastructureItem, 'id' | 'createdAt'>) => Promise<void>;
    updateItem: (item: InfrastructureItem) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

export interface EquipmentItemContextType {
    items: EquipmentItem[];
    addItem: (item: Omit<EquipmentItem, 'id' | 'createdAt'>) => Promise<void>;
    updateItem: (item: EquipmentItem) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

export interface Camera {
    id: string;
    name: string;
    description?: string;
    backup_hours: number;
    is_archived?: boolean;
    created_at: string;
}

export interface CameraContextType {
    cameras: Camera[];
    addCamera: (camera: Omit<Camera, 'id' | 'createdAt'>) => Promise<void>;
    updateCamera: (camera: Camera) => Promise<void>;
    deleteCamera: (id: string) => Promise<void>;
}

export interface ShiftReport {
    id: string;
    folio: string;
    worker_id: string;
    worker_name: string;
    shift_date: string;
    shift_type: 'Manana' | 'Tarde' | 'Noche';
    status: 'open' | 'closed';
    novedades: string;
    has_incidents: boolean;
    incident_details?: string;
    incident_attachments?: string[]; // Base64 strings
    has_infrastructure_issues: boolean;
    infrastructure_issue_type?: string; 
    infrastructure_issue_types?: string[]; 
    infrastructure_issue_details?: string;
    infrastructure_attachments?: string[];
    has_equipment_issues: boolean;
    equipment_issue_type?: string; 
    equipment_issue_types?: string[]; 
    equipment_issue_details?: string;
    equipment_attachments?: string[];
    closed_at?: string;
    admin_reopen_reason?: string;
    admin_reopened_by?: string;
    created_at: string;
    is_archived?: boolean;
    resident_id?: string;
    owner_id?: string;
    department_id?: string;
}

export interface ShiftReportContextType {
    reports: ShiftReport[];
    addReport: (report: Omit<ShiftReport, 'id' | 'folio' | 'created_at' | 'status' | 'has_incidents' | 'has_infrastructure_issues' | 'has_equipment_issues'>) => Promise<boolean>;
    updateReport: (id: string, data: Partial<ShiftReport>) => Promise<void>;
    closeShift: (id: string, data: Partial<ShiftReport>) => Promise<void>;
    reopenShift: (id: string, adminName: string, reason: string) => Promise<void>;
    deleteReport: (id: string) => Promise<void>;
    clearAllReports: () => void;
}

export interface ShiftLog {
    id: string;
    daily_report_id: string;
    timestamp: string;
    event: string;
    category?: 'routine' | 'incident' | 'check';
    worker_id: string;
    is_archived?: boolean;
    created_at: string;
}

export interface EmergencyNumber {
    id: string;
    category: string;
    name: string;
    phone: string;
    description?: string;
    web_url?: string;
    is_archived?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface EmergencyNumberContextType {
    numbers: EmergencyNumber[];
    addNumber: (number: Omit<EmergencyNumber, 'id' | 'createdAt'>) => Promise<void>;
    updateNumber: (id: string, number: Omit<EmergencyNumber, 'id' | 'createdAt'>) => Promise<void>;
    deleteNumber: (id: string) => Promise<void>;
}

export interface Certificate {
    id: string;
    folio: string;
    type: 'residencia' | 'gastos' | 'estado_cuenta' | 'liquidacion';
    residentName: string;
    residentRut: string;
    residentAddress: string;
    generatedAt: string;
    adminName: string;
    adminRut: string;
    condoName: string;
    condoRut: string;
    condoAddress: string;
    financialData?: {
        commonExpenseDebt: number;
        extraordinaryDebt: number;
        reserveDebt: number;
        totalDebt: number;
        lastPaymentDate?: string;
    };
}

export interface CertificateContextType {
    certificates: Certificate[];
    addCertificate: (certificate: Omit<Certificate, 'id' | 'folio' | 'generatedAt'>) => Promise<Certificate>;
    deleteCertificate: (id: string) => Promise<void>;
}

export interface Advance {
    id: string;
    personnelId: string;
    amount: number;
    date: string;
    description: string;
    status: 'pending' | 'deducted' | 'cancelled';
    payslipId?: string;
}

export interface Payslip {
    id: string;
    folio: string;
    personnelId: string;
    month: number;
    year: number;
    baseSalary: number;
    grossSalary: number;
    workedDays: number;
    adjustedWorkedDays?: number;
    healthDiscount: number;
    pensionDiscount: number;
    apvDiscount: number;
    insuranceDiscount: number;
    advancesDiscount: number;
    totalDeductions: number;
    netSalary: number;
    generatedAt: string;
    bonusPoints?: number; // Optional extras
}

export interface PayslipContextType {
    payslips: Payslip[];
    advances: Advance[];
    addPayslip: (payslip: Omit<Payslip, 'id' | 'folio' | 'generatedAt'>) => Promise<Payslip>;
    deletePayslip: (id: string) => Promise<void>;
    addAdvance: (advance: Omit<Advance, 'id' | 'status'>) => Promise<string>;
    updateAdvanceStatus: (id: string, status: Advance['status'], payslipId?: string) => Promise<void>;
    deleteAdvance: (id: string) => Promise<void>;
}

export interface CommunicationTemplate {
    id: string;
    name: string;
    subject: string;
    message: string;
    type: 'general' | 'arrears' | 'emergency';
    is_archived?: boolean;
    created_at: string;
}

export interface CommunicationHistory {
    id: string;
    subject: string;
    message: string;
    recipients: string[]; // Lista de correos
    sender_id: string;
    attachment_url?: string;
    target_filter: string; // Resumen del filtro aplicado
    is_archived?: boolean;
    created_at: string;
}

export interface CommunicationContextType {
    templates: CommunicationTemplate[];
    history: CommunicationHistory[];
    addTemplate: (template: Omit<CommunicationTemplate, 'id' | 'createdAt'>) => Promise<void>;
    updateTemplate: (template: CommunicationTemplate) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    addHistory: (item: Omit<CommunicationHistory, 'id' | 'createdAt'>) => Promise<void>;
}

export interface SupplyRequest {
    id: string;
    folio: string;
    name: string;
    description?: string;
    requested_by: string; // worker_id
    status: 'pending' | 'approved' | 'rejected' | 'delivered';
    is_archived?: boolean;
    created_at: string;
}

export interface CctvLog {
    id: string;
    folio: string;
    camera_id: string;
    event_type: 'intrusion' | 'movement' | 'error' | 'routine';
    description?: string;
    recorded_at: string;
    evidence_url?: string;
    is_archived?: boolean;
    created_at: string;
}
