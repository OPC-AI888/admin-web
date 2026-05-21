import { ref, reactive } from 'vue'

export interface PaginationState {
  page: number
  page_size: number
  total: number
}

export function usePagination(defaultPageSize = 20) {
  const pagination = reactive<PaginationState>({
    page: 1,
    page_size: defaultPageSize,
    total: 0,
  })

  function setTotal(total: number) {
    pagination.total = total
  }

  function handlePageChange(page: number) {
    pagination.page = page
  }

  function handleSizeChange(size: number) {
    pagination.page_size = size
    pagination.page = 1
  }

  function resetPage() {
    pagination.page = 1
  }

  return {
    pagination,
    setTotal,
    handlePageChange,
    handleSizeChange,
    resetPage,
  }
}
