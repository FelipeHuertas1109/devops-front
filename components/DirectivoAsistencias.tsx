'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { DirectivoAsistenciaService } from '../services/directivoAsistencias';
import {
  Asistencia,
  AsistenciasDirectivoFiltros,
  ESTADOS_ASISTENCIA,
  COLORES_ESTADOS,
  EstadoAutorizacion
} from '../types/asistencias';

export default function DirectivoAsistencias() {
  const { token, user } = useAuth();
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const [monitoresDistintos, setMonitoresDistintos] = useState(0);

  // Filtros
  const [filtros, setFiltros] = useState<AsistenciasDirectivoFiltros>({});
  const [showFiltros, setShowFiltros] = useState(false);

  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadAsistencias();
    }
  }, [token]);

  const loadAsistencias = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await DirectivoAsistenciaService.listarTodas(filtros, token);
      setAsistencias(data.asistencias);
      setTotalHoras(data.total_horas);
      setTotalAsistencias(data.total_asistencias);
      setMonitoresDistintos(data.monitores_distintos);
      setSelectedIds([]); // Limpiar selección
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al cargar asistencias',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutorizar = async (id: number, estado: 'autorizado' | 'rechazado') => {
    if (!token) return;

    const textoEstado = estado === 'autorizado' ? 'autorizar' : 'rechazar';
    
    const result = await Swal.fire({
      title: `¿${textoEstado.charAt(0).toUpperCase() + textoEstado.slice(1)} asistencia?`,
      text: `Esta acción cambiará el estado de la asistencia a "${estado}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: estado === 'autorizado' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${textoEstado}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await DirectivoAsistenciaService.autorizarAsistencia(
          id,
          { estado_autorizacion: estado },
          token
        );

        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Asistencia ${estado === 'autorizado' ? 'autorizada' : 'rechazada'} correctamente`,
          timer: 1500,
          showConfirmButton: false
        });

        await loadAsistencias();
      } catch (error) {
        console.error('Error al autorizar asistencia:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error al cambiar estado de asistencia',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAutorizarMultiples = async (estado: 'autorizado' | 'rechazado') => {
    if (!token || selectedIds.length === 0) return;

    const textoEstado = estado === 'autorizado' ? 'autorizar' : 'rechazar';
    
    const result = await Swal.fire({
      title: `¿${textoEstado.charAt(0).toUpperCase() + textoEstado.slice(1)} ${selectedIds.length} asistencias?`,
      text: `Esta acción cambiará el estado de todas las asistencias seleccionadas`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: estado === 'autorizado' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${textoEstado} todas`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        const resultado = await DirectivoAsistenciaService.autorizarMultiples(
          selectedIds,
          estado,
          token
        );

        if (resultado.exitosas > 0) {
          await Swal.fire({
            icon: resultado.fallidas === 0 ? 'success' : 'warning',
            title: resultado.fallidas === 0 ? '¡Éxito!' : 'Completado con errores',
            html: `
              <p>Asistencias ${estado === 'autorizado' ? 'autorizadas' : 'rechazadas'}: ${resultado.exitosas}</p>
              ${resultado.fallidas > 0 ? `<p>Fallidas: ${resultado.fallidas}</p>` : ''}
              ${resultado.errores.length > 0 ? `<p class="text-sm text-left mt-2">${resultado.errores.join('<br>')}</p>` : ''}
            `,
          });
        }

        await loadAsistencias();
      } catch (error) {
        console.error('Error al autorizar múltiples asistencias:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error al procesar asistencias',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === asistencias.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(asistencias.map(a => a.id));
    }
  };

  const handleAplicarFiltros = () => {
    loadAsistencias();
    setShowFiltros(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({});
    setTimeout(() => loadAsistencias(), 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const obtenerEstadisticasPorEstado = () => {
    const stats = {
      pendiente: { count: 0, horas: 0 },
      autorizado: { count: 0, horas: 0 },
      rechazado: { count: 0, horas: 0 }
    };

    asistencias.forEach(asistencia => {
      stats[asistencia.estado_autorizacion].count++;
      stats[asistencia.estado_autorizacion].horas += asistencia.horas;
    });

    return stats;
  };

  const stats = obtenerEstadisticasPorEstado();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header con información del usuario */}
          {user && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-800">
                    <span className="font-semibold">Directivo:</span> {user.nombre} ({user.username})
                  </p>
                  <p className="text-purple-700 text-sm mt-1">
                    Vista de todas las asistencias del sistema
                  </p>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-800 text-sm font-medium">
                    {user.tipo_usuario}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Asistencias</div>
              <div className="text-2xl font-bold text-gray-900">{totalAsistencias}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Horas</div>
              <div className="text-2xl font-bold text-blue-600">{totalHoras.toFixed(2)}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Monitores</div>
              <div className="text-2xl font-bold text-purple-600">{monitoresDistintos}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendiente.count} ({stats.pendiente.horas.toFixed(1)}h)
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showFiltros ? 'Ocultar Filtros' : '🔍 Filtros'}
            </button>

            {(filtros.usuario_id || filtros.fecha_inicio || filtros.fecha_fin || filtros.estado || filtros.sede) && (
              <button
                onClick={handleLimpiarFiltros}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Limpiar Filtros
              </button>
            )}

            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={() => handleAutorizarMultiples('autorizado')}
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  ✓ Autorizar {selectedIds.length}
                </button>

                <button
                  onClick={() => handleAutorizarMultiples('rechazado')}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  ✗ Rechazar {selectedIds.length}
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Limpiar Selección
                </button>
              </>
            )}
          </div>

          {/* Panel de filtros */}
          {showFiltros && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    ID Monitor
                  </label>
                  <input
                    type="number"
                    value={filtros.usuario_id || ''}
                    onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="ID del monitor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_inicio || ''}
                    onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_fin || ''}
                    onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtros.estado || ''}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoAutorizacion || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Todos</option>
                    {Object.entries(ESTADOS_ASISTENCIA).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Sede
                  </label>
                  <select
                    value={filtros.sede || ''}
                    onChange={(e) => setFiltros({ ...filtros, sede: e.target.value as 'SA' | 'BA' || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Todas</option>
                    <option value="SA">San Antonio</option>
                    <option value="BA">Barcelona</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleAplicarFiltros}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Lista de asistencias */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Asistencias de Monitores
            </h2>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 mt-2">Cargando...</p>
              </div>
            )}

            {!loading && asistencias.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay asistencias registradas
              </div>
            )}

            {!loading && asistencias.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === asistencias.length}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Monitor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Horario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Horas</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Presente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.map((asistencia) => (
                      <tr 
                        key={asistencia.id} 
                        className={`border-t border-gray-200 hover:bg-gray-50 ${selectedIds.includes(asistencia.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(asistencia.id)}
                            onChange={() => handleToggleSelect(asistencia.id)}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{asistencia.usuario.nombre}</div>
                            <div className="text-xs text-gray-600">@{asistencia.usuario.username}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {new Date(asistencia.fecha + 'T00:00:00').toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{asistencia.horario.dia_semana_display}</div>
                            <div className="text-xs text-gray-600">
                              {asistencia.horario.jornada_display} - {asistencia.horario.sede_display}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-bold">
                          {asistencia.horas.toFixed(1)}h
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {asistencia.presente ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Sí
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLORES_ESTADOS[asistencia.estado_autorizacion]}`}>
                            {asistencia.estado_autorizacion_display}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {asistencia.estado_autorizacion !== 'autorizado' && (
                              <button
                                onClick={() => handleAutorizar(asistencia.id, 'autorizado')}
                                className="text-green-500 hover:text-green-700 font-medium text-xs"
                                disabled={loading}
                              >
                                ✓ Autorizar
                              </button>
                            )}
                            {asistencia.estado_autorizacion !== 'rechazado' && (
                              <button
                                onClick={() => handleAutorizar(asistencia.id, 'rechazado')}
                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                                disabled={loading}
                              >
                                ✗ Rechazar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

