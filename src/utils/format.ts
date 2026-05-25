import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.locale('zh-cn')

/**
 * 格式化金额（元，保留2位小数）
 */
export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return `¥${amount.toFixed(2)}`
}

/**
 * 格式化字节大小（友好展示 KB/MB/GB）
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化时间（dayjs）
 */
export function formatTime(
  time: string | number | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!time) return '-'
  return dayjs(time).format(format)
}

/**
 * 格式化日期（仅年月日）
 */
export function formatDate(time: string | number | null | undefined): string {
  return formatTime(time, 'YYYY-MM-DD')
}

/**
 * 相对时间（如：3分钟前）
 */
export function fromNow(time: string | number | null | undefined): string {
  if (!time) return '-'
  return (dayjs(time) as ReturnType<typeof dayjs>).fromNow()
}

/**
 * 截断字符串，超过 maxLen 显示省略号
 */
export function truncate(str: string | null | undefined, maxLen = 20): string {
  if (!str) return '-'
  if (str.length <= maxLen) return str
  return `${str.slice(0, maxLen)}...`
}

/**
 * 格式化大数字（如 10000 → 1万）
 */
export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  if (num >= 100000000) return `${(num / 100000000).toFixed(2)}亿`
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  return String(num)
}

/**
 * 将本地日期转换为 UTC 该日 00:00:00（用于查询范围开始）
 */
export function dateToUTCStart(dateStr: string): string {
  if (!dateStr) return ''
  return dayjs(dateStr).startOf('day').utc().format()
}

/**
 * 将本地日期转换为 UTC 该日 23:59:59（用于查询范围结束）
 */
export function dateToUTCEnd(dateStr: string): string {
  if (!dateStr) return ''
  return dayjs(dateStr).endOf('day').utc().format()
}

/**
 * 将本地日期时间字符串转换为 UTC（用于 publishTime 等精确时刻）
 */
export function datetimeToUTC(dateStr: string): string {
  if (!dateStr) return ''
  return dayjs(dateStr).utc().format()
}
