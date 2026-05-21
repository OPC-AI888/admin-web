import request from './request'

export interface SyncOverview {
  synced_user_count: number
  total_storage_bytes: number
  avg_size_bytes: number
}

export interface SyncListParams {
  phone?: string
  synced_time_start?: string
  synced_time_end?: string
  min_data_size?: number
  page?: number
  page_size?: number
}

export interface SyncUserItem {
  account_id: number
  phone: string
  data_size: number
  synced_time: string
  content_hash: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const syncApi = {
  getOverview: (): Promise<SyncOverview> => request.get('/admin/sync/overview'),

  getUserList: (params: SyncListParams): Promise<PageResult<SyncUserItem>> =>
    request.get('/admin/sync/users', { params }),
}
