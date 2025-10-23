# 🎯 Alcance del Laboratorio I

## ✅ Funcionalidades Implementadas.

Este proyecto frontend ahora está alineado con el **Laboratorio I** del backend, que incluye únicamente:

### 1. Autenticación JWT (HU1, HU2)
- ✅ Login de usuarios
- ✅ Registro de monitores
- ✅ Gestión de tokens JWT
- ✅ Obtención de información del usuario actual

### 2. Gestión de Horarios (HU3)
- ✅ Crear horarios fijos para monitores
- ✅ Listar horarios propios (monitores)
- ✅ Editar y eliminar horarios
- ✅ Crear múltiples horarios en una sola operación
- ✅ Reemplazar todos los horarios de un usuario
- ✅ Consultar horarios de todos los monitores (directivos)
- ✅ Filtrar horarios por usuario, día, jornada y sede

### 3. Ajustes Manuales de Horas (HU7A)
- ✅ Crear ajustes de horas para monitores (positivos o negativos)
- ✅ Listar ajustes con filtros por monitor y período
- ✅ Ver estadísticas de ajustes
- ✅ Eliminar ajustes de horas

### 4. Administración de Configuraciones del Sistema (HU9)
- ✅ Listar configuraciones del sistema
- ✅ Crear nuevas configuraciones
- ✅ Actualizar configuraciones existentes
- ✅ Eliminar configuraciones
- ✅ Inicializar configuraciones por defecto (costo_por_hora, semanas_semestre)

---

## ❌ Funcionalidades Fuera de Alcance

Las siguientes funcionalidades han sido **removidas** del frontend ya que no están disponibles en el backend del Laboratorio I:

### 1. Registro y Autorización de Asistencias
- ❌ Marcación de asistencias por monitores
- ❌ Autorización de asistencias por directivos
- ❌ Consulta de asistencias del día

### 2. Reportes Operativos y Financieros
- ❌ Generación de reportes de asistencias
- ❌ Reportes individuales y generales
- ❌ Exportación a PDF

### 3. Análisis Financiero
- ❌ Cálculo de costos por monitor
- ❌ Proyecciones financieras
- ❌ Análisis de gastos por período

### 4. Visualizaciones Avanzadas
- ❌ Heatmap de asistencias anuales
- ❌ Gráficos de estadísticas

---

## 📁 Estructura del Proyecto

### Componentes Mantenidos
- `AuthContainer.tsx` - Contenedor de autenticación
- `LoginForm.tsx` - Formulario de login
- `RegisterForm.tsx` - Formulario de registro
- `Dashboard.tsx` - Dashboard principal (simplificado)
- `Navbar.tsx` - Barra de navegación (simplificada)
- `HorariosManager.tsx` - Gestión de horarios para monitores
- `DirectivoHorarios.tsx` - Gestión de horarios para directivos
- `DirectivoAjustesHoras.tsx` - Gestión de ajustes de horas
- `DirectivoConfiguraciones.tsx` - **NUEVO** - Gestión de configuraciones

### Componentes Eliminados
- ~~`MonitorAsistencias.tsx`~~
- ~~`DirectivoAsistencias.tsx`~~
- ~~`DirectivoReportes.tsx`~~
- ~~`DirectivoFinanzas.tsx`~~
- ~~`HeatmapAsistencia.tsx`~~
- ~~`DataValidationAlert.tsx`~~

### Servicios Mantenidos
- `auth.ts` - Autenticación
- `horarios.ts` - Gestión de horarios (monitores)
- `directivoHorarios.ts` - Gestión de horarios (directivos)
- `ajustesHoras.ts` - Ajustes de horas
- `directivo.ts` - Operaciones de directivos
- `configuraciones.ts` - **NUEVO** - Gestión de configuraciones

### Servicios Eliminados
- ~~`asistencias.ts`~~
- ~~`reportes.ts`~~
- ~~`finanzas.ts`~~
- ~~`heatmap.ts`~~

### Tipos Mantenidos
- `auth.ts` - Tipos de autenticación
- `horarios.ts` - Tipos de horarios
- `ajustesHoras.ts` - Tipos de ajustes de horas
- `directivo.ts` - Tipos de directivos
- `configuraciones.ts` - **NUEVO** - Tipos de configuraciones

