'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConfiguracionesService } from '../services/configuraciones';
import type { Configuracion, ConfiguracionCreate, TipoDato } from '../types/configuraciones';
import Swal from 'sweetalert2';

export default function DirectivoConfiguraciones() {
  const { token } = useAuth();
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [valoresEdit, setValoresEdit] = useState<Record<number, string>>({});

  useEffect(() => {
    cargarConfiguraciones();
  }, [token]);

  const cargarConfiguraciones = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await ConfiguracionesService.listar(token);
      setConfiguraciones(response.configuraciones);
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las configuraciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInicializar = async () => {
    if (!token) return;
    try {
      const result = await Swal.fire({
        title: '¿Inicializar configuraciones?',
        text: 'Esto creará las configuraciones por defecto si no existen',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, inicializar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const response = await ConfiguracionesService.inicializar(token);
        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.mensaje || 'Configuraciones inicializadas correctamente'
        });
        cargarConfiguraciones();
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudieron inicializar las configuraciones'
      });
    }
  };

  const handleEditar = (config: Configuracion) => {
    setEditandoId(config.id);
    setValoresEdit({ ...valoresEdit, [config.id]: config.valor });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setValoresEdit({});
  };

  const handleGuardarEdicion = async (config: Configuracion) => {
    if (!token) return;
    const nuevoValor = valoresEdit[config.id];
    
    if (!nuevoValor || nuevoValor.trim() === '') {
      await Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El valor no puede estar vacío'
      });
      return;
    }

    try {
      await ConfiguracionesService.actualizar(
        config.clave,
        {
          clave: config.clave,
          valor: nuevoValor,
          descripcion: config.descripcion,
          tipo_dato: config.tipo_dato
        },
        token
      );

      await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Configuración actualizada correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      setEditandoId(null);
      setValoresEdit({});
      cargarConfiguraciones();
    } catch (error) {
      console.error('Error al actualizar:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo actualizar la configuración'
      });
    }
  };

  const handleEliminar = async (config: Configuracion) => {
    if (!token) return;

    const result = await Swal.fire({
      title: '¿Eliminar configuración?',
      text: `¿Estás seguro de eliminar "${config.clave}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await ConfiguracionesService.eliminar(config.clave, token);
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Configuración eliminada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        cargarConfiguraciones();
      } catch (error) {
        console.error('Error al eliminar:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'No se pudo eliminar la configuración'
        });
      }
    }
  };

  const handleCrearNueva = async () => {
    if (!token) return;

    const { value: formValues } = await Swal.fire({
      title: 'Nueva Configuración',
      html:
        '<input id="swal-clave" class="swal2-input" placeholder="Clave (ej: nueva_config)">' +
        '<input id="swal-valor" class="swal2-input" placeholder="Valor">' +
        '<textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>' +
        '<select id="swal-tipo" class="swal2-select">' +
        '<option value="">Seleccionar tipo...</option>' +
        '<option value="entero">Entero</option>' +
        '<option value="decimal">Decimal</option>' +
        '<option value="texto">Texto</option>' +
        '<option value="booleano">Booleano</option>' +
        '</select>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const clave = (document.getElementById('swal-clave') as HTMLInputElement).value;
        const valor = (document.getElementById('swal-valor') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-descripcion') as HTMLTextAreaElement).value;
        const tipo_dato = (document.getElementById('swal-tipo') as HTMLSelectElement).value;

        if (!clave || !valor || !descripcion || !tipo_dato) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return { clave, valor, descripcion, tipo_dato: tipo_dato as TipoDato };
      }
    });

    if (formValues) {
      try {
        await ConfiguracionesService.crear(formValues as ConfiguracionCreate, token);
        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Configuración creada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        cargarConfiguraciones();
      } catch (error) {
        console.error('Error al crear:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'No se pudo crear la configuración'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuraciones del Sistema</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total de configuraciones: {configuraciones.length}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleInicializar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Inicializar Configuraciones
          </button>
          <button
            onClick={handleCrearNueva}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Nueva Configuración
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clave
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configuraciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay configuraciones. Haz clic en "Inicializar Configuraciones" para crear las predeterminadas.
                </td>
              </tr>
            ) : (
              configuraciones.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {config.clave}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editandoId === config.id ? (
                      <input
                        type="text"
                        value={valoresEdit[config.id] || ''}
                        onChange={(e) => setValoresEdit({ ...valoresEdit, [config.id]: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="font-semibold text-blue-600">{config.valor}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {config.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {config.tipo_dato}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {editandoId === config.id ? (
                      <>
                        <button
                          onClick={() => handleGuardarEdicion(config)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelarEdicion}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditar(config)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(config)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

