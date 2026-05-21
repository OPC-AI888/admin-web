// 枚举常量，与后端 Java 枚举完全对齐

// 用户状态
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  BANNED = 'BANNED',
}

export const UserStatusMap: Record<UserStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger'; color: string }> = {
  [UserStatus.ACTIVE]: { label: '正常', type: 'success', color: '#52c41a' },
  [UserStatus.DISABLED]: { label: '已禁用', type: 'info', color: '#8c8c8c' },
  [UserStatus.BANNED]: { label: '已封禁', type: 'danger', color: '#f5222d' },
}

// 套餐类型
export enum PlanType {
  FREE = 'FREE',
  DAY_CARD = 'DAY_CARD',
  MONTH_CARD = 'MONTH_CARD',
  YEAR_CARD = 'YEAR_CARD',
}

export const PlanTypeMap: Record<PlanType, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger'; color: string }> = {
  [PlanType.FREE]: { label: '免费版', type: 'info', color: '#8c8c8c' },
  [PlanType.DAY_CARD]: { label: '日卡', type: 'warning', color: '#fa8c16' },
  [PlanType.MONTH_CARD]: { label: '月卡', type: 'primary', color: '#1890ff' },
  [PlanType.YEAR_CARD]: { label: '年卡', type: 'success', color: '#52c41a' },
}

// 订阅状态
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export const SubscriptionStatusMap: Record<
  SubscriptionStatus,
  { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }
> = {
  [SubscriptionStatus.ACTIVE]: { label: '生效中', type: 'success' },
  [SubscriptionStatus.EXPIRED]: { label: '已过期', type: 'info' },
  [SubscriptionStatus.CANCELLED]: { label: '已取消', type: 'warning' },
}

// 支付方式
export enum PayMethod {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
}

export const PayMethodMap: Record<PayMethod, { label: string; color: string }> = {
  [PayMethod.WECHAT]: { label: '微信支付', color: '#07C160' },
  [PayMethod.ALIPAY]: { label: '支付宝', color: '#1677FF' },
}

// 支付状态
export enum PayStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export const PayStatusMap: Record<PayStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [PayStatus.PENDING]: { label: '待支付', type: 'warning' },
  [PayStatus.PAID]: { label: '已支付', type: 'success' },
  [PayStatus.FAILED]: { label: '支付失败', type: 'danger' },
  [PayStatus.CANCELLED]: { label: '已取消', type: 'info' },
}

// 退款状态
export enum RefundStatus {
  NONE = 'NONE',
  PROCESSING = 'PROCESSING',
  REFUNDED = 'REFUNDED',
  REJECTED = 'REJECTED',
}

export const RefundStatusMap: Record<RefundStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [RefundStatus.NONE]: { label: '无退款', type: 'info' },
  [RefundStatus.PROCESSING]: { label: '退款中', type: 'warning' },
  [RefundStatus.REFUNDED]: { label: '已退款', type: 'success' },
  [RefundStatus.REJECTED]: { label: '退款拒绝', type: 'danger' },
}

// 管理员角色
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATOR = 'OPERATOR',
}

export const AdminRoleMap: Record<AdminRole, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [AdminRole.SUPER_ADMIN]: { label: '超级管理员', type: 'danger' },
  [AdminRole.OPERATOR]: { label: '运营人员', type: 'primary' },
}

// 同步模式
export enum SyncMode {
  NONE = 'NONE',
  MANUAL_ONLY = 'MANUAL_ONLY',
  AUTO_AND_MANUAL = 'AUTO_AND_MANUAL',
}

export const SyncModeMap: Record<SyncMode, { label: string; desc: string }> = {
  [SyncMode.NONE]: { label: '不支持同步', desc: '用户无法上传/下载云端数据，仅用于免费版' },
  [SyncMode.MANUAL_ONLY]: {
    label: '仅手动同步',
    desc: '用户可手动上传/下载（每小时各3次限制），不自动上传，用于日卡',
  },
  [SyncMode.AUTO_AND_MANUAL]: {
    label: '自动+手动同步',
    desc: '每12小时自动上传+手动可上传/下载，用于月卡/年卡',
  },
}

// 管理员状态
export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export const AdminStatusMap: Record<AdminStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [AdminStatus.ACTIVE]: { label: '正常', type: 'success' },
  [AdminStatus.DISABLED]: { label: '已禁用', type: 'info' },
}

// App 版本状态
export enum AppVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export const AppVersionStatusMap: Record<AppVersionStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [AppVersionStatus.DRAFT]: { label: '草稿', type: 'info' },
  [AppVersionStatus.PUBLISHED]: { label: '已发布', type: 'success' },
  [AppVersionStatus.ARCHIVED]: { label: '已归档', type: 'warning' },
}

// 公告类型
export enum NoticeType {
  NOTICE = 'NOTICE',
  UPDATE = 'UPDATE',
  PROMO = 'PROMO',
}

export const NoticeTypeMap: Record<NoticeType, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [NoticeType.NOTICE]: { label: '通知', type: 'primary' },
  [NoticeType.UPDATE]: { label: '更新', type: 'warning' },
  [NoticeType.PROMO]: { label: '活动', type: 'success' },
}

// 公告状态
export enum NoticeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OFFLINE = 'OFFLINE',
}

export const NoticeStatusMap: Record<NoticeStatus, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  [NoticeStatus.DRAFT]: { label: '草稿', type: 'info' },
  [NoticeStatus.PUBLISHED]: { label: '已发布', type: 'success' },
  [NoticeStatus.OFFLINE]: { label: '已下线', type: 'warning' },
}

// 公告目标用户
export enum NoticeTargetUsers {
  ALL = 'ALL',
  PAID = 'PAID',
  FREE = 'FREE',
}

export const NoticeTargetUsersMap: Record<NoticeTargetUsers, { label: string }> = {
  [NoticeTargetUsers.ALL]: { label: '所有用户' },
  [NoticeTargetUsers.PAID]: { label: '付费用户' },
  [NoticeTargetUsers.FREE]: { label: '免费用户' },
}

// 平台类型
export enum Platform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

export const PlatformMap: Record<Platform, { label: string }> = {
  [Platform.ANDROID]: { label: 'Android' },
  [Platform.IOS]: { label: 'iOS' },
}