### Tipos Eliminados
- ~~`asistencias.ts`~~
- ~~`reportes.ts`~~
- ~~`finanzas.ts`~~
- ~~`heatmap.ts`~~

### Páginas Mantenidas
- `app/page.tsx` - Página principal (Dashboard)
- `app/horarios/page.tsx` - Gestión de horarios (monitores)
- `app/directivo/horarios/page.tsx` - Consulta de horarios (directivos)
- `app/directivo/ajustes-horas/page.tsx` - Ajustes de horas
- `app/directivo/configuraciones/page.tsx` - **NUEVO** - Configuraciones

### Páginas Eliminadas
- ~~`app/monitor/asistencias/page.tsx`~~
- ~~`app/directivo/asistencias/page.tsx`~~
- ~~`app/directivo/reportes/page.tsx`~~
- ~~`app/directivo/finanzas/page.tsx`~~
- ~~`app/directivo/heatmap/page.tsx`~~

### Utilidades Eliminadas
- ~~`hooks/usePDFGenerator.ts`~~
- ~~`utils/dataValidation.ts`~~

---

## 🎨 Interfaz de Usuario

### Dashboard Principal
El dashboard ahora muestra únicamente las funcionalidades disponibles:

**Para Monitores:**
- Gestión de Horarios

**Para Directivos:**
- Ver Horarios (de todos los monitores)
- Ajustes de Horas
- Configuraciones del Sistema

### Barra de Navegación
La navbar ha sido simplificada para mostrar solo:

**Para Monitores:**
- 🏠 Dashboard
- 📋 Horarios

**Para Directivos:**
- 🏠 Dashboard
- 📅 Horarios
- ⏰ Ajustes de Horas
- ⚙️ Configuraciones

---

## 🔄 Cambios Principales

1. **Eliminación de referencias a asistencias**: Se removieron todos los componentes, servicios y tipos relacionados con asistencias.

2. **Simplificación del Dashboard**: Ya no muestra opciones de marcación rápida ni tarjetas para funcionalidades no disponibles.

3. **Navbar minimalista**: Solo muestra las opciones disponibles en el Laboratorio I.

4. **Nueva funcionalidad de Configuraciones**: Se agregó completamente la gestión de configuraciones del sistema.

5. **Eliminación de documentación obsoleta**: Se removieron archivos de documentación que ya no aplican.

---

## 🚀 Próximos Pasos

Para futuras fases del proyecto (Laboratorio II), se podrán agregar:
- Registro y autorización de asistencias
- Generación de reportes
- Análisis financiero
- Visualizaciones avanzadas (heatmap)

---

## 📝 Notas Importantes

- Todos los endpoints del backend están configurados con el prefijo `/example/`
- La autenticación es mediante JWT Bearer tokens
- Los tokens no expiran (configuración de desarrollo)
- Solo hay dos tipos de usuario: MONITOR y DIRECTIVO
- Las jornadas son de 4 horas (Mañana o Tarde)
- Hay dos sedes: San Antonio (SA) y Barcelona (BA)

---

## 🔗 Endpoints del Backend

Base URL: `http://localhost:8000/example/`

### Autenticación
- `POST /registro/` - Registro de usuario
- `POST /login/` - Login
- `GET /usuario/actual/` - Obtener usuario actual

### Horarios
- `GET/POST /horarios/` - Listar/Crear horarios
- `GET/PUT/DELETE /horarios/{id}/` - Operaciones sobre horario específico
- `POST /horarios/multiple/` - Crear múltiples horarios
- `POST /horarios/edit-multiple/` - Reemplazar todos los horarios
- `GET /directivo/horarios/` - Listar horarios de todos (directivos)

### Ajustes de Horas
- `GET/POST /directivo/ajustes-horas/` - Listar/Crear ajustes
- `GET/DELETE /directivo/ajustes-horas/{id}/` - Operaciones sobre ajuste específico

### Configuraciones
- `GET /directivo/configuraciones/` - Listar configuraciones
- `POST /directivo/configuraciones/crear/` - Crear configuración
- `POST /directivo/configuraciones/inicializar/` - Inicializar configuraciones por defecto
- `GET/PUT/DELETE /directivo/configuraciones/{clave}/` - Operaciones sobre configuración específica

---

**Fecha de última actualización:** Octubre 23, 2025  
**Versión del frontend:** Laboratorio I  
**Compatible con backend:** Laboratorio I

