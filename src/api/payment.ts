import request from './request'

export interface TransactionListParams {
  startDate?: string
  endDate?: string
  payMethod?: string
  payStatus?: string
  page?: number
  pageSize?: number
}

export interface TransactionItem {
  id: number
  orderNo: string
  accountPhone: string
  amount: number
  payMethod: string
  payStatus: string
  refundStatus: string
  payTime?: string
}

export interface ReconciliationParams {
  date: string
}

export interface ReconciliationData {
  date: string
  orderCount: number
  successCount: number
  successAmount: number
  refundCount: number
  refundAmount: number
  netIncome: number
  byPayMethod: PayMethodSummary[]
}

export interface PayMethodSummary {
  payMethod: string
  orderCount: number
  successCount: number
  successAmount: number
  refundCount: number
  refundAmount: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

function toTransactionParams(params: TransactionListParams) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    payMethod: params.payMethod,
    payStatus: params.payStatus,
    page: params.page,
    size: params.pageSize,
  }
}

export const paymentApi = {
  getTransactions: (params: TransactionListParams): Promise<PageResult<TransactionItem>> =>
    request.get('/payments/transactions', { params: toTransactionParams(params) }),

  getReconciliation: (params: ReconciliationParams): Promise<ReconciliationData> =>
    request.get('/payments/reconciliation', { params }),
}
