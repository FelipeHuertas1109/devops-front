export type TipoDato = 'decimal' | 'entero' | 'texto' | 'booleano';

export interface UsuarioBasico {
  id: number;
  username: string;
  nombre: string;
  tipo_usuario: string;
  tipo_usuario_display: string;
}

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  tipo_dato: TipoDato;
  valor_tipado: number | string | boolean;
  creado_por: UsuarioBasico;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracionCreate {
  clave: string;
  valor: string;
  descripcion: string;
  tipo_dato: TipoDato;
}

export interface ConfiguracionUpdate {
  clave: string;
  valor: string;
  descripcion: string;
  tipo_dato: TipoDato;
}

export interface ConfiguracionesListResponse {
  total_configuraciones: number;
  configuraciones: Configuracion[];
}

