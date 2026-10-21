import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Dashboard' } },
    { path: '/produtos', name: 'produtos', component: () => import('../views/ProdutosView.vue'), meta: { title: 'Produtos' } },
    { path: '/produtos/estoque', name: 'estoque', component: () => import('../views/EstoqueView.vue'), meta: { title: 'Alerta de estoque' } },
    { path: '/categorias', name: 'categorias', component: () => import('../views/CategoriasView.vue'), meta: { title: 'Categorias' } },
    { path: '/clientes', name: 'clientes', component: () => import('../views/ClientesView.vue'), meta: { title: 'Clientes' } },
    {
      path: '/clientes/:id(\\d+)',
      name: 'cliente-detalhe',
      component: () => import('../views/ClienteDetalheView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
      meta: { title: 'Cliente' },
    },
    { path: '/pedidos', name: 'pedidos', component: () => import('../views/PedidosView.vue'), meta: { title: 'Pedidos' } },
    { path: '/pedidos/novo', name: 'nova-venda', component: () => import('../views/NovaVendaView.vue'), meta: { title: 'Nova venda' } },
    { path: '/relatorios', name: 'relatorios', component: () => import('../views/RelatoriosView.vue'), meta: { title: 'Relatórios' } },
    { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Página não encontrada' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Fruteira`
})

export default router
