import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { user, isAuthenticated } = useAuth();
    
    const hasPermission = (permission: string): boolean => {
        if (!isAuthenticated || !user) return false;
        
        // El Administrador siempre tiene todos los permisos
        if (user.role === 'Administrador' || user.role === 'admin') return true;
        
        return user.permissions?.includes(permission) || false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some(p => hasPermission(p));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every(p => hasPermission(p));
    };

    return { hasPermission, hasAnyPermission, hasAllPermissions, userRole: user?.role };
};
