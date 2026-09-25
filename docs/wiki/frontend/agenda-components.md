---
title: Agenda Frontend — Segmentación de Componentes
---

Segmentación del mockup glass-ui (rama `glass-ui`) del módulo agendar cita en componentes reutilizables. Fecha: 2026-09-24. Backend relacionado: [[agenda-api/index]].

## Convención de carpetas

- `src/app/core/` — lo principal de la app: interceptors, models, services, utils, icons. No UI.
- `src/app/shared/components/` — librería de componentes de formulario (button, input, select) usada por login/register. Diseño plano (rounded-lg).
- `src/app/shared/ui/` — librería de componentes visuales del diseño glass (rounded-2xl/3xl, `glass-panel`, `glass-card`, `glass-modal`) usados por board, calendar y shell. Todos standalone, `input()`/`output()` signals, sin lógica de negocio — solo presentación.
- `src/app/features/<feature>/` — páginas que componen los componentes de `shared/ui` (board, calendar).
- `src/app/layout/shell/` — layout raíz (sidebar + topbar + router-outlet), también compuesto con piezas de `shared/ui`.

## Componentes ya existentes (antes de esta segmentación)

- `board-column`, `board-card` — columnas y tarjetas del Kanban.
- `calendar-day-cell` — celda de día del mes.
- `appointment-list-item` — fila de cita en listas.
- `badge`, `icon`, `loader`, `notification` — átomos genéricos.
- `new-appointment-dialog` — formulario modal de nueva cita.

## Componentes nuevos (sesión de segmentación)

- **`page-header`** (`shared/ui/page-header`) — título + subtítulo opcional (línea aparte, debajo) + slot `[titleAccessory]` (contenido inline junto al título, ej. el filtro de fechas del board) + slot de acciones a la derecha (default). Usado por `board` y `calendar`.
- **`segmented-tabs`** (`shared/ui/segmented-tabs`) — switcher de pastillas genérico `{id, label}[]`. No se usa actualmente, se deja como pieza reutilizable.
- **`calendar-nav`** (`shared/ui/calendar-nav`) — grupo prev/next/today del calendario.
- **`day-agenda-panel`** (`shared/ui/day-agenda-panel`) — panel lateral del calendario.
- **`sidebar-nav`** (`shared/ui/sidebar-nav`) — sidebar del shell. Ancho `w-72` (288px, antes `w-64`/256px) — pedido explícito para que se vea "más grueso"/limpio.
- **`topbar`** (`shared/ui/topbar`) — barra superior del shell.
- **`date-range-picker`** (`shared/ui/date-range-picker`) — ver sección propia abajo.

## Modal (`new-appointment-dialog`) — restyle a glass

Único componente fuera de la línea gráfica original. `styles.css` ganó `.glass-modal` (superficie opaca 85%, blur 24px, reutilizada también por el popover de `date-range-picker`) y `.glass-backdrop` (dim+blur propio para CDK Dialog, vía `backdropClass: 'glass-backdrop'` en `calendar.component.ts`). Formulario reescrito con inputs/botones glass. Sin cambios de comportamiento.

## Board (`/board`) — limpieza según swagger

Mock original simulaba 3 "workflows" con columnas libres y tarjetas con `priority`/`reason`/`waitMinutes` — nada de eso existe en el backend. Según [[agenda-api/admin-board]] el board solo tiene 3 estados fijos (`PENDING`/`CONFIRMED`/`CANCELLED`) y el único filtro real es `from`/`to`.

- `core/models/board.model.ts` — `Workflow` eliminado. `AppointmentStatus`, `BoardAppointment { id, clientName, doctorName?, appointmentDate, appointmentTime, status }`.
- `core/services/appointments.service.ts` — mock plano de `BoardAppointment[]`.
- `shared/ui/board-card` — solo `clientName`/`appointmentTime`/`doctorName`. Sin badge de prioridad.
- `shared/ui/board-column` — tipado a `BoardAppointment` (`Appointment` con `priority`/`reason` sigue existiendo solo para `calendar`).
- `features/board/board.component.ts` — columnas fijas (`COLUMN_DEFS`: Pending/Confirmed/Cancelled) filtradas por `dateFrom`/`dateTo`.

Drag-and-drop entre columnas no persiste a backend (mock, no regresión). Board sigue en datos mock.

## Shell — layout centrado + topbar como pieza del sistema

Layout capado con `max-w-[1680px]` centrado (fondo degradado sigue a pantalla completa). `topbar` agrupa campanita+avatar en un pill `glass-panel`. Sin scroll global — cada sección con su propio `overflow-y-auto`/`overflow-x-auto` (ya estaba resuelto).

## Date-range-picker — reemplazo de los `<input type="date">` nativos

Se construyó propio (no se instaló librería: el proyecto ya tenía el motor de calendario de `/calendar` — `buildMonthMatrix`, `formatMonthLabel`, `toIso`/`parseIso` — y no hay Material/PrimeNG instalado; una librería de terceros pelearía contra el theming glass).

`shared/ui/date-range-picker`:
- Popover `glass-modal` anclado bajo el trigger, cierra con capa `fixed inset-0` invisible (mismo patrón que `shared/components/select-component`, sin `@angular/cdk/overlay`).
- Selección estilo Airbnb: 1er click fija inicio (popover sigue abierto, hover-preview del rango), 2do click fija fin y cierra+aplica solo; si el 2do click es anterior al 1ro se invierten. Click repetido reinicia a un solo día.
- Presets: "Today", "Next 7 days", "This month".
- Ubicación final: chip con fondo `bg-gray-900/[0.05]` en línea junto al título "Appointments" (`page-header`'s slot `[titleAccessory]`, `flex items-center gap-3`), tras iterar por: pill pesado a la derecha → texto plano debajo (invisible) → chip debajo (visible pero separado) → chip en línea junto al título (final).

## Fixes de recorte por `overflow` (esquinas del calendario + hover de cards)

Dos contenedores con `overflow-y-auto` cortaban el `box-shadow` de sus hijos porque no tenían margen de holgura: el navegador clipea en el borde exacto del *padding box*, y un anillo/sombra que sobresale del último elemento de una fila/columna se corta ahí mismo.

- **Grilla de días de `/calendar`** (`calendar.component.html`): el anillo de selección (`shadow-[0_0_0_2px_var(--color-primary),...]` en `calendar-day-cell`) se cortaba en las celdas de las 4 esquinas de la grilla de 6 semanas. La grilla tiene `overflow-y-auto`, y por spec CSS eso vuelve el `overflow-x` efectivo `auto` también (deja de ser `visible`), así que clipea en ambos ejes. Fix: `-m-2 ... p-2` en el contenedor (`grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-2.5 overflow-y-auto`) — margen negativo + padding del mismo tamaño no mueve el contenido (se cancelan), pero mueve el punto de clip 8px más afuera, dando margen para que el anillo respire. Alineación con la fila de labels (MON/TUE/…) arriba, que no tiene este ajuste, se preserva exactamente por la misma razón (el contenido real queda en la misma posición).
- **Lista de citas del día en `day-agenda-panel`**: la primera card se cortaba un poco al hacer hover porque `.glass-card:hover` (en `styles.css`) aplica `translateY(-6px) scale(1.02)` + sombra más grande, y el contenedor scrollable solo tenía `pt-1.5` (6px) de aire. Mismo fix: `-m-2 ... p-2 pt-3.5` (el `pt-3.5` en vez de `p-2` parejo preserva el gap visual original de 6px contra el header del panel, ya que `-mt-2` + `pt-3.5` = +6px netos, igual que antes, pero con 8px de buffer real antes del punto de clip).

Verificado en browser: las 4 esquinas de septiembre 2026 (31, 6, 5, 11) muestran el anillo completo al seleccionarse; hover sobre la primera card del panel lateral ya no se corta contra el header.

## Pendiente / no tocado

- `shared/components/*` (button/input/select del flujo login-register) — diseño distinto, fuera de scope glass-ui.
- SVG inline duplicados en `board-card`/`appointment-list-item` — no migrados al `icon-registry`.
- Validación del formulario del modal no muestra mensajes de error en UI (gap preexistente).
- `calendar` no usa `date-range-picker` (sigue con `calendar-nav` propio) — fuera de scope, no se pidió.
- Board no filtra por `doctorId`/`patientId` aún.
- Board sigue en datos mock, no conectado a `GET /api/appointments/board` real.
