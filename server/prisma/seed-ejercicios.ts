import prisma from '../src/lib/prisma.js'

const videoUrl = 'https://www.youtube.com/watch?v=jlFl7WJ1TzI'
const imagenUrl = '/static/imagenes/ejercicios/ejercicio-placeholder.svg'

const ejercicios = [
  { nombre: 'Press banca', musculoPrincipal: 'Pectoral', musculoSecundario: 'Tríceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Empuje' as const, descripcion: 'Ejercicio básico de empuje horizontal para el desarrollo del pecho.' },
  { nombre: 'Press inclinado', musculoPrincipal: 'Pectoral superior', musculoSecundario: 'Tríceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Empuje' as const, descripcion: 'Variante de press enfocada en la parte superior del pectoral.' },
  { nombre: 'Press militar', musculoPrincipal: 'Hombro', musculoSecundario: 'Tríceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Empuje' as const, descripcion: 'Press por encima de la cabeza para el desarrollo del hombro.' },
  { nombre: 'Fondos', musculoPrincipal: 'Pectoral', musculoSecundario: 'Tríceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Empuje' as const, descripcion: 'Ejercicio a peso corporal para pecho y tríceps.' },
  { nombre: 'Aperturas', musculoPrincipal: 'Pectoral', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Empuje' as const, descripcion: 'Aislamiento del pectoral con mancuernas en posición de apertura.' },
  { nombre: 'Curl con barra', musculoPrincipal: 'Bíceps', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Flexion' as const, descripcion: 'Curl clásico con barra para el desarrollo del bíceps.' },
  { nombre: 'Curl martillo', musculoPrincipal: 'Bíceps', musculoSecundario: 'Braquial', tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Flexion' as const, descripcion: 'Variante de curl con palmas enfrentadas para braquial y bíceps.' },
  { nombre: 'Curl predicador', musculoPrincipal: 'Bíceps', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Flexion' as const, descripcion: 'Curl con apoyo en banco predicador para máxima tensión en bíceps.' },
  { nombre: 'Dominadas', musculoPrincipal: 'Dorsal', musculoSecundario: 'Bíceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Traccion' as const, descripcion: 'Tracción vertical clásica a peso corporal.' },
  { nombre: 'Remo con barra', musculoPrincipal: 'Espalda media', musculoSecundario: 'Bíceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Traccion' as const, descripcion: 'Remo a dos manos con barra para el desarrollo de la espalda.' },
  { nombre: 'Jalón al pecho', musculoPrincipal: 'Dorsal', musculoSecundario: 'Bíceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Traccion' as const, descripcion: 'Alternativa a dominadas en polea alta.' },
  { nombre: 'Remo en máquina', musculoPrincipal: 'Espalda media', musculoSecundario: 'Bíceps', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Traccion' as const, descripcion: 'Remo asistido en máquina para espalda.' },
  { nombre: 'Face pull', musculoPrincipal: 'Deltoides posterior', musculoSecundario: 'Trapecio', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Traccion' as const, descripcion: 'Ejercicio para la salud del hombro y deltoides posterior.' },
  { nombre: 'Sentadilla', musculoPrincipal: 'Cuádriceps', musculoSecundario: 'Glúteos', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'DominanteRodilla' as const, descripcion: 'Movimiento fundamental de piernas.' },
  { nombre: 'Prensa', musculoPrincipal: 'Cuádriceps', musculoSecundario: 'Glúteos', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'DominanteRodilla' as const, descripcion: 'Empuje en máquina de piernas.' },
  { nombre: 'Extensión de cuádriceps', musculoPrincipal: 'Cuádriceps', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Extension' as const, descripcion: 'Aislamiento del cuádriceps en máquina de extensión.' },
  { nombre: 'Peso muerto', musculoPrincipal: 'Isquiotibiales', musculoSecundario: 'Espalda baja', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'DominanteCadera' as const, descripcion: 'Movimiento fundamental de cadena posterior.' },
  { nombre: 'Peso muerto rumano', musculoPrincipal: 'Isquiotibiales', musculoSecundario: 'Glúteos', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'DominanteCadera' as const, descripcion: 'Variante de peso muerto a piernas semi-extendidas.' },
  { nombre: 'Hip thrust', musculoPrincipal: 'Glúteos', musculoSecundario: 'Isquiotibiales', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'DominanteCadera' as const, descripcion: 'Empuje de cadera para desarrollo de glúteos.' },
  { nombre: 'Curl femoral', musculoPrincipal: 'Isquiotibiales', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Flexion' as const, descripcion: 'Aislamiento de isquiotibiales en máquina de curl femoral.' },
  { nombre: 'Elevación de talones', musculoPrincipal: 'Gemelos', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Extension' as const, descripcion: 'Trabajo de pantorrillas en máquina o parado.' },
  { nombre: 'Plancha', musculoPrincipal: 'Abdominales', musculoSecundario: null, tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Antirrotacion' as const, descripcion: 'Isométrico de core en posición de plancha.' },
  { nombre: 'Pallof press', musculoPrincipal: 'Abdominales', musculoSecundario: 'Oblicuos', tipoArticular: 'Monoarticular' as const, patronMovimiento: 'Antirrotacion' as const, descripcion: 'Ejercicio antirrotación con polea.' },
  { nombre: 'Giro ruso', musculoPrincipal: 'Oblicuos', musculoSecundario: 'Abdominales', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Rotacion' as const, descripcion: 'Rotación de tronco con peso.' },
  { nombre: 'Farmer walk', musculoPrincipal: 'Core', musculoSecundario: 'Trapecio', tipoArticular: 'Poliarticular' as const, patronMovimiento: 'Antirrotacion' as const, descripcion: 'Caminata con peso muerto en cada mano.' },
]

async function main() {
  const trainer = await prisma.usuario.findUnique({ where: { correo: 'ursito@test.com' } })
  if (!trainer) {
    console.error('Trainer no encontrado. Ejecutá primero el seed principal.')
    process.exit(1)
  }

  for (const ej of ejercicios) {
    await prisma.ejercicio.create({
      data: {
        nombre: ej.nombre,
        musculoPrincipal: ej.musculoPrincipal,
        musculoSecundario: ej.musculoSecundario,
        tipoArticular: ej.tipoArticular,
        patronMovimiento: ej.patronMovimiento,
        imagenUrl,
        videoUrl,
        descripcion: ej.descripcion,
        creadoPor: trainer.id,
      },
    })
  }

  console.log(`✓ ${ejercicios.length} ejercicios insertados`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
