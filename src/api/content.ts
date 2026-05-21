import request from './request'

// ---- App 版本 ----
export interface AppVersionItem {
  id: number
  version_code: number
  version_name: string
  platform: string
  download_url: string
  force_update: boolean
  status: string
  release_notes: string
  created_time: string
  published_time?: string
}

export interface AppVersionCreateParams {
  version_code: number
  version_name: string
  platform: string
  download_url: string
  force_update: boolean
  release_notes: string
}

export interface AppVersionUpdateParams extends Partial<AppVersionCreateParams> {}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// ---- 公告 ----
export interface NoticeItem {
  id: number
  title: string
  content: string
  type: string
  target_users: string
  status: string
  publish_time?: string
  created_time: string
}

export interface NoticeCreateParams {
  title: string
  content: string
  type: string
  target_users: string
  publish_time?: string
}

export interface NoticeUpdateParams extends Partial<NoticeCreateParams> {}

export const contentApi = {
  // App 版本
  getAppVersionList: (params?: { platform?: string; status?: string; page?: number; page_size?: number }): Promise<PageResult<AppVersionItem>> =>
    request.get('/admin/app-versions', { params }),

  getAppVersionDetail: (id: number): Promise<AppVersionItem> =>
    request.get(`/admin/app-versions/${id}`),

  createAppVersion: (data: AppVersionCreateParams): Promise<AppVersionItem> =>
    request.post('/admin/app-versions', data),

  updateAppVersion: (id: number, data: AppVersionUpdateParams): Promise<void> =>
    request.put(`/admin/app-versions/${id}`, data),

  publishAppVersion: (id: number): Promise<void> =>
    request.post(`/admin/app-versions/${id}/publish`),

  archiveAppVersion: (id: number): Promise<void> =>
    request.post(`/admin/app-versions/${id}/archive`),

  // 公告
  getNoticeList: (params?: { type?: string; status?: string; page?: number; page_size?: number }): Promise<PageResult<NoticeItem>> =>
    request.get('/admin/notices', { params }),

  getNoticeDetail: (id: number): Promise<NoticeItem> =>
    request.get(`/admin/notices/${id}`),

  createNotice: (data: NoticeCreateParams): Promise<NoticeItem> =>
    request.post('/admin/notices', data),

  updateNotice: (id: number, data: NoticeUpdateParams): Promise<void> =>
    request.put(`/admin/notices/${id}`, data),

  publishNotice: (id: number): Promise<void> =>
    request.post(`/admin/notices/${id}/publish`),

  offlineNotice: (id: number): Promise<void> =>
    request.post(`/admin/notices/${id}/offline`),

  deleteNotice: (id: number): Promise<void> =>
    request.delete(`/admin/notices/${id}`),
}
