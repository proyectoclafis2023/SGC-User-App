const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Limpiar plantillas existentes para evitar duplicados en esta prueba
    await prisma.communicationTemplate.deleteMany({});

    await prisma.communicationTemplate.createMany({
        data: [
            {
                name: 'Aviso de Mora y Corte',
                subject: 'AVISO IMPORTANTE: Morosidad en Gastos Comunes - [UNIDAD]',
                type: 'mora',
                message: `Estimado Copropietario(a):

Le informamos que su unidad registra una morosidad superior a [MAX_MESES] meses. 
De acuerdo al reglamento de copropiedad, el no pago antes del día [DIA_LIMITE] facultará a la administración para proceder con el corte de suministro eléctrico y la aplicación de una multa de [MULTA].

Le instamos a regularizar su situación a la brevedad.

Atentamente,
La Administración.`
            },
            {
                name: 'Convocatoria Asamblea Ordinaria',
                subject: 'CITACIÓN: Asamblea Ordinaria de Copropietarios - [AÑO]',
                type: 'asamblea',
                message: `Estimados Residentes:

Se les cita a la Asamblea Ordinaria de Copropietarios a realizarse el día [FECHA] a las [HORA] en [LUGAR].

Tabla de la sesión:
1. Lectura de acta anterior.
2. Rendición de cuentas de la administración.
3. Renovación del Comité de Administración.
4. Otros temas de interés.

Su asistencia es fundamental para el buen funcionamiento de nuestra comunidad.`
            },
            {
                name: 'Asamblea Extraordinaria Urgente',
                subject: 'URGENTE: Citación a Asamblea Extraordinaria',
                type: 'asamblea',
                message: `Estimados Copropietarios:

Dada la urgencia de tratar el tema [TEMA_URGENTE], se cita a Asamblea Extraordinaria para el día [FECHA] a las [HORA].

Se solicita puntual asistencia dada la importancia de las decisiones a tomar.

Saludos cordiales.`
            },
            {
                name: 'Circular Mantención de Ascensores',
                subject: 'AVISO: Mantención Programada de Ascensores',
                type: 'comunicado',
                message: `Informamos que el día [FECHA], entre las [HORA_INICIO] y [HORA_FIN], se realizará la mantención trimestral de los ascensores de la torre [TORRE].

Agradecemos su comprensión y pedimos disculpas por los inconvenientes.`
            }
        ]
    });
    console.log('¡Plantillas cargadas con éxito!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
