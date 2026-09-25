---
title: Board (/board) — Integración con backend
---

Conexión de `/board` al backend real (issue #1). Fecha: 2026-09-25. Contexto previo: [[frontend/agenda-components]]. API: [[agenda-api/appointments]], [[agenda-api/admin-board]].

## Fuente de datos

Usa `GET /api/appointments` (paginado), **no** `GET /api/appointments/board`: el resumen de `/board` (`AppointmentSummaryItem`) no trae `id` ni `status`, así que no permite `confirm`/`cancel`.

- `AppointmentsService.getAll()` recorre todas las páginas (`size=100`, `expand`) y mapea a `BoardAppointment`.
- El filtro de fechas es client-side (`computed` en `BoardComponent`); cambiar rango no hace request.
- `status` llega como etiqueta en español (`Pendiente`/`Confirmado`/`Cancelado`, vía `AppointmentStatus.getDisplayName()` en `AppointmentMapper`), no como nombre del enum. `STATUS_BY_LABEL` lo traduce.
- `scheduleStart`/`scheduleEnd` son `LocalDateTime` ISO sin zona (`2026-09-26T09:00:00`).

## Transiciones (drag-and-drop y diálogo de detalle)

Reflejan `AppointmentServiceImpl`. Única fuente: `ALLOWED_TRANSITIONS` en `board.model.ts`.

| Desde | Permitido |
|---|---|
| PENDING | CONFIRMED (`confirm`), CANCELLED (`cancel`) |
| CONFIRMED | CANCELLED (`cancel`) |
| CANCELLED | — (terminal) |

- Columna inválida rechaza el drop (`cdkDropListEnterPredicate`).
- Misma columna: no-op (orden siempre por hora).
- Update optimista; si falla, revierte y muestra `message` del backend.
- Cancelar pide confirmación (`confirm-dialog`): libera el slot y no se puede deshacer.
- Por qué no hay vuelta atrás: cancelar libera el slot (otro paciente puede tomarlo) y "desconfirmar" no es un caso de negocio. El "deshacer" por error de click queda del lado backend.

## Componentes nuevos

- `shared/ui/appointment-detail-dialog` — clic en tarjeta; paciente, doctor, horario, status, acciones según transiciones.
- `shared/ui/confirm-dialog` — genérico `{title, message, confirmLabel}` → `boolean`.
- `board-column` — inputs `enterPredicate`, output `cardClick` (ignora el click que sigue a un drag).
- Estados de `BoardComponent`: `loading` (skeleton), `error` (reintentar), `ready`.

## Sesión de desarrollo (temporal)

El login real exige `clinicId` y el selector de clínica lo implementa otro dev. Mientras tanto `BoardDevAuthService` loguea con la cuenta seed de `environment.devAutoLogin` si no hay token.

- `environment.development.ts`: `devAutoLogin` con cuenta pública del `DataSeeder` (solo DB local).
- `environment.ts` (prod): `production: true`, `devAutoLogin: null` → el servicio no hace nada.
- Nunca importar `environment.development` directo: rompe `fileReplacements` y mete el entorno dev en el bundle de prod. Verificar con build prod + `grep -r "password123\|localhost:8080" dist/`.
- Borrar `BoardDevAuthService` cuando exista el login real.

## Datos de prueba

El seeder solo crea `Schedule`s, ninguna cita. Para probar: login como paciente seed, `GET /api/schedules?doctorId=…&status=AVAILABLE`, `POST /api/appointments {scheduleId, patientId}`. Las citas viven en `clinic_<id>.appointments` (schema por tenant, no `public`).

## Faltantes del backend (solo listados)

1. `AppointmentSummaryItem` sin `id`/`status`.
2. `GET /api/appointments` sin filtro `from`/`to`.
3. Sin "deshacer" confirmación/cancelación.
4. `BusinessException` → 406 (lo esperable sería 409/422).
5. `findAllByFilters` hace inner `JOIN FETCH d.specialty`: doctores sin especialidad quedan fuera; paginación en memoria.
6. Seeder no crea citas; además corre en cualquier entorno si no hay clínicas (cuentas `password123` en una DB prod nueva).
7. Contenedor local con `JWT_SECRET` por defecto y `DB_PASSWORD` vacío.
8. `status` serializado como etiqueta en español, no documentado en el OpenAPI.
