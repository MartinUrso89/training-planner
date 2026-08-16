# AGENTS.md — Training Planner

App de entrenamiento donde los entrenadores asignan rutinas a atletas vinculados.
Misma web para ambos roles (`ENTRENADOR` / `ATLETA`); un atleta puede tener
**varios entrenadores** a la vez. Código, endpoints y tipos en español.
Monorepo con dos paquetes:

```
training-planner/
  client/   Vite + React 19 + TS + Tailwind 4 + react-router-dom + axios
  server/   Express 5 + Prisma 5 + MySQL + JWT (access/refresh) + vitest/supertest
```

## Comandos

### Server (`workdir: server`)
- `pnpm dev` — tsx watch src/index.ts (puerto 3000, health: `GET /health`)
- `pnpm test` — vitest run (usa DB `training_planner_test`)
- `pnpm typecheck` / `pnpm lint`
- `npx prisma db push` — sincroniza schema → DB dev (REQUIERE server detenido)
- `pnpm db:test:push` — sincroniza DB de tests
- `pnpm db:generate` — regenera Prisma Client (postinstall)
- `pnpm db:seed` — seed dev
- `pnpm build` + `pnpm start` — compilado

### Client (`workdir: client`)
- `pnpm dev` — Vite (la API se configura con `VITE_API_URL` en client/.env)
- `pnpm typecheck` (tsc -b) / `pnpm lint` / `pnpm build` / `pnpm test`

## Arquitectura backend (patrón obligatorio)
`routes → service → database`, sin lógica en las rutas.
- `src/presentation/routes/` — routers Express con auth por middleware.
- `src/domain/services/` — validaciones y reglas; errores con `createHttpError(código, mensaje)` de `src/lib/errors`.
- `src/infrastructure/database/` — acceso Prisma.
- `src/domain/types/` — tipos compartidos.
- Tests con supertest en `server/test/` (crear usuarios, login → token, llamar endpoint).

Convenciones: respuestas `{ datos, mensaje?, total?, pagina?, limite? }`; errores `{ mensaje }`; fechas ISO `...Z`; fechas de entrenamiento normalizadas a día (sin hora local). No escribir comentarios en el código salvo que se pidan.

## Entidades clave (`server/prisma/schema.prisma`)
- `Usuario` (rol, credenciales bcrypt, refreshTokens).
- `Ejercicio`, `Plantilla` → `Seccion` → `PlantillaEjercicio` (plan) vs `EjercicioRegistro` (real).
- `Vinculacion` (entrenador↔atleta, `@@unique`, estado Pendiente/Activo/Inactivo, `notasEntrenador` privadas por par).
- `PerfilAtleta` (objetivoPrincipal, diasPorSemana, descripcion).
- `Entrenamiento` (asignación: `fecha`, `completado`, `completadoEn`, `comentario` del atleta, `nombreRutina` snapshot del nombre al asignar).

## Windows / PowerShell gotchas
- `prisma generate`/`db push` fallan con EPERM (`query_engine-windows.dll.node`) si `tsx watch` está vivo → detener el server dev ANTES y relanzarlo después.
- Levantar server dev en background:
  `Start-Process -FilePath "pnpm.cmd" -ArgumentList "run","dev" -WorkingDirectory "D:\Martin\Entrenamiento\training-planner\server" -RedirectStandardOutput <out.log> -RedirectStandardError <err.log>`
  Detenerlo matando los `node.exe` cuyo CommandLine contenga `tsx.*src/index.ts`.
- `$pid` es variable reservada de PowerShell (usar `$id`/`$plantillaId`).
- El usuario prefiere NO gastar tokens en levantar/detener el server ni en migraciones: cuando hagan falta, entregarle los comandos listos para que los corra él.

## Despliegue futuro
Hoy todo es local. Cuando algo impacte un futuro deploy (URLs hardcodeadas, CORS,
credenciales de MySQL, almacenamiento de imágenes, env vars), **avisarlo** en el
momento en que aparezca.

## Datos dev (para smoke tests)
- ENTRENADOR: `ursito@test.com` / `123456`
- ATLETA: `lucia@test.com` / `123456` (Lucía Fernández)
- En la UI de atleta, las rutinas asignadas se completan desde la vista del atleta.

## Roadmap (actualizar al cierre de cada sesión)
Estado: ✅ hecho · 🔶 en curso · ⏳ próximo · 💭 idea

### ✅ Hecho
- Vinculaciones, dashboard Entrenados, perfil de atleta (card editable).
- Tab Entrenamientos realizados: comentario del atleta + nombre de rutina, ítem en una línea, detalle en `/entrenamientos/:id`.
- Backend Rutinas pendientes: `GET /entrenados/:atletaId/rutinas-pendientes` (orden fecha asc, límite 15).
- Tab Rutinas pendientes (N) en PerfilEntrenado (frontend completo).
- Tab Notas del entrenador: textarea grande + guardar inline. Backend: `Vinculacion.notasEntrenador` (privadas por par), `PUT /entrenados/:atletaId/notas`, máx 2000 chars, 403 si no hay vinculación activa. Schema ya migrado (dev + test).
- CI en GitHub Actions: corre lint, typecheck, build (server+client) y tests en push a `develop` y PRs hacia `develop`. Usa MySQL 8 como servicio, setea `DATABASE_URL`/secrets a nivel de job y hace `prisma db push --skip-generate` antes de los tests.
- Fix build server: `tsconfig.build.json` sin `declaration: true` (TS2742 con Express 5 + pnpm).
- Experiencia del atleta: sidebar/dashboard propios por rol (`ATLETA` vs `ENTRENADOR`), rutas protegidas con `RutaRol`.
- Backend atleta: `GET /entrenamientos/mios` (listado liviano paginado con filtros `completado`, `desde`/`hasta` para calendario). Logs de ejercicios ahora validan ownership (403) y que la rutina no esté completada (409); `POST /entrenamientos/:id/completar` devuelve 409 si ya está completada.
- Vistas atleta: `Mis rutinas` (pendientes), `Histórico` (realizadas), `Estadísticas` (placeholder).
- Dashboard atleta (única vista de inicio): tarjetas de secciones → banner azul "Próximo entrenamiento" full-width con "Comenzar próximo entrenamiento asignado" → calendario mensual embebido (`CalendarioMensual`, verde=completada/ámbar=pendiente). No hay ruta `/calendario` ni solapa en el sidebar (se eliminaron al embeberse).
- `RutinaDetalle` editable para el atleta: carga de resultados por serie (reps, peso, RPE, duración, comentario, ✓) con PUT en blur, "Agregar serie", y botón "Completar rutina" con comentario general. Para entrenador sigue en solo lectura.

### 🔶 En curso
- (nada pendiente por ahora)

### ⏳ Próximo
- Estadísticas (contenido a definir: frecuencia, volumen por músculo, progreso de fuerza, plan vs real).
- Pendientes menores detectadas: no hay endpoint para `SeccionEntrenamiento.rondasCompletadas`/`tiempoTotalReal` (se pueden dejar fuera por ahora); no hay borrado de series/registros.

### 💭 Ideas
- Notificaciones/recordatorios de rutinas.
- Calendario / plan semanal.
