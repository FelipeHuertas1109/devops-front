'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { AsistenciaService } from '../services/asistencias';
import { HorarioService } from '../services/horarios';
import {
  Asistencia,
  AsistenciaCreateRequest,
  AsistenciaUpdateRequest,
  AsistenciasFiltros,
  ESTADOS_ASISTENCIA,
  COLORES_ESTADOS,
  EstadoAutorizacion
} from '../types/asistencias';
import { Horario } from '../types/horarios';

export default function AsistenciasManager() {
  const { token, user } = useAuth();
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHoras, setTotalHoras] = useState(0);
  
  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AsistenciaCreateRequest>({
    horario_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    presente: true,
    horas: 4.0
  });

  // Filtros
  const [filtros, setFiltros] = useState<AsistenciasFiltros>({});
  const [showFiltros, setShowFiltros] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadHorarios();
      loadAsistencias();
    }
  }, [token]);

  const loadHorarios = async () => {
    if (!token) return;
    
    try {
      const data = await HorarioService.getAll(token);
      setHorarios(data);
      
      // Si hay horarios y el formulario no tiene uno seleccionado, seleccionar el primero
      if (data.length > 0 && formData.horario_id === 0) {
        setFormData(prev => ({ ...prev, horario_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const loadAsistencias = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await AsistenciaService.getAll(filtros, token);
      setAsistencias(data.asistencias);
      setTotalHoras(data.total_horas);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validar rango de horas
    if (formData.horas < 0 || formData.horas > 24) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las horas deben estar entre 0 y 24',
      });
      return;
    }

    // Validar que se haya seleccionado un horario
    if (formData.horario_id === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar un horario',
      });
      return;
    }

    try {
      setLoading(true);

      if (editingId !== null) {
        // Actualizar
        const updateData: AsistenciaUpdateRequest = {
          presente: formData.presente,
          horas: formData.horas
        };
        await AsistenciaService.update(editingId, updateData, token);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Asistencia actualizada correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Crear
        await AsistenciaService.create(formData, token);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Asistencia registrada correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      }

      // Resetear formulario
      handleCancelEdit();
      
      // Recargar asistencias
      await loadAsistencias();

    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al guardar asistencia',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asistencia: Asistencia) => {
    setEditingId(asistencia.id);
    setFormData({
      horario_id: asistencia.horario.id,
      fecha: asistencia.fecha,
      presente: asistencia.presente,
      horas: asistencia.horas
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await AsistenciaService.delete(id, token);
        
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Asistencia eliminada correctamente',
          timer: 1500,
          showConfirmButton: false
        });

        await loadAsistencias();
      } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error al eliminar asistencia',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      horario_id: horarios.length > 0 ? horarios[0].id : 0,
      fecha: new Date().toISOString().split('T')[0],
      presente: true,
      horas: 4.0
    });
    setShowForm(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header con información del usuario */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800">
                    <span className="font-semibold">Usuario:</span> {user.nombre} ({user.username})
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    <span className="font-medium">Tipo:</span> {user.tipo_usuario_display}
                  </p>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                  <span className="text-blue-800 text-sm font-medium">Total Horas:</span>
                  <span className="text-blue-900 text-lg font-bold ml-2">{totalHoras.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia si no hay horarios */}
          {horarios.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <span className="font-semibold">⚠️ Atención:</span> No tienes horarios registrados. 
                Debes crear horarios antes de registrar asistencias.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={horarios.length === 0}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showForm ? 'Ocultar Formulario' : '+ Nueva Asistencia'}
            </button>
            
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showFiltros ? 'Ocultar Filtros' : '🔍 Filtros'}
            </button>

            {(filtros.fecha_inicio || filtros.fecha_fin || filtros.estado || filtros.horario_id) && (
              <button
                onClick={handleLimpiarFiltros}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Limpiar Filtros
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {showFiltros && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    Horario
                  </label>
                  <select
                    value={filtros.horario_id || ''}
                    onChange={(e) => setFiltros({ ...filtros, horario_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Todos</option>
                    {horarios.map((horario) => (
                      <option key={horario.id} value={horario.id}>
                        {horario.dia_semana_display} - {horario.jornada_display}
                      </option>
                    ))}
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

          {/* Formulario de asistencia */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingId !== null ? 'Editar Asistencia' : 'Registrar Asistencia'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Horario *
                    </label>
                    <select
                      value={formData.horario_id}
                      onChange={(e) => setFormData({ ...formData, horario_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                      disabled={editingId !== null}
                    >
                      <option value={0}>Selecciona un horario</option>
                      {horarios.map((horario) => (
                        <option key={horario.id} value={horario.id}>
                          {horario.dia_semana_display} - {horario.jornada_display} - {horario.sede_display}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                      disabled={editingId !== null}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Horas * (0-24)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.horas}
                      onChange={(e) => setFormData({ ...formData, horas: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Presente
                    </label>
                    <div className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        checked={formData.presente}
                        onChange={(e) => setFormData({ ...formData, presente: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-800">Marcar como presente</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : (editingId !== null ? 'Actualizar' : 'Registrar')}
                  </button>

                  {(editingId !== null || showForm) && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Lista de asistencias */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Mis Asistencias ({asistencias.length})
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
                      <tr key={asistencia.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {formatDate(asistencia.fecha)}
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
                            <button
                              onClick={() => handleEdit(asistencia)}
                              className="text-blue-500 hover:text-blue-700 font-medium"
                              disabled={loading}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(asistencia.id)}
                              className="text-red-500 hover:text-red-700 font-medium"
                              disabled={loading}
                            >
                              Eliminar
                            </button>
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

