export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    profileId?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: { name: string; role: string } | null;
}

export interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    updateUser: (id: string, user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export interface SystemSettings {
    systemName: string;
    systemIcon: string;
    systemLogo?: string; // Base64 del logo personalizado
    systemFavicon?: string; // Base64 del favicon personalizado
    darkMode: boolean;
}

export interface SettingsContextType {
    settings: SystemSettings;
    updateSettings: (newSettings: SystemSettings) => void;
    toggleTheme: () => void;
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
    photo?: string; // Base64
    isHonorary: boolean;
    bankName?: string;
    accountNumber?: string;
    baseSalary: number;
    vacationDays: number;
    healthInsuranceId?: string;
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
    createdAt: string;
}

export interface CommonSpace {
    id: string;
    name: string;
    location: string;
    rentalValue: number;
    rentalTime: string; // ej: "2 horas", "Por bloque"
}

export interface Reservation {
    id: string;
    spaceId: string;
    userId: string; // Quien reserva (del personal o residente?)
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Department {
    id: string;
    number: string;
    residentName: string;
    residentType: 'owner' | 'tenant';
    familyCount: number;
    hasPets: boolean;
    specialConditions: string; // ej: "electro-dependiente", "oxígeno"
}

export interface Tower {
    id: string;
    name: string;
    departments: Department[];
}

export interface CommonSpaceContextType {
    spaces: CommonSpace[];
    addSpace: (space: Omit<CommonSpace, 'id'>) => Promise<void>;
    updateSpace: (space: CommonSpace) => Promise<void>;
    deleteSpace: (id: string) => Promise<void>;
}

export interface ReservationContextType {
    reservations: Reservation[];
    addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
    updateReservation: (reservation: Reservation) => Promise<void>;
    deleteReservation: (id: string) => Promise<void>;
}

export interface InfrastructureContextType {
    towers: Tower[];
    addTower: (tower: Omit<Tower, 'id'>) => Promise<void>;
    updateTower: (tower: Tower) => Promise<void>;
    deleteTower: (id: string) => Promise<void>;
    duplicateTower: (id: string, newName: string) => Promise<void>;
}

export interface HealthProvider {
    id: string;
    name: string;
    type: 'fonasa' | 'isapre';
    discountRate: number; // % de descuento
}

export interface PensionFund {
    id: string;
    name: string;
    discountRate: number; // % de descuento fijo/variable
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

export interface ProfilePermissions {
    canViewPersonnel: boolean;
    canManagePersonnel: boolean;
    canViewPrevisiones: boolean;
    canManagePrevisiones: boolean;
    canViewAFPs: boolean;
    canManageAFPs: boolean;
    canViewUsers: boolean;
    canManageUsers: boolean;
    canViewSettings: boolean;
    canManageSettings: boolean;
}

export interface Profile {
    id: string;
    name: string;
    permissions: ProfilePermissions;
}

export interface ProfileContextType {
    profiles: Profile[];
    addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
    updateProfile: (profile: Profile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
}

export interface PersonnelContextType {
    personnel: Personnel[];
    addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt'>) => Promise<void>;
    updatePersonnel: (person: Personnel) => Promise<void>;
    deletePersonnel: (id: string) => Promise<void>;
}

export interface Resident {
    id: string;
    names: string;
    lastNames: string;
    dni: string;
    phone: string;
    email: string;
    notes?: string;
    createdAt: string;
}

export interface ResidentContextType {
    residents: Resident[];
    addResident: (resident: Omit<Resident, 'id' | 'createdAt'>) => Promise<void>;
    updateResident: (resident: Resident) => Promise<void>;
    deleteResident: (id: string) => Promise<void>;
}

export interface SystemMessage {
    id: string;
    text: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    isActive: boolean;
    expiresAt?: string;
    tags?: string[];
    createdAt: string;
}

export interface SystemMessageContextType {
    messages: SystemMessage[];
    addMessage: (message: Omit<SystemMessage, 'id' | 'createdAt'>) => Promise<void>;
    updateMessage: (message: SystemMessage) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
    toggleMessageStatus: (id: string) => Promise<void>;
}

export interface AuthContextType extends AuthState {
    login: (username: string, pass: string) => Promise<boolean>;
    logout: () => void;
}

