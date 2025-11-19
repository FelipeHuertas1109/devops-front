import { environment } from '../config/environment';
import {
  Asistencia,
  AsistenciasDirectivoResponse,
  AsistenciasDirectivoFiltros,
  AutorizarAsistenciaRequest
} from '../types/asistencias';

export class DirectivoAsistenciaService {
  private static baseUrl = environment.backendUrl;

  /**
   * Listar todas las asistencias de todos los monitores
   * GET /api/directivo/asistencias/
   */
  static async listarTodas(
    filtros: AsistenciasDirectivoFiltros,
    token: string
  ): Promise<AsistenciasDirectivoResponse> {
    console.log('Obteniendo asistencias de todos los monitores con filtros:', filtros);

    // Construir query params
    const params = new URLSearchParams();
    if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id.toString());
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.sede) params.append('sede', filtros.sede);

    const queryString = params.toString();
    const url = `${this.baseUrl}/directivo/asistencias/${queryString ? '?' + queryString : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        if (response.status === 401) {
          throw new Error('Token de autenticación inválido');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos de directivo para ver asistencias');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: AsistenciasDirectivoResponse = await response.json();
      console.log('Asistencias obtenidas exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error completo:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Error de conexión. Verifica que el backend esté ejecutándose en ${this.baseUrl}`);
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error de conexión desconocido');
    }
  }

  /**
   * Autorizar o rechazar una asistencia
   * PUT /api/directivo/asistencias/{id}/autorizar/
   */
  static async autorizarAsistencia(
    id: number,
    estadoData: AutorizarAsistenciaRequest,
    token: string
  ): Promise<Asistencia> {
    console.log('Autorizando asistencia ID:', id, 'con estado:', estadoData);

    // Validar estado
    const estadosValidos = ['pendiente', 'autorizado', 'rechazado'];
    if (!estadosValidos.includes(estadoData.estado_autorizacion)) {
      throw new Error('Estado debe ser: pendiente, autorizado o rechazado');
    }

    try {
      const response = await fetch(`${this.baseUrl}/directivo/asistencias/${id}/autorizar/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify(estadoData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = null;
        }

        if (response.status === 401) {
          throw new Error('Token de autenticación inválido');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos de directivo para autorizar asistencias');
        } else if (response.status === 404) {
          throw new Error('Asistencia no encontrada');
        } else if (response.status === 400) {
          if (errorData?.detail) {
            throw new Error(errorData.detail);
          }
          throw new Error('Estado de autorización inválido');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: Asistencia = await response.json();
      console.log('Asistencia autorizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error completo:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Error de conexión. Verifica que el backend esté ejecutándose en ${this.baseUrl}`);
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error de conexión desconocido');
    }
  }

  /**
   * Autorizar múltiples asistencias (helper)
   */
  static async autorizarMultiples(
    ids: number[],
    estado: 'autorizado' | 'rechazado',
    token: string
  ): Promise<{ exitosas: number; fallidas: number; errores: string[] }> {
    console.log(`Autorizando ${ids.length} asistencias con estado: ${estado}`);

    let exitosas = 0;
    let fallidas = 0;
    const errores: string[] = [];

    for (const id of ids) {
      try {
        await this.autorizarAsistencia(id, { estado_autorizacion: estado }, token);
        exitosas++;
      } catch (error) {
        fallidas++;
        const mensaje = error instanceof Error ? error.message : 'Error desconocido';
        errores.push(`ID ${id}: ${mensaje}`);
      }
    }

    return { exitosas, fallidas, errores };
  }
}

