import React, { useEffect, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { isVersionGreater } from '../utils/versionCompare'

const VERSION_FILE = '/app-version.json'
const SKIP_KEY_PREFIX = 'datser_apk_update_skip_'

function AppUpdatePrompt() {
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    let cancelled = false

    const checkForUpdate = async () => {
      if (!Capacitor.isNativePlatform()) return

      try {
        const appInfo = await CapacitorApp.getInfo()
        const response = await fetch(`${VERSION_FILE}?t=${Date.now()}`, {
          cache: 'no-store'
        })

        if (!response.ok) return

        const data = await response.json()
        if (!data?.latestVersion || !data?.apkUrl) return

        const currentVersion = appInfo.version || '0.0.0'
        if (!isVersionGreater(data.latestVersion, currentVersion)) return

        const latestVersion = String(data.latestVersion)
        if (!data.forceUpdate && localStorage.getItem(`${SKIP_KEY_PREFIX}${latestVersion}`) === 'true') {
          return
        }

        if (!cancelled) {
          setUpdateInfo({
            currentVersion,
            latestVersion,
            apkUrl: String(data.apkUrl),
            forceUpdate: Boolean(data.forceUpdate),
            message: data.message || 'A new DatSer app update is available.'
          })
        }
      } catch {
        // Update checks must never interrupt normal app usage.
      }
    }

    checkForUpdate()

    return () => {
      cancelled = true
    }
  }, [])

  if (!updateInfo) return null

  const openUpdate = async () => {
    try {
      await Browser.open({ url: updateInfo.apkUrl })
    } catch {
      window.open(updateInfo.apkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const skipUpdate = () => {
    if (updateInfo.forceUpdate) return
    localStorage.setItem(`${SKIP_KEY_PREFIX}${updateInfo.latestVersion}`, 'true')
    setUpdateInfo(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal={updateInfo.forceUpdate}
        aria-labelledby="datser-apk-update-title"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-lg font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">
            D
          </div>
          <div>
            <h2 id="datser-apk-update-title" className="text-lg font-bold text-gray-950 dark:text-white">
              {updateInfo.forceUpdate ? 'Update required' : 'App update available'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {updateInfo.message}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          Current version: <span className="font-semibold">{updateInfo.currentVersion}</span>
          <span className="mx-2 text-gray-400">/</span>
          Latest version: <span className="font-semibold">{updateInfo.latestVersion}</span>
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
            Download update
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppUpdatePrompt
