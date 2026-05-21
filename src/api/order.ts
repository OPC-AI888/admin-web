import request from './request'

export interface OrderListParams {
  order_no?: string
  account_phone?: string
  pay_status?: string | string[]
  refund_status?: string | string[]
  pay_method?: string
  pay_time_start?: string
  pay_time_end?: string
  page?: number
  page_size?: number
}

export interface OrderItem {
  id: number
  order_no: string
  account_id: number
  account_phone: string
  plan_type: string
  plan_name: string
  amount: number
  pay_method: string
  pay_status: string
  refund_status: string
  pay_time?: string
  created_time: string
}

export interface OrderDetail extends OrderItem {
  account_nickname?: string
  refund_records?: RefundRecord[]
}

export interface RefundRecord {
  id: number
  amount: number
  reason: string
  status: string
  created_time: string
  processed_time?: string
}

export interface OrderStats {
  order_count: number
  total_amount: number
  refund_amount: number
}

export interface RefundParams {
  refund_amount: number
  reason: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const orderApi = {
  getList: (params: OrderListParams): Promise<PageResult<OrderItem>> =>
    request.get('/admin/orders', { params }),

  getStats: (params: Omit<OrderListParams, 'page' | 'page_size'>): Promise<OrderStats> =>
    request.get('/admin/orders/stats', { params }),

  getDetail: (id: number): Promise<OrderDetail> => request.get(`/admin/orders/${id}`),

  refund: (id: number, data: RefundParams): Promise<void> =>
    request.post(`/admin/orders/${id}/refund`, data),
}
