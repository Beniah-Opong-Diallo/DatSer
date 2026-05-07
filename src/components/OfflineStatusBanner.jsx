import React from 'react'
import { CloudOff, RefreshCw, Wifi } from 'lucide-react'
import { useApp } from '../context/AppContext'

const OfflineStatusBanner = () => {
  const {
    isOnline,
    pendingSyncCount,
    offlineStatusMessage,
    isSyncingOffline,
    syncOfflineChanges
  } = useApp()

  if (isOnline && pendingSyncCount === 0 && !offlineStatusMessage) {
    return null
  }

  const showSync = isOnline && pendingSyncCount > 0
  const label = isOnline
    ? `Back online - ${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'} waiting to sync.`
    : 'Offline Mode - using local data. Changes will sync when you are back online.'

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 mb-3">
      <div className={`rounded-2xl border px-3 py-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
        isOnline
          ? 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-100'
          : 'bg-gray-900 border-gray-800 text-white dark:bg-gray-950 dark:border-gray-700'
      }`}>
        <div className="flex items-start gap-2 min-w-0">
          <div className={`mt-0.5 rounded-full p-1 ${isOnline ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-white/10'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{label}</p>
            {offlineStatusMessage && (
              <p className={`text-xs mt-0.5 ${isOnline ? 'text-orange-700 dark:text-orange-200' : 'text-white/70'}`}>
                {offlineStatusMessage}
              </p>
            )}
          </div>
        </div>

        {showSync && (
          <button
            type="button"
            onClick={syncOfflineChanges}
            disabled={isSyncingOffline}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingOffline ? 'animate-spin' : ''}`} />
            {isSyncingOffline ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  )
}

export default OfflineStatusBanner
