const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('--- SEED RBAC ---');
    
    // 1. Permissions
    const permissions = [
        { slug: 'common_expenses:create', description: 'Crear Gastos Comunes' },
        { slug: 'common_expenses:view', description: 'Ver Gastos Comunes' },
        { slug: 'payments:create', description: 'Registrar Pagos' },
        { slug: 'payments:view', description: 'Ver Mis Pagos' },
        { slug: 'expenses:manage', description: 'Gestionar Egresos' },
        { slug: 'personnel:manage', description: 'Gestionar Personal' },
        { slug: 'infrastructure:manage', description: 'Gestionar Infraestructura' }
    ];

    const permissionMap = {};
    for (const p of permissions) {
        const created = await prisma.permission.upsert({
            where: { slug: p.slug },
            update: { description: p.description },
            create: p
        });
        permissionMap[p.slug] = created.id;
        console.log(`Permission: ${p.slug} [OK]`);
    }

    // 2. Roles
    const roles = [
        { name: 'Administrador', description: 'Acceso total al sistema', slugs: permissions.map(p => p.slug) },
        { name: 'Residente', description: 'Vista de hogar y pagos', slugs: ['common_expenses:view', 'payments:create', 'payments:view'] },
        { name: 'Conserje', description: 'Operaciones diarias', slugs: ['common_expenses:view', 'payments:view'] }
    ];

    for (const r of roles) {
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: { description: r.description },
            create: { name: r.name, description: r.description }
        });

        // Link permissions
        for (const slug of r.slugs) {
            const permId = permissionMap[slug];
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
                update: {},
                create: { roleId: role.id, permissionId: permId }
            });
        }
        console.log(`Role: ${r.name} [OK]`);
    }

    // 3. Assign to existing Personnel (e.g., the first one as Admin for testing)
    const adminRole = await prisma.role.findUnique({ where: { name: 'Administrador' } });
    if (adminRole) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        const personnel = await prisma.personnel.findFirst();
        if (personnel) {
            await prisma.personnel.update({
                where: { id: personnel.id },
                data: { roleId: adminRole.id, password: passwordHash }
            });
            console.log(`Assigned Admin role + password to ${personnel.names} [OK]`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
