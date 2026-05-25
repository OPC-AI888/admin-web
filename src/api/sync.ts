import request from './request'

export interface SyncOverview {
  syncedUsers: number
  totalBytes: number
  avgBytes: number
}

export interface SyncListParams {
  phone?: string
  syncedTimeStart?: string
  syncedTimeEnd?: string
  minDataSize?: number
  sortBy?: string
  sortOrder?: string
  page?: number
  pageSize?: number
}

export interface SyncUserItem {
  accountId: number
  phone: string
  dataSize: number
  syncedTime: string
  contentHashPrefix: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const syncApi = {
  getOverview: (): Promise<SyncOverview> =>
    request.get('/sync/overview') as Promise<SyncOverview>,

  getUserList: (params: SyncListParams): Promise<PageResult<SyncUserItem>> =>
    request.get('/sync/users', { params }),
}
