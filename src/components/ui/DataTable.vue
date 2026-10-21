<script setup lang="ts" generic="T extends { id: number }">
import { computed, ref } from 'vue'

export interface Column<R> {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Valor usado na ordenação; sem ele a coluna não é ordenável */
  sortBy?: (row: R) => string | number
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: Column<T>[]
    rows: T[]
    loading?: boolean
    emptyText?: string
    initialSort?: { key: string; dir: 'asc' | 'desc' }
    clickable?: boolean
  }>(),
  { emptyText: 'Nenhum registro encontrado.' },
)

const emit = defineEmits<{ rowClick: [row: T] }>()

const sort = ref(props.initialSort ?? null)

function toggleSort(col: Column<T>) {
  if (!col.sortBy) return
  if (sort.value?.key === col.key) sort.value = { key: col.key, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
  else sort.value = { key: col.key, dir: 'asc' }
}

const sortedRows = computed(() => {
  const col = props.columns.find((c) => c.key === sort.value?.key)
  if (!col?.sortBy || !sort.value) return props.rows
  const get = col.sortBy
  const dir = sort.value.dir === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const va = get(a)
    const vb = get(b)
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
    return String(va).localeCompare(String(vb), 'pt-BR') * dir
  })
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[col.align ?? 'left', { sortable: !!col.sortBy }]"
            :style="{ width: col.width }"
            :aria-sort="sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined"
            @click="toggleSort(col)"
          >
            {{ col.label }}
            <span v-if="sort?.key === col.key" class="arrow">{{ sort.dir === 'asc' ? '▲' : '▼' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="state">Carregando…</td>
        </tr>
        <tr v-else-if="!sortedRows.length">
          <td :colspan="columns.length" class="state">{{ emptyText }}</td>
        </tr>
        <template v-else>
          <tr v-for="row in sortedRows" :key="row.id" :class="{ clickable }" @click="emit('rowClick', row)">
            <td v-for="col in columns" :key="col.key" :class="col.align ?? 'left'">
              <slot :name="col.key" :row="row">{{ (row as Record<string, unknown>)[col.key] }}</slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
}
th {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: var(--surface-2);
  white-space: nowrap;
  user-select: none;
}
th.sortable {
  cursor: pointer;
}
th.sortable:hover {
  color: var(--text);
}
.arrow {
  font-size: 9px;
  margin-left: 4px;
}
tbody tr:last-child td {
  border-bottom: 0;
}
tbody tr:hover td {
  background: var(--surface-2);
}
tr.clickable {
  cursor: pointer;
}
.left {
  text-align: left;
}
.right {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.center {
  text-align: center;
}
.state {
  text-align: center;
  color: var(--text-muted);
  padding: 36px 16px;
}
</style>
