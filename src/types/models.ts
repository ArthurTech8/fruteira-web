// Espelho dos Models do Projeto-Fruteira (C#), serializados em camelCase pela API.

export interface Categoria {
  id: number
  nome: string
}

export interface Produto {
  id: number
  nome: string
  preco: number
  quantidadeEstoque: number
  categoriaId: number
  categoria?: Categoria | null
}

export interface Cliente {
  id: number
  nome: string
  cpf?: string | null
  telefone?: string | null
  /** true = Ativo, false = Inativo */
  status: boolean
}

export interface Pedido {
  id: number
  clienteId: number
  cliente?: Cliente | null
  produtoId: number
  produto?: Produto | null
  quantidade: number
  precoUnitario: number
  /** Data local do servidor, sem fuso (ex.: 2026-09-28T19:33:02) */
  dataPedido: string
  /** true = Concluído, false = Cancelado */
  status: boolean
}

export interface PedidoCreateDto {
  clienteId: number
  produtoId: number
  quantidade: number
}

export type ProdutoInput = Omit<Produto, 'id' | 'categoria'>
export type ClienteInput = Omit<Cliente, 'id'>
