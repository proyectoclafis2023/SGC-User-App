const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const list = await prisma.banco.findMany({ take: 1 });
        console.log('Result:', JSON.stringify(list));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
