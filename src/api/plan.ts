import request from './request'

export interface PlanItem {
  id: number | string
  planType: string
  name: string
  price: number
  dailyDialLimit: number
  customerLimit: number
  syncMode: string
  dataExport: boolean
  trialDays: number
  enabled: boolean
  createdTime: string
  updatedTime: string
}

export interface PlanUpdateParams {
  name?: string
  price?: number
  dailyDialLimit?: number
  customerLimit?: number
  syncMode?: string
  dataExport?: boolean
  trialDays?: number
  enabled?: boolean
}

type PlanId = number | string

export const planApi = {
  getList: (): Promise<PlanItem[]> =>
    request.get('/plans') as Promise<PlanItem[]>,

  getDetail: (id: PlanId): Promise<PlanItem> =>
    request.get(`/plans/${id}`) as Promise<PlanItem>,

  update: (id: PlanId, data: PlanUpdateParams): Promise<void> =>
    request.put(`/plans/${id}`, data),

  enable: (id: PlanId): Promise<void> => request.post(`/plans/${id}/enable`),

  disable: (id: PlanId): Promise<void> => request.post(`/plans/${id}/disable`),
}
