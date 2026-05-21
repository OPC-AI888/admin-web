import { ElMessageBox, ElMessage } from 'element-plus'

export interface ConfirmOptions {
  title?: string
  message: string
  type?: 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
}

export function useConfirm() {
  return async (opts: ConfirmOptions): Promise<boolean> => {
    const { title = '提示', message, type = 'warning', confirmText = '确认', cancelText = '取消' } = opts

    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        type: type === 'danger' ? 'error' : 'warning',
        confirmButtonClass: type === 'danger' ? 'el-button--danger' : '',
        dangerouslyUseHTMLString: true,
      })
      return true
    } catch {
      return false
    }
  }
}

/**
 * 危险操作确认（需用户输入"确认"二字）
 */
export async function dangerConfirm(title: string, message: string): Promise<boolean> {
  try {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入"确认"以继续',
      inputValidator: (val) => {
        if (val !== '确认') return '请输入"确认"以继续操作'
        return true
      },
      type: 'warning',
    })
    return value === '确认'
  } catch {
    return false
  }
}
