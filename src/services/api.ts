import { request } from './http'
import type { Categoria, Cliente, ClienteInput, Pedido, PedidoCreateDto, Produto, ProdutoInput } from '../types/models'

export const categoriasApi = {
  list: () => request<Categoria[]>('/Categorias'),
}

export const produtosApi = {
  list: () => request<Produto[]>('/Produtos'),
  create: (data: ProdutoInput) => request<Produto>('/Produtos', { method: 'POST', body: data }),
  update: (id: number, data: ProdutoInput) =>
    request<void>(`/Produtos/${id}`, { method: 'PUT', body: { id, ...data } }),
  remove: (id: number) => request<void>(`/Produtos/${id}`, { method: 'DELETE' }),
}

export const clientesApi = {
  list: (apenasAtivos = false) => request<Cliente[]>('/Clientes', { query: { apenasAtivos } }),
  create: (data: ClienteInput) => request<Cliente>('/Clientes', { method: 'POST', body: data }),
  update: (id: number, data: ClienteInput) =>
    request<void>(`/Clientes/${id}`, { method: 'PUT', body: { id, ...data } }),
  // O DELETE /Clientes/{id} não é usado: o site só inativa clientes (ver stores/clientes.ts)
}

export const pedidosApi = {
  list: () => request<Pedido[]>('/Pedidos'),
  create: (data: PedidoCreateDto) => request<Pedido>('/Pedidos', { method: 'POST', body: data }),
}
