import { environment } from '../config/environment';
import {
  Asistencia,
  AsistenciaCreateRequest,
  AsistenciaUpdateRequest,
  AsistenciasListResponse,
  AsistenciasFiltros
} from '../types/asistencias';

export class AsistenciaService {
  private static baseUrl = environment.backendUrl;

  /**
   * Listar asistencias del usuario autenticado
   * GET /api/asistencias/
   */
  static async getAll(
    filtros: AsistenciasFiltros,
    token: string
  ): Promise<AsistenciasListResponse> {
    console.log('Obteniendo asistencias con filtros:', filtros);

    // Construir query params
    const params = new URLSearchParams();
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.horario_id) params.append('horario_id', filtros.horario_id.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/asistencias/${queryString ? '?' + queryString : ''}`;

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
          throw new Error('No tienes permisos para ver asistencias');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: AsistenciasListResponse = await response.json();
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
   * Obtener una asistencia específica
   * GET /api/asistencias/{id}/
   */
  static async getById(id: number, token: string): Promise<Asistencia> {
    console.log('Obteniendo asistencia ID:', id);

    try {
      const response = await fetch(`${this.baseUrl}/asistencias/${id}/`, {
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
          throw new Error('No tienes permisos para ver esta asistencia');
        } else if (response.status === 404) {
          throw new Error('Asistencia no encontrada');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: Asistencia = await response.json();
      console.log('Asistencia obtenida exitosamente:', data);
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
   * Crear una nueva asistencia
   * POST /api/asistencias/
   */
  static async create(
    asistenciaData: AsistenciaCreateRequest,
    token: string
  ): Promise<Asistencia> {
    console.log('Creando asistencia con datos:', asistenciaData);

    // Validar rango de horas antes de enviar
    if (asistenciaData.horas < 0 || asistenciaData.horas > 24) {
      throw new Error('Las horas deben estar entre 0 y 24');
    }

    try {
      const response = await fetch(`${this.baseUrl}/asistencias/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify(asistenciaData),
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
          if (errorData?.detail) {
            throw new Error(errorData.detail);
          }
          throw new Error('No tienes permisos para crear asistencias');
        } else if (response.status === 400) {
          // Errores de validación
          if (errorData) {
            // Error de unicidad
            if (errorData.non_field_errors) {
              throw new Error(errorData.non_field_errors[0]);
            }
            // Error de rango de horas
            if (errorData.horas) {
              throw new Error(errorData.horas[0]);
            }
            // Otros errores
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              throw new Error(firstError[0] as string);
            }
          }
          throw new Error('Datos de asistencia inválidos');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: Asistencia = await response.json();
      console.log('Asistencia creada exitosamente:', data);
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
   * Actualizar una asistencia
   * PUT /api/asistencias/{id}/
   */
  static async update(
    id: number,
    asistenciaData: AsistenciaUpdateRequest,
    token: string
  ): Promise<Asistencia> {
    console.log('Actualizando asistencia ID:', id, 'con datos:', asistenciaData);

    // Validar rango de horas si se proporciona
    if (asistenciaData.horas !== undefined && (asistenciaData.horas < 0 || asistenciaData.horas > 24)) {
      throw new Error('Las horas deben estar entre 0 y 24');
    }

    try {
      const response = await fetch(`${this.baseUrl}/asistencias/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        body: JSON.stringify(asistenciaData),
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
          throw new Error('No tienes permisos para editar esta asistencia');
        } else if (response.status === 404) {
          throw new Error('Asistencia no encontrada');
        } else if (response.status === 400) {
          if (errorData) {
            if (errorData.horas) {
              throw new Error(errorData.horas[0]);
            }
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              throw new Error(firstError[0] as string);
            }
          }
          throw new Error('Datos de asistencia inválidos');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      const data: Asistencia = await response.json();
      console.log('Asistencia actualizada exitosamente:', data);
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
   * Eliminar una asistencia
   * DELETE /api/asistencias/{id}/
   */
  static async delete(id: number, token: string): Promise<void> {
    console.log('Eliminando asistencia ID:', id);

    try {
      const response = await fetch(`${this.baseUrl}/asistencias/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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
          throw new Error('No tienes permisos para eliminar asistencias');
        } else if (response.status === 404) {
          throw new Error('Asistencia no encontrada');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(`Error del servidor: ${response.status}`);
        }
      }

      console.log('Asistencia eliminada exitosamente');
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
}

