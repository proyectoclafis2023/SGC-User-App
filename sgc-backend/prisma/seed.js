const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...');

    // 1. Asegurar Permisos básicos
    const permissions = [
        { slug: 'payments:view', description: 'Ver pagos' },
        { slug: 'payments:create', description: 'Crear pagos' },
        { slug: 'common_expenses:view', description: 'Ver gastos comunes' },
        { slug: 'common_expenses:create', description: 'Generar gastos comunes' },
    ];

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { slug: p.slug },
            update: { description: p.description },
            create: p,
        });
    }

    // 2. Asegurar Rol Administrador
    const adminRole = await prisma.role.upsert({
        where: { name: 'Administrador' },
        update: {},
        create: {
            name: 'Administrador',
            description: 'Acceso total al sistema',
        },
    });

    // 3. Vincular todos los permisos al Administrador
    const allPermissions = await prisma.permission.findMany();
    for (const p of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: p.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: p.id,
            },
        });
    }

    // 4. Crear Usuario Administrador por defecto
    const adminEmail = 'admin@sgc.cl';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.personnel.upsert({
        where: { dni: '1-9' }, // Usamos DNI como identificador único para el personal
        update: {
            email: adminEmail,
            roleId: adminRole.id,
            password: hashedPassword,
        },
        create: {
            names: 'Admin',
            lastNames: 'Sistema',
            dni: '1-9',
            email: adminEmail,
            password: hashedPassword,
            roleId: adminRole.id,
            address: 'Santiago',
            baseSalary: 0,
        },
    });

    console.log(`✅ Admin user created/updated: ${adminUser.email}`);
    console.log('🚀 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
