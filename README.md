# Fruteira · Gestão (front-end)

Site de gerenciamento de uma fruteira feito em **Vue 3 + TypeScript**, consumindo a API do
[Projeto-Fruteira](https://github.com/AndreNicolay/Projeto-Fruteira) (.NET 8 + MySQL).

## Telas

| Rota | Tela |
|---|---|
| `/` | Dashboard: vendas do dia, faturamento do mês, ticket médio, estoque baixo, últimos pedidos |
| `/relatorios` | Faturamento por dia, por categoria, top 10 produtos e melhores clientes, com filtro de período |
| `/pedidos/novo` | Nova venda (PDV): cliente ativo + produto + quantidade, com validação de estoque |
| `/pedidos` | Lista de pedidos com filtros por cliente, status e período |
| `/produtos` | Cadastro de produtos (criar, editar, excluir), busca e filtro por categoria |
| `/produtos/estoque` | Alerta de estoque com limite configurável, previsão de término e reposição |
| `/categorias` | Resumo de estoque e vendas por categoria |
| `/clientes` | Cadastro de clientes (criar, editar, inativar e reativar) |
| `/clientes/:id` | Detalhe do cliente: total gasto, ticket médio, produto favorito e histórico |

## Como rodar

São dois processos: a API e o front.

**1. API (Projeto-Fruteira)**

```bash
cd ../Projeto-Fruteira
dotnet run --launch-profile http
```

A API sobe em `http://localhost:5022` (Swagger em `/swagger`).

**2. Front**

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha `/api` para `http://localhost:5022`
(veja `vite.config.ts`). Para apontar para outra URL da API, copie `.env.example`
para `.env` e defina `VITE_API_URL`.

O indicador no topo mostra se a API está respondendo.

## Regras de negócio refletidas no front

Todas vêm dos controllers da API:

- **Pedido**: o cliente precisa estar ativo, a quantidade vai de 1 a 10000 e não pode passar do estoque.
  O preço unitário é o do produto e o estoque é baixado pela API.
- **Cliente**: o site **nunca apaga** clientes, apenas os **inativa** (`PUT` com `status = false`),
  preservando cadastro e histórico. O `DELETE` da API não é usado, porque ele apaga de vez quem não
  tem pedidos. Clientes inativos não podem comprar e podem ser reativados na lista ou na edição.
- **Produto**: produtos que aparecem em pedidos não podem ser excluídos (restrição de chave estrangeira).
- **Categorias** são só leitura (a API expõe apenas `GET`).

A API não tem endpoints de "buscar por id" nem de cancelar pedido, então detalhes e relatórios
são calculados no front a partir das listas.

## Estrutura

```
src/
  types/models.ts      espelho dos Models C#
  services/http.ts     fetch + tratamento de erros da API
  services/api.ts      endpoints de Categorias, Produtos, Clientes e Pedidos
  stores/              Pinia (cache e ações de cada recurso)
  composables/         formatação pt-BR, toasts, confirmação, tema, limite de estoque
  components/ui/       botões, inputs, tabela, modal, cards, badges
  components/layout/   sidebar e topbar
  views/               uma tela por rota
```

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: checagem de tipos (`vue-tsc`) + build de produção em `dist/`
- `npm run preview`: serve o build
