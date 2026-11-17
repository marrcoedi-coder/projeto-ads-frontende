import { Categoria, TipoCategoria } from './categoria.model';

export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria?: Categoria;
}

// Omite o id que será definido no backend
export type LancamentoInput = Omit<Lancamento, 'id'>;
