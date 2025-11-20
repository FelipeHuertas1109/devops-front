import { Usuario } from './auth';

// Estados y catálogos
export type EstadoAutorizacion = 'pendiente' | 'autorizado' | 'rechazado';
export type Jornada = 'M' | 'T';
export type Sede = 'SA' | 'BA';

// Entidades
export interface Horario {
  id: number;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'username' | 'tipo_usuario' | 'tipo_usuario_display'>;
  dia_semana: number;
  dia_semana_display: string;
  jornada: Jornada;
  jornada_display: string;
  sede: Sede;
  sede_display: string;
}

// Estructura del backend (formato directo)
export interface AsistenciaBackend {
  id: number;
  monitor: string;
  monitor_id: number;
  monitor_username: string;
  dia: string; // YYYY-MM-DD
  dia_display: string;
  jornada: Jornada;
  jornada_display: string;
  sede: Sede;
  sede_display: string;
  marcado: boolean;
  estado: EstadoAutorizacion;
  estado_display: string;
  horas: number;
}

export interface Asistencia {
  id: number;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'username' | 'tipo_usuario' | 'tipo_usuario_display'>;
  fecha: string; // YYYY-MM-DD
  horario: Horario;
  presente: boolean;
  estado_autorizacion: EstadoAutorizacion;
  estado_autorizacion_display: string;
  horas: number;
}

// Función helper para convertir del formato del backend al formato esperado
export function mapearAsistenciaBackend(backend: AsistenciaBackend): Asistencia {
  return {
    id: backend.id,
    usuario: {
      id: backend.monitor_id,
      nombre: backend.monitor,
      username: backend.monitor_username,
      tipo_usuario: 'MONITOR' as const,
      tipo_usuario_display: 'Monitor',
    },
    fecha: backend.dia,
    horario: {
      id: 0, // No viene en el backend
      usuario: {
        id: backend.monitor_id,
        nombre: backend.monitor,
        username: backend.monitor_username,
        tipo_usuario: 'MONITOR' as const,
        tipo_usuario_display: 'Monitor',
      },
      dia_semana: 0, // No viene en el backend
      dia_semana_display: backend.dia_display,
      jornada: backend.jornada,
      jornada_display: backend.jornada_display,
      sede: backend.sede,
      sede_display: backend.sede_display,
    },
    presente: backend.marcado,
    estado_autorizacion: backend.estado,
    estado_autorizacion_display: backend.estado_display,
    horas: backend.horas,
  };
}

// Directivo: listar asistencias
export interface ListarAsistenciasQuery {
  fecha?: string; // YYYY-MM-DD - opcional, si no se envía trae las de hoy
  estado?: EstadoAutorizacion | '';
  jornada?: Jornada | '';
  sede?: Sede | '';
}

export interface ListarAsistenciasResponse {
  resultados?: Asistencia[]; // Compatibilidad con formato anterior
  asistencias?: Asistencia[]; // Formato actual del backend
  total_asistencias?: number;
  total_horas?: number;
  monitores_distintos?: number;
  // Posible paginación si el backend la incluye en el futuro
  total?: number;
  pagina?: number;
  paginas?: number;
}

// Directivo: autorizar / rechazar
export interface AccionAsistenciaResponse extends Asistencia {}

// Monitor: ver mis asistencias
export interface MisAsistenciasQuery {
  fecha?: string; // YYYY-MM-DD - opcional, si no se envía trae las de hoy
}

export type MisAsistenciasResponse = Asistencia[];

// Monitor: marcar presente
export interface MarcarPresenteRequest {
  fecha: string; // YYYY-MM-DD
  jornada: Jornada;
}

export interface MarcarPresenteResponse extends Asistencia {}


