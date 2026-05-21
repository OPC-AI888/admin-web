import request from './request'

export interface DashboardOverview {
  total_users: number
  dau: number
  paying_users: number
  total_revenue_today: number
  total_revenue_month: number
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
  getOverview: (): Promise<DashboardOverview> => request.get('/admin/dashboard/overview'),

  getTrend: (params: TrendParams): Promise<TrendItem[]> =>
    request.get('/admin/dashboard/trend', { params }),
}
