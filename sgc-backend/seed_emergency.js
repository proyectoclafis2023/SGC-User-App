const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clear existing if any to avoid duplicates in this test
    await prisma.emergencyNumber.deleteMany({});

    await prisma.emergencyNumber.createMany({
        data: [
            { name: 'Ambulancia (SAMU)', phone: '131', category: 'URGENCIA', description: 'Atención médica de urgencia' },
            { name: 'Bomberos', phone: '132', category: 'URGENCIA', description: 'Emergencias y rescate' },
            { name: 'Carabineros', phone: '133', category: 'COMUNAL', description: 'Seguridad y orden público' },
            { name: 'PDI', phone: '134', category: 'COMUNAL', description: 'Investigaciones' },
            { name: 'Seguridad Municipal', phone: '14XX', category: 'COMUNAL', description: 'Patrullaje preventivo' },
            { name: 'Enel (Electricidad)', phone: '600 696 0000', category: 'SERVICIOS', description: 'Emergencias eléctricas' }
        ]
    });
    console.log('Seed updated with UI categories!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
