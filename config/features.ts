// Configuración de funcionalidades - Activa/desactiva tarjetas del dashboard y enlaces del navbar

export interface FeatureConfig {
  enabled: boolean;
  title: string;
  href: string;
}

export const features = {
  // Funcionalidades para Directivos
  directivo: {
    asistencias: {
      enabled: true,
      title: 'Autorizar Monitores',
      href: '/directivo/asistencias',
    },
    horarios: {
      enabled: true,
      title: 'Ver Horarios',
      href: '/directivo/horarios',
    },
    reportes: {
      enabled: false,
      title: '📊 Reportes',
      href: '/directivo/reportes',
    },
    ajustesHoras: {
      enabled: false,
      title: 'Ajustes de Horas',
      href: '/directivo/ajustes-horas',
    },
    heatmap: {
      enabled: false,
      title: '🗺️ Mapa de Calor',
      href: '/directivo/heatmap',
    },
    finanzas: {
      enabled: false,
      title: '💰 Finanzas',
      href: '/directivo/finanzas',
    },
  },
  // Funcionalidades para Monitores
  monitor: {
    horarios: {
      enabled: true,
      title: 'Gestión de Horarios',
      href: '/horarios',
    },
    asistencias: {
      enabled: true,
      title: 'Mis Asistencias',
      href: '/monitor/asistencias',
    },
  },
} as const;

