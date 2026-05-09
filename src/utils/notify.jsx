import React from 'react'
import { toast } from 'react-toastify'
import NotificationToast from '../components/NotificationToast'

const toastByType = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
  offline: toast.warning,
  online: toast.success,
  sync: toast.info,
  update: toast.info
}

const defaultAutoCloseByType = {
  success: 3200,
  info: 3200,
  online: 3200,
  sync: 3400,
  warning: 4400,
  offline: 4600,
  update: 4600,
  error: 5000
}

const notifyCard = (type, options = {}) => {
  const {
    title,
    message,
    details,
    actions,
    autoClose,
    persistent = false,
    toastId,
    defaultExpanded = false
  } = options
  const toastFn = toastByType[type] || toast.info

  return toastFn(
    <NotificationToast
      type={type}
      title={title}
      message={message}
      details={details}
      actions={actions}
      defaultExpanded={defaultExpanded}
    />,
    {
      toastId,
      autoClose: persistent ? false : (autoClose ?? defaultAutoCloseByType[type] ?? 3400),
      closeButton: false,
      className: 'datser-notification-shell',
      bodyClassName: 'datser-notification-body',
      progressClassName: `datser-notification-progress datser-notification-progress-${type}`
    }
  )
}

export const notify = {
  show: notifyCard,
  success: (message, options = {}) => notifyCard('success', { message, ...options }),
  error: (message, options = {}) => notifyCard('error', { message, ...options }),
  warning: (message, options = {}) => notifyCard('warning', { message, ...options }),
  info: (message, options = {}) => notifyCard('info', { message, ...options }),
  offline: (message, options = {}) => notifyCard('offline', { message, ...options }),
  online: (message, options = {}) => notifyCard('online', { message, ...options }),
  sync: (message, options = {}) => notifyCard('sync', { message, ...options }),
  update: (message, options = {}) => notifyCard('update', { message, ...options })
}

export default notify
