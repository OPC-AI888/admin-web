import request from './request'

export interface StatsParams {
  days: number
}

export interface StatsTrendItem {
  date: string
  value: number
  value2?: number
}

export interface DauTrend {
  items: StatsTrendItem[]
}

export interface DialTrend {
  items: StatsTrendItem[]  // value=拨打次数, value2=客户数
}

export interface ActiveDurationTrend {
  items: StatsTrendItem[]  // value=avg_seconds, value2=total_seconds
}

export const statsApi = {
  getDau: (params: StatsParams): Promise<DauTrend> =>
    request.get('/admin/stats/dau', { params }),

  getDial: (params: StatsParams): Promise<DialTrend> =>
    request.get('/admin/stats/dial', { params }),

  getActiveDuration: (params: StatsParams): Promise<ActiveDurationTrend> =>
    request.get('/admin/stats/active-duration', { params }),
}
