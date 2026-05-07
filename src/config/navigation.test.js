import { describe, expect, it } from 'vitest'
import {
    getVisibleSettingsSearchItems,
    searchSettingsIndex,
    SETTINGS_SECTIONS
} from './navigation'

describe('settings search index', () => {
    it.each([
        ['command menu', 'command_menu'],
        ['profile picture', 'profile_photo'],
        ['dark mode', 'theme_dark'],
        ['storage', 'storage_limits'],
        ['offline', 'offline_mode'],
        ['sync', 'offline_mode'],
        ['download offline data', 'offline_mode'],
        ['attendance', 'auto_all_dates'],
        ['notifications', 'notifications'],
        ['keyboard shortcuts', 'command_menu'],
        ['Ctrl K', 'command_menu'],
        ['settings', 'help_center']
    ])('finds %s', (query, expectedId) => {
        const results = searchSettingsIndex(query, getVisibleSettingsSearchItems(true), SETTINGS_SECTIONS)
        expect(results.map(item => item.id)).toContain(expectedId)
    })
})
