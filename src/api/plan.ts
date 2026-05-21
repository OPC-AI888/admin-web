import request from './request'

export interface PlanItem {
  id: number
  plan_type: string
  name: string
  price: number
  daily_dial_limit: number
  customer_limit: number
  sync_mode: string
  data_export: boolean
  trial_days: number
  enabled: boolean
  created_time: string
  updated_time: string
}

export interface PlanUpdateParams {
  name?: string
  price?: number
  daily_dial_limit?: number
  customer_limit?: number
  sync_mode?: string
  data_export?: boolean
  trial_days?: number
  enabled?: boolean
}

export const planApi = {
  getList: (): Promise<PlanItem[]> => request.get('/admin/plans'),

  getDetail: (id: number): Promise<PlanItem> => request.get(`/admin/plans/${id}`),

  update: (id: number, data: PlanUpdateParams): Promise<void> =>
    request.put(`/admin/plans/${id}`, data),

  enable: (id: number): Promise<void> => request.post(`/admin/plans/${id}/enable`),

  disable: (id: number): Promise<void> => request.post(`/admin/plans/${id}/disable`),
}
