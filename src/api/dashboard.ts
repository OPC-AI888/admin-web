import request from './request'

export interface DashboardOverview {
  totalUsers: number
  dau: number
  payingUsers: number
  totalRevenueToday: number
  totalRevenueMonth: number
}

export interface TrendItem {
  date: string
  value: number
}

export interface TrendParams {
  metric: string
  range?: 'day' | 'week' | 'month'
  days?: number
}

export const dashboardApi = {
  getOverview: (): Promise<DashboardOverview> =>
    request.get('/dashboard/overview') as Promise<DashboardOverview>,

  getTrend: (params: TrendParams): Promise<TrendItem[]> =>
    request.get('/dashboard/trend', { params }),
}
