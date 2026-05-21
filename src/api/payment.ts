import request from './request'

export interface TransactionListParams {
  pay_time_start?: string
  pay_time_end?: string
  pay_method?: string
  pay_status?: string
  page?: number
  page_size?: number
}

export interface TransactionItem {
  id: number
  order_no: string
  account_phone: string
  amount: number
  pay_method: string
  pay_status: string
  refund_status: string
  pay_time?: string
}

export interface ReconciliationParams {
  date: string
}

export interface ReconciliationData {
  date: string
  order_count: number
  success_count: number
  success_amount: number
  refund_count: number
  refund_amount: number
  net_income: number
  by_pay_method: PayMethodSummary[]
}

export interface PayMethodSummary {
  pay_method: string
  order_count: number
  success_count: number
  success_amount: number
  refund_count: number
  refund_amount: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const paymentApi = {
  getTransactions: (params: TransactionListParams): Promise<PageResult<TransactionItem>> =>
    request.get('/admin/payments/transactions', { params }),

  getReconciliation: (params: ReconciliationParams): Promise<ReconciliationData> =>
    request.get('/admin/payments/reconciliation', { params }),
}
