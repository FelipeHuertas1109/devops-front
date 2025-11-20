import { environment } from '../config/environment';
import {
  AccionAsistenciaResponse,
  Asistencia,
  AsistenciaBackend,
  ListarAsistenciasQuery,
  ListarAsistenciasResponse,
  MarcarPresenteRequest,
  MarcarPresenteResponse,
  MisAsistenciasQuery,
  MisAsistenciasResponse,
  mapearAsistenciaBackend,
} from '../types/asistencias';

export class AsistenciasService {
  private static baseUrl = environment.backendUrl;

  // Directivo: listar asistencias del día (genera si faltan)
  static async listar(query: ListarAsistenciasQuery, token: string): Promise<ListarAsistenciasResponse> {
    const params = new URLSearchParams();
    // Solo agregar fecha si está presente, si no, traerá asistencias de hoy por defecto
    if (query.fecha) params.set('fecha', query.fecha);
    if (query.estado !== undefined && query.estado !== '') params.set('estado', String(query.estado));
    if (query.jornada !== undefined && query.jornada !== '') params.set('jornada', String(query.jornada));
    if (query.sede !== undefined && query.sede !== '') params.set('sede', String(query.sede));

    const url = `${this.baseUrl}/directivo/asistencias/?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Sesión vencida o sin permisos');
      if (response.status === 404) return { resultados: [] } as ListarAsistenciasResponse;
      if (response.status === 400) throw new Error('Parámetros inválidos');
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    // Función helper para mapear asistencias del backend
    const mapearAsistencias = (items: any[]): Asistencia[] => {
      if (!Array.isArray(items)) return [];
      return items.map(item => {
        // Si ya tiene la estructura esperada, devolverla tal cual
        if (item.usuario && item.horario) {
          return item as Asistencia;
        }
        // Si tiene la estructura del backend, mapearla
        if (item.monitor || item.monitor_id !== undefined) {
          return mapearAsistenciaBackend(item as AsistenciaBackend);
        }
        // Fallback: intentar mapear
        return mapearAsistenciaBackend(item as AsistenciaBackend);
      });
    };
    
    // Permitir tanto lista simple como objeto con resultados/asistencias
    if (Array.isArray(data)) {
      const asistenciasMapeadas = mapearAsistencias(data);
      return { 
        resultados: asistenciasMapeadas, 
        asistencias: asistenciasMapeadas 
      };
    }
    
    // Manejar tanto 'resultados' como 'asistencias' (el backend usa 'asistencias')
    const asistenciasRaw = Array.isArray(data?.asistencias) 
      ? data.asistencias 
      : Array.isArray(data?.resultados) 
        ? data.resultados 
        : [];
    
    const asistenciasMapeadas = mapearAsistencias(asistenciasRaw);
    
    return {
      resultados: asistenciasMapeadas,
      asistencias: asistenciasMapeadas,
      total_asistencias: data?.total_asistencias ?? asistenciasMapeadas.length,
      total_horas: data?.total_horas ?? 0,
      monitores_distintos: data?.monitores_distintos ?? 0,
    };
  }

  // Directivo: autorizar asistencia
  static async autorizar(id: number, token: string): Promise<AccionAsistenciaResponse> {
    const url = `${this.baseUrl}/directivo/asistencias/${id}/autorizar/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Sesión vencida o sin permisos');
      if (response.status === 404) throw new Error('La asistencia ya no existe');
      throw new Error(`Error del servidor: ${response.status}`);
    }
    return response.json();
  }

  // Directivo: rechazar asistencia
  static async rechazar(id: number, token: string): Promise<AccionAsistenciaResponse> {
    const url = `${this.baseUrl}/directivo/asistencias/${id}/rechazar/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Sesión vencida o sin permisos');
      if (response.status === 404) throw new Error('La asistencia ya no existe');
      throw new Error(`Error del servidor: ${response.status}`);
    }
    return response.json();
  }

  // Monitor: ver mis asistencias (genera si faltan)
  static async misAsistencias(query: MisAsistenciasQuery, token: string): Promise<MisAsistenciasResponse> {
    const params = new URLSearchParams();
    // Solo agregar fecha si está presente, si no, traerá asistencias de hoy por defecto
    if (query.fecha) params.set('fecha', query.fecha);
    const url = `${this.baseUrl}/monitor/mis-asistencias/?${params.toString()}`;
    
    console.log('AsistenciasService.misAsistencias - URL:', url);
    console.log('AsistenciasService.misAsistencias - Fecha:', query.fecha);
    console.log('AsistenciasService.misAsistencias - Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });
    
    console.log('AsistenciasService.misAsistencias - Status:', response.status);
    console.log('AsistenciasService.misAsistencias - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AsistenciasService.misAsistencias - Error response:', errorText);
      
      if (response.status === 401 || response.status === 403) throw new Error('Sesión vencida o sin permisos');
      if (response.status === 404) return [];
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Monitor: marcar presente
  static async marcar(body: MarcarPresenteRequest, token: string): Promise<MarcarPresenteResponse> {
    const url = `${this.baseUrl}/monitor/marcar/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Sesión vencida o sin permisos');
      if (response.status === 403) {
        // Intentar leer detalle del backend
        try {
          const data = await response.json();
          const detail = (data && (data.detail || data.message)) || 'No autorizado';
          throw new Error(detail);
        } catch {
          // si no es JSON, leer texto
          const text = await response.text();
          throw new Error(text || 'No autorizado');
        }
      }
      if (response.status === 400) {
        const text = await response.text();
        throw new Error(text || 'Solicitud inválida');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }
    return response.json();
  }
}


