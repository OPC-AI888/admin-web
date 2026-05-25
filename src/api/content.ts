import request from './request'

// ---- App 版本 ----
export interface AppVersionItem {
  id: number
  versionCode: number
  versionName: string
  platform: string
  downloadUrl: string
  forceUpdate: boolean
  status: string
  releaseNotes: string
  createdTime: string
  publishedTime?: string
}

export interface AppVersionCreateParams {
  versionCode: number
  versionName: string
  platform: string
  downloadUrl: string
  forceUpdate: boolean
  releaseNotes: string
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
  targetUsers: string
  status: string
  publishTime?: string
  createdTime: string
}

export interface NoticeCreateParams {
  title: string
  content: string
  type: string
  targetUsers: string
  publishTime?: string
}

export interface NoticeUpdateParams extends Partial<NoticeCreateParams> {}

export const contentApi = {
  // App 版本
  getAppVersionList: (params?: { platform?: string; status?: string; page?: number; page_size?: number }): Promise<PageResult<AppVersionItem>> =>
    request.get('/app-versions', { params }),

  createAppVersion: (data: AppVersionCreateParams): Promise<AppVersionItem> =>
    request.post('/app-versions', data),

  updateAppVersion: (id: number, data: AppVersionUpdateParams): Promise<void> =>
    request.put(`/app-versions/${id}`, data),

  publishAppVersion: (id: number): Promise<void> =>
    request.post(`/app-versions/${id}/publish`),

  archiveAppVersion: (id: number): Promise<void> =>
    request.post(`/app-versions/${id}/archive`),

  // 公告
  getNoticeList: (params?: { type?: string; status?: string; page?: number; page_size?: number }): Promise<PageResult<NoticeItem>> =>
    request.get('/notices', { params }),

  createNotice: (data: NoticeCreateParams): Promise<NoticeItem> =>
    request.post('/notices', data),

  updateNotice: (id: number, data: NoticeUpdateParams): Promise<void> =>
    request.put(`/notices/${id}`, data),

  publishNotice: (id: number): Promise<void> =>
    request.post(`/notices/${id}/publish`),

  offlineNotice: (id: number): Promise<void> =>
    request.post(`/notices/${id}/offline`),

  deleteNotice: (id: number): Promise<void> =>
    request.delete(`/notices/${id}`),
}
