import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/crudController';

const router = Router();

/**
 * GENERIC CRUD ROUTES
 * The crudController automatically uses the last part of the URL as the table name.
 */

const entities = [
    // Infrastructure
    'towers',
    'departments',
    'unit_types',
    'parking',
    'infrastructure_items',
    'equipment_items',
    'common_spaces',
    'reservations',
    'special_conditions',
    
    // People
    'owners',
    'residents',
    'personnel',
    
    // Operations (Security/Concierge)
    'shift_reports',
    'visitors',
    'correspondence',
    'couriers',
    'camera_requests',
    'cameras',
    'contractor_visits',
    
    // Finance
    'special_funds',
    'common_expense_rules',
    'common_expense_payments',
    'community_expenses',
    'employee_advances',
    'payslips',
    'weighted_ipc',
    
    // Maintenance
    'contractors',
    'fixed_assets',
    'asset_maintenance_history',
    'articles',
    'article_deliveries',
    
    // Community
    'tickets',
    'certificates',
    'emergency_numbers',
    'system_messages',
    'communication_templates',
    'communication_history',
    'ipc_projections',
    'jornada_groups',
    'directed_messages',
    
    // System
    'profiles',
    'profile_permissions',
    'system_parameters',
    'system_settings',
    'history_logs',
    'banks',
    'health_providers',
    'pension_funds'
];

entities.forEach(entity => {
    router.get(`/${entity}`, getAll);
    router.post(`/${entity}`, create);
    router.put(`/${entity}/:id`, update);
    router.delete(`/${entity}/:id`, remove);
});

export default router;
