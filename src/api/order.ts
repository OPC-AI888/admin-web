import request from './request'

export interface OrderListParams {
  orderNo?: string
  accountId?: number
  payStatus?: string | string[]
  refundStatus?: string | string[]
  payMethod?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface OrderItem {
  id: number
  orderNo: string
  accountId: number
  accountPhone: string
  planType: string
  planName: string
  amount: number
  payMethod: string
  payStatus: string
  refundStatus: string
  payTime?: string
  createdTime: string
}

export interface OrderDetail extends OrderItem {
  accountNickname?: string
  refundRecords?: RefundRecord[]
}

export interface RefundRecord {
  id: number
  amount: number
  reason: string
  status: string
  createdTime: string
  processedTime?: string
}

export interface OrderStats {
  orderCount: number
  totalAmount: number
  refundAmount: number
}

export interface RefundParams {
  refundAmount: number
  reason: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function toOrderParams(params: OrderListParams) {
  return {
    orderNo: params.orderNo,
    accountId: params.accountId,
    payStatus: firstValue(params.payStatus),
    refundStatus: firstValue(params.refundStatus),
    payMethod: params.payMethod,
    startDate: params.startDate,
    endDate: params.endDate,
    page: params.page,
    size: params.pageSize,
  }
}

export const orderApi = {
  getList: (params: OrderListParams): Promise<PageResult<OrderItem>> =>
    request.get('/orders', { params: toOrderParams(params) }) as Promise<PageResult<OrderItem>>,

  getStats: (params: Omit<OrderListParams, 'page' | 'pageSize'>): Promise<OrderStats> =>
    request.get('/orders/stats', { params: toOrderParams(params) }),

  getDetail: (id: number): Promise<OrderDetail> => request.get(`/orders/${id}`) as Promise<OrderDetail>,

  refund: (id: number, data: RefundParams): Promise<void> =>
    request.post(`/orders/${id}/refund`, { refundAmount: data.refundAmount, reason: data.reason }),
}
