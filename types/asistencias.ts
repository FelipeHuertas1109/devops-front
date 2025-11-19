import { Usuario } from './auth';
import { Horario } from './horarios';

// Estados de autorización de asistencias
export type EstadoAutorizacion = 'pendiente' | 'autorizado' | 'rechazado';

// Asistencia completa (respuesta del backend)
export interface Asistencia {
  id: number;
  usuario: Usuario;
  horario: Horario;
  fecha: string; // Formato: YYYY-MM-DD
  presente: boolean;
  estado_autorizacion: EstadoAutorizacion;
  estado_autorizacion_display: string;
  horas: number;
  created_at: string;
  updated_at: string;
}

// Request para crear asistencia
export interface AsistenciaCreateRequest {
  horario_id: number;
  fecha: string; // Formato: YYYY-MM-DD
  presente: boolean;
  horas: number;
}

// Request para actualizar asistencia
export interface AsistenciaUpdateRequest {
  presente?: boolean;
  horas?: number;
  estado_autorizacion?: EstadoAutorizacion;
}

// Respuesta de lista de asistencias (monitor)
export interface AsistenciasListResponse {
  total_asistencias: number;
  total_horas: number;
  asistencias: Asistencia[];
}

// Parámetros de filtrado para asistencias (monitor)
export interface AsistenciasFiltros {
  fecha_inicio?: string; // Formato: YYYY-MM-DD
  fecha_fin?: string; // Formato: YYYY-MM-DD
  estado?: EstadoAutorizacion;
  horario_id?: number;
}

// Respuesta de lista de asistencias (directivo)
export interface AsistenciasDirectivoResponse {
  total_asistencias: number;
  total_horas: number;
  monitores_distintos: number;
  asistencias: Asistencia[];
}

// Parámetros de filtrado para asistencias (directivo)
export interface AsistenciasDirectivoFiltros {
  usuario_id?: number;
  fecha_inicio?: string; // Formato: YYYY-MM-DD
  fecha_fin?: string; // Formato: YYYY-MM-DD
  estado?: EstadoAutorizacion;
  sede?: 'SA' | 'BA';
}

// Request para autorizar/rechazar asistencia
export interface AutorizarAsistenciaRequest {
  estado_autorizacion: EstadoAutorizacion;
}

// Mapeo de estados para UI
export const ESTADOS_ASISTENCIA: Record<EstadoAutorizacion, string> = {
  pendiente: 'Pendiente',
  autorizado: 'Autorizado',
  rechazado: 'Rechazado'
};

// Colores para estados en la UI
export const COLORES_ESTADOS: Record<EstadoAutorizacion, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  autorizado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800'
};

