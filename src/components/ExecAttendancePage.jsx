import React, { useEffect, useState, useMemo } from 'react'
import { Shield, CalendarDays, Users, ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ExecAttendancePage = ({ onBack }) => {
  const { preferences } = useAuth()
  const isExecutive = preferences?.role === 'executive' || preferences?.is_executive === true
  const [rollup, setRollup] = useState({ loading: true, error: null, data: [] })

  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  useEffect(() => {
    // Scroll to top on enter
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchRollup = async () => {
      if (!isExecutive) {
        setRollup({ loading: false, error: null, data: [] })
        return
      }
      if (!isSupabaseConfigured || !supabase) {
        setRollup({
          loading: false,
          error: 'Supabase is not configured; showing placeholder only.',
          data: []
        })
        return
      }
      try {
        const { data, error } = await supabase.rpc('get_exec_attendance', { month: currentMonth })
        if (!isMounted) return
        if (error) {
          // Gracefully handle missing RPC/function
          setRollup({
            loading: false,
            error: error.message || 'Unable to load executive attendance (RPC missing?)',
            data: []
          })
        } else {
          setRollup({ loading: false, error: null, data: data || [] })
        }
      } catch (err) {
        if (!isMounted) return
        setRollup({
          loading: false,
          error: err?.message || 'Unable to load executive attendance',
          data: []
        })
      }
    }
    fetchRollup()
    return () => { isMounted = false }
  }, [currentMonth, isExecutive])

  if (!isExecutive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access restricted</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">You need executive permissions to view the executive attendance dashboard.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-[76px] md:top-[48px] left-0 right-0 z-50 w-full bg-gray-100/95 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto w-full px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Executive Attendance</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-[52px] md:pt-[60px] pb-10 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly rollup</h2>
          </div>
          {rollup.loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading executive attendance…</p>
          ) : rollup.error ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {rollup.error} (Showing placeholder only)
            </p>
          ) : rollup.data.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No rollup data returned yet. The RPC get_exec_attendance may be empty; placeholder shown.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rollup.data.map((day) => (
                <div key={day.date} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{day.date}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Exec-only</span>
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <div>Present: {day.present_count ?? '—'}</div>
                    <div>Absent: {day.absent_count ?? '—'}</div>
                    <div>Visitors: {day.visitor_count ?? '—'}</div>
                    <div>Ushers/Teams: {day.ushers_count ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What we will show</h2>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>Month grid with per-day totals (present, absent, visitors, ushers/teams).</li>
            <li>Click a day to drill into service slots and member-level details.</li>
            <li>Filters for month, service type, and teams.</li>
            <li>Exports (CSV/PDF) with audit logging.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExecAttendancePage
