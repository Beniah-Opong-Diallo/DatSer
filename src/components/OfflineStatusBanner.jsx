import React, { useEffect, useState } from 'react'
import { CloudOff, Database, Download, RefreshCw, Wifi, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PREP_DISMISSED_KEY = 'datser_offline_prepare_prompt_dismissed'

const statusStyles = {
  online: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
  offline: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
  'forced-offline': 'border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
  error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100'
}

const getDismissed = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PREP_DISMISSED_KEY) === 'true'
}

const OfflineStatusBanner = ({ onOpenOfflineSettings }) => {
  const {
    isOnline,
    offlineMode,
    offlineModeStatus,
    offlineCacheMeta,
    pendingSyncCount,
    offlineStatusMessage,
    isPreparingOffline,
    isSyncingOffline,
    prepareOfflineData,
    syncOfflineChanges,
    hasAccess
  } = useApp()
  const [isPrepDismissed, setIsPrepDismissed] = useState(getDismissed)

  useEffect(() => {
    if (offlineCacheMeta && isPrepDismissed) {
      setIsPrepDismissed(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PREP_DISMISSED_KEY)
      }
    }
  }, [offlineCacheMeta, isPrepDismissed])

  const dismissPrep = () => {
    setIsPrepDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREP_DISMISSED_KEY, 'true')
    }
  }

  const hasCache = Boolean(offlineCacheMeta)
  const showPrepPrompt = hasAccess && !hasCache && !isPrepDismissed
  const showSync = isOnline && offlineMode !== 'offline' && pendingSyncCount > 0
  const showStatus = hasAccess && !showPrepPrompt && (
    offlineStatusMessage ||
    pendingSyncCount > 0 ||
    offlineModeStatus === 'offline' ||
    offlineModeStatus === 'forced-offline' ||
    offlineModeStatus === 'online-unavailable'
  )

  if (!showPrepPrompt && !showStatus) return null

  if (showPrepPrompt) {
    return (
      <div className="datser-offline-notice fixed z-[55] w-[min(420px,calc(100vw-24px))]">
        <div className="rounded-2xl border border-orange-200 bg-white text-gray-900 shadow-2xl shadow-orange-900/10 dark:border-orange-900/60 dark:bg-gray-900 dark:text-white">
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-orange-100 p-2.5 text-orange-700 dark:bg-orange-900/35 dark:text-orange-300">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Prepare Offline Mode</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      Download your members and attendance data so you can continue working when the APK is offline.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={dismissPrep}
                    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    aria-label="Dismiss offline preparation prompt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await prepareOfflineData()
                      if (result?.success) dismissPrep()
                    }}
                    disabled={isPreparingOffline || !isOnline}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {isPreparingOffline ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isPreparingOffline ? 'Downloading...' : 'Download Offline Data'}
                  </button>
                  <button
                    type="button"
                    onClick={onOpenOfflineSettings}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200 dark:hover:bg-orange-900/40"
                  >
                    Offline Settings
                  </button>
                </div>
                {!isOnline && (
                  <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                    Go online once to prepare this device.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isError = offlineStatusMessage?.toLowerCase().includes('failed') || offlineModeStatus === 'online-unavailable'
  const statusClass = isError
    ? statusStyles.error
    : statusStyles[offlineModeStatus] || statusStyles.online
  const title = offlineModeStatus === 'forced-offline'
    ? 'Forced Offline'
    : offlineModeStatus === 'offline'
      ? 'Offline Mode'
      : isOnline
        ? 'Online'
        : 'Offline'
  const message = offlineStatusMessage || (offlineModeStatus === 'offline'
    ? 'Offline Mode - using saved local data.'
    : `Back online - ${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'} waiting to sync.`)

  return (
    <div className="datser-offline-notice fixed z-[55] w-[min(380px,calc(100vw-24px))]">
      <div className={`rounded-2xl border p-3 shadow-2xl ${statusClass}`}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-full bg-white/60 p-1.5 dark:bg-white/10">
            {isOnline && offlineModeStatus !== 'offline' && offlineModeStatus !== 'forced-offline'
              ? <Wifi className="h-4 w-4" />
              : <CloudOff className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">{title}</p>
            <p className="mt-0.5 text-sm leading-snug opacity-90">{message}</p>
          </div>
          {showSync && (
            <button
              type="button"
              onClick={syncOfflineChanges}
              disabled={isSyncingOffline}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingOffline ? 'animate-spin' : ''}`} />
              {isSyncingOffline ? 'Syncing' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OfflineStatusBanner
