import React, { useEffect, useState } from 'react'
import { AlertTriangle, Download, Info, X } from 'lucide-react'
import {
  fetchLatestAppRelease,
  getInstalledAppInfo,
  isAndroidNative,
  isReleaseNewer,
  openApkDownload
} from '../utils/appUpdates'
import { notify } from '../utils/notify'

const SKIP_KEY_PREFIX = 'datser_apk_update_skip_'

function AppUpdatePrompt() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkForUpdate = async () => {
      if (!isAndroidNative()) return

      try {
        const appInfo = await getInstalledAppInfo()
        const release = await fetchLatestAppRelease()
        if (!release?.apkUrl || !isReleaseNewer(release, appInfo)) return

        const skipKey = `${SKIP_KEY_PREFIX}${release.versionName}_${release.versionCode}`
        if (!release.forceUpdate && localStorage.getItem(skipKey) === 'true') return

        const nextUpdate = { ...release, appInfo, skipKey }
        if (cancelled) return

        setUpdateInfo(nextUpdate)
        notify.update('Version ' + release.versionName + ' is ready to download.', {
          title: release.forceUpdate ? 'Update required before continuing.' : 'New DatSer update available.',
          details: release.description,
          persistent: release.forceUpdate,
          defaultExpanded: release.forceUpdate,
          toastId: `apk-update-${release.versionName}-${release.versionCode}`,
          actions: [
            {
              label: 'Download Update',
              variant: 'primary',
              dismiss: false,
              onClick: () => openApkDownload(release.apkUrl)
            },
            {
              label: 'View Details',
              dismiss: false,
              onClick: () => setShowDetails(true)
            },
            ...(!release.forceUpdate
              ? [{
                  label: 'Later',
                  onClick: () => {
                    localStorage.setItem(skipKey, 'true')
                    setUpdateInfo(null)
                    setShowDetails(false)
                  }
                }]
              : [])
          ]
        })
      } catch (error) {
        console.warn('APK update check failed:', error)
      }
    }

    checkForUpdate()

    return () => {
      cancelled = true
    }
  }, [])

  if (!updateInfo || (!updateInfo.forceUpdate && !showDetails)) return null

  const openUpdate = () => openApkDownload(updateInfo.apkUrl)

  const skipUpdate = () => {
    if (updateInfo.forceUpdate) return
    localStorage.setItem(updateInfo.skipKey, 'true')
    setUpdateInfo(null)
    setShowDetails(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-md rounded-[24px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal={updateInfo.forceUpdate}
        aria-labelledby="datser-apk-update-title"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            updateInfo.forceUpdate
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200'
          }`}>
            {updateInfo.forceUpdate ? <AlertTriangle className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 id="datser-apk-update-title" className="text-lg font-bold text-gray-950 dark:text-white">
                {updateInfo.forceUpdate ? 'Update required before continuing.' : 'New DatSer update available.'}
              </h2>
              {!updateInfo.forceUpdate && (
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Close update details"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Version {updateInfo.versionName} is ready to download.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <p className="font-semibold">{updateInfo.title}</p>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{updateInfo.description}</p>
          <p className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            Android will open the APK download or installer flow. You will still confirm Install or Update manually.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-xs dark:border-gray-700 dark:bg-gray-900">
          <div>
            <p className="text-gray-400">Current</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {updateInfo.appInfo.versionName} ({updateInfo.appInfo.versionCode || 'web'})
            </p>
          </div>
          <div>
            <p className="text-gray-400">Latest</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {updateInfo.versionName} ({updateInfo.versionCode})
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {!updateInfo.forceUpdate && (
            <button
              type="button"
              onClick={skipUpdate}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Later
            </button>
          )}
          <button
            type="button"
            onClick={openUpdate}
            className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
          >
            Download Update
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppUpdatePrompt
