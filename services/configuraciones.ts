import { environment } from '../config/environment';
import type { 
  Configuracion, 
  ConfiguracionCreate, 
  ConfiguracionUpdate,
  ConfiguracionesListResponse 
} from '../types/configuraciones';

export class ConfiguracionesService {
  private static baseUrl = environment.backendUrl;

  /**
   * Listar todas las configuraciones del sistema
   */
  static async listar(token: string): Promise<ConfiguracionesListResponse> {
    const url = `${this.baseUrl}/directivo/configuraciones/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Obtener una configuración específica por clave
   */
  static async obtenerPorClave(clave: string, token: string): Promise<Configuracion> {
    const url = `${this.baseUrl}/directivo/configuraciones/${clave}/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Configuración no encontrada');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Crear una nueva configuración
   */
  static async crear(data: ConfiguracionCreate, token: string): Promise<Configuracion> {
    const url = `${this.baseUrl}/directivo/configuraciones/crear/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.clave?.[0] || data?.detail || 'Error de validación';
        throw new Error(msg);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Actualizar una configuración existente
   */
  static async actualizar(clave: string, data: ConfiguracionUpdate, token: string): Promise<Configuracion> {
    const url = `${this.baseUrl}/directivo/configuraciones/${clave}/`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.detail || 'Error de validación';
        throw new Error(msg);
      }
      if (response.status === 404) {
        throw new Error('Configuración no encontrada');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Eliminar una configuración
   */
  static async eliminar(clave: string, token: string): Promise<void> {
    const url = `${this.baseUrl}/directivo/configuraciones/${clave}/`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Configuración no encontrada');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }
  }

  /**
   * Inicializar configuraciones por defecto del sistema
   */
  static async inicializar(token: string): Promise<any> {
    const url = `${this.baseUrl}/directivo/configuraciones/inicializar/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sesión vencida o sin permisos');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
  }
}

