import { ref, reactive, watch } from 'vue'
import type { Ref } from 'vue'
import { usePagination } from './usePagination'

export function useTableQuery<T, Q extends Record<string, unknown>>(
  fetchFn: (params: Q & { page: number; page_size: number }) => Promise<{ list: T[]; total: number }>,
  defaultQuery?: Partial<Q>,
) {
  const loading = ref(false)
  const tableData = ref<T[]>([]) as Ref<T[]>
  const query = reactive<Record<string, unknown>>({ ...defaultQuery })

  const { pagination, setTotal, handlePageChange, handleSizeChange, resetPage } = usePagination()

  async function load() {
    loading.value = true
    try {
      const params = {
        ...query,
        page: pagination.page,
        page_size: pagination.page_size,
      } as Q & { page: number; page_size: number }

      const res = await fetchFn(params)
      tableData.value = res.list
      setTotal(res.total)
    } finally {
      loading.value = false
    }
  }

  function search() {
    resetPage()
    load()
  }

  function reset() {
    // 重置 query
    Object.keys(query).forEach((k) => {
      if (defaultQuery && k in defaultQuery) {
        ;(query as Record<string, unknown>)[k] = (defaultQuery as Record<string, unknown>)[k]
      } else {
        delete (query as Record<string, unknown>)[k]
      }
    })
    resetPage()
    load()
  }

  function onPageChange(page: number) {
    handlePageChange(page)
    load()
  }

  function onSizeChange(size: number) {
    handleSizeChange(size)
    load()
  }

  return {
    loading,
    tableData,
    query,
    pagination,
    load,
    search,
    reset,
    onPageChange,
    onSizeChange,
  }
}
