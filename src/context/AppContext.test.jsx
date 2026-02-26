import React, { useEffect } from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

let preferenceListeners = []
let emitPreferencesChange = () => {}

vi.mock('../lib/supabase', () => {
  preferenceListeners = []
  emitPreferencesChange = (row) => {
    preferenceListeners.forEach((cb) => cb({ new: row }))
  }

  const makeQuery = (table) => {
    const base = {
      select: () => base,
      eq: () => base,
      in: () => base,
      limit: () => base,
      range: () => Promise.resolve({ data: [], error: null }),
      single: () => {
        if (table === 'collaborators') {
          return Promise.resolve({ data: { owner_id: 'owner-1', status: 'accepted' }, error: null })
        }
        if (table === 'user_preferences') {
          return Promise.resolve({
            data: {
              admin_sticky_month: 'January_2026',
              admin_sticky_sundays: [],
              locked_default_date: null
            },
            error: null
          })
        }
        return Promise.resolve({ data: null, error: null })
      },
      upsert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ data: [], error: null }),
      delete: () => base,
      not: () => Promise.resolve({ error: null })
    }
    return base
  }

  const channel = () => {
    const ch = {
      on: (_event, filter, cb) => {
        if (filter?.table === 'user_preferences') {
          preferenceListeners.push(cb)
        }
        return ch
      },
      subscribe: () => ch
    }
    return ch
  }

  return {
    supabase: {
      from: (table) => makeQuery(table),
      rpc: (name) => {
        if (name === 'get_owner_workspace_name') {
          return Promise.resolve({ data: 'Workspace', error: null })
        }
        if (name === 'get_owner_locked_date') {
          return Promise.resolve({ data: null, error: null })
        }
        if (name === 'get_available_month_tables') {
          return Promise.resolve({
            data: [{ table_name: 'January_2026' }, { table_name: 'February_2026' }],
            error: null
          })
        }
        if (name === 'get_table_columns') {
          return Promise.resolve({ data: [], error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      auth: {
        getSession: () => Promise.resolve({ data: { session: { user: { id: 'collab-1' } } } })
      },
      channel,
      removeChannel: () => {}
    }
  }
})

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'collab-1', email: 'collab@example.com' },
    loading: false,
    preferences: {},
    updatePreference: vi.fn()
  })
}))

describe('AppContext collaborator sync', () => {
  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
    process.env.VITE_SUPABASE_ANON_KEY = 'test-key'
    localStorage.clear()
  })

  it('jumps to admin date across month boundaries', async () => {
    const { AppProvider, useApp } = await import('./AppContext.jsx')
    const StateProbe = ({ onState }) => {
      const { currentTable, selectedAttendanceDate } = useApp()
      useEffect(() => {
        onState({ currentTable, selectedAttendanceDate })
      }, [currentTable, selectedAttendanceDate, onState])
      return null
    }
    let latest = null
    render(
      <AppProvider>
        <StateProbe
          onState={(state) => {
            latest = state
          }}
        />
      </AppProvider>
    )

    await waitFor(() => {
      expect(latest?.currentTable).toBeTruthy()
    })

    emitPreferencesChange({
      admin_sticky_month: 'February_2026',
      locked_default_date: '2026-02-08',
      admin_sticky_sundays: []
    })

    await waitFor(() => {
      expect(latest.currentTable).toBe('February_2026')
    })

    await waitFor(() => {
      expect(latest.selectedAttendanceDate?.toISOString().slice(0, 10)).toBe('2026-02-08')
    })
  })
})
