# 🗺️ Guía de Rutas y Acceso - Sistema de Asistencias

## 📍 Rutas Disponibles

### 🏠 Dashboard Principal
**Ruta:** `/`

**Acceso desde:**
- Automático después de login
- Navbar: Clic en el logo o emoji 🏠

**Contenido:**
- **Monitores:** Tarjetas para acceder a Horarios y Asistencias
- **Directivos:** Tarjetas arrastrables para Horarios, Asistencias, Ajustes y Configuraciones

---

## 👤 RUTAS PARA MONITORES

### 📋 Gestión de Horarios
**Ruta:** `/horarios`

**Acceso desde:**
- Dashboard: Tarjeta "Gestión de Horarios"
- Navbar: Emoji 📋

**Funcionalidades:**
- Crear horarios múltiples
- Editar horarios individuales
- Editar todos los horarios
- Eliminar horarios
- Ver horarios existentes

---

### ✅ Mis Asistencias
**Ruta:** `/monitor/asistencias`

**Acceso desde:**
- Dashboard: Tarjeta "Mis Asistencias"
- Navbar: Emoji ✅

**Funcionalidades:**
- Registrar nueva asistencia
- Ver historial de asistencias
- Editar asistencias
- Eliminar asistencias
- Filtrar por:
  - Fecha inicio/fin
  - Estado (pendiente/autorizado/rechazado)
  - Horario específico
- Ver total de horas acumuladas

**Requisitos:**
- ⚠️ Debes tener horarios creados antes de registrar asistencias

---

## 👔 RUTAS PARA DIRECTIVOS

### 📅 Ver Horarios (Directivo)
**Ruta:** `/directivo/horarios`

**Acceso desde:**
- Dashboard: Tarjeta "Ver Horarios"
- Navbar: Emoji 📅

**Funcionalidades:**
- Ver horarios de todos los monitores
- Filtrar por:
  - Monitor específico
  - Día de la semana
  - Jornada (Mañana/Tarde)
  - Sede (San Antonio/Barcelona)
- Ver estadísticas totales

---

### ✅ Asistencias (Directivo)
**Ruta:** `/directivo/asistencias`

**Acceso desde:**
- Dashboard: Tarjeta "Asistencias"
- Navbar: Emoji ✅

**Funcionalidades:**
- Ver asistencias de todos los monitores
- Autorizar asistencias (individual o múltiple)
- Rechazar asistencias (individual o múltiple)
- Ver estadísticas:
  - Total asistencias
  - Total horas
  - Monitores distintos
  - Asistencias pendientes
- Filtrar por:
  - ID de monitor
  - Rango de fechas
  - Estado (pendiente/autorizado/rechazado)
  - Sede (San Antonio/Barcelona)
- Selección múltiple con checkboxes

---

### ⏰ Ajustes de Horas
**Ruta:** `/directivo/ajustes-horas`

**Acceso desde:**
- Dashboard: Tarjeta "Ajustes de Horas"
- Navbar: Emoji ⏰

**Funcionalidades:**
- Crear ajustes de horas (dar o quitar horas)
- Ver historial de ajustes
- Eliminar ajustes
- Buscar monitor por nombre o username
- Filtrar por:
  - Monitor específico
  - Rango de fechas

**Validaciones:**
- ✅ Rango: **-24.00 a 24.00**
- ✅ **No puede ser 0**
- ✅ Valores negativos restan horas
- ✅ Valores positivos agregan horas

---

### ⚙️ Configuraciones
**Ruta:** `/directivo/configuraciones`

**Acceso desde:**
- Dashboard: Tarjeta "Configuraciones"
- Navbar: Emoji ⚙️

**Funcionalidades:**
- Configuraciones del sistema
- (Funcionalidades según implementación existente)

---

## 🔐 Acceso por Tipo de Usuario

### Monitor
```
✅ Disponibles:
  - /
  - /horarios
  - /monitor/asistencias

❌ No disponibles:
  - /directivo/*
```

### Directivo
```
✅ Disponibles:
  - /
  - /directivo/horarios
  - /directivo/asistencias
  - /directivo/ajustes-horas
  - /directivo/configuraciones

⚠️ Acceso limitado:
  - /horarios (solo si cambia tipo de usuario)
  - /monitor/* (solo si cambia tipo de usuario)
```

---

## 📱 Navegación por Dispositivo

### 💻 Desktop
- **Navbar Superior:** Emojis clicables para acceso rápido
- **Dashboard:** Tarjetas en grid de 3 columnas (directivos) o 2 columnas (monitores)

### 📱 Mobile
- **Menú Hamburguesa:** Clic en ☰ en la esquina superior derecha
- **Menú Desplegable:** Lista completa de opciones con texto e iconos
- **Dashboard:** Tarjetas en columna única (stack)

---

## 🎨 Navbar - Referencia Rápida

### Para Monitores
```
🏠 (Dashboard) | 📋 (Horarios) | ✅ (Asistencias) | [Usuario] [Cerrar Sesión]
```

### Para Directivos
```
🏠 (Dashboard) | 📅 (Horarios) | ✅ (Asistencias) | ⏰ (Ajustes) | ⚙️ (Config) | [Usuario] [Cerrar Sesión]
```

---

## 📊 Flujo de Trabajo Típico

### Para Monitores

1. **Primer Uso:**
```
Login → Dashboard → Horarios → Crear horarios → Dashboard → Asistencias
```

2. **Uso Diario:**
```
Login → Dashboard → Asistencias → Registrar asistencia del día
```

3. **Consulta de Historial:**
```
Login → Dashboard → Asistencias → Aplicar filtros de fecha → Ver historial
```

### Para Directivos

1. **Revisión Matutina:**
```
Login → Dashboard → Asistencias → Filtrar: Estado = Pendiente → Autorizar/Rechazar
```

2. **Consulta de Horarios:**
```
Login → Dashboard → Horarios → Aplicar filtros → Ver horarios de monitores
```

3. **Ajuste Manual:**
```
Login → Dashboard → Ajustes de Horas → Buscar monitor → Crear ajuste
```

4. **Operación Masiva:**
```
Login → Dashboard → Asistencias → Seleccionar múltiples → Autorizar todas
```

---

## 🔍 Búsqueda y Filtros

### Asistencias (Monitor)
```
📅 Fecha Inicio  |  📅 Fecha Fin  |  📊 Estado  |  📋 Horario
[Aplicar Filtros] [Limpiar Filtros]
```

### Asistencias (Directivo)
```
👤 ID Monitor  |  📅 Fecha Inicio  |  📅 Fecha Fin  |  📊 Estado  |  🏢 Sede
[Aplicar Filtros] [Limpiar Filtros]
```

### Horarios (Directivo)
```
👤 ID Monitor  |  📅 Día Semana  |  🌅 Jornada  |  🏢 Sede
[Aplicar Filtros] [Limpiar Filtros]
```

### Ajustes de Horas (Directivo)
```
🔍 Buscar Monitor (autocompletado)  |  📅 Fecha Inicio  |  📅 Fecha Fin
[Aplicar] [Limpiar]
```

---

## 💡 Consejos de Navegación

1. **Usar Dashboard como Centro:**
   - Siempre puedes volver al dashboard con el logo o 🏠

2. **Navbar Siempre Visible:**
   - Está fijado en la parte superior (sticky)
   - Acceso rápido a cualquier sección

3. **Breadcrumbs Visual:**
   - El título de cada página indica dónde estás

4. **Filtros Persistentes:**
   - Los filtros se mantienen hasta que hagas clic en "Limpiar"

5. **Responsive:**
   - En móvil, usa el menú hamburguesa ☰

---

## 🚨 Errores Comunes de Navegación

### Error: "No hay horarios registrados"
**Solución:**
- Ir a `/horarios`
- Crear al menos un horario
- Regresar a `/monitor/asistencias`

### Error: "No tienes permisos"
**Solución:**
- Verificar que estás logueado con el tipo de usuario correcto
- Monitores no pueden acceder a rutas `/directivo/*`
- Directivos tienen acceso completo

### Error: "Token inválido"
**Solución:**
- Cerrar sesión
- Volver a hacer login
- Si persiste, contactar administrador

---

## 📖 Referencia Rápida de URLs

```bash
# Públicas
/               # Login/Dashboard (redirige según autenticación)

# Monitores
/horarios                    # Gestión de horarios del monitor
/monitor/asistencias         # Asistencias del monitor

# Directivos
/directivo/horarios          # Ver todos los horarios
/directivo/asistencias       # Gestionar todas las asistencias
/directivo/ajustes-horas     # Crear ajustes de horas
/directivo/configuraciones   # Configuraciones del sistema
```

---

## 🎯 Accesos Rápidos por Emoji

| Emoji | Nombre | Ruta | Usuarios |
|-------|--------|------|----------|
| 🏠 | Dashboard | `/` | Todos |
| 📋 | Horarios | `/horarios` | Monitor |
| ✅ | Asistencias | `/monitor/asistencias` | Monitor |
| 📅 | Horarios | `/directivo/horarios` | Directivo |
| ✅ | Asistencias | `/directivo/asistencias` | Directivo |
| ⏰ | Ajustes | `/directivo/ajustes-horas` | Directivo |
| ⚙️ | Config | `/directivo/configuraciones` | Directivo |

---

**Última actualización:** Noviembre 2025
**Versión del Frontend:** 2.0 (con módulo de Asistencias)

