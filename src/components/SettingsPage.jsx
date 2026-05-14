import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
    User,
    Building2,
    Users,
    Database,
    Palette,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Lock,
    Mail,
    Download,
    Upload,
    Trash2,
    UserPlus,
    Calendar,
    Moon,
    Sun,
    Laptop,
    CheckCircle,
    Shield,
    RefreshCw,
    Pencil,
    HelpCircle,
    ChevronDown,
    X,
    Loader2,
    Search,
    ClipboardList,
    Zap,
    Monitor,
    RotateCcw,
    Sparkles,
    Plus,
    Archive,
    BellRing,
    GripVertical,
    ArrowUp,
    ArrowDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { executeSupabaseWrite } from '../utils/supabaseWrite'
import { GUIDED_FORM_FIELD_LABELS, GUIDED_FORM_FIELD_ORDER, normalizeGuidedOrder, sortGuidedSteps } from '../utils/guidedFormSettings'
import {
    getVisibleSettingsSearchItems,
    getVisibleSettingsSections,
    searchSettingsIndex
} from '../config/navigation.js'
import { getInstalledAppInfo } from '../utils/appUpdates.js'
import ConfirmModal from './ConfirmModal'
import useHapticFeedback from '../hooks/useHapticFeedback'

const ShareAccessModal = React.lazy(() => import('./ShareAccessModal'))
const WorkspaceSettingsModal = React.lazy(() => import('./WorkspaceSettingsModal'))
const DeleteAccountModal = React.lazy(() => import('./DeleteAccountModal'))
const ExportDataModal = React.lazy(() => import('./ExportDataModal'))
const ProfilePhotoEditor = React.lazy(() => import('./ProfilePhotoEditor'))
const HelpCenterPage = React.lazy(() => import('./HelpCenterPage'))
const ActivityLogViewer = React.lazy(() => import('./ActivityLogViewer'))
const ExportCenterPage = React.lazy(() => import('./ExportCenterPage'))
const AdminControlsModal = React.lazy(() => import('./AdminControlsModal'))
const ArchiveMonthModal = React.lazy(() => import('./ArchiveMonthModal'))
const MonthPickerPopup = React.lazy(() => import('./MonthPickerPopup'))
const CombinedDatePicker = React.lazy(() => import('./CombinedDatePicker'))

const PreviewInput = ({ children, compact = false }) => (
    <div className={`guided-preview-input ${compact ? 'guided-preview-input-compact' : ''}`}>
        {children}
    </div>
)

const GuidedOrderPreview = ({ settings }) => {
    const orderedIds = useMemo(() => normalizeGuidedOrder(settings?.guidedOrder), [settings?.guidedOrder])
    const previewSteps = useMemo(() => sortGuidedSteps(
        orderedIds.map(id => ({
            id,
            enabled: !((id === 'tags' && !settings?.highlightTags) || (id === 'notes' && !settings?.highlightNotes))
        })),
        settings
    ), [orderedIds, settings])
    const guidableIds = useMemo(() => orderedIds.filter((id) => {
        if (id === 'tags') return settings?.highlightTags
        if (id === 'notes') return settings?.highlightNotes
        return true
    }), [orderedIds, settings?.highlightNotes, settings?.highlightTags])
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if (activeIndex >= guidableIds.length) setActiveIndex(0)
    }, [activeIndex, guidableIds.length])

    useEffect(() => {
        if (!settings?.enabled || guidableIds.length <= 1) return undefined
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % guidableIds.length)
        }, 1700)
        return () => clearInterval(timer)
    }, [guidableIds.length, settings?.enabled])

    const activeId = settings?.enabled ? previewSteps.filter(step => step.enabled !== false)[activeIndex]?.id : null

    const renderPreviewSection = (id) => {
        const active = activeId === id
        const isSkipped = (id === 'tags' && !settings?.highlightTags) || (id === 'notes' && !settings?.highlightNotes)
        const wrapperClass = `guided-preview-section guided-form-field ${active ? 'guided-form-field-active' : ''} ${isSkipped ? 'guided-preview-section-muted' : ''}`

        const cue = active && (
            <div className={`guided-form-cue ${settings?.pulseNextButton === false ? '' : 'guided-form-cue-pulse'}`} aria-hidden="true">
                <span>→</span>
                <span>Next</span>
            </div>
        )

        if (id === 'full-name') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Full Name *</label>
                    <PreviewInput>Enter full name</PreviewInput>
                </div>
            )
        }
        if (id === 'gender') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Gender *</label>
                    <div className="grid grid-cols-2 gap-2">
                        <PreviewInput compact>Male</PreviewInput>
                        <PreviewInput compact>Female</PreviewInput>
                    </div>
                </div>
            )
        }
        if (id === 'phone') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Phone Number</label>
                    <PreviewInput>
                        <span>598999819</span>
                        <span className="guided-preview-pill">No Phone</span>
                    </PreviewInput>
                </div>
            )
        }
        if (id === 'dob') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Date of Birth</label>
                    <PreviewInput>Select date</PreviewInput>
                </div>
            )
        }
        if (id === 'age') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Age</label>
                    <PreviewInput>Age</PreviewInput>
                </div>
            )
        }
        if (id === 'level') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Current Level</label>
                    <PreviewInput>Select level</PreviewInput>
                </div>
            )
        }
        if (id === 'tags') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Tags {isSkipped && <span className="guided-preview-muted-label">not highlighted</span>}</label>
                    <div className="flex flex-wrap gap-2">
                        {['Choir Department', 'Dance Department', 'Data Department', 'Media Department', 'Protocol Department', 'Ushering Department'].map(tag => (
                            <span key={tag} className="guided-preview-chip">{tag}</span>
                        ))}
                    </div>
                </div>
            )
        }
        if (id === 'attendance') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>May 2026 Sunday Attendance (Optional)</label>
                    <div className="space-y-2">
                        {[3, 10, 17, 24, 31].map(day => (
                            <div key={day} className="guided-preview-attendance-row">
                                <span>Sunday, May {day}, 2026</span>
                                <div className="flex gap-1">
                                    <span>Present</span>
                                    <span>Absent</span>
                                    <span>Clear</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        if (id === 'parent') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Parent/Guardian Info</label>
                    <div className="space-y-2">
                        <span className="guided-preview-subtitle">Parent/Guardian 1 *</span>
                        <PreviewInput>Name</PreviewInput>
                        <PreviewInput><span>Phone Number</span><span className="guided-preview-pill">No Phone</span></PreviewInput>
                        <span className="guided-preview-subtitle">Parent/Guardian 2 (Optional)</span>
                        <PreviewInput>Name</PreviewInput>
                        <PreviewInput><span>Phone Number</span><span className="guided-preview-pill">No Phone</span></PreviewInput>
                    </div>
                </div>
            )
        }
        if (id === 'notes') {
            return (
                <div key={id} className={wrapperClass}>
                    {cue}
                    <label>Notes (Optional) {isSkipped && <span className="guided-preview-muted-label">not highlighted</span>}</label>
                    <PreviewInput> </PreviewInput>
                </div>
            )
        }
        return null
    }

    return (
        <div className="guided-preview-panel">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preview only. It does not edit member data.</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${settings?.enabled ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {settings?.enabled ? 'Guide On' : 'Guide Off'}
                </span>
            </div>
            <div className="guided-preview-scroll">
                {orderedIds.map(renderPreviewSection)}
            </div>
        </div>
    )
}

const createDeveloperQaQueue = () => ([
    { id: 'open-add', label: 'Open Add Member', status: 'pending' },
    { id: 'create-member', label: 'Create test member', status: 'pending' },
    { id: 'verify-create', label: 'Verify created member', status: 'pending' },
    { id: 'open-edit', label: 'Open Edit Member', status: 'pending' },
    { id: 'update-member', label: 'Edit same member', status: 'pending' },
    { id: 'verify-update', label: 'Verify edited member', status: 'pending' },
    { id: 'cleanup-member', label: 'Delete test member', status: 'pending' }
])

const createDeepDeveloperQaQueue = () => ([
    { id: 'open-add', label: 'Open Add Member', status: 'pending' },
    { id: 'create-member', label: 'Create test member', status: 'pending' },
    { id: 'verify-create', label: 'Verify created member', status: 'pending' },
    { id: 'supabase-check-create', label: 'Supabase check (created)', status: 'pending' },
    { id: 'open-edit', label: 'Open Edit Member', status: 'pending' },
    { id: 'update-member', label: 'Edit same member', status: 'pending' },
    { id: 'verify-update', label: 'Verify edited member', status: 'pending' },
    { id: 'supabase-check-update', label: 'Supabase check (edited)', status: 'pending' },
    { id: 'missing-info-create', label: 'Create incomplete member', status: 'pending' },
    { id: 'missing-info-modal', label: 'Test Missing Info Modal', status: 'pending' },
    { id: 'missing-info-override', label: 'Test Missing Info Override', status: 'pending' },
    { id: 'cleanup-member', label: 'Delete test members', status: 'pending' },
    { id: 'supabase-check-delete', label: 'Supabase check (deleted)', status: 'pending' }
])

const createExistingMemberEditQaQueue = () => ([
    { id: 'open-existing-edit', label: 'Open existing member', status: 'pending' },
    { id: 'edit-existing-member', label: 'Edit real member details and attendance', status: 'pending' },
    { id: 'verify-existing-edit', label: 'Verify saved details and attendance', status: 'pending' },
    { id: 'restore-existing-member', label: 'Restore original values', status: 'pending' },
    { id: 'verify-existing-restore', label: 'Verify original details and attendance restored', status: 'pending' }
])

const createBadgeTagQaQueue = () => ([
    { id: 'open-badge-edit', label: 'Open existing member', status: 'pending' },
    { id: 'toggle-badge-tag', label: 'Change badge, tag, and attendance', status: 'pending' },
    { id: 'verify-badge-tag', label: 'Verify badge, tag, and attendance change', status: 'pending' },
    { id: 'restore-badge-tag', label: 'Restore original badge and tag', status: 'pending' },
    { id: 'verify-badge-tag-restore', label: 'Verify badge, tag, and attendance restored', status: 'pending' }
])

const LazyPanelFallback = () => (
    <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-orange-600 dark:text-orange-400" />
    </div>
)

const SettingsPage = ({ onBack, navigateToSection, onCreateMonth, onOpenAddMember }) => {
    const { user, signOut, preferences, resetPassword, isDeveloperBypass } = useAuth()
    const { isDarkMode, toggleTheme, themeMode, setThemeMode, commandKEnabled, setCommandKEnabled } = useTheme()
    const { members, monthlyTables, currentTable, setCurrentTable, isSupabaseConfigured, createNewMonth, deleteMonthTable, isCollaborator, isAdminCollaborator, dataOwnerId, lockedDefaultDate, setCollaboratorOverride, selectedAttendanceDate, setAndSaveAttendanceDate, deleteMember, forceRefreshMembersSilent, loadAllAttendanceData, loadAllBadgeData, refreshSearch, validateMemberData, getPastSundays, getMissingAttendance, autoAllDatesEnabled, setAutoAllDatesEnabled, missingInfoPromptEnabled, setMissingInfoPromptEnabled, guidedFormSettings, setGuidedFormSetting, personalCalendarMode, isPersonalManualMode, manualMonthTable, manualSundayDate, manualOverrideUntil, setPersonalCalendarMode, isOnline, offlineMode, setOfflineMode, isOfflineModeActive, offlineModeStatus, offlineCacheMeta, pendingSyncCount, isPreparingOffline, isSyncingOffline, prepareOfflineData, clearOfflineCacheData, syncOfflineChanges } = useApp()
    const { selection } = useHapticFeedback()
    const isDeveloperToolsEnabled = import.meta.env.DEV

    const [activeSection, setActiveSection] = useState(null) // null = show main list
    const [searchQuery, setSearchQuery] = useState('')
    const [highlightedSettingId, setHighlightedSettingId] = useState(null)
    const [guidedOrderDragId, setGuidedOrderDragId] = useState(null)
    const highlightTimerRef = useRef(null)
    const [showHelpCenter, setShowHelpCenter] = useState(false)
    const [archiveMonth, setArchiveMonth] = useState(null) // table name to archive

    const focusSettingTarget = useCallback((settingId) => {
        if (!settingId || typeof window === 'undefined') return
        if (highlightTimerRef.current) {
            window.clearTimeout(highlightTimerRef.current)
        }
        setHighlightedSettingId(settingId)
        window.setTimeout(() => {
            const target = document.querySelector(`[data-setting-id="${settingId}"]`)
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                if (typeof target.focus === 'function') {
                    target.focus({ preventScroll: true })
                }
            }
        }, 120)
        highlightTimerRef.current = window.setTimeout(() => {
            setHighlightedSettingId(null)
            highlightTimerRef.current = null
        }, 1800)
    }, [])

    const navigateToSetting = useCallback((section, settingId = null) => {
        if (!section) return
        setSearchQuery('')
        if (section === 'help') {
            setShowHelpCenter(true)
            return
        }
        setActiveSection(section)
        if (settingId) {
            focusSettingTarget(settingId)
        }
    }, [focusSettingTarget])

    // Handle navigation from command palette
    useEffect(() => {
        if (navigateToSection) {
            if (typeof navigateToSection === 'string') {
                navigateToSetting(navigateToSection)
                return
            }
            navigateToSetting(navigateToSection.section, navigateToSection.settingId)
        }
    }, [navigateToSection, navigateToSetting])

    useEffect(() => () => {
        if (highlightTimerRef.current) {
            window.clearTimeout(highlightTimerRef.current)
        }
    }, [])

    useEffect(() => {
        const scrollToTop = () => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
            } catch {
                window.scrollTo(0, 0)
            }
        }
        scrollToTop()
        const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(scrollToTop)
            return () => cancelAnimationFrame(raf2)
        })
        return () => cancelAnimationFrame(raf1)
    }, [activeSection, showHelpCenter])


    const toggleAutoAllDates = () => {
        const newValue = !autoAllDatesEnabled
        setAutoAllDatesEnabled(newValue)
        if (newValue) {
            toast.success('Auto-All-Dates enabled: will auto-mark all dates to present day')
        } else {
            toast.info('Auto-All-Dates disabled')
        }
    }

    const toggleMissingInfoPrompt = () => {
        const newValue = !missingInfoPromptEnabled
        setMissingInfoPromptEnabled(newValue)
        if (newValue) {
            toast.success('Missing info popup enabled')
        } else {
            toast.info('Missing info popup disabled')
        }
    }

    const toggleGuidedFormSetting = (key, label) => {
        const newValue = !guidedFormSettings?.[key]
        setGuidedFormSetting(key, newValue)
        toast.info(`${label} ${newValue ? 'enabled' : 'disabled'}`)
    }

    const guidedOrder = useMemo(
        () => normalizeGuidedOrder(guidedFormSettings?.guidedOrder),
        [guidedFormSettings?.guidedOrder]
    )

    const saveGuidedOrder = useCallback((nextOrder) => {
        setGuidedFormSetting('guidedOrder', normalizeGuidedOrder(nextOrder))
    }, [setGuidedFormSetting])

    const moveGuidedOrderItem = useCallback((fieldId, direction) => {
        const currentIndex = guidedOrder.indexOf(fieldId)
        const nextIndex = currentIndex + direction
        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= guidedOrder.length) return
        const nextOrder = [...guidedOrder]
        const [moved] = nextOrder.splice(currentIndex, 1)
        nextOrder.splice(nextIndex, 0, moved)
        saveGuidedOrder(nextOrder)
        selection()
    }, [guidedOrder, saveGuidedOrder, selection])

    const moveGuidedOrderItemTo = useCallback((fieldId, targetFieldId) => {
        if (!fieldId || !targetFieldId || fieldId === targetFieldId) return
        const nextOrder = [...guidedOrder]
        const fromIndex = nextOrder.indexOf(fieldId)
        const toIndex = nextOrder.indexOf(targetFieldId)
        if (fromIndex < 0 || toIndex < 0) return
        const [moved] = nextOrder.splice(fromIndex, 1)
        nextOrder.splice(toIndex, 0, moved)
        saveGuidedOrder(nextOrder)
        selection()
    }, [guidedOrder, saveGuidedOrder, selection])

    const resetGuidedOrder = useCallback(() => {
        saveGuidedOrder(GUIDED_FORM_FIELD_ORDER)
        toast.info('Guided order reset')
    }, [saveGuidedOrder])


    // Quick Attendance Access toggle removed

    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [collaborators, setCollaborators] = useState([])
    const [fetchingCollaborators, setFetchingCollaborators] = useState(false)
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [showExportCenter, setShowExportCenter] = useState(false)
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false)
    const [isAdminControlsOpen, setIsAdminControlsOpen] = useState(false)
    const [deletingCollaboratorId, setDeletingCollaboratorId] = useState(null)
    const [pendingRemoval, setPendingRemoval] = useState(null)
    const monthViewMode = 'list'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [liveClock, setLiveClock] = useState(() => new Date())
    const [showMonthDropdown, setShowMonthDropdown] = useState(false)
    const monthDropdownRef = useRef(null)
    const [deletingTable, setDeletingTable] = useState(null)
    const [deletePrompt, setDeletePrompt] = useState({
        isOpen: false,
        tableName: null,
        label: ''
    })
    const [isOverrideSaving, setIsOverrideSaving] = useState(false)
    const [dob, setDob] = useState('')
    const [isDobSaving, setIsDobSaving] = useState(false)
    const [installedAppInfo, setInstalledAppInfo] = useState(null)

    useEffect(() => {
        if (user?.user_metadata?.date_of_birth) {
            setDob(user.user_metadata.date_of_birth)
        }
    }, [user])

    useEffect(() => {
        let cancelled = false
        getInstalledAppInfo().then((info) => {
            if (!cancelled) setInstalledAppInfo(info)
        })
        return () => {
            cancelled = true
        }
    }, [])

    const handleSaveDob = async () => {
        if (!user) return
        setIsDobSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { date_of_birth: dob }
            })
            if (error) throw error
            toast.success('Date of birth updated')
        } catch (error) {
            console.error('Error updating DOB:', error)
            toast.error('Failed to update date of birth')
        } finally {
            setIsDobSaving(false)
        }
    }
    const [showOverridePicker, setShowOverridePicker] = useState(false)
    const overrideButtonRef = useRef(null)
    const [showPersonalMonthPicker, setShowPersonalMonthPicker] = useState(false)
    const personalMonthButtonRef = useRef(null)
    const [devSandboxDate, setDevSandboxDate] = useState('')
    const [devLastPayload, setDevLastPayload] = useState('No interaction yet')
    const [devQaStatus, setDevQaStatus] = useState('idle')
    const [devQaReport, setDevQaReport] = useState('No automated QA run yet')
    const [isDevQaModalOpen, setIsDevQaModalOpen] = useState(false)
    const [isDevQaMinimized, setIsDevQaMinimized] = useState(false)
    const [devQaQueue, setDevQaQueue] = useState(() => createDeveloperQaQueue())
    const membersRef = useRef(members)
    const devQaQueueScrollRef = useRef(null)
    const devQaReportScrollRef = useRef(null)
    const devQaResumeRef = useRef(null)
    const devQaDeepModeRef = useRef(false)
    const [devQaCountdown, setDevQaCountdown] = useState(0)
    const [devQaPausedSql, setDevQaPausedSql] = useState('')
    const [devQaPausedLabel, setDevQaPausedLabel] = useState('')
    const [devQaBatchCount, setDevQaBatchCount] = useState(3)
    const [devQaSelectedMemberId, setDevQaSelectedMemberId] = useState('')
    const [isDevMemberDropdownOpen, setIsDevMemberDropdownOpen] = useState(false)
    const [selectedLauncherId, setSelectedLauncherId] = useState('')
    const devMemberDropdownRef = useRef(null)
    const [workspacePanels, setWorkspacePanels] = useState({
        overview: true,
        controls: true,
        months: false
    })

    useEffect(() => {
        membersRef.current = members
    }, [members])

    useEffect(() => {
        if (devQaQueueScrollRef.current) {
            devQaQueueScrollRef.current.scrollTo({
                top: devQaQueueScrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [devQaQueue])

    useEffect(() => {
        if (devQaReportScrollRef.current) {
            devQaReportScrollRef.current.scrollTo({
                top: devQaReportScrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [devQaReport])

    useEffect(() => {
        if (devQaCountdown <= 0) return
        const timer = setTimeout(() => {
            setDevQaCountdown(prev => prev - 1)
        }, 1000)
        return () => clearTimeout(timer)
    }, [devQaCountdown])

    useEffect(() => {
        if (devQaCountdown > 0 || !devQaResumeRef.current) return
        const resume = devQaResumeRef.current
        devQaResumeRef.current = null
        resume('auto')
        setDevQaPausedSql('')
        setDevQaPausedLabel('')
    }, [devQaCountdown])

    const handleDevQaResume = useCallback(() => {
        selection()
        if (devQaResumeRef.current) {
            devQaResumeRef.current('manual')
            devQaResumeRef.current = null
        }
        setDevQaPausedSql('')
        setDevQaPausedLabel('')
        setDevQaCountdown(0)
    }, [selection])

    const getMemberDisplayName = useCallback((member) => (
        member?.full_name || member?.['Full Name'] || member?.name || 'Unnamed member'
    ), [])

    const getQaSundayDatesForTable = useCallback((tableName) => {
        if (!tableName) return []

        const [monthName, year] = String(tableName).split('_')
        const yearNum = Number.parseInt(year, 10)
        const monthIndex = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ].indexOf(monthName)

        if (monthIndex === -1 || Number.isNaN(yearNum)) {
            return []
        }

        const sundays = []
        const cursor = new Date(yearNum, monthIndex, 1)

        while (cursor.getMonth() === monthIndex) {
            if (cursor.getDay() === 0) {
                sundays.push([
                    cursor.getFullYear(),
                    String(cursor.getMonth() + 1).padStart(2, '0'),
                    String(cursor.getDate()).padStart(2, '0')
                ].join('-'))
            }
            cursor.setDate(cursor.getDate() + 1)
        }

        return sundays
    }, [])

    const getAttendanceColumnName = useCallback((dateKey) => (
        `attendance_${String(dateKey || '').replace(/-/g, '_')}`
    ), [])

    const getAttendanceStatusFromRecord = useCallback((record, dateKey) => {
        if (!record || !dateKey) return null
        const columnName = getAttendanceColumnName(dateKey)
        return record[columnName] ?? null
    }, [getAttendanceColumnName])

    const devQaExistingMemberOptions = useMemo(() => (
        members
            .filter((member) => member?.id)
            .map((member) => ({
                id: member.id,
                name: getMemberDisplayName(member),
                missingCount: validateMemberData(member).length
            }))
            .sort((a, b) => {
                if (a.missingCount === 0 && b.missingCount !== 0) return -1
                if (a.missingCount !== 0 && b.missingCount === 0) return 1
                return a.name.localeCompare(b.name)
            })
    ), [members, validateMemberData, getMemberDisplayName])

    const preferredDevQaMemberId = useMemo(() => (
        devQaExistingMemberOptions.find((member) => member.missingCount === 0)?.id
        || devQaExistingMemberOptions[0]?.id
        || ''
    ), [devQaExistingMemberOptions])

    const selectedDevQaMember = useMemo(() => (
        devQaExistingMemberOptions.find((member) => member.id === devQaSelectedMemberId) || null
    ), [devQaExistingMemberOptions, devQaSelectedMemberId])

    useEffect(() => {
        if (!devQaSelectedMemberId || !devQaExistingMemberOptions.some((member) => member.id === devQaSelectedMemberId)) {
            setDevQaSelectedMemberId(preferredDevQaMemberId)
        }
    }, [devQaSelectedMemberId, devQaExistingMemberOptions, preferredDevQaMemberId])

    const toggleWorkspacePanel = useCallback((panelKey) => {
        selection()
        setWorkspacePanels((prev) => ({
            ...prev,
            [panelKey]: !prev[panelKey]
        }))
    }, [selection])

    const copyTextToClipboard = useCallback(async (text, successMessage = 'Copied to clipboard') => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(successMessage)
        } catch (error) {
            console.error('Clipboard copy failed:', error)
            toast.error('Failed to copy to clipboard')
        }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setLiveClock(new Date()), 30000)
        return () => clearInterval(timer)
    }, [])

    const openDeveloperAction = useCallback((action, label) => {
        selection()
        if (typeof action !== 'function') {
            toast.info(`${label} is not available in this view yet`)
            return
        }
        action()
    }, [selection])

    const handleDevSandboxChange = useCallback((payload) => {
        const nextValue = payload?.target?.value ?? payload ?? ''
        const nextPayload = payload?.target
            ? { name: payload.target.name, value: payload.target.value }
            : payload

        setDevSandboxDate(nextValue)
        setDevLastPayload(JSON.stringify(nextPayload, null, 2))
    }, [])

    const runNotificationStackTester = useCallback(() => {
        selection()
        toast.dismiss()

        const demoToasts = [
            ['success', 'Marked present'],
            ['success', 'Marked present'],
            ['success', 'Marked present'],
            ['info', 'Attendance saved'],
            ['warning', 'Missing info still needs review']
        ]

        demoToasts.forEach(([type, message], index) => {
            window.setTimeout(() => {
                toast[type](message, {
                    autoClose: 4500,
                    className: 'dev-stack-test-toast',
                    toastId: `dev-notification-stack-${Date.now()}-${index}`
                })
            }, index * 90)
        })
    }, [selection])

    const runDeveloperMemberQa = useCallback(async () => {
        selection()

        if (devQaStatus === 'running') {
            return
        }

        const reportLines = []
        const appendLine = (message) => {
            reportLines.push(message)
            setDevQaReport(reportLines.join('\n'))
        }
        const isDeepRun = devQaDeepModeRef.current
        const resetQueue = () => setDevQaQueue(isDeepRun ? createDeepDeveloperQaQueue() : createDeveloperQaQueue())

        const waitForUserContinue = (countdownSec, sql, label) => {
            return new Promise((resolve) => {
                devQaResumeRef.current = resolve
                setDevQaPausedSql(sql)
                setDevQaPausedLabel(label)
                setDevQaCountdown(countdownSec)
            })
        }
        const markQueueStep = (stepId, status, detail = '') => {
            setDevQaQueue((prev) => prev.map((step) => (
                step.id === stepId
                    ? { ...step, status, detail }
                    : step
            )))
        }

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        const ownerId = dataOwnerId || user?.id
        const actorUserId = user?.id || ownerId
        const runToken = Date.now()
        const createdName = `DEV QA ${runToken}`
        const updatedName = `${createdName} Updated`
        const createGender = 'female'
        const updatedGender = 'male'
        const createDob = '2010-03-09'
        const updatedDob = '2009-04-11'
        const createPhone = '0500001234'
        const updatedPhone = '0500005678'
        const createAge = '16'
        const updatedAge = '17'
        const createLevel = 'SHS1'
        const updatedLevel = 'JHS3'
        const createNotes = 'Developer QA runner'
        const updatedNotes = 'Developer QA runner updated'
        const createVisitor = false
        const updatedVisitor = true
        const createParentName = 'QA Parent One'
        const updatedParentName = 'QA Parent Updated'
        const createParentPhone = '0501112233'
        const updatedParentPhone = '0509998877'
        const missingDob = '2008-08-18'
        const missingPhone = '0240001111'
        const missingAge = '20'
        const missingLevel = 'JHS1'
        const missingParentName = 'QA Missing Parent'
        const missingParentPhone = '0241112233'
        let createdMemberId = null
        let incompleteMemberId = null
        let overrideMemberId = null
        const incompleteName = `QA MISSING ${runToken}`
        const overrideName = `QA OVERRIDE ${runToken}`

        const getDateKey = (date) => {
            if (!date) return null
            if (typeof date === 'string') return date
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        const getComparableValue = (record, key) => {
            if (!record) return null
            const variants = {
                full_name: ['full_name', 'Full Name'],
                Gender: ['Gender', 'gender'],
                'Phone Number': ['Phone Number', 'phone_number'],
                Age: ['Age', 'age'],
                date_of_birth: ['date_of_birth'],
                'Current Level': ['Current Level', 'current_level'],
                notes: ['notes'],
                is_visitor: ['is_visitor'],
                parent_name_1: ['parent_name_1', 'Parent Name 1'],
                parent_phone_1: ['parent_phone_1', 'Parent Phone 1']
            }
            const keys = variants[key] || [key]
            for (const variant of keys) {
                if (Object.prototype.hasOwnProperty.call(record, variant)) {
                    return record[variant]
                }
            }
            return null
        }

        const assertMemberFields = (record, expectedFields, stageLabel) => {
            const mismatches = Object.entries(expectedFields).filter(([field, expectedValue]) => {
                const actualValue = getComparableValue(record, field)
                if (field === 'is_visitor') {
                    return Boolean(actualValue) !== Boolean(expectedValue)
                }
                return String(actualValue ?? '') !== String(expectedValue ?? '')
            })

            if (mismatches.length > 0) {
                const summary = mismatches
                    .map(([field, expectedValue]) => {
                        const actualValue = getComparableValue(record, field)
                        return `${field} expected "${expectedValue}" but got "${actualValue ?? ''}"`
                    })
                    .join('; ')
                throw new Error(`${stageLabel} verification failed: ${summary}`)
            }
        }

        const matchesExpectedFields = (record, expectedFields) => {
            if (!record) return false
            return Object.entries(expectedFields).every(([field, expectedValue]) => {
                const actualValue = getComparableValue(record, field)
                if (field === 'is_visitor') {
                    return Boolean(actualValue) === Boolean(expectedValue)
                }
                return String(actualValue ?? '') === String(expectedValue ?? '')
            })
        }

        const waitFor = async (condition, timeoutMs, label) => {
            const start = Date.now()
            while (Date.now() - start < timeoutMs) {
                const value = condition()
                if (value) {
                    return value
                }
                await sleep(120)
            }
            throw new Error(`Timed out waiting for ${label}`)
        }

        const getByTestId = (testId, scope = document) => scope.querySelector(`[data-testid="${testId}"]`)

        const waitForTestId = (testId, timeoutMs = 8000, scope = document) =>
            waitFor(() => getByTestId(testId, scope), timeoutMs, testId)

        const clickElement = async (element, message) => {
            if (!element) {
                throw new Error(`Missing element for step: ${message}`)
            }
            appendLine(message)
            element.click()
            await sleep(500)
        }

        const setElementValue = async (element, nextValue, message) => {
            if (!element) {
                throw new Error(`Missing input for step: ${message}`)
            }

            appendLine(message)

            const prototype = element.tagName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype
            const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set

            if (!valueSetter) {
                throw new Error(`Unable to access native setter for ${message}`)
            }

            element.focus()
            valueSetter.call(element, '')
            element.dispatchEvent(new Event('input', { bubbles: true }))

            let typedValue = ''
            for (const character of String(nextValue)) {
                typedValue += character
                valueSetter.call(element, typedValue)
                element.dispatchEvent(new Event('input', { bubbles: true }))
                await sleep(85)
            }

            element.dispatchEvent(new Event('change', { bubbles: true }))
            await sleep(560)
        }

        const ensureParentSectionOpen = async (toggleTestId, nameFieldTestId) => {
            if (!getByTestId(nameFieldTestId)) {
                await clickElement(await waitForTestId(toggleTestId), 'Opening parent section...')
                await waitForTestId(nameFieldTestId, 5000)
            }
        }

        const selectLevel = async (toggleTestId, optionTestId, label) => {
            await clickElement(await waitForTestId(toggleTestId), `${label}: opening level menu...`)
            await clickElement(await waitForTestId(optionTestId, 5000), `${label}: selecting level...`)
        }

        const selectDateValue = async (pickerName, dateValue, label) => {
            const sanitizedPickerName = String(pickerName)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            const [year, month, day] = String(dateValue).split('-')
            const toggleTestId = `combined-date-picker-${sanitizedPickerName}-toggle`
            const dropdownTestId = `combined-date-picker-${sanitizedPickerName}-dropdown`
            const parts = [
                ['year', year],
                ['month', month],
                ['day', day]
            ]

            for (const [part, value] of parts) {
                if (!getByTestId(dropdownTestId)) {
                    await clickElement(await waitForTestId(toggleTestId), `${label}: opening date picker for ${part}...`)
                    await waitForTestId(dropdownTestId, 5000)
                } else {
                    appendLine(`${label}: date picker already open for ${part}...`)
                }
                await clickElement(
                    await waitForTestId(`combined-date-picker-${sanitizedPickerName}-${part}-${value}`, 5000),
                    `${label}: selecting ${part} ${value}...`
                )
            }
        }

        const verifyPersistedMember = async (memberId, expectedFields, stageLabel) => {
            let storedRecord = null

            if (!isDeveloperBypass && isSupabaseConfigured() && ownerId) {
                for (let attempt = 0; attempt < 8; attempt += 1) {
                    const { data, error } = await supabase
                        .from(currentTable)
                        .select('*')
                        .eq('id', memberId)
                        .single()

                    if (error) {
                        throw error
                    }

                    if (matchesExpectedFields(data, expectedFields)) {
                        storedRecord = data
                        break
                    }

                    await sleep(900)
                }

                if (!storedRecord) {
                    throw new Error(`Timed out waiting for ${stageLabel.toLowerCase()} member database state`)
                }

                assertMemberFields(storedRecord, expectedFields, `${stageLabel} database`)
                appendLine(`${stageLabel}: database verification passed`)
            }

            for (let attempt = 0; attempt < 5; attempt += 1) {
                const localRecord = membersRef.current.find((member) => member.id === memberId)
                if (matchesExpectedFields(localRecord, expectedFields)) {
                    assertMemberFields(localRecord, expectedFields, `${stageLabel} local state`)
                    appendLine(`${stageLabel}: local verification passed`)
                    return storedRecord || localRecord
                }

                if (!isDeveloperBypass && isSupabaseConfigured() && attempt < 4) {
                    appendLine(`${stageLabel}: local state still catching up, refreshing again...`)
                    await Promise.allSettled([
                        forceRefreshMembersSilent(),
                        loadAllAttendanceData(),
                        loadAllBadgeData()
                    ])
                    refreshSearch()
                }

                await sleep(1500)
            }

            if (storedRecord) {
                appendLine(`${stageLabel}: database passed, but local state was slower than expected`)
                return storedRecord
            }

            throw new Error(`Timed out waiting for ${stageLabel.toLowerCase()} member state`)
        }

        const openMissingDataFlow = async (memberId, present, label) => {
            appendLine(`${label}: triggering the real ${present ? 'Present' : 'Absent'} flow...`)
            const modalOpened = await waitFor(() => {
                if (typeof window.openDeveloperMissingDataFlow !== 'function') {
                    return false
                }
                return window.openDeveloperMissingDataFlow(memberId, present)
            }, 8000, `${label.toLowerCase()} developer opener`)

            if (!modalOpened) {
                throw new Error(`${label} could not open the real MissingData modal`)
            }

            await waitForTestId('missing-data-modal', 8000)
            appendLine(`${label}: MissingData modal opened`)
        }

        const populateMissingDataModal = async ({ memberId, label, attendanceChoice }) => {
            await setElementValue(await waitForTestId('missing-data-phone'), missingPhone, `${label}: typing phone...`)
            await clickElement(await waitForTestId('missing-data-gender-toggle'), `${label}: opening gender...`)
            await clickElement(await waitForTestId('missing-data-gender-female'), `${label}: selecting Female...`)
            await selectDateValue('date of birth', missingDob, label)
            await setElementValue(await waitForTestId('missing-data-age'), missingAge, `${label}: typing age...`)
            await clickElement(await waitForTestId('missing-data-level-toggle'), `${label}: opening level...`)
            await clickElement(await waitForTestId(`missing-data-level-${missingLevel.toLowerCase()}`), `${label}: selecting ${missingLevel}...`)
            await setElementValue(await waitForTestId('missing-data-parent1-name'), missingParentName, `${label}: typing parent name...`)
            await setElementValue(await waitForTestId('missing-data-parent1-phone'), missingParentPhone, `${label}: typing parent phone...`)

            const missingDateKeys = getMissingAttendance(memberId, getPastSundays()).map(getDateKey)
            if (missingDateKeys.length === 0) {
                appendLine(`${label}: no past Sunday entries are due for this month, so this run is validating missing fields only.`)
            } else {
                appendLine(`${label}: marking ${missingDateKeys.length} past Sunday entr${missingDateKeys.length === 1 ? 'y' : 'ies'}...`)
                for (const dateKey of missingDateKeys) {
                    await clickElement(
                        await waitForTestId(`missing-data-attendance-${dateKey}-${attendanceChoice}`),
                        `${label}: marking ${dateKey} as ${attendanceChoice}...`
                    )
                }
            }

            await clickElement(await waitForTestId('missing-data-save'), `${label}: clicking save...`)
            await waitFor(() => !getByTestId('missing-data-modal'), 8000, `${label} modal to close`)
            await forceRefreshMembersSilent()
            await loadAllAttendanceData()
            refreshSearch()
        }

        setDevQaStatus('running')
        setIsDevQaModalOpen(true)
        setIsDevQaMinimized(false)
        setDevQaReport('Starting visual add/edit QA...')
        resetQueue()

        try {
            if (!currentTable) {
                throw new Error('No active month table is selected')
            }

            appendLine(`Table: ${currentTable}`)
            appendLine(`Mode: ${isDeveloperBypass ? 'Developer bypass/local state' : (isSupabaseConfigured() ? 'Supabase-backed UI flow' : 'Local state UI flow')}`)
            appendLine('The monitor will stay open while the real app modals are used.')

            markQueueStep('open-add', 'running', 'Launching the live Add Member modal')
            appendLine('Opening the real Add Member modal...')
            if (typeof onOpenAddMember === 'function') {
                onOpenAddMember()
            } else if (typeof window.openAddMember === 'function') {
                window.openAddMember()
            } else {
                throw new Error('Add Member launcher is not available')
            }

            await waitForTestId('add-member-modal', 8000)
            markQueueStep('open-add', 'passed', 'Add Member modal opened')
            markQueueStep('create-member', 'running', `Creating ${createdName}`)
            await setElementValue(await waitForTestId('member-form-full-name'), createdName, 'Add Member: typing full name...')
            await clickElement(await waitForTestId(`member-form-gender-${createGender}`), 'Add Member: selecting gender...')
            await setElementValue(await waitForTestId('member-form-phone'), createPhone, 'Add Member: typing phone number...')
            await selectDateValue('date_of_birth', createDob, 'Add Member')
            await setElementValue(await waitForTestId('member-form-age'), createAge, 'Add Member: confirming age...')
            await selectLevel('member-form-level-toggle', `member-form-level-${createLevel.toLowerCase()}`, 'Add Member')
            await ensureParentSectionOpen('member-form-parent-toggle', 'member-form-parent1-name')
            await setElementValue(await waitForTestId('member-form-parent1-name'), createParentName, 'Add Member: typing parent name...')
            await setElementValue(await waitForTestId('member-form-parent1-phone'), createParentPhone, 'Add Member: typing parent phone...')
            await setElementValue(await waitForTestId('member-form-notes'), createNotes, 'Add Member: typing notes...')
            if (createVisitor) {
                await clickElement(await waitForTestId('member-form-visitor-toggle'), 'Add Member: toggling visitor status...')
            }
            await clickElement(await waitForTestId('member-form-submit'), 'Add Member: submitting the real modal...')
            await waitFor(() => !getByTestId('add-member-modal'), 12000, 'Add Member modal to close')
            markQueueStep('create-member', 'passed', `${createdName} was submitted`)

            const createdMember = await waitFor(
                () => membersRef.current.find((member) => getComparableValue(member, 'full_name') === createdName),
                15000,
                'created member to appear'
            )

            createdMemberId = createdMember.id
            appendLine(`Created test member "${createdName}" (ID: ${createdMemberId})`)
            markQueueStep('verify-create', 'running', 'Checking saved values after create')
            await verifyPersistedMember(createdMemberId, {
                full_name: createdName,
                Gender: 'Female',
                'Phone Number': createPhone,
                Age: createAge,
                date_of_birth: createDob,
                'Current Level': createLevel,
                notes: createNotes,
                is_visitor: createVisitor,
                parent_name_1: createParentName,
                parent_phone_1: createParentPhone
            }, 'Create')
            markQueueStep('verify-create', 'passed', 'Created member values matched')

            if (isDeepRun) {
                appendLine('Assigning extra tags and attendance for deep QA testing...')
                const sundayDatesForTable = []
                if (currentTable) {
                    const match = currentTable.match(/^(\d{4})_(\d{2})_members$/)
                    if (match) {
                        const tablYearNum = parseInt(match[1], 10)
                        const tablMonthIdx = parseInt(match[2], 10) - 1
                        const d = new Date(tablYearNum, tablMonthIdx, 1)
                        while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
                        while (d.getMonth() === tablMonthIdx) {
                            sundayDatesForTable.push(new Date(d))
                            d.setDate(d.getDate() + 7)
                        }
                    }
                }

                // 1. Tags
                const effectiveOwnerId = dataOwnerId || user?.id
                let assignedTagNames = []
                if (isSupabaseConfigured()) {
                    try {
                        const { data: tagData } = await supabase.rpc('get_workspace_tags', {
                            p_owner_id: effectiveOwnerId
                        })
                        if (tagData && tagData.length > 0) {
                            // Pick random 2 tags
                            const tagsToAssign = tagData.sort(() => 0.5 - Math.random()).slice(0, 2)
                            for (const tag of tagsToAssign) {
                                await supabase.rpc('assign_tag_to_member', {
                                    p_tag_id: tag.id,
                                    p_member_id: createdMemberId,
                                    p_table_name: currentTable,
                                    p_owner_id: effectiveOwnerId
                                })
                                assignedTagNames.push(tag.name)
                            }
                        }
                    } catch (err) {
                        console.error('Error assigning QA tags:', err)
                    }
                }

                // 2. Attendance
                let assignedAttendance = []
                if (isSupabaseConfigured()) {
                    for (let i = 0; i < sundayDatesForTable.length; i++) {
                        const sunday = sundayDatesForTable[i]
                        const y = sunday.getFullYear()
                        const m = String(sunday.getMonth() + 1).padStart(2, '0')
                        const d = String(sunday.getDate()).padStart(2, '0')
                        const colName = `attendance_${y}_${m}_${d}`
                        const dateLabel = `${y}-${m}-${d}`

                        const status = (i % 2 === 0) ? 'Present' : 'Absent'
                        await supabase
                            .from(currentTable)
                            .update({ [colName]: status })
                            .eq('id', createdMemberId)
                        assignedAttendance.push(`-- ${dateLabel}: ${status}`)
                    }
                }

                markQueueStep('supabase-check-create', 'running', 'Waiting for manual Supabase verification')
                const createSql = [
                    '-- \u2705 1. Verify the CREATED member exists in Supabase (with attendance)',
                    `SELECT *`,
                    `FROM "${currentTable}"`,
                    `WHERE id = '${createdMemberId}';`,
                    '',
                    '-- \u2705 2. Verify their assigned WORKSPACE TAGS',
                    `SELECT m."Full Name", COALESCE(STRING_AGG(t.name, ', '), 'No Tags') as assigned_tags`,
                    `FROM "${currentTable}" m`,
                    `LEFT JOIN member_tags mt ON mt.member_id = m.id AND mt.table_name = '${currentTable}'`,
                    `LEFT JOIN tags t ON t.id = mt.tag_id`,
                    `WHERE m.id = '${createdMemberId}'`,
                    `GROUP BY m.id, m."Full Name";`,
                    '',
                    '-- Expected values:',
                    `-- Full Name: ${createdName}`,
                    `-- Gender: Female`,
                    `-- Phone Number: ${createPhone}`,
                    `-- Age: ${createAge}`,
                    `-- date_of_birth: ${createDob}`,
                    `-- Current Level: ${createLevel}`,
                    `-- notes: ${createNotes}`,
                    `-- is_visitor: ${createVisitor}`,
                    `-- parent_name_1: ${createParentName}`,
                    `-- parent_phone_1: ${createParentPhone}`,
                    '',
                    `-- Assigned Tags: ${assignedTagNames.length > 0 ? assignedTagNames.join(', ') : 'None available'}`,
                    '-- Expected Attendance:',
                    ...assignedAttendance
                ].join('\n')
                appendLine('Paused - copy the SQL below and run it in your Supabase SQL Editor to verify the CREATED member.')
                const createCheckMode = await waitForUserContinue(120, createSql, 'Verify CREATED member in Supabase')
                markQueueStep('supabase-check-create', 'passed', createCheckMode === 'auto' ? 'Auto-resumed after countdown' : 'User confirmed Supabase check')
                appendLine(createCheckMode === 'auto'
                    ? 'Supabase verification (created) auto-resumed after countdown'
                    : 'Supabase verification (created) confirmed by user')
            }

            markQueueStep('open-edit', 'running', 'Launching the live Edit Member modal')
            appendLine('Opening the real Edit Member modal...')
            const editOpened = await waitFor(() => {
                if (typeof window.openDeveloperEditMember !== 'function') {
                    return false
                }
                return window.openDeveloperEditMember(createdMemberId)
            }, 8000, 'developer edit member opener')

            if (!editOpened) {
                throw new Error('Could not open the real Edit Member modal')
            }

            await waitForTestId('edit-member-modal', 8000)
            markQueueStep('open-edit', 'passed', 'Edit Member modal opened')
            markQueueStep('update-member', 'running', `Editing ${createdName}`)
            await setElementValue(await waitForTestId('edit-form-full-name'), updatedName, 'Edit Member: updating full name...')
            await clickElement(await waitForTestId(`edit-form-gender-${updatedGender}`), 'Edit Member: updating gender...')
            await setElementValue(await waitForTestId('edit-form-phone'), updatedPhone, 'Edit Member: updating phone number...')
            await selectDateValue('date_of_birth', updatedDob, 'Edit Member')
            await setElementValue(await waitForTestId('edit-form-age'), updatedAge, 'Edit Member: confirming age...')
            await selectLevel('edit-form-level-toggle', `edit-form-level-${updatedLevel.toLowerCase()}`, 'Edit Member')
            await ensureParentSectionOpen('edit-form-parent-toggle', 'edit-form-parent1-name')
            await setElementValue(await waitForTestId('edit-form-parent1-name'), updatedParentName, 'Edit Member: updating parent name...')
            await setElementValue(await waitForTestId('edit-form-parent1-phone'), updatedParentPhone, 'Edit Member: updating parent phone...')
            await clickElement(await waitForTestId('edit-form-visitor-toggle'), 'Edit Member: toggling visitor status...')
            await setElementValue(await waitForTestId('edit-form-notes'), updatedNotes, 'Edit Member: updating notes...')
            await clickElement(await waitForTestId('edit-form-submit'), 'Edit Member: submitting the real modal...')
            await waitFor(() => !getByTestId('edit-member-modal'), 12000, 'Edit Member modal to close')
            markQueueStep('update-member', 'passed', `${updatedName} was submitted`)

            appendLine('Refreshing members after edit submission...')
            await Promise.allSettled([
                forceRefreshMembersSilent(),
                loadAllAttendanceData(),
                loadAllBadgeData()
            ])
            refreshSearch()
            await sleep(1800)

            markQueueStep('verify-update', 'running', 'Checking saved values after edit')
            await verifyPersistedMember(createdMemberId, {
                full_name: updatedName,
                Gender: 'Male',
                'Phone Number': updatedPhone,
                Age: updatedAge,
                date_of_birth: updatedDob,
                'Current Level': updatedLevel,
                notes: updatedNotes,
                is_visitor: updatedVisitor,
                parent_name_1: updatedParentName,
                parent_phone_1: updatedParentPhone
            }, 'Update')
            markQueueStep('verify-update', 'passed', 'Edited member values matched')

            if (isDeepRun) {
                markQueueStep('supabase-check-update', 'running', 'Waiting for manual Supabase verification')
                const updateSql = [
                    '-- Check 1. Verify the EDITED member exists in Supabase with updated values',
                    `SELECT *`,
                    `FROM "${currentTable}"`,
                    `WHERE id = '${createdMemberId}';`,
                    '',
                    '-- Expected updated values:',
                    `-- Full Name: ${updatedName}`,
                    `-- Gender: Male`,
                    `-- Phone Number: ${updatedPhone}`,
                    `-- Age: ${updatedAge}`,
                    `-- date_of_birth: ${updatedDob}`,
                    `-- Current Level: ${updatedLevel}`,
                    `-- notes: ${updatedNotes}`,
                    `-- is_visitor: ${updatedVisitor}`,
                    `-- parent_name_1: ${updatedParentName}`,
                    `-- parent_phone_1: ${updatedParentPhone}`
                ].join('\n')
                appendLine('Paused - copy the SQL below and run it in your Supabase SQL Editor to verify the EDITED member.')
                const updateCheckMode = await waitForUserContinue(120, updateSql, 'Verify EDITED member in Supabase')
                markQueueStep('supabase-check-update', 'passed', updateCheckMode === 'auto' ? 'Auto-resumed after countdown' : 'User confirmed edited Supabase check')
                appendLine(updateCheckMode === 'auto'
                    ? 'Supabase verification (edited) auto-resumed after countdown'
                    : 'Supabase verification (edited) confirmed by user')
            }

            if (isDeepRun) {
                markQueueStep('missing-info-create', 'running', 'Creating member with missing data')
                appendLine('Inserting incomplete member record directly into DB...')

                const incompleteData = {
                    'Full Name': incompleteName,
                    'Gender': '',
                    'Phone Number': '',
                    'Current Level': '',
                    'Age': '',
                    date_of_birth: '',
                    parent_name_1: '',
                    parent_phone_1: null,
                    user_id: actorUserId
                }

                const { data: incData, error: incError } = await supabase
                    .from(currentTable)
                    .insert(incompleteData)
                    .select()
                    .single()

                if (incError) throw new Error(`Failed to create incomplete member: ${incError.message}`)
                incompleteMemberId = incData.id
                appendLine(`Incomplete member created: ${incompleteName} (ID: ${incompleteMemberId})`)
                markQueueStep('missing-info-create', 'passed', 'Incomplete member created')

                // Refresh to make sure useApp has it
                await forceRefreshMembersSilent()
                await sleep(1500)

                markQueueStep('missing-info-modal', 'running', 'Testing MissingDataModal flow')
                await openMissingDataFlow(incompleteMemberId, true, 'Missing Info')
                await populateMissingDataModal({
                    memberId: incompleteMemberId,
                    label: 'Missing Info',
                    attendanceChoice: 'present'
                })
                const filledMember = await verifyPersistedMember(incompleteMemberId, {
                    'Phone Number': missingPhone,
                    Gender: 'Female',
                    Age: missingAge,
                    date_of_birth: missingDob,
                    'Current Level': missingLevel,
                    parent_name_1: missingParentName,
                    parent_phone_1: missingParentPhone
                }, 'Missing Info')

                const remainingMissingDates = getMissingAttendance(incompleteMemberId, getPastSundays())
                if (remainingMissingDates.length > 0) {
                    throw new Error('Missing info flow saved the member, but some Sunday attendance is still missing')
                }

                markQueueStep('missing-info-modal', 'passed', 'Modal flow completed successfully')

                markQueueStep('missing-info-override', 'running', 'Testing Override mechanism')
                appendLine('Creating a second incomplete member for the real Override test...')

                const overrideData = {
                    'Full Name': overrideName,
                    'Gender': '',
                    'Phone Number': '',
                    'Current Level': '',
                    'Age': '',
                    date_of_birth: '',
                    parent_name_1: '',
                    parent_phone_1: null,
                    user_id: actorUserId
                }

                const { data: overrideInsert, error: overrideInsertError } = await supabase
                    .from(currentTable)
                    .insert(overrideData)
                    .select()
                    .single()

                if (overrideInsertError) {
                    throw new Error(`Failed to create override QA member: ${overrideInsertError.message}`)
                }

                overrideMemberId = overrideInsert.id
                await forceRefreshMembersSilent()
                await sleep(1500)

                await openMissingDataFlow(overrideMemberId, false, 'Missing Info Override')
                await clickElement(await waitForTestId('missing-data-override-toggle'), 'Missing Info Override: enabling override mode...')
                await clickElement(await waitForTestId('missing-data-save'), 'Missing Info Override: saving with override...')
                await waitFor(() => !getByTestId('missing-data-modal'), 8000, 'Missing Info Override modal to close')
                await forceRefreshMembersSilent()
                await loadAllAttendanceData()
                refreshSearch()

                const overrideMember = await waitFor(
                    () => membersRef.current.find((member) => member.id === overrideMemberId),
                    12000,
                    'override member to remain available after save'
                )
                const overridePastSundays = getPastSundays()
                const overrideRemainingMissingDates = getMissingAttendance(overrideMemberId, overridePastSundays)
                if (overridePastSundays.length === 0) {
                    appendLine('Missing Info Override: no past Sunday entries are due for this month, so override was validated as a bypass-only save.')
                } else if (overrideRemainingMissingDates.length === overridePastSundays.length) {
                    throw new Error('Override flow did not save any attendance value')
                }

                const overrideMissingFields = validateMemberData(overrideMember)
                if (overrideMissingFields.length === 0) {
                    appendLine('Missing Info Override: note - override member ended up fully complete')
                } else {
                    appendLine(`Missing Info Override: validation was bypassed with ${overrideMissingFields.length} field(s) still missing`)
                }

                if (String(getComparableValue(filledMember, 'full_name') ?? '') !== incompleteName) {
                    appendLine('Missing Info: verification used the refreshed record from the database')
                }

                markQueueStep('missing-info-override', 'passed', 'Override bypass verified')
            }

            if (!isDeveloperBypass && isSupabaseConfigured()) {
                appendLine('Refreshing local caches after database-backed run...')
                await forceRefreshMembersSilent()
                await Promise.all([loadAllAttendanceData(), loadAllBadgeData()])
                refreshSearch()
            }

            markQueueStep('cleanup-member', 'running', 'Deleting test members')
            const membersToDelete = [
                { id: createdMemberId, name: updatedName },
                { id: incompleteMemberId, name: incompleteName },
                { id: overrideMemberId, name: overrideName }
            ].filter(m => m.id !== null)

            for (const m of membersToDelete) {
                appendLine(`Deleting temporary member "${m.name}" (ID: ${m.id})...`)
                const deleteResult = await deleteMember(m.id)
                if (!deleteResult?.success) {
                    throw new Error(`Cleanup failed: ${m.name} could not be deleted`)
                }
                await waitFor(
                    () => !membersRef.current.find((member) => member.id === m.id),
                    12000,
                    `cleanup of ${m.name}`
                )
            }
            createdMemberId = null
            incompleteMemberId = null
            overrideMemberId = null

            appendLine('Cleanup completed: all temporary test members deleted')
            markQueueStep('cleanup-member', 'passed', 'Test members deleted')

            if (isDeepRun) {
                markQueueStep('supabase-check-delete', 'running', 'Waiting for manual Supabase verification')
                const deleteSql = [
                    '-- \u2705 1. Verify all test members were DELETED from Supabase',
                    `SELECT *`,
                    `FROM "${currentTable}"`,
                    `WHERE "Full Name" LIKE 'DEV QA %' OR "Full Name" LIKE 'QA MISSING %';`,
                    '',
                    '-- Expected: 0 rows returned',
                    '-- All temporary test members should no longer exist in the database.'
                ].join('\n')
                appendLine('Paused - copy the SQL below and run it in your Supabase SQL Editor to verify deletions.')
                const deleteCheckMode = await waitForUserContinue(120, deleteSql, 'Verify DELETED members in Supabase')
                markQueueStep('supabase-check-delete', 'passed', deleteCheckMode === 'auto' ? 'Auto-resumed after countdown' : 'User confirmed Supabase deletion check')
                appendLine(deleteCheckMode === 'auto'
                    ? 'Supabase verification (deleted) auto-resumed after countdown'
                    : 'Supabase verification (deleted) confirmed by user')
            }

            devQaDeepModeRef.current = false
            setDevQaStatus('passed')
            appendLine('Result: PASS')
            toast.success('Developer member QA passed')
        } catch (error) {
            setDevQaQueue((prev) => prev.map((step) => (
                step.status === 'running'
                    ? { ...step, status: 'failed', detail: error.message || 'Step failed' }
                    : step
            )))
            appendLine('Result: FAIL')
            appendLine(`Error: ${error.message || 'Unknown error'}`)

            const failedCleanupIds = [createdMemberId, incompleteMemberId, overrideMemberId].filter(id => id !== null)
            if (failedCleanupIds.length > 0) {
                try {
                    markQueueStep('cleanup-member', 'running', 'Trying cleanup after failure')
                    appendLine('Attempting cleanup after failure...')
                    for (const mid of failedCleanupIds) {
                        await deleteMember(mid)
                    }
                    appendLine('Cleanup after failure attempted')
                    markQueueStep('cleanup-member', 'passed', 'Cleanup after failure attempted')
                } catch (cleanupError) {
                    appendLine(`Cleanup after failure failed: ${cleanupError.message || 'Unknown cleanup error'}`)
                    markQueueStep('cleanup-member', 'failed', cleanupError.message || 'Cleanup after failure failed')
                }
            }

            devQaDeepModeRef.current = false
            setDevQaPausedSql('')
            setDevQaPausedLabel('')
            setDevQaCountdown(0)
            devQaResumeRef.current = null
            setDevQaStatus('failed')
            toast.error(error.message || 'Developer member QA failed')
        }
    }, [
        selection,
        devQaStatus,
        dataOwnerId,
        user?.id,
        currentTable,
        isDeveloperBypass,
        isSupabaseConfigured,
        deleteMember,
        forceRefreshMembersSilent,
        loadAllAttendanceData,
        loadAllBadgeData,
        refreshSearch,
        onOpenAddMember,
        validateMemberData,
        getPastSundays,
        getMissingAttendance
    ])

    const runBatchMemberQa = useCallback(async () => {
        selection()
        if (devQaStatus === 'running') return

        const batchSize = Math.max(1, Math.min(10, devQaBatchCount))
        const reportLines = []
        const appendLine = (msg) => { reportLines.push(msg); setDevQaReport(reportLines.join('\n')) }
        const markQueueStep = (stepId, status, detail = '') => {
            setDevQaQueue(prev => prev.map(step => (
                step.id === stepId ? { ...step, status, detail } : step
            )))
        }
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
        const waitForUserContinue = (countdownSec, sql, label) => {
            return new Promise((resolve) => {
                devQaResumeRef.current = resolve
                setDevQaPausedSql(sql)
                setDevQaPausedLabel(label)
                setDevQaCountdown(countdownSec)
            })
        }

        if (!currentTable) {
            toast.error('No active month table selected')
            return
        }

        const ownerId = dataOwnerId || user?.id
        const actorUserId = user?.id || ownerId
        if (!ownerId) {
            toast.error('Unable to determine the workspace owner for batch QA')
            return
        }

        const runToken = Date.now()
        const createdMembers = []

        const [tablMonth, tablYear] = currentTable.split('_')
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const tablMonthIdx = monthNames.indexOf(tablMonth)
        const tablYearNum = parseInt(tablYear, 10)
        const sundayDatesForTable = []
        if (tablMonthIdx !== -1 && !Number.isNaN(tablYearNum)) {
            const d = new Date(tablYearNum, tablMonthIdx, 1)
            while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
            while (d.getMonth() === tablMonthIdx) {
                sundayDatesForTable.push(new Date(d))
                d.setDate(d.getDate() + 7)
            }
        }

        const batchQueue = []
        for (let i = 1; i <= batchSize; i++) {
            batchQueue.push({ id: `batch-create-${i}`, label: `Create member #${i}`, status: 'pending' })
        }
        batchQueue.push({ id: 'batch-badges', label: `Assign badges to all ${batchSize} members`, status: 'pending' })
        batchQueue.push({ id: 'batch-tags', label: `Assign workspace tags to all ${batchSize} members`, status: 'pending' })
        if (sundayDatesForTable.length > 0) {
        batchQueue.push({ id: 'batch-attendance', label: `Mark attendance for ${sundayDatesForTable.length} Sundays`, status: 'pending' })
        }
        batchQueue.push({ id: 'batch-verify-all', label: 'Verify all created in Supabase', status: 'pending' })
        for (let i = 1; i <= batchSize; i++) {
            batchQueue.push({ id: `batch-delete-${i}`, label: `Delete member #${i}`, status: 'pending' })
        }
        batchQueue.push({ id: 'batch-verify-deleted', label: 'Verify all deleted from Supabase', status: 'pending' })

        setDevQaStatus('running')
        setIsDevQaModalOpen(true)
        setIsDevQaMinimized(false)
        setDevQaReport(`Starting batch QA (${batchSize} members)...`)
        setDevQaQueue(batchQueue)

        try {
            appendLine(`Table: ${currentTable}`)
            appendLine(`Batch size: ${batchSize}`)
            appendLine(`Sundays in month: ${sundayDatesForTable.length}`)
            appendLine('Mode: Workspace-backed bundle save for cross-account safety')
            appendLine('')

            const genders = ['Female', 'Male']
            const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3']
            const memberBadgeMap = {}
            const memberAttendanceMap = {}
            const memberTagMap = {}

            markQueueStep('batch-tags', 'running', 'Fetching workspace tags...')
            appendLine('Preparing workspace tags for batch members...')
            let workspaceTags = []
            try {
                const { data: tagData, error: tagFetchError } = await supabase.rpc('get_workspace_tags', {
                    p_owner_id: ownerId
                })
                if (tagFetchError) throw tagFetchError
                workspaceTags = tagData || []
            } catch (tagErr) {
                appendLine(`  Warning: could not fetch workspace tags: ${tagErr.message}`)
            }

            if (workspaceTags.length === 0) {
                appendLine('  No workspace tags found - skipping tag assignment')
                appendLine('  (Create tags in Admin Controls -> Tag Management first)')
                markQueueStep('batch-tags', 'passed', 'No tags available - skipped')
            } else {
                appendLine(`  Found ${workspaceTags.length} workspace tag(s): ${workspaceTags.map(tag => tag.name).join(', ')}`)
            }

            markQueueStep('batch-badges', 'running', 'Badges will be included during member creation')
            if (sundayDatesForTable.length > 0) {
                markQueueStep('batch-attendance', 'running', `Attendance will be included during member creation for ${sundayDatesForTable.length} Sundays`)
            }

            for (let i = 1; i <= batchSize; i++) {
                markQueueStep(`batch-create-${i}`, 'running', `Saving member #${i} through workspace bundle RPC`)

                const memberName = `BATCH QA ${i} [${runToken}]`
                const memberPayload = {
                    'Full Name': memberName,
                    'Gender': genders[i % 2],
                    'Phone Number': `050000${String(1000 + i)}`,
                    'Age': String(14 + (i % 6)),
                    date_of_birth: `${2012 - (i % 5)}-0${(i % 9) + 1}-${String(10 + (i % 20)).padStart(2, '0')}`,
                    'Current Level': levels[i % levels.length],
                    workspace: preferences?.workspace_name || null,
                    notes: `Batch QA member ${i} of ${batchSize} - auto-generated`,
                    is_visitor: i % 4 === 0,
                    parent_name_1: `Batch Parent 1 for #${i}`,
                    parent_phone_1: `050111${String(1000 + i)}`,
                    parent_name_2: `Batch Parent 2 for #${i}`,
                    parent_phone_2: `050222${String(1000 + i)}`,
                    user_id: actorUserId
                }

                const assignedBadges = ['member', 'regular', 'newcomer']
                const assignedTagIds = workspaceTags.map(tag => tag.id)
                const attendancePayload = {}

                sundayDatesForTable.forEach((sunday, sundayIdx) => {
                    const isPresent = ((i - 1 + sundayIdx) % 3 !== 0)
                    const dateKey = [
                        sunday.getFullYear(),
                        String(sunday.getMonth() + 1).padStart(2, '0'),
                        String(sunday.getDate()).padStart(2, '0')
                    ].join('-')
                    const dateLabel = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    attendancePayload[dateKey] = isPresent
                    if (!memberAttendanceMap[memberName]) {
                        memberAttendanceMap[memberName] = {}
                    }
                    memberAttendanceMap[memberName][dateLabel] = isPresent ? 'Present' : 'Absent'
                })

                const requestId = window.crypto?.randomUUID?.() || `batch-member-${runToken}-${i}-${Math.random().toString(16).slice(2)}`
                const { data: bundleResult } = await executeSupabaseWrite(
                    () => supabase.rpc('save_member_bundle', {
                        p_table_name: currentTable,
                        p_owner_id: ownerId,
                        p_request_id: requestId,
                        p_member: memberPayload,
                        p_badges: assignedBadges,
                        p_tag_ids: assignedTagIds,
                        p_attendance: attendancePayload
                    }),
                    { action: `Create batch member #${i} in ${currentTable}` }
                )

                if (!bundleResult?.success || !bundleResult?.member_id) {
                    throw new Error(`Failed to create member #${i}: ${bundleResult?.error_message || 'Backend batch member save failed'}`)
                }

                memberBadgeMap[bundleResult.member_id] = assignedBadges
                memberTagMap[bundleResult.member_id] = workspaceTags.map(tag => tag.name)
                createdMembers.push({ id: bundleResult.member_id, name: memberName, index: i })

                appendLine(`Created #${i}: "${memberName}" -> ${bundleResult.member_id}`)
                appendLine(`  #${i} badges: ${assignedBadges.join(', ')}`)
                if (workspaceTags.length > 0) {
                    appendLine(`  #${i} tags: ${workspaceTags.map(tag => tag.name).join(', ')}`)
                }
                if (sundayDatesForTable.length > 0) {
                    appendLine(`  #${i} attendance saved for ${sundayDatesForTable.length} Sunday(s)`)
                }
                markQueueStep(`batch-create-${i}`, 'passed', memberName)
                await sleep(150)
            }

            appendLine('')
            appendLine('Assigning badges to batch members...')
            appendLine('  Included badge assignment inside each secure member bundle save.')
            markQueueStep('batch-badges', 'passed', `Assigned badges to ${createdMembers.length} members`)
            appendLine(`All ${createdMembers.length} members received badges`)

            appendLine('')
            appendLine('Assigning workspace tags to batch members...')
            if (workspaceTags.length === 0) {
                appendLine('  No workspace tags found - nothing to assign.')
                markQueueStep('batch-tags', 'passed', 'No tags available - skipped')
            } else {
                appendLine('  Included workspace tags inside each secure member bundle save.')
                markQueueStep('batch-tags', 'passed', `Assigned tags to ${createdMembers.length} members`)
                appendLine(`All ${createdMembers.length} members received workspace tags`)
            }

            if (sundayDatesForTable.length > 0) {
                appendLine('')
                appendLine(`Marking attendance for ${sundayDatesForTable.length} Sundays...`)
                appendLine('  Included Sunday attendance inside each secure member bundle save.')
                for (const sunday of sundayDatesForTable) {
                    const dateLabel = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    const presentCount = createdMembers.filter(member => memberAttendanceMap[member.name]?.[dateLabel] === 'Present').length
                    const absentCount = createdMembers.length - presentCount
                    appendLine(`  ${dateLabel}: ${presentCount} Present, ${absentCount} Absent`)
                    await sleep(100)
                }
                markQueueStep('batch-attendance', 'passed', `Marked ${sundayDatesForTable.length} Sundays for ${createdMembers.length} members`)
                appendLine(`Attendance marked for all ${sundayDatesForTable.length} Sundays`)
            }

            appendLine('')
            appendLine('Refreshing local member list...')
            await Promise.allSettled([
                forceRefreshMembersSilent(),
                loadAllAttendanceData(),
                loadAllBadgeData()
            ])
            refreshSearch()
            await sleep(800)

            markQueueStep('batch-verify-all', 'running', 'Waiting for Supabase verification')
            const allIds = createdMembers.map(member => `'${member.id}'`).join(',\n       ')
            const attendanceCols = sundayDatesForTable.map((sunday) => {
                const y = sunday.getFullYear()
                const m = String(sunday.getMonth() + 1).padStart(2, '0')
                const d = String(sunday.getDate()).padStart(2, '0')
                return `attendance_${y}_${m}_${d}`
            })
            const selectFields = [
                'm."Full Name"',
                'm."Gender"',
                'm."Phone Number"',
                'm."date_of_birth"',
                'm."Age"',
                'm."Current Level"',
                'm."parent_name_1"',
                'm."parent_phone_1"',
                'm."parent_name_2"',
                'm."parent_phone_2"',
                'm."is_visitor"',
                'm."notes"',
                'm."Member"',
                'm."Regular"',
                'm."Newcomer"',
                ...attendanceCols.map(col => `m."${col}"`),
                `COALESCE(STRING_AGG(t.name, ', '), 'No Tags') as assigned_tags`
            ].join(',\n    ')

            const verifySql = [
                `-- Verify ALL ${batchSize} batch members - EVERY SINGLE FIELD + BADGES + ATTENDANCE + TAGS`,
                'SELECT',
                `    ${selectFields}`,
                `FROM "${currentTable}" m`,
                `LEFT JOIN member_tags mt ON mt.member_id = m.id AND mt.table_name = '${currentTable}'`,
                'LEFT JOIN tags t ON t.id = mt.tag_id',
                'WHERE m.id IN (',
                `       ${allIds}`,
                ')',
                `GROUP BY m.id, m."Full Name", m."Gender", m."Phone Number", m."date_of_birth", m."Age", m."Current Level", m."parent_name_1", m."parent_phone_1", m."parent_name_2", m."parent_phone_2", m."is_visitor", m."notes", m."Member", m."Regular", m."Newcomer"${attendanceCols.length > 0 ? `, ${attendanceCols.map(col => `m."${col}"`).join(', ')}` : ''}`,
                'ORDER BY m."Full Name";',
                '',
                `-- Expected: ${batchSize} rows returned`,
                '-- Every column listed above should be completely filled out for every member.',
                '',
                ...createdMembers.map((member) => {
                    const badges = memberBadgeMap[member.id]?.join(', ') || 'none'
                    const tags = memberTagMap[member.id]?.join(', ') || 'none'
                    const attendance = memberAttendanceMap[member.name]
                        ? Object.entries(memberAttendanceMap[member.name]).map(([dateLabel, status]) => `${dateLabel}=${status}`).join(', ')
                        : 'none'
                    return `-- #${member.index}: ${member.name} | Badges: ${badges} | Tags: ${tags} | Attendance: ${attendance}`
                })
            ].join('\n')
            appendLine('')
            appendLine(`Paused - verify all ${batchSize} members with badges + attendance in Supabase`)
            const batchCreateCheckMode = await waitForUserContinue(180, verifySql, `Verify all ${batchSize} CREATED members`)
            markQueueStep('batch-verify-all', 'passed', batchCreateCheckMode === 'auto' ? 'Auto-resumed after countdown' : `User confirmed all ${batchSize} exist`)
            appendLine(batchCreateCheckMode === 'auto'
                ? `Batch creation auto-resumed after the ${batchSize}-member review countdown`
                : 'Batch creation verified by user')
            appendLine('')

            for (const member of createdMembers) {
                markQueueStep(`batch-delete-${member.index}`, 'running', `Deleting "${member.name}"`)
                const deleteResult = await deleteMember(member.id)
                if (!deleteResult?.success) {
                    throw new Error(`Failed to delete member #${member.index}: deleteMember fallback failed`)
                }

                appendLine(`Deleted #${member.index}: "${member.name}"`)
                markQueueStep(`batch-delete-${member.index}`, 'passed', 'Deleted')
                await sleep(150)
            }

            await Promise.allSettled([
                forceRefreshMembersSilent(),
                loadAllAttendanceData(),
                loadAllBadgeData()
            ])
            refreshSearch()
            await sleep(800)

            markQueueStep('batch-verify-deleted', 'running', 'Waiting for Supabase verification')
            const deleteSql = [
                `-- Verify ALL ${batchSize} batch members were DELETED from Supabase`,
                'SELECT *',
                `FROM "${currentTable}"`,
                'WHERE id IN (',
                `       ${allIds}`,
                ');',
                '',
                '-- Expected: 0 rows returned',
                `-- All ${batchSize} test members should no longer exist.`
            ].join('\n')
            appendLine('')
            appendLine(`Paused - verify all ${batchSize} members were deleted from Supabase`)
            const batchDeleteCheckMode = await waitForUserContinue(180, deleteSql, `Verify all ${batchSize} members DELETED`)
            markQueueStep('batch-verify-deleted', 'passed', batchDeleteCheckMode === 'auto' ? 'Auto-resumed after countdown' : `User confirmed all ${batchSize} deleted`)
            appendLine(batchDeleteCheckMode === 'auto'
                ? `Batch deletion auto-resumed after the ${batchSize}-member review countdown`
                : 'Batch deletion verified by user')

            setDevQaStatus('passed')
            appendLine('')
            appendLine('Result: PASS')
            toast.success(`Batch QA passed (${batchSize} members created, verified, deleted, verified)`)
        } catch (error) {
            setDevQaQueue(prev => prev.map(step => (
                step.status === 'running' ? { ...step, status: 'failed', detail: error.message || 'Failed' } : step
            )))
            appendLine('Result: FAIL')
            appendLine(`Error: ${error.message || 'Unknown error'}`)

            if (createdMembers.length > 0) {
                appendLine('')
                appendLine('Attempting emergency cleanup of created members...')
                for (const member of createdMembers) {
                    try {
                        const delResult = await deleteMember(member.id)
                        if (!delResult?.success) {
                            throw new Error('deleteMember cleanup fallback failed')
                        }
                        appendLine(`  Cleaned up: ${member.name}`)
                    } catch {
                        appendLine(`  Warning: could not clean up: ${member.name}`)
                    }
                }
            }

            setDevQaPausedSql('')
            setDevQaPausedLabel('')
            setDevQaCountdown(0)
            devQaResumeRef.current = null
            setDevQaStatus('failed')
            toast.error(error.message || 'Batch QA failed')
        }
    }, [
        selection,
        devQaStatus,
        devQaBatchCount,
        dataOwnerId,
        user?.id,
        currentTable,
        preferences?.workspace_name,
        deleteMember,
        forceRefreshMembersSilent,
        loadAllAttendanceData,
        loadAllBadgeData,
        refreshSearch
    ])

    const runExistingMemberEditQa = useCallback(async () => {
        selection()
        if (devQaStatus === 'running') return

        const memberId = devQaSelectedMemberId
        const sourceMember = membersRef.current.find((member) => member.id === memberId)
        if (!sourceMember) {
            toast.error('Pick a member to test first')
            return
        }

        if (validateMemberData(sourceMember).length > 0) {
            toast.error('Pick a completed member for the Existing Member Edit QA')
            return
        }

        const reportLines = []
        const appendLine = (message) => {
            reportLines.push(message)
            setDevQaReport(reportLines.join('\n'))
        }
        const markQueueStep = (stepId, status, detail = '') => {
            setDevQaQueue((prev) => prev.map((step) => (
                step.id === stepId ? { ...step, status, detail } : step
            )))
        }
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        const waitFor = async (condition, timeoutMs, label) => {
            const start = Date.now()
            while (Date.now() - start < timeoutMs) {
                const value = condition()
                if (value) return value
                await sleep(120)
            }
            throw new Error(`Timed out waiting for ${label}`)
        }
        const getByTestId = (testId, scope = document) => scope.querySelector(`[data-testid="${testId}"]`)
        const waitForTestId = (testId, timeoutMs = 8000, scope = document) => waitFor(() => getByTestId(testId, scope), timeoutMs, testId)
        const clickElement = async (element, message) => {
            if (!element) throw new Error(`Missing element for step: ${message}`)
            appendLine(message)
            element.click()
            await sleep(420)
        }
        const setElementValue = async (element, nextValue, message) => {
            if (!element) throw new Error(`Missing input for step: ${message}`)
            appendLine(message)
            const prototype = element.tagName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype
            const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
            if (!valueSetter) throw new Error(`Unable to access setter for ${message}`)

            element.focus()
            valueSetter.call(element, '')
            element.dispatchEvent(new Event('input', { bubbles: true }))

            let typedValue = ''
            for (const character of String(nextValue ?? '')) {
                typedValue += character
                valueSetter.call(element, typedValue)
                element.dispatchEvent(new Event('input', { bubbles: true }))
                await sleep(65)
            }

            element.dispatchEvent(new Event('change', { bubbles: true }))
            await sleep(520)
        }
        const getComparableValue = (record, key) => {
            if (!record) return null
            const variants = {
                full_name: ['full_name', 'Full Name'],
                notes: ['notes']
            }
            const keys = variants[key] || [key]
            for (const variant of keys) {
                if (Object.prototype.hasOwnProperty.call(record, variant)) {
                    return record[variant]
                }
            }
            return null
        }
        const qaSundayDates = getQaSundayDatesForTable(currentTable).slice(0, 2)
        const originalAttendanceState = Object.fromEntries(
            qaSundayDates.map((date) => [date, getAttendanceStatusFromRecord(sourceMember, date)])
        )
        const editedAttendanceState = Object.fromEntries(
            qaSundayDates.map((date, index) => [date, index % 2 === 0 ? 'Present' : 'Absent'])
        )
        const applyAttendanceState = async (attendanceState, labelPrefix) => {
            for (const [date, status] of Object.entries(attendanceState)) {
                const action = status === 'Present'
                    ? 'present'
                    : status === 'Absent'
                        ? 'absent'
                        : 'clear'
                await clickElement(
                    await waitForTestId(`edit-form-attendance-${date}-${action}`),
                    `${labelPrefix}: setting ${date} to ${status || 'Clear'}...`
                )
            }
        }
        const verifyState = async (expectedFields, expectedAttendance, label) => {
            let dbRecord = null

            if (!isDeveloperBypass && isSupabaseConfigured()) {
                for (let attempt = 0; attempt < 7; attempt += 1) {
                    const { data, error } = await supabase
                        .from(currentTable)
                        .select('*')
                        .eq('id', memberId)
                        .single()

                    if (error) throw error

                    const matchesDb = Object.entries(expectedFields).every(([field, value]) => String(getComparableValue(data, field) ?? '') === String(value ?? ''))
                    const matchesAttendance = Object.entries(expectedAttendance).every(([date, value]) => (
                        String(getAttendanceStatusFromRecord(data, date) ?? '') === String(value ?? '')
                    ))
                    if (matchesDb && matchesAttendance) {
                        dbRecord = data
                        break
                    }
                    await sleep(800)
                }

                if (!dbRecord) {
                    throw new Error(`Timed out waiting for ${label.toLowerCase()} database state`)
                }
            }

            for (let attempt = 0; attempt < 5; attempt += 1) {
                const localRecord = membersRef.current.find((member) => member.id === memberId)
                const matchesLocal = Object.entries(expectedFields).every(([field, value]) => String(getComparableValue(localRecord, field) ?? '') === String(value ?? ''))
                const matchesAttendance = Object.entries(expectedAttendance).every(([date, value]) => (
                    String(getAttendanceStatusFromRecord(localRecord, date) ?? '') === String(value ?? '')
                ))
                if (matchesLocal && matchesAttendance) {
                    appendLine(`${label}: verification passed`)
                    return
                }

                await Promise.allSettled([
                    forceRefreshMembersSilent(),
                    loadAllAttendanceData(),
                    loadAllBadgeData()
                ])
                refreshSearch()
                await sleep(900)
            }

            if (dbRecord) {
                appendLine(`${label}: database passed while local state caught up slowly`)
                return
            }

            throw new Error(`Timed out waiting for ${label.toLowerCase()} local state`)
        }

        const originalName = getMemberDisplayName(sourceMember)
        const originalNotes = String(getComparableValue(sourceMember, 'notes') ?? '')
        const editedName = `${originalName} QA`
        const editedNotes = originalNotes
            ? `${originalNotes} | Existing Member Edit QA`
            : 'Existing Member Edit QA'

        setDevQaStatus('running')
        setIsDevQaModalOpen(true)
        setIsDevQaMinimized(false)
        setDevQaPausedSql('')
        setDevQaPausedLabel('')
        setDevQaCountdown(0)
        devQaResumeRef.current = null
        devQaDeepModeRef.current = false
        setDevQaQueue(createExistingMemberEditQaQueue())
        setDevQaReport('Starting existing member edit QA...')

        try {
        appendLine(`Table: ${currentTable}`)
        appendLine(`Testing existing member: ${originalName}`)
        if (qaSundayDates.length > 0) {
            appendLine(`Attendance under test: ${qaSundayDates.map((date, index) => `${date}=${index % 2 === 0 ? 'Present' : 'Absent'}`).join(', ')}`)
        }
        appendLine('Verification SQL:')
        appendLine(`SELECT id, "Full Name", notes${qaSundayDates.map((date) => `, "${getAttendanceColumnName(date)}"`).join('')} FROM "${currentTable}" WHERE id = '${memberId}';`)

        markQueueStep('open-existing-edit', 'running', `Opening ${originalName}`)
            const editOpened = await waitFor(() => {
                if (typeof window.openDeveloperEditMember !== 'function') return false
                return window.openDeveloperEditMember(memberId)
            }, 8000, 'existing member edit opener')

            if (!editOpened) {
                throw new Error('Could not open the selected member in Edit Member')
            }

            await waitForTestId('edit-member-modal', 8000)
            markQueueStep('open-existing-edit', 'passed', 'Edit Member modal opened')

            markQueueStep('edit-existing-member', 'running', `Editing ${originalName}`)
            await setElementValue(await waitForTestId('edit-form-full-name'), editedName, 'Existing Member QA: updating full name...')
            await setElementValue(await waitForTestId('edit-form-notes'), editedNotes, 'Existing Member QA: updating notes...')
            await applyAttendanceState(editedAttendanceState, 'Existing Member QA')
            await clickElement(await waitForTestId('edit-form-submit'), 'Existing Member QA: saving changes...')
            await waitFor(() => !getByTestId('edit-member-modal'), 12000, 'edit modal to close after save')
            markQueueStep('edit-existing-member', 'passed', `${editedName} was submitted`)

            markQueueStep('verify-existing-edit', 'running', 'Checking saved values')
            await verifyState({
                full_name: editedName,
                notes: editedNotes
            }, editedAttendanceState, 'Existing edit')
            markQueueStep('verify-existing-edit', 'passed', 'Edited values matched')

            markQueueStep('restore-existing-member', 'running', `Restoring ${originalName}`)
            const restoreOpened = await waitFor(() => {
                if (typeof window.openDeveloperEditMember !== 'function') return false
                return window.openDeveloperEditMember(memberId)
            }, 8000, 'existing member restore opener')

            if (!restoreOpened) {
                throw new Error('Could not reopen the selected member for restore')
            }

            await waitForTestId('edit-member-modal', 8000)
            await setElementValue(await waitForTestId('edit-form-full-name'), originalName, 'Existing Member QA: restoring full name...')
            await setElementValue(await waitForTestId('edit-form-notes'), originalNotes, 'Existing Member QA: restoring notes...')
            await applyAttendanceState(originalAttendanceState, 'Existing Member QA')
            await clickElement(await waitForTestId('edit-form-submit'), 'Existing Member QA: saving restored values...')
            await waitFor(() => !getByTestId('edit-member-modal'), 12000, 'edit modal to close after restore')
            markQueueStep('restore-existing-member', 'passed', 'Original values resubmitted')

            markQueueStep('verify-existing-restore', 'running', 'Checking original values again')
            await verifyState({
                full_name: originalName,
                notes: originalNotes
            }, originalAttendanceState, 'Existing restore')
            markQueueStep('verify-existing-restore', 'passed', 'Original values restored')

            setDevQaStatus('passed')
            appendLine('')
            appendLine('Result: PASS')
            toast.success('Existing member edit QA passed')
        } catch (error) {
            setDevQaQueue((prev) => prev.map((step) => (
                step.status === 'running' ? { ...step, status: 'failed', detail: error.message || 'Failed' } : step
            )))
            appendLine('Result: FAIL')
            appendLine(`Error: ${error.message || 'Unknown error'}`)
            setDevQaStatus('failed')
            toast.error(error.message || 'Existing member edit QA failed')
        }
    }, [
        selection,
        devQaStatus,
        devQaSelectedMemberId,
        validateMemberData,
        isDeveloperBypass,
        isSupabaseConfigured,
        currentTable,
        forceRefreshMembersSilent,
        loadAllAttendanceData,
        loadAllBadgeData,
        refreshSearch,
        getMemberDisplayName,
        getQaSundayDatesForTable,
        getAttendanceColumnName,
        getAttendanceStatusFromRecord
    ])

    const runBadgeTagQa = useCallback(async () => {
        selection()
        if (devQaStatus === 'running') return

        const memberId = devQaSelectedMemberId
        const sourceMember = membersRef.current.find((member) => member.id === memberId)
        if (!sourceMember) {
            toast.error('Pick a member to test first')
            return
        }

        if (validateMemberData(sourceMember).length > 0) {
            toast.error('Pick a completed member for the Badge + Tag QA')
            return
        }

        const reportLines = []
        const appendLine = (message) => {
            reportLines.push(message)
            setDevQaReport(reportLines.join('\n'))
        }
        const markQueueStep = (stepId, status, detail = '') => {
            setDevQaQueue((prev) => prev.map((step) => (
                step.id === stepId ? { ...step, status, detail } : step
            )))
        }
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        const waitFor = async (condition, timeoutMs, label) => {
            const start = Date.now()
            while (Date.now() - start < timeoutMs) {
                const value = condition()
                if (value) return value
                await sleep(120)
            }
            throw new Error(`Timed out waiting for ${label}`)
        }
        const getByTestId = (testId, scope = document) => scope.querySelector(`[data-testid="${testId}"]`)
        const waitForTestId = (testId, timeoutMs = 8000, scope = document) => waitFor(() => getByTestId(testId, scope), timeoutMs, testId)
        const clickElement = async (element, message) => {
            if (!element) throw new Error(`Missing element for step: ${message}`)
            appendLine(message)
            element.click()
            await sleep(460)
        }
        const applyAttendanceState = async (attendanceState, labelPrefix) => {
            for (const [date, status] of Object.entries(attendanceState)) {
                const action = status === 'Present'
                    ? 'present'
                    : status === 'Absent'
                        ? 'absent'
                        : 'clear'
                await clickElement(
                    await waitForTestId(`edit-form-attendance-${date}-${action}`),
                    `${labelPrefix}: setting ${date} to ${status || 'Clear'}...`
                )
            }
        }

        const ownerId = dataOwnerId || user?.id
        const qaSundayDates = getQaSundayDatesForTable(currentTable).slice(0, 2)
        const originalAttendanceState = Object.fromEntries(
            qaSundayDates.map((date) => [date, getAttendanceStatusFromRecord(sourceMember, date)])
        )
        const editedAttendanceState = Object.fromEntries(
            qaSundayDates.map((date, index) => [date, index % 2 === 0 ? 'Absent' : 'Present'])
        )
        const badgeTags = ['member', 'regular', 'newcomer']
        const originalBadgeSet = new Set(
            badgeTags.filter((tag) => {
                if (tag === 'member') return sourceMember?.Member === 'Yes'
                if (tag === 'regular') return sourceMember?.Regular === 'Yes'
                if (tag === 'newcomer') return sourceMember?.Newcomer === 'Yes'
                return false
            })
        )
        const badgeToToggle = badgeTags.find((tag) => !originalBadgeSet.has(tag)) || 'member'
        const expectedBadgeSet = new Set(originalBadgeSet)
        if (expectedBadgeSet.has(badgeToToggle)) {
            expectedBadgeSet.delete(badgeToToggle)
        } else {
            expectedBadgeSet.add(badgeToToggle)
        }

        const fetchAssignedTagIds = async () => {
            if (!ownerId || !currentTable || !isSupabaseConfigured()) return null
            const { data, error } = await supabase.rpc('get_member_tags', {
                p_member_id: memberId,
                p_table_name: currentTable
            })
            if (error) throw error
            return new Set((data || []).map((tag) => tag.id))
        }

        const verifyBadgeAndTagState = async (expectedBadges, expectedTagIds, expectedAttendance, label) => {
            let dbRecord = null

            if (!isDeveloperBypass && isSupabaseConfigured()) {
                for (let attempt = 0; attempt < 7; attempt += 1) {
                    const { data, error } = await supabase
                        .from(currentTable)
                        .select('*')
                        .eq('id', memberId)
                        .single()

                    if (error) throw error

                    const dbBadgeSet = new Set(badgeTags.filter((tag) => {
                        if (tag === 'member') return data?.Member === 'Yes'
                        if (tag === 'regular') return data?.Regular === 'Yes'
                        if (tag === 'newcomer') return data?.Newcomer === 'Yes'
                        return false
                    }))

                    const badgeMatch = badgeTags.every((tag) => dbBadgeSet.has(tag) === expectedBadges.has(tag))
                    let tagMatch = true

                    if (expectedTagIds) {
                        const assignedTagIds = await fetchAssignedTagIds()
                        tagMatch = assignedTagIds && expectedTagIds.size === assignedTagIds.size && [...expectedTagIds].every((tagId) => assignedTagIds.has(tagId))
                    }
                    const attendanceMatch = Object.entries(expectedAttendance).every(([date, value]) => (
                        String(getAttendanceStatusFromRecord(data, date) ?? '') === String(value ?? '')
                    ))

                    if (badgeMatch && tagMatch && attendanceMatch) {
                        dbRecord = data
                        break
                    }

                    await sleep(800)
                }

                if (!dbRecord) {
                    throw new Error(`Timed out waiting for ${label.toLowerCase()} database state`)
                }
            }

            for (let attempt = 0; attempt < 5; attempt += 1) {
                const localRecord = membersRef.current.find((member) => member.id === memberId)
                const localBadgeSet = new Set(badgeTags.filter((tag) => {
                    if (tag === 'member') return localRecord?.Member === 'Yes'
                    if (tag === 'regular') return localRecord?.Regular === 'Yes'
                    if (tag === 'newcomer') return localRecord?.Newcomer === 'Yes'
                    return false
                }))
                const badgeMatch = badgeTags.every((tag) => localBadgeSet.has(tag) === expectedBadges.has(tag))
                const attendanceMatch = Object.entries(expectedAttendance).every(([date, value]) => (
                    String(getAttendanceStatusFromRecord(localRecord, date) ?? '') === String(value ?? '')
                ))
                if (badgeMatch && attendanceMatch) {
                    appendLine(`${label}: badge, tag, and attendance verification passed`)
                    return
                }

                await Promise.allSettled([
                    forceRefreshMembersSilent(),
                    loadAllAttendanceData(),
                    loadAllBadgeData()
                ])
                refreshSearch()
                await sleep(900)
            }

            if (dbRecord) {
                appendLine(`${label}: database verification passed while local state caught up slowly`)
                return
            }

            throw new Error(`Timed out waiting for ${label.toLowerCase()} badge state`)
        }

        let workspaceTags = []
        let originalTagIds = null
        let targetTagId = null
        let expectedTagIds = null

        setDevQaStatus('running')
        setIsDevQaModalOpen(true)
        setIsDevQaMinimized(false)
        setDevQaPausedSql('')
        setDevQaPausedLabel('')
        setDevQaCountdown(0)
        devQaResumeRef.current = null
        devQaDeepModeRef.current = false
        setDevQaQueue(createBadgeTagQaQueue())
        setDevQaReport('Starting badge and tag QA...')

        try {
            if (ownerId && currentTable && isSupabaseConfigured()) {
                const { data, error } = await supabase.rpc('get_workspace_tags', {
                    p_owner_id: ownerId
                })
                if (!error) {
                    workspaceTags = data || []
                }

                originalTagIds = await fetchAssignedTagIds()
                const firstTag = workspaceTags[0]
                if (firstTag) {
                    targetTagId = firstTag.id
                    expectedTagIds = new Set(originalTagIds)
                    if (expectedTagIds.has(targetTagId)) {
                        expectedTagIds.delete(targetTagId)
                    } else {
                        expectedTagIds.add(targetTagId)
                    }
                }
            }

            appendLine(`Table: ${currentTable}`)
            appendLine(`Testing badges for: ${getMemberDisplayName(sourceMember)}`)
            appendLine(`Badge to toggle: ${badgeToToggle}`)
            if (qaSundayDates.length > 0) {
                appendLine(`Attendance under test: ${qaSundayDates.map((date, index) => `${date}=${index % 2 === 0 ? 'Absent' : 'Present'}`).join(', ')}`)
            }
            if (targetTagId) {
                const targetTag = workspaceTags.find((tag) => tag.id === targetTagId)
                appendLine(`Workspace tag to toggle: ${targetTag?.name || targetTagId}`)
            } else {
                appendLine('No workspace tags available - this run will verify badges only')
            }
            appendLine('Verification SQL:')
            appendLine(`SELECT id, "Full Name", "Member", "Regular", "Newcomer"${qaSundayDates.map((date) => `, "${getAttendanceColumnName(date)}"`).join('')} FROM "${currentTable}" WHERE id = '${memberId}';`)
            appendLine(`SELECT tag_id FROM member_tags WHERE member_id = '${memberId}' AND table_name = '${currentTable}' ORDER BY tag_id;`)

            markQueueStep('open-badge-edit', 'running', `Opening ${getMemberDisplayName(sourceMember)}`)
            const editOpened = await waitFor(() => {
                if (typeof window.openDeveloperEditMember !== 'function') return false
                return window.openDeveloperEditMember(memberId)
            }, 8000, 'badge edit opener')

            if (!editOpened) {
                throw new Error('Could not open the selected member in Edit Member')
            }

            await waitForTestId('edit-member-modal', 8000)
            markQueueStep('open-badge-edit', 'passed', 'Edit Member modal opened')

            markQueueStep('toggle-badge-tag', 'running', 'Updating badge and tag selections')
            await clickElement(await waitForTestId(`edit-form-badge-${badgeToToggle}`), `Badge QA: toggling ${badgeToToggle} badge...`)
            if (targetTagId) {
                await clickElement(await waitForTestId(`tag-selector-tag-${targetTagId}`), 'Badge QA: toggling workspace tag...')
            }
            await applyAttendanceState(editedAttendanceState, 'Badge QA')
            await clickElement(await waitForTestId('edit-form-submit'), 'Badge QA: saving changes...')
            await waitFor(() => !getByTestId('edit-member-modal'), 12000, 'edit modal to close after badge save')
            markQueueStep('toggle-badge-tag', 'passed', 'Badge and tag changes submitted')

            markQueueStep('verify-badge-tag', 'running', 'Checking badge and tag state')
            await verifyBadgeAndTagState(expectedBadgeSet, expectedTagIds, editedAttendanceState, 'Badge update')
            markQueueStep('verify-badge-tag', 'passed', 'Badge and tag changes matched')

            markQueueStep('restore-badge-tag', 'running', 'Restoring original badge and tag state')
            const restoreOpened = await waitFor(() => {
                if (typeof window.openDeveloperEditMember !== 'function') return false
                return window.openDeveloperEditMember(memberId)
            }, 8000, 'badge restore opener')

            if (!restoreOpened) {
                throw new Error('Could not reopen the selected member for badge restore')
            }

            await waitForTestId('edit-member-modal', 8000)
            await clickElement(await waitForTestId(`edit-form-badge-${badgeToToggle}`), `Badge QA: restoring ${badgeToToggle} badge...`)
            if (targetTagId) {
                await clickElement(await waitForTestId(`tag-selector-tag-${targetTagId}`), 'Badge QA: restoring workspace tag...')
            }
            await applyAttendanceState(originalAttendanceState, 'Badge QA')
            await clickElement(await waitForTestId('edit-form-submit'), 'Badge QA: saving restored badge state...')
            await waitFor(() => !getByTestId('edit-member-modal'), 12000, 'edit modal to close after badge restore')
            markQueueStep('restore-badge-tag', 'passed', 'Original badge and tag state resubmitted')

            markQueueStep('verify-badge-tag-restore', 'running', 'Checking original badge and tag state again')
            await verifyBadgeAndTagState(originalBadgeSet, originalTagIds, originalAttendanceState, 'Badge restore')
            markQueueStep('verify-badge-tag-restore', 'passed', 'Original badge and tag state restored')

            setDevQaStatus('passed')
            appendLine('')
            appendLine('Result: PASS')
            toast.success('Badge + tag QA passed')
        } catch (error) {
            setDevQaQueue((prev) => prev.map((step) => (
                step.status === 'running' ? { ...step, status: 'failed', detail: error.message || 'Failed' } : step
            )))
            appendLine('Result: FAIL')
            appendLine(`Error: ${error.message || 'Unknown error'}`)
            setDevQaStatus('failed')
            toast.error(error.message || 'Badge + tag QA failed')
        }
    }, [
        selection,
        devQaStatus,
        devQaSelectedMemberId,
        validateMemberData,
        dataOwnerId,
        user?.id,
        isDeveloperBypass,
        isSupabaseConfigured,
        currentTable,
        forceRefreshMembersSilent,
        loadAllAttendanceData,
        loadAllBadgeData,
        refreshSearch,
        getMemberDisplayName,
        getQaSundayDatesForTable,
        getAttendanceColumnName,
        getAttendanceStatusFromRecord
    ])

    useEffect(() => {
        const handleDocumentClick = (event) => {
            if (showMonthDropdown && monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false)
            }
            if (isDevMemberDropdownOpen && devMemberDropdownRef.current && !devMemberDropdownRef.current.contains(event.target)) {
                setIsDevMemberDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleDocumentClick)
        return () => document.removeEventListener('mousedown', handleDocumentClick)
    }, [showMonthDropdown, isDevMemberDropdownOpen])

    // Database Usage (real query)
    const [dbUsage, setDbUsage] = useState(null)
    const [dbLoading, setDbLoading] = useState(false)
    const DB_LIMIT_MB = 500 // Supabase free tier

    const fetchDbUsage = useCallback(async () => {
        if (!isSupabaseConfigured) return
        setDbLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_database_usage')
            if (error) throw error
            setDbUsage(data)
        } catch (err) {
            console.error('Failed to fetch DB usage:', err)
        } finally {
            setDbLoading(false)
        }
    }, [isSupabaseConfigured])

    useEffect(() => { fetchDbUsage() }, [fetchDbUsage])

    // Find oldest monthly table for archive recommendation
    const oldestMonthTable = useMemo(() => {
        if (!dbUsage?.tables) return null
        const monthTables = dbUsage.tables.filter(t =>
            /^[A-Z][a-z]+_\d{4}$/.test(t.table_name)
        )
        if (monthTables.length <= 1) return null
        // Sort by size descending, recommend the largest old one
        return monthTables[monthTables.length - 1] || monthTables[0]
    }, [dbUsage])

    // Email usage tracking for Supabase free-tier awareness
    const EMAIL_RATE_LIMIT = 3 // Supabase free tier: 3 emails per hour
    const EMAIL_WINDOW_MS = 60 * 60 * 1000 // 1 hour

    const getEmailSends = useCallback(() => {
        try {
            const raw = localStorage.getItem('email_send_timestamps')
            if (!raw) return []
            const timestamps = JSON.parse(raw)
            const cutoff = Date.now() - EMAIL_WINDOW_MS
            return timestamps.filter(ts => ts > cutoff)
        } catch { return [] }
    }, [])

    const [emailSends, setEmailSends] = useState(() => {
        try {
            const raw = localStorage.getItem('email_send_timestamps')
            if (!raw) return []
            const timestamps = JSON.parse(raw)
            const cutoff = Date.now() - EMAIL_WINDOW_MS
            return timestamps.filter(ts => ts > cutoff)
        } catch { return [] }
    })
    const [emailCountdown, setEmailCountdown] = useState('')

    // Refresh email sends and countdown every second
    useEffect(() => {
        const tick = () => {
            const current = getEmailSends()
            setEmailSends(current)
            if (current.length >= EMAIL_RATE_LIMIT && current.length > 0) {
                const oldest = Math.min(...current)
                const resetAt = oldest + EMAIL_WINDOW_MS
                const remaining = resetAt - Date.now()
                if (remaining > 0) {
                    const mins = Math.floor(remaining / 60000)
                    const secs = Math.floor((remaining % 60000) / 1000)
                    setEmailCountdown(`${mins}m ${secs}s`)
                } else {
                    setEmailCountdown('')
                }
            } else {
                setEmailCountdown('')
            }
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [getEmailSends])

    const emailsRemaining = Math.max(0, EMAIL_RATE_LIMIT - emailSends.length)
    const emailPct = Math.round((emailSends.length / EMAIL_RATE_LIMIT) * 100)

    const [removeDelay, setRemoveDelay] = useState(0)
    const [isRemovingCollaborator, setIsRemovingCollaborator] = useState(false)
    const [isExportingCollaborator, setIsExportingCollaborator] = useState(false)
    const removeTimerRef = useRef(null)
    const removeCountdownRef = useRef(null)
    const [removeCountdownMs, setRemoveCountdownMs] = useState(0)
    const [showUsageDetails, setShowUsageDetails] = useState(false)
    const [showStorageLimits, setShowStorageLimits] = useState(false)

    const handleInteractionFeedback = useCallback((event) => {
        if (event.defaultPrevented) return
        const target = event.target instanceof Element
            ? event.target.closest('button, a, [role="button"], summary, input[type="checkbox"], input[type="radio"], input[type="range"]')
            : null
        if (!target) return
        if (target.matches(':disabled')) return
        selection()
    }, [selection])

    // Fetch collaborators for Team section display
    useEffect(() => {
        const fetchCollaborators = async () => {
            if (!user?.id || isDeveloperBypass || !isSupabaseConfigured()) {
                setCollaborators([])
                return
            }

            setFetchingCollaborators(true)
            try {
                const { data, error } = await supabase
                    .from('collaborators')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    setCollaborators(data)
                } else if (error) {
                    console.error('Error fetching collaborators:', error)
                }
            } catch (err) {
                console.error('Error in fetchCollaborators:', err)
            } finally {
                setFetchingCollaborators(false)
            }
        }
        fetchCollaborators()
    }, [user?.id, isDeveloperBypass, isSupabaseConfigured])

    // Refresh collaborators when modal closes
    const handleShareModalClose = async () => {
        setIsShareModalOpen(false)
        if (user && !isDeveloperBypass && isSupabaseConfigured()) {
            try {
                const { data } = await supabase
                    .from('collaborators')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: false })
                if (data) setCollaborators(data)
            } catch (err) {
                console.error('Error refreshing collaborators:', err)
            }
        }
    }

    const requestDeleteTable = (tableName) => {
        if (!tableName) return
        setDeletePrompt({
            isOpen: true,
            tableName,
            label: tableName.replace('_', ' ')
        })
    }

    const handleDeleteTable = async () => {
        const tableName = deletePrompt.tableName
        if (!tableName) return
        try {
            setDeletingTable(tableName)
            await deleteMonthTable(tableName)
        } catch (error) {
            console.error('Failed to delete month table:', error)
        } finally {
            setDeletingTable(null)
            setDeletePrompt({ isOpen: false, tableName: null, label: '' })
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success('Signed out successfully')
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }

    const handleDeleteCollaborator = (collaboratorId) => {
        if (!user || !isSupabaseConfigured) {
            toast.error('Not authorized')
            return
        }
        const target = collaborators.find(c => c.id === collaboratorId)
        setPendingRemoval(target || null)
        setRemoveDelay(0)
    }

    const performCollaboratorDeletion = async (target) => {
        setDeletingCollaboratorId(target.id)
        try {
            const { error } = await supabase
                .from('collaborators')
                .delete()
                .eq('id', target.id)
                .eq('owner_id', user.id)
            if (error) throw error
            setCollaborators(prev => prev.filter(c => c.id !== target.id))
            toast.success(`Removed access for ${target.email}`)
        } catch (err) {
            console.error('Error deleting collaborator:', err)
            toast.error('Failed to remove collaborator from database')
        } finally {
            setDeletingCollaboratorId(null)
            setIsRemovingCollaborator(false)
            setPendingRemoval(null)
        }
    }

    const confirmRemoveCollaborator = async () => {
        if (!pendingRemoval) return
        setIsRemovingCollaborator(true)
        if (removeDelay > 0) {
            toast.info(`Will remove ${pendingRemoval.email} in ${removeDelay} minutes`)
        }
        const totalMs = removeDelay * 60 * 1000
        setRemoveCountdownMs(totalMs)
        const start = Date.now()
        if (removeCountdownRef.current) clearInterval(removeCountdownRef.current)
        removeCountdownRef.current = setInterval(() => {
            const elapsed = Date.now() - start
            const remaining = Math.max(totalMs - elapsed, 0)
            setRemoveCountdownMs(remaining)
        }, 1000)
        removeTimerRef.current = setTimeout(() => performCollaboratorDeletion(pendingRemoval), totalMs || 0)
    }

    const handleExportCollaboratorData = async () => {
        setIsExportingCollaborator(true)
        try {
            toast.info('Export collaborator data: please export from Supabase (not implemented here).')
        } finally {
            setIsExportingCollaborator(false)
        }
    }

    const closeRemoveModal = () => {
        if (removeTimerRef.current) clearTimeout(removeTimerRef.current)
        if (removeCountdownRef.current) clearInterval(removeCountdownRef.current)
        setPendingRemoval(null)
        setIsRemovingCollaborator(false)
        setRemoveCountdownMs(0)
    }

    useEffect(() => {
        return () => {
            if (removeTimerRef.current) clearTimeout(removeTimerRef.current)
            if (removeCountdownRef.current) clearInterval(removeCountdownRef.current)
        }
    }, [])

    // Get preview text for each section
    const getSectionPreview = (sectionId) => {
        switch (sectionId) {
            case 'account':
                return user?.email || 'Manage your account'
            case 'workspace':
                return preferences?.workspace_name || 'TMH Teen Ministry'
            case 'team':
                return `${collaborators.length} collaborator${collaborators.length !== 1 ? 's' : ''}`
            case 'data':
                return `${members?.length || 0} members`
            case 'appearance':
                return themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'
            case 'accessibility':
                return 'Command Menu'
            case 'help':
                return 'Get help & support'
            case 'danger':
                return 'Delete account'
            case 'developer':
                return 'Launch flows quickly'
            default:
                return ''
        }
    }

    // Helper function to get month display name from table name
    const getMonthDisplayName = (tableName) => {
        // Convert table name like "October_2025" to "October 2025"
        return tableName.replace('_', ' ')
    }

    const currentMonthTable = `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][liveClock.getMonth()]}_${liveClock.getFullYear()}`
    const liveSundayDate = (() => {
        const today = new Date(liveClock.getFullYear(), liveClock.getMonth(), liveClock.getDate())
        const sunday = new Date(today)
        if (sunday.getDay() !== 0) {
            sunday.setDate(sunday.getDate() - sunday.getDay())
        }
        if (sunday.getMonth() !== today.getMonth()) {
            const firstSunday = new Date(today.getFullYear(), today.getMonth(), 1)
            while (firstSunday.getDay() !== 0) {
                firstSunday.setDate(firstSunday.getDate() + 1)
            }
            return firstSunday
        }
        return sunday
    })()
    const liveSundayDateKey = `${liveSundayDate.getFullYear()}-${String(liveSundayDate.getMonth() + 1).padStart(2, '0')}-${String(liveSundayDate.getDate()).padStart(2, '0')}`
    const selectedDateKey = selectedAttendanceDate
        ? `${selectedAttendanceDate.getFullYear()}-${String(selectedAttendanceDate.getMonth() + 1).padStart(2, '0')}-${String(selectedAttendanceDate.getDate()).padStart(2, '0')}`
        : null
    const isLiveNow = currentTable === currentMonthTable && selectedDateKey === liveSundayDateKey
    const liveMonthExists = monthlyTables.includes(currentMonthTable)
    const calendarCurrentYear = liveClock.getFullYear()

    const groupTablesByYear = useMemo(() => {
        const grouped = {}
        monthlyTables.forEach(table => {
            const [month, year] = table.split('_')
            if (!grouped[year]) grouped[year] = []
            grouped[year].push({ month, table })
        })
        return grouped
    }, [monthlyTables])

    const availableYears = useMemo(() => {
        const years = new Set(Object.keys(groupTablesByYear).map(year => parseInt(year, 10)))
        years.add(calendarCurrentYear)
        years.add(calendarCurrentYear + 1)
        return Array.from(years).sort((a, b) => a - b)
    }, [groupTablesByYear, calendarCurrentYear])

    useEffect(() => {
        if (availableYears.length === 0) return
        if (!availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[availableYears.length - 1])
        }
    }, [availableYears, selectedYear])

    // Helper to get Sundays for a month
    const getSundaysInMonth = (monthName, year) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const monthIdx = months.indexOf(monthName)
        if (monthIdx === -1) return []
        const sundays = []
        const date = new Date(year, monthIdx, 1)
        while (date.getDay() !== 0) date.setDate(date.getDate() + 1)
        while (date.getMonth() === monthIdx) {
            sundays.push(new Date(date))
            date.setDate(date.getDate() + 7)
        }
        return sundays
    }

    const handleQuickCreateMonth = async (monthName, year) => {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            const monthIdx = months.indexOf(monthName)
            if (monthIdx === -1) return
            const sundays = getSundaysInMonth(monthName, year)
            await createNewMonth({
                month: monthIdx + 1,
                year,
                monthName,
                sundays,
                copyMode: 'empty'
            })
        } catch (err) {
            console.error('Quick create month failed:', err)
        }
    }

    const isOverrideActive = Boolean(lockedDefaultDate)
    const isAutoMode = !isOverrideActive
    const hasAdminAccess = !isCollaborator || isAdminCollaborator
    const isPersonalAutoMode = !isPersonalManualMode
    const personalModeDisabled = isCollaborator && isOverrideActive
    const manualExpiryDate = useMemo(() => {
        if (!manualOverrideUntil) return null
        const parsed = new Date(manualOverrideUntil)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }, [manualOverrideUntil])
    const manualModeCountdown = useMemo(() => {
        if (!manualExpiryDate || isPersonalAutoMode) return null
        const remainingMs = manualExpiryDate.getTime() - liveClock.getTime()
        if (remainingMs <= 0) return 'Ending now'
        const totalMinutes = Math.max(1, Math.ceil(remainingMs / 60000))
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        if (hours <= 0) return `${minutes}m left`
        return `${hours}h ${minutes}m left`
    }, [manualExpiryDate, isPersonalAutoMode, liveClock])

    const getFallbackOverrideDate = useCallback((tableName) => {
        if (!tableName) return null
        const [monthName, yearStr] = tableName.split('_')
        const yearNum = parseInt(yearStr, 10)
        if (!monthName || Number.isNaN(yearNum)) return null
        const sundays = getSundaysInMonth(monthName, yearNum)
        return sundays.length > 0 ? sundays[0] : null
    }, [getSundaysInMonth])

    const handlePersonalModeToggle = useCallback(async () => {
        if (personalModeDisabled) {
            toast.info('The workspace owner override is active right now, so personal manual mode is temporarily locked.')
            return
        }

        if (isPersonalAutoMode) {
            const ok = await setPersonalCalendarMode({
                mode: 'manual',
                tableName: currentTable,
                date: selectedAttendanceDate || manualSundayDate || new Date()
            })
            if (ok) {
                toast.info('Manual mode is on for 12 hours. You can now choose a month and Sunday yourself.')
            }
            return
        }

        const ok = await setPersonalCalendarMode({ mode: 'auto' })
        if (ok) {
            toast.success('Auto mode is back on. Your month and Sunday will follow the live schedule again.')
        }
    }, [
        personalModeDisabled,
        isPersonalAutoMode,
        setPersonalCalendarMode,
        currentTable,
        selectedAttendanceDate,
        manualSundayDate
    ])

    const handlePersonalSundaySelection = useCallback(async ({ table, date }) => {
        if (personalModeDisabled) {
            toast.info('The workspace owner override is active right now, so personal manual mode is temporarily locked.')
            return
        }

        if (isPersonalAutoMode) {
            toast.info('Turn Auto off first before manually picking a month and Sunday.')
            return
        }

        setShowPersonalMonthPicker(false)
        const ok = await setPersonalCalendarMode({
            mode: 'manual',
            tableName: table || currentTable,
            date: date || selectedAttendanceDate || new Date(),
            silent: true
        })
        if (!ok) return

        toast.success('Manual month and Sunday updated.')
    }, [
        personalModeDisabled,
        isPersonalAutoMode,
        setPersonalCalendarMode,
        currentTable,
        selectedAttendanceDate
    ])

    const handleEnableOverride = async (tableName = currentTable, sundayDate = selectedAttendanceDate, options = {}) => {
        const { showToast = true } = options
        if (!hasAdminAccess) {
            console.log('[SETTINGS] handleEnableOverride: No admin access')
            return
        }
        const targetTable = tableName || currentTable
        const targetDate = sundayDate || selectedAttendanceDate || getFallbackOverrideDate(targetTable) || new Date()
        console.log('[SETTINGS] handleEnableOverride called:', { targetTable, targetDate, hasAdminAccess })
        setIsOverrideSaving(true)
        try {
            const ok = await setCollaboratorOverride({
                enabled: true,
                tableName: targetTable,
                date: targetDate
            })
            console.log('[SETTINGS] setCollaboratorOverride returned:', ok)
            if (ok) {
                if (showToast) {
                    toast.success('Override enabled for all collaborators')
                }
            } else {
                if (showToast) {
                    toast.error('Failed to enable override')
                }
            }
            return ok
        } catch (err) {
            console.error('[SETTINGS] Error in handleEnableOverride:', err)
            if (showToast) {
                toast.error('Error: ' + (err?.message || 'Failed to enable override'))
            }
        } finally {
            setIsOverrideSaving(false)
        }
    }

    const handleOverrideSundaySelect = useCallback(async ({ table, date }) => {
        if (!table || !date) return
        setShowOverridePicker(false)
        await handleEnableOverride(table, date)
    }, [handleEnableOverride])

    const handleDisableOverride = async () => {
        if (!hasAdminAccess) return
        setIsOverrideSaving(true)
        try {
            const ok = await setCollaboratorOverride({ enabled: false })
            if (ok) {
                toast.info('Override disabled. Returning to auto mode.')
            } else {
                toast.error('Failed to disable override')
            }
        } finally {
            setIsOverrideSaving(false)
        }
    }

    const handleAdminSundaySelection = async (sunday, table) => {
        if (!hasAdminAccess || !table) return
        if (!isOverrideActive) {
            toast.info('Enable Override All to change Sundays for everyone')
            return
        }
        if (table !== currentTable) {
            setCurrentTable(table)
        }
        if (isOverrideActive) {
            await handleEnableOverride(table, sunday, { showToast: false })
            return
        }
        setAndSaveAttendanceDate(sunday, table)
    }

    const renderAccountSection = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Account Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account information and security</p>
            </div>

            {/* Profile Card */}
            <div
                data-setting-id="profile_photo"
                tabIndex={-1}
                className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 ${getSettingTargetClass('profile_photo')}`}
            >
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        {(() => {
                            const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_avatar_url') : null
                            const avatarUrl = localAvatar || user?.user_metadata?.avatar_url
                            return avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"
                                />
                            ) : (
                                <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )
                        })()}
                        {/* Edit photo button - available for all users */}
                        <button
                            onClick={() => setIsPhotoEditorOpen(true)}
                            className="absolute -bottom-1 -right-1 p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-colors btn-press"
                            title="Change photo"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                    <div
                        data-setting-id="account_name"
                        tabIndex={-1}
                        className={`flex-1 min-w-0 ${getSettingTargetClass('account_name')}`}
                    >
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </h4>
                        <p
                            data-setting-id="account_email"
                            tabIndex={-1}
                            className={`text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate ${getSettingTargetClass('account_email')}`}
                        >
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user?.email}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
    {user?.app_metadata?.provider === 'google' ? 'Signed in with Google' : 'Email and password account'}
</p>
                    </div>
                </div>
            </div>

            <div
                data-setting-id="app_version"
                tabIndex={-1}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${getSettingTargetClass('app_version')}`}
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">App Version</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Current install: <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {installedAppInfo ? `${installedAppInfo.versionName} (${installedAppInfo.versionCode || 'web'})` : 'Loading...'}
                            </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            APK mode: <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {installedAppInfo?.runtimeMode || 'Website'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    <div
                        data-setting-id="date_of_birth"
                        tabIndex={-1}
                        className={`p-4 flex items-center justify-between ${getSettingTargetClass('date_of_birth')}`}
                    >
                        <div className="flex-1">
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date of Birth
                            </label>
                            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                                <div className="w-full max-w-xs">
                                    <React.Suspense fallback={<div className="h-11 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />}>
                                        <CombinedDatePicker
                                            name="account_date_of_birth"
                                            value={dob}
                                            onChange={(event) => setDob(event.target.value)}
                                            placeholder="Select date of birth"
                                        />
                                    </React.Suspense>
                                </div>
                                <button
                                    onClick={handleSaveDob}
                                    disabled={isDobSaving || dob === (user?.user_metadata?.date_of_birth || '')}
                                    className={`min-h-[44px] px-3 py-2 text-sm rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                                        isDobSaving || dob === (user?.user_metadata?.date_of_birth || '')
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                    }`}
                                >
                                    {isDobSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isDobSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Security
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    <div
                        data-setting-id="password"
                        tabIndex={-1}
                        className={`p-4 flex items-center justify-between ${getSettingTargetClass('password')}`}
                    >
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    Password
                                    {window.__needsPasswordSetup && (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                            Action needed
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user?.app_metadata?.provider === 'google'
                                        ? 'Managed by Google'
                                        : window.__needsPasswordSetup
                                        ? 'Set up a password for email login'
                                        : 'Change your password'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (user?.app_metadata?.provider === 'google') {
                                    toast.info('Your account is secured via Google. Manage it at myaccount.google.com')
                                } else if (window.__needsPasswordSetup && window.__openSetPassword) {
                                    window.__openSetPassword()
                                } else {
                                    try {
                                        await resetPassword(user?.email)
                                    } catch (err) {
                                        // Error toast is already shown by resetPassword
                                    }
                                }
                            }}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                window.__needsPasswordSetup
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {user?.app_metadata?.provider === 'google' ? 'View' : window.__needsPasswordSetup ? 'Set Up' : 'Change'}
                        </button>
                    </div>
                    {user?.app_metadata?.provider !== 'google' && (
                        <div
                            data-setting-id="set_password"
                            tabIndex={-1}
                            className={`p-4 flex items-center justify-between ${getSettingTargetClass('set_password')}`}
                        >
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Create Password</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Open the password setup screen</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.__openSetPassword) {
                                        window.__openSetPassword()
                                    } else {
                                        toast.info('Password setup is not available right now')
                                    }
                                }}
                                className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    )}
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sign Out</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderWorkspacePanel = (panelKey, title, description, iconClassName, icon, children) => {
        const Icon = icon
        const panelSettingIds = {
            overview: 'workspace_stats',
            controls: 'auto_all_dates',
            months: 'current_month'
        }
        const panelSettingId = panelSettingIds[panelKey]

        return (
            <div
                data-setting-id={panelSettingId}
                tabIndex={-1}
                className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${getSettingTargetClass(panelSettingId)}`}
            >
                <button
                    type="button"
                    onClick={() => toggleWorkspacePanel(panelKey)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl ${iconClassName}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${workspacePanels[panelKey] ? 'rotate-180' : ''}`} />
                </button>
                {workspacePanels[panelKey] && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                        {children}
                    </div>
                )}
            </div>
        )
    }

    const renderWorkspaceSection = () => {
        const renderWorkspacePanel = (panelKey, title, description, iconClassName, icon, children) => {
            const Icon = icon
            const panelSettingIds = {
                overview: 'workspace_stats',
                controls: 'auto_all_dates',
                months: 'current_month'
            }
            const panelSettingId = panelSettingIds[panelKey]

            return (
                <div
                    data-setting-id={panelSettingId}
                    tabIndex={-1}
                    className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${getSettingTargetClass(panelSettingId)}`}
                >
                    <button
                        type="button"
                        onClick={() => toggleWorkspacePanel(panelKey)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl ${iconClassName}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${workspacePanels[panelKey] ? 'rotate-180' : ''}`} />
                    </button>
                    {workspacePanels[panelKey] && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                            {children}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Workspace Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure your workspace and organization</p>
            </div>

            {renderWorkspacePanel(
                'overview',
                'Workspace Overview',
                'See your current workspace and the main numbers at a glance.',
                'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                Building2,
                <>
                    <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl p-4 text-white mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Current Workspace</p>
                                <h4 className="font-semibold text-lg">{preferences?.workspace_name || 'TMH Teen Ministry'}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] grid-animate">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center bg-gray-50 dark:bg-gray-900/40">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{members?.length || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center bg-gray-50 dark:bg-gray-900/40">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyTables?.length || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Databases</p>
                        </div>
                    </div>
                </>
            )}


            {renderWorkspacePanel(
                'months',
                'Month & Sunday',
                'One place for the live month, your personal override, and new months.',
                'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                Calendar,
                <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Current Month</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Select active month database</p>
                                </div>
                            </div>
                        </div>

                        <div
                            data-setting-id="personal_calendar"
                            tabIndex={-1}
                            className={`mb-4 rounded-2xl border p-3 transition-colors ${getSettingTargetClass('personal_calendar')} ${isPersonalAutoMode
                                ? 'border-emerald-200/70 dark:border-emerald-700/60 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 dark:from-emerald-900/20 dark:via-gray-900/40 dark:to-teal-900/20'
                                : 'border-red-200/70 dark:border-red-700/60 bg-gradient-to-r from-red-50/90 via-orange-50/80 to-white dark:from-red-900/20 dark:via-orange-900/20 dark:to-gray-900/40'
                            }`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className={`text-sm font-semibold ${isPersonalAutoMode ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
                                        Personal Calendar Mode
                                    </p>
                                    <p className={`text-xs mt-1 ${isPersonalAutoMode ? 'text-emerald-800/80 dark:text-emerald-200/80' : 'text-red-800/80 dark:text-red-200/80'}`}>
                                        {personalModeDisabled
                                            ? 'The workspace owner override is active, so your personal manual mode is temporarily locked.'
                                            : isPersonalAutoMode
                                                ? 'Auto is on. The app follows the live month and Sunday for you.'
                                                : `Manual mode is active${manualModeCountdown ? ` - ${manualModeCountdown}` : ''}. Your personal month and Sunday are saved until it switches back to auto.`}
                                    </p>
                                    {!isPersonalAutoMode && manualExpiryDate && (
                                        <p className="text-[11px] mt-2 text-red-700 dark:text-red-300">
                                            Manual until {manualExpiryDate.toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handlePersonalModeToggle}
                                    disabled={personalModeDisabled}
                                    className={`inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isPersonalAutoMode
                                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                            : 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                                        }`}
                                >
                                    <span className={`inline-flex h-5 w-10 items-center rounded-full px-0.5 transition-colors ${isPersonalAutoMode ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}>
                                        <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${isPersonalAutoMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </span>
                                    <span>{isPersonalAutoMode ? 'Auto On' : 'Manual On'}</span>
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    ref={personalMonthButtonRef}
                                    onClick={() => setShowPersonalMonthPicker(true)}
                                    disabled={personalModeDisabled}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isPersonalAutoMode
                                            ? 'border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-900/40 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                            : 'border border-red-200 dark:border-red-700 bg-white/80 dark:bg-gray-900/40 text-red-700 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }`}
                                >
                                    {isPersonalAutoMode ? 'View live month and Sunday' : 'Change month and Sunday'}
                                </button>
                                {!isPersonalAutoMode && (
                                    <button
                                        type="button"
                                        onClick={() => setPersonalCalendarMode({ mode: 'auto' })}
                                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Return to Auto Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {hasAdminAccess && (
                            <div className="mb-4 rounded-2xl border border-orange-200/70 dark:border-orange-700/60 bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-white dark:from-orange-900/30 dark:via-orange-900/20 dark:to-gray-900/40 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Collaborator Override</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            {isOverrideActive
                                                ? `Manual override is active for ${lockedDefaultDate || 'No date'}. Changing the selected Sunday updates everyone.`
                                                : 'Auto mode is active by default. Collaborators follow the normal Sunday calendar until you turn override on.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowOverridePicker(true)}
                                            ref={overrideButtonRef}
                                            disabled={isOverrideSaving}
                                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isOverrideActive
                                                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm ring-2 ring-orange-300/60'
                                                : 'border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 bg-white/80 dark:bg-gray-900/40 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                            }`}
                                        >
                                            {isOverrideSaving ? 'Saving...' : 'Override All'}
                                        </button>
                                        <button
                                            onClick={handleDisableOverride}
                                            disabled={isOverrideSaving || !isOverrideActive}
                                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isAutoMode
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-200/70'
                                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            Return To Auto
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {monthViewMode === 'list' ? (
                            <>
                                <div className="relative" ref={monthDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isPersonalAutoMode) {
                                            toast.info('Turn Auto off before manually changing the active month.')
                                            return
                                        }
                                        setShowMonthDropdown(prev => !prev)
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 border rounded-2xl shadow-lg focus:outline-none focus:ring-4 transition-all ${isPersonalAutoMode
                                            ? 'bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 border-emerald-200/80 dark:border-emerald-800/70 focus:ring-emerald-500/30'
                                            : 'bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border-red-200/80 dark:border-red-800/70 focus:ring-red-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-300">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Active Month</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {currentTable ? currentTable.replace('_', ' ') : 'Select month'}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isLiveNow
                                                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                                                        : 'bg-red-500/20 text-red-700 dark:text-red-300 animate-pulse'
                                                    }`}>
                                                    {isLiveNow ? 'Live' : 'Live Off'}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPersonalAutoMode
                                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-red-500/20 text-red-700 dark:text-red-300'
                                                    }`}>
                                                    {isPersonalAutoMode ? 'Auto' : 'Manual'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Live Sunday: {liveSundayDateKey}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 dark:text-gray-300 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                {showMonthDropdown && (
                                    <div className="absolute left-0 right-0 mt-2 z-30 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
                                        {monthlyTables && monthlyTables.length > 0 ? (
                                            monthlyTables.map(table => {
                                                const isActive = currentTable === table
                                                return (
                                                    <button
                                                        key={table}
                                                        type="button"
                                                        onClick={async () => {
                                                            if (isPersonalAutoMode) return
                                                            await setPersonalCalendarMode({
                                                                mode: 'manual',
                                                                tableName: table,
                                                                date: selectedAttendanceDate || manualSundayDate || new Date(),
                                                                silent: true
                                                            })
                                                            setShowMonthDropdown(false)
                                                        }}
                                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${isActive
                                                                ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200'
                                                                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <span>{table.replace('_', ' ')}</span>
                                                        <div className="flex items-center gap-2">
                                                            {isActive && (
                                                                <span className="text-xs font-semibold text-orange-600 dark:text-orange-200">Current</span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    requestDeleteTable(table)
                                                                }}
                                                                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                                disabled={deletingTable === table}
                                                                title={`Delete ${table.replace('_', ' ')}`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No months available</div>
                                        )}
                                    </div>
                                )}
                                </div>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            selection()
                                            if (onCreateMonth) onCreateMonth()
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create New Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isPersonalAutoMode) return
                                            setPersonalCalendarMode({ mode: 'auto' })
                                        }}
                                        disabled={isPersonalAutoMode}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {isPersonalAutoMode ? 'Auto Active' : 'Return To Auto'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {/* Year Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    {availableYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedYear === year
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>

                                {/* Calendar Grid for Selected Year */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => {
                                        const table = groupTablesByYear[selectedYear]?.find(m => m.month === month)?.table
                                        const exists = Boolean(table)
                                        const sundays = getSundaysInMonth(month, selectedYear)
                                        const isCurrent = table === currentTable
                                        return (
                                            <div
                                                key={month}
                                                onClick={() => {
                                                    if (exists) {
                                                        setCurrentTable(table)
                                                    } else {
                                                        handleQuickCreateMonth(month, selectedYear)
                                                    }
                                                }}
                                                className={`relative p-4 rounded-2xl border transition-all cursor-pointer shadow-sm backdrop-blur-sm ${isCurrent
                                                        ? 'border-orange-400 bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-700/20'
                                                        : exists
                                                            ? 'border-green-200/70 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 hover:border-green-400'
                                                            : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/60 dark:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-500'
                                                    } hover:-translate-y-1 hover:shadow-lg`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Month</p>
                                                        <p className={`text-lg font-semibold ${isCurrent
                                                                ? 'text-orange-700 dark:text-orange-200'
                                                                : exists
                                                                    ? 'text-emerald-800 dark:text-emerald-200'
                                                                    : 'text-gray-600 dark:text-gray-300'
                                                            }`}>
                                                            {month}
                                                        </p>
                                                    </div>
                                                    {exists ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${isCurrent
                                                                    ? isLiveNow
                                                                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                                                                        : 'bg-red-500/20 text-red-700 dark:text-red-300 animate-pulse'
                                                                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                                                                }`}>
                                                                {isCurrent ? (isLiveNow ? 'Live' : 'Live Off') : 'Saved'}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    requestDeleteTable(table)
                                                                }}
                                                                className={`p-1.5 rounded-full ${deletingTable === table
                                                                    ? 'bg-red-200/80 text-red-700 cursor-wait'
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40'
                                                                    } transition-colors`}
                                                                disabled={deletingTable === table}
                                                                title={`Delete ${month} ${selectedYear}`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleQuickCreateMonth(month, selectedYear)
                                                            }}
                                                            className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-1"
                                                            title={`Create ${month} ${selectedYear}`}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Create
                                                        </button>
                                                    )}
                                                </div>
                                                {/* Sunday badges */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    {sundays.slice(0, 12).map((sunday, i) => {
                                                        const sundayDateStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`
                                                        const isLocked = lockedDefaultDate === sundayDateStr
                                                        const isSelectedSunday = selectedDateKey === sundayDateStr
                                                        const isLiveSundayDate = sundayDateStr === liveSundayDateKey
                                                        const isLiveTargetDate = isCurrent && isLiveSundayDate && isLiveNow
                                                        const isLiveMismatchDate = isCurrent && isLiveSundayDate && !isLiveNow
                                                        return (
                                                            <div
                                                                key={`${month}-${i}`}
                                                                onClick={async (e) => {
                                                                    e.stopPropagation()
                                                                    if (!hasAdminAccess) return
                                                                    if (!exists) return
                                                                    await handleAdminSundaySelection(sunday, table)
                                                                }}
                                                                className={`rounded-xl px-2 py-2 flex flex-col items-center text-center shadow-inner transition-all ${
                                                                    isLocked
                                                                        ? 'bg-orange-600 text-white border-2 border-orange-400 ring-2 ring-orange-300/50 shadow-md cursor-pointer'
                                                                        : exists
                                                                            ? isCurrent
                                                                                ? `bg-white/80 dark:bg-white/10 text-orange-700 dark:text-orange-200 border border-orange-200/60 dark:border-orange-400/30 ${hasAdminAccess ? 'cursor-pointer hover:border-orange-400 hover:shadow-md' : ''}`
                                                                                : `bg-white/80 dark:bg-white/5 text-emerald-700 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-400/30 ${hasAdminAccess ? 'cursor-pointer hover:border-emerald-400 hover:shadow-md' : ''}`
                                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-dashed border-gray-300 dark:border-gray-600'
                                                                } ${
                                                                    isSelectedSunday && !isLocked ? 'ring-2 ring-orange-300 dark:ring-orange-400/70 shadow-md' : ''
                                                                } ${
                                                                    isLiveTargetDate ? 'ring-2 ring-green-400' : ''
                                                                } ${
                                                                    isLiveMismatchDate ? 'ring-2 ring-red-400 animate-pulse' : ''
                                                                }`}
                                                                title={isLocked
                                                                    ? `Locked: ${sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - tap to unlock`
                                                                    : sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                            >
                                                                {isLocked && <Lock className="w-3 h-3 mb-0.5" />}
                                                                <span className="text-[10px] uppercase tracking-wide opacity-70">Sun</span>
                                                                <span className="text-sm font-semibold leading-tight">{sunday.getDate()}</span>
                                                                {isSelectedSunday && !isLocked && (
                                                                    <span className="text-[9px] font-semibold mt-0.5 opacity-80">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                                {isLiveSundayDate && (
                                                                    <span className={`text-[9px] font-semibold mt-0.5 ${isLiveNow ? 'text-green-200 dark:text-green-300' : 'text-red-200 dark:text-red-300 animate-pulse'}`}>
                                                                        {isLiveNow ? 'LIVE' : 'OFF'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {exists
                                                        ? isCollaborator && !isAdminCollaborator
                                                            ? 'Tap to switch to this month.'
                                                            : 'Tap card to switch month. Turn on Override All, then tap a Sunday to update everyone.'
                                                        : 'Tap to create a fresh month with no data.'}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            )}
            </div>
        )
    }

    const renderTeamSection = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Team & Sharing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage who has access to your workspace</p>
            </div>

            {/* Admin Controls Card - Only for owners - moved to Workspace section */}
            {hasAdminAccess && (
                <div className="hidden bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Admin Controls</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set sticky month and Sunday dates for all collaborators</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdminControlsOpen(true)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Lock className="w-4 h-4" />
                        Admin Controls
                    </button>
                </div>
            )}


            {/* Share Access Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <UserPlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Invite Team Members</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Share access to your workspace with others</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Share Access
                </button>
            </div>

            {/* Always Visible Collaborators List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    People with Access ({collaborators.length})
                </h4>
                {fetchingCollaborators ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                    </div>
                ) : collaborators.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No collaborators yet</p>
                        <p className="text-xs mt-1">Click "Share Access" to invite someone</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {collaborators.map((collaborator) => (
                            <div
                                key={collaborator.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full"
                            >
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                        {collaborator.email.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {collaborator.email}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${collaborator.status === 'accepted'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : collaborator.status === 'rejected'
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                        {collaborator.status === 'accepted' ? 'Accepted' : collaborator.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteCollaborator(collaborator.id)}
                                    disabled={deletingCollaboratorId === collaborator.id}
                                    className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                                >
                                    {deletingCollaboratorId === collaborator.id ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Permissions Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Permission Levels
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400"><strong>Owner:</strong> Full access, can delete workspace</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400"><strong>Editor:</strong> Can view and edit data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400"><strong>Viewer:</strong> Read-only access</span>
                    </div>
                </div>
            </div>
        </div>
    )

    const offlineBadgeClass = offlineModeStatus === 'forced-offline'
        ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
        : offlineModeStatus === 'offline'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
            : offlineModeStatus === 'online-unavailable'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-200'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    const offlineBadgeDotClass = offlineModeStatus === 'forced-offline'
        ? 'bg-slate-500'
        : offlineModeStatus === 'offline'
            ? 'bg-amber-600'
            : offlineModeStatus === 'online-unavailable'
                ? 'bg-red-500'
                : 'bg-emerald-500'
    const offlineBadgeLabel = offlineModeStatus === 'forced-offline'
        ? 'Forced Offline'
        : offlineModeStatus === 'offline'
            ? 'Offline'
            : offlineModeStatus === 'online-unavailable'
                ? 'Online unavailable'
                : 'Online'
    const offlineCardAccentClass = isOfflineModeActive || offlineMode === 'offline'
        ? 'border-amber-300/90 dark:border-amber-800/70'
        : 'border-orange-200/80 dark:border-orange-900/60'

    const renderDataSection = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Data Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Export, import, and manage your data</p>
            </div>

            <div
                data-setting-id="offline_mode"
                tabIndex={-1}
                className={`relative overflow-hidden rounded-2xl border ${offlineCardAccentClass} bg-white dark:bg-gray-800 shadow-sm ${getSettingTargetClass('offline_mode')}`}
            >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />
                <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex-shrink-0">
                                    <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-gray-900 dark:text-white">Offline Mode</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${offlineBadgeClass}`}>
                                            <span className={`w-2 h-2 rounded-full ${offlineBadgeDotClass}`} />
                                            {offlineBadgeLabel}
                                        </span>
                                        {pendingSyncCount > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                {pendingSyncCount} pending
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 max-w-2xl">
                                        Cache members and attendance on this device, then keep attendance changes safe when the APK is offline.
                                    </p>
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mode:</span>
                                        <div className="inline-grid grid-cols-3 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50">
                                            {[
                                                { id: 'auto', label: 'Auto' },
                                                { id: 'online', label: 'Online' },
                                                { id: 'offline', label: 'Offline' }
                                            ].map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => setOfflineMode(mode.id)}
                                                    aria-pressed={offlineMode === mode.id}
                                                    className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition-colors ${
                                                        offlineMode === mode.id
                                                            ? mode.id === 'offline'
                                                                ? 'bg-slate-700 text-white shadow-sm dark:bg-slate-500'
                                                                : mode.id === 'online'
                                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                                    : 'bg-orange-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {offlineMode === 'auto'
                                                ? 'Auto switches based on network and cache.'
                                                : offlineMode === 'online'
                                                    ? 'Online uses live Supabase data.'
                                                    : 'Offline uses saved local data and queues attendance.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div className="rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Last cache</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {offlineCacheMeta?.cached_at ? new Date(offlineCacheMeta.cached_at).toLocaleString() : 'Not prepared yet'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cached data</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {offlineCacheMeta ? `${offlineCacheMeta.member_count} members` : 'No local cache'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {offlineCacheMeta ? `${offlineCacheMeta.attendance_date_count} attendance dates` : 'Download while online'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sync status</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {isSyncingOffline ? 'Syncing now' : pendingSyncCount > 0 ? `${pendingSyncCount} waiting` : 'Up to date'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {offlineMode === 'offline' ? 'Switch to Auto or Online to sync' : isOnline ? 'Ready when changes exist' : 'Will sync when online'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[260px] flex-shrink-0 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={prepareOfflineData}
                                    disabled={isPreparingOffline || !isOnline}
                                    className="min-h-[44px] px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:text-white/80 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    {isPreparingOffline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    {isPreparingOffline ? 'Preparing...' : 'Download Offline Data'}
                                </button>
                                <button
                                    type="button"
                                    onClick={syncOfflineChanges}
                                    disabled={isSyncingOffline || !isOnline || offlineMode === 'offline' || pendingSyncCount === 0}
                                    className="min-h-[44px] px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSyncingOffline ? 'animate-spin' : ''}`} />
                                    {isSyncingOffline ? 'Syncing...' : 'Sync Now'}
                                </button>
                                <button
                                    type="button"
                                    onClick={clearOfflineCacheData}
                                    disabled={isPreparingOffline || isSyncingOffline}
                                    className="min-h-[44px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear Cache
                                </button>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                {isOnline
                                    ? offlineMode === 'offline'
                                        ? 'Forced Offline is active. Attendance changes will stay in the pending queue.'
                                        : pendingSyncCount > 0
                                            ? 'You are online. Sync now to upload pending changes.'
                                            : 'You are online. Download data before using the APK offline.'
                                    : 'Offline changes stay on this device until you reconnect and sync.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export/Import */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                <button
                    data-setting-id="export_data"
                    onClick={() => setActiveSection('export')}
                    className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getSettingTargetClass('export_data')}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">Export Center</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select months, preview, reorder columns, export CSV</p>
                        </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>

                <button
                    data-setting-id="import_data"
                    onClick={() => toast.info('Import feature coming soon!')}
                    className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getSettingTargetClass('import_data')}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">Import Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Import members from CSV</p>
                        </div>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">Soon</span>
                </button>

                <button
                    data-setting-id="clean_duplicates"
                    onClick={() => toast.info('Duplicate cleanup is available from the Dashboard search tools.')}
                    className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getSettingTargetClass('clean_duplicates')}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">Clean Duplicates</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Find and merge duplicate members</p>
                        </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
            </div>

            {/* Archive Months */}
            {monthlyTables && monthlyTables.length > 0 && (
                <div
                    data-setting-id="archive_month"
                    tabIndex={-1}
                    className={getSettingTargetClass('archive_month')}
                >
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Archive className="w-4 h-4 text-amber-500" />
                        Archive Months
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Export data as CSV and remove from database to save storage space.
                        Use Export Center above if you just want a backup without deleting.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                        {monthlyTables.map(table => {
                            const isCurrent = table === currentTable
                            return (
                                <div key={table} className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {table.replace('_', ' ')}
                                        </span>
                                        {isCurrent && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setArchiveMonth(table)}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                    >
                                        Archive
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Storage Info */}
            <div
                data-setting-id="storage_limits"
                tabIndex={-1}
                className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 ${getSettingTargetClass('storage_limits')}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{monthlyTables?.length || 0} months</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((members?.length || 0) / 1000 * 100, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Free tier: 500 MB database. Archive old months to stay within limits.
                </p>
            </div>
        </div>
    )

    const renderAppearanceSection = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize how Datser looks</p>
            </div>


            {/* Theme Selection */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h4>
                <div className="grid grid-cols-3 gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] grid-animate">
                    {/* System Mode (Custom Slash) */}
                    <button
                        data-setting-id="theme_auto"
                        tabIndex={-1}
                        onClick={() => setThemeMode('system')}
                        className={`group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${getSettingTargetClass('theme_auto')} ${themeMode === 'system'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <div
                            className="w-16 h-16 rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 50%, #111827 50%)'
                            }}
                        />
                        <span className={`text-sm font-medium ${themeMode === 'system' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>System mode</span>
                    </button>

                    {/* Dark Mode (Black) */}
                    <button
                        data-setting-id="theme_dark"
                        tabIndex={-1}
                        onClick={() => setThemeMode('dark')}
                        className={`group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${getSettingTargetClass('theme_dark')} ${themeMode === 'dark'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 shadow-sm" />
                        <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>Dark mode</span>
                    </button>

                    {/* Light Mode (White) */}
                    <button
                        data-setting-id="theme_light"
                        tabIndex={-1}
                        onClick={() => setThemeMode('light')}
                        className={`group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${getSettingTargetClass('theme_light')} ${themeMode === 'light'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm" />
                        <span className={`text-sm font-medium ${themeMode === 'light' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>Light mode</span>
                    </button>

                </div>
            </div>

            {/* Quick Attendance Access removed */}
        </div>
    )

    const renderAccessibilitySection = () => (
        <div className="space-y-4">
            {renderWorkspacePanel(
                'controls',
                'Quick Controls',
                'The main switches and admin actions without repeated panels.',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                Zap,
                <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    {/* Auto-Sunday Settings */}
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">Automation Settings</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Configure auto-selection and attendance behavior</p>
                            </div>
                        </div>

                        {/* Auto-All-Dates Toggle */}
                        <div
                            data-setting-id="auto_all_dates"
                            tabIndex={-1}
                            className={`flex items-center justify-between ${getSettingTargetClass('auto_all_dates')}`}
                        >
                            <div className="flex-1">
                                <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    Auto-All-Dates
                                    {autoAllDatesEnabled && (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Active</span>
                                    )}
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    When enabled, automatically mark all dates up to today as present
                                </p>
                            </div>
                            <button
                                onClick={toggleAutoAllDates}
                                disabled={isCollaborator && !isAdminCollaborator && !autoAllDatesEnabled}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isCollaborator && !isAdminCollaborator && !autoAllDatesEnabled
                                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                        : autoAllDatesEnabled
                                            ? 'bg-primary-600'
                                            : 'bg-gray-200 dark:bg-gray-600'
                                    }`}
                                title={isCollaborator && !isAdminCollaborator && !autoAllDatesEnabled ? 'Auto-All-Dates is managed by workspace admin' : 'Toggle Auto-All-Dates'}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAllDatesEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div
                            data-setting-id="missing_info_prompt"
                            tabIndex={-1}
                            className={`flex items-center justify-between ${getSettingTargetClass('missing_info_prompt')}`}
                        >
                            <div className="flex-1">
                                <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    Missing Info Popup
                                    {missingInfoPromptEnabled ? (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">On</span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">Off</span>
                                    )}
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Ask for missing phone, age, level, or older attendance before marking present or absent
                                </p>
                            </div>
                            <button
                                onClick={toggleMissingInfoPrompt}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${missingInfoPromptEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                title="Toggle Missing Info Popup"
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${missingInfoPromptEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        <div
                            data-setting-id="guided_form_assistant"
                            tabIndex={-1}
                            className={`rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-900/10 p-3 space-y-3 ${getSettingTargetClass('guided_form_assistant')}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        Guided Form Assistant
                                        {guidedFormSettings?.enabled ? (
                                            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">On</span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">Off</span>
                                        )}
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Highlight the next field in Add Member, Edit Member, and Complete Missing Info.
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleGuidedFormSetting('enabled', 'Guided Form Assistant')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${guidedFormSettings?.enabled ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    title="Toggle Guided Form Assistant"
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${guidedFormSettings?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {[
                                    ['highlightNotes', 'Highlight Notes Section'],
                                    ['highlightTags', 'Highlight Tags Section'],
                                    ['autoFocusNextField', 'Auto Focus Next Field'],
                                    ['autoScrollToActiveField', 'Auto Scroll To Active Field'],
                                    ['pulseNextButton', 'Pulse Next Button'],
                                    ['manualNextAfterTyping', 'Require Tap Next After Typing'],
                                    ['attendanceAutoPresent', 'Attendance Auto-Present Logic']
                                ].map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleGuidedFormSetting(key, label)}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-left"
                                    >
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
                                        <span className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${guidedFormSettings?.[key] ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${guidedFormSettings?.[key] ? 'translate-x-4' : 'translate-x-1'}`} />
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-3 space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Show Assistant In</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose which forms show the Next guidance button.</p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {[
                                        ['showInAddMember', 'Add New Member'],
                                        ['showInEditMember', 'Edit Member'],
                                        ['showInMissingInfo', 'Complete Missing Info']
                                    ].map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => toggleGuidedFormSetting(key, label)}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-left"
                                        >
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
                                            <span className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${guidedFormSettings?.[key] !== false ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${guidedFormSettings?.[key] !== false ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Customize Guided Order</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Drag rows or use arrows for mobile sorting.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetGuidedOrder}
                                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {guidedOrder.map((fieldId, index) => {
                                            const muted = (fieldId === 'tags' && !guidedFormSettings?.highlightTags) || (fieldId === 'notes' && !guidedFormSettings?.highlightNotes)
                                            return (
                                                <div
                                                    key={fieldId}
                                                    draggable
                                                    onDragStart={() => setGuidedOrderDragId(fieldId)}
                                                    onDragOver={(event) => event.preventDefault()}
                                                    onDrop={(event) => {
                                                        event.preventDefault()
                                                        moveGuidedOrderItemTo(guidedOrderDragId, fieldId)
                                                        setGuidedOrderDragId(null)
                                                    }}
                                                    onDragEnd={() => setGuidedOrderDragId(null)}
                                                    className={`guided-order-row ${guidedOrderDragId === fieldId ? 'guided-order-row-dragging' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="guided-order-handle" aria-hidden="true">
                                                            <GripVertical className="w-4 h-4" />
                                                        </span>
                                                        <span className="guided-order-index">{index + 1}</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{GUIDED_FORM_FIELD_LABELS[fieldId]}</p>
                                                            {muted && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Shown in preview, skipped by guide unless enabled</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveGuidedOrderItem(fieldId, -1)}
                                                            disabled={index === 0}
                                                            className="guided-order-arrow"
                                                            aria-label={`Move ${GUIDED_FORM_FIELD_LABELS[fieldId]} up`}
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveGuidedOrderItem(fieldId, 1)}
                                                            disabled={index === guidedOrder.length - 1}
                                                            className="guided-order-arrow"
                                                            aria-label={`Move ${GUIDED_FORM_FIELD_LABELS[fieldId]} down`}
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <GuidedOrderPreview settings={{ ...guidedFormSettings, guidedOrder }} />
                            </div>
                        </div>

                        {/* Collaborator Notice */}
                        {isCollaborator && !isAdminCollaborator && !autoAllDatesEnabled && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-amber-700 dark:text-amber-300">
                                        <p className="font-medium mb-1">Workspace Admin Control</p>
                                        <p>Automation settings are managed by the workspace administrator. Contact your admin to enable these features.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <button
                        onClick={() => setIsWorkspaceModalOpen(true)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">Edit Workspace</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Change name and preferences</p>
                            </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* Admin Controls (Sticky Month & Sunday) */}
                    {hasAdminAccess && (
                        <div
                            data-setting-id="admin_controls"
                            tabIndex={-1}
                            className={`p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${getSettingTargetClass('admin_controls')}`}
                            onClick={() => setIsAdminControlsOpen(true)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">Admin Controls</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Set sticky month and Sunday dates</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </div>
                    )}
                    </div>
                </div>
            )}
            {/* Command Menu Settings */}
            <div
                data-setting-id="command_menu"
                tabIndex={-1}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${getSettingTargetClass('command_menu')}`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-green-500" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Command Menu</h4>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-gray-900 dark:text-white">Enable Command Menu</label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + K to open quick navigation
                            </p>
                        </div>
                        <button
                            onClick={() => setCommandKEnabled(!commandKEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${commandKEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${commandKEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {commandKEnabled && (
                        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + K</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                Use Command Menu to quickly navigate to any page, search members, or access settings without clicking through menus.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div
                data-setting-id="notifications"
                tabIndex={-1}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${getSettingTargetClass('notifications')}`}
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <BellRing className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">In-App Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            DatSer uses in-app banners and toast messages for offline status, sync progress, and important alerts. Android system notifications are not enabled yet, so no phone notification permission is required.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderDangerSection = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible and destructive actions</p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-red-700 dark:text-red-400">Delete Account</h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-3">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                            onClick={() => setIsDeleteAccountOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderDeveloperSection = () => {
        const isExecutive = preferences?.role === 'executive' || preferences?.is_executive === true
        const launcherButtons = [
            {
                id: 'add-member',
                label: 'Open Add Member',
                description: 'Jump straight into the member form modal.',
                icon: Plus,
                action: onOpenAddMember
            },
            {
                id: 'create-month',
                label: 'Open Create Month',
                description: 'Test the carry-over flow and month setup modal.',
                icon: Calendar,
                action: onCreateMonth
            },
            {
                id: 'share-access',
                label: 'Open Share Access',
                description: 'Check collaborator invite and access UI.',
                icon: UserPlus,
                action: () => setIsShareModalOpen(true)
            },
            {
                id: 'workspace-settings',
                label: 'Open Workspace Settings',
                description: 'Test workspace configuration modal behavior.',
                icon: Building2,
                action: () => setIsWorkspaceModalOpen(true)
            },
            {
                id: 'export-center',
                label: 'Open Export Center',
                description: 'Jump into export/download flows without leaving Settings.',
                icon: Download,
                action: () => setActiveSection('export')
            },
            {
                id: 'onboarding',
                label: 'Open Onboarding',
                description: 'Replay the onboarding wizard for a quick walkthrough.',
                icon: Sparkles,
                action: () => window.openOnboarding?.()
            },
            {
                id: 'dashboard',
                label: 'Go To Dashboard',
                description: 'Return to the main working screen in one tap.',
                icon: Monitor,
                action: () => window.openDashboard?.()
            }
        ]

        if (isExecutive) {
            launcherButtons.push({
                id: 'executive',
                label: 'Open Executive View',
                description: 'Check the executive attendance page quickly.',
                icon: ClipboardList,
                action: () => window.openExecutive?.()
            })
        }

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Developer Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        A small in-app test bench for the flows that usually break when you are rushing.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Use this before shipping</h4>
                            <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
                                Tap through the launchers below, confirm forms open correctly, then run <code>npm run test:preflight</code> for a safer final check.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Quick Launchers</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Open the important screens directly instead of clicking around the whole app.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedLauncherId}
                                onChange={(e) => setSelectedLauncherId(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                                data-testid="dev-launcher-select"
                            >
                                <option value="">Choose a screen to open</option>
                                {launcherButtons.map((button) => (
                                    <option key={button.id} value={button.id}>
                                        {button.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    const launcher = launcherButtons.find((button) => button.id === selectedLauncherId)
                                    if (!launcher) return
                                    openDeveloperAction(launcher.action, launcher.label)
                                    setSelectedLauncherId('')
                                }}
                                disabled={!selectedLauncherId}
                                data-testid="dev-launcher-open"
                                className="sm:w-auto px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                            >
                                Open
                            </button>
                        </div>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Available launchers</p>
                            <div className="space-y-1.5">
                                {launcherButtons.map((button) => (
                                    <div key={button.id} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-900 dark:text-white">{button.label}</span>
                                        <span className="text-gray-500 dark:text-gray-400">- {button.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Interaction Sandbox</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Use this area to test tricky controls like the date picker without risking real member data.
                        </p>
                    </div>

                    <React.Suspense fallback={<LazyPanelFallback />}>
                        <CombinedDatePicker
                            name="dev_sandbox_date"
                            label="Sandbox Date Picker"
                            value={devSandboxDate}
                            onChange={handleDevSandboxChange}
                            placeholder="Select a test date"
                        />
                    </React.Suspense>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                selection()
                                setDevSandboxDate('')
                                setDevLastPayload('No interaction yet')
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            Reset Sandbox
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Current value: <span className="font-medium text-gray-900 dark:text-white">{devSandboxDate || 'empty'}</span>
                        </span>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Last emitted payload</p>
                        <pre className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">{devLastPayload}</pre>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BellRing className="w-4 h-4 text-primary-500" />
                                Notification Tester
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Fire a burst of sample alerts to check the stacked mobile notification tray.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={runNotificationStackTester}
                            data-testid="dev-notification-stack-test"
                            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <BellRing className="w-4 h-4" />
                            Test Stack
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/20">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-5 h-5 text-indigo-500" />
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Automated QA Bench</h4>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Run complete automated test flows to verify UI functionality and database integrity.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                                devQaStatus === 'passed'
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                                    : devQaStatus === 'failed'
                                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                        : devQaStatus === 'running'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            }`}>
                                {devQaStatus === 'passed' && <CheckCircle className="w-3.5 h-3.5" />}
                                {devQaStatus === 'failed' && <AlertTriangle className="w-3.5 h-3.5" />}
                                {devQaStatus === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {devQaStatus === 'passed' ? 'Last QA Passed'
                                    : devQaStatus === 'failed' ? 'Last QA Failed'
                                    : devQaStatus === 'running' ? 'QA Running...'
                                    : 'Idle'}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    selection()
                                    setIsDevQaModalOpen(true)
                                    setIsDevQaMinimized(false)
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <Monitor className="w-4 h-4" />
                                Monitor
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Standard QA Card */}
                            <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4">
                                <div className="mb-3">
                                    <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-primary-500" />
                                        UI Flow Simulation
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        Visibly opens modals and types data. Verifies the Add, Edit, and Delete lifecycle.
                                    </p>
                                </div>
                                <div className="mt-auto space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            devQaDeepModeRef.current = false
                                            runDeveloperMemberQa()
                                        }}
                                        disabled={devQaStatus === 'running'}
                                        data-testid="dev-run-member-qa"
                                        className="w-full px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {devQaStatus === 'running' && !devQaDeepModeRef.current ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Quick QA (Automated)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            devQaDeepModeRef.current = true
                                            runDeveloperMemberQa()
                                        }}
                                        disabled={devQaStatus === 'running' || !currentTable}
                                        className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {devQaStatus === 'running' && devQaDeepModeRef.current ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                                        Deep QA + Manual Check
                                    </button>
                                </div>
                            </div>

                            {/* Batch QA Card */}
                            <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4">
                                <div className="mb-3">
                                    <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Database className="w-4 h-4 text-emerald-500" />
                                        Batch Insertion Stress Test
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        Bypasses UI to directly insert bulk data. Provides combined SQL to verify.
                                    </p>
                                </div>
                                <div className="mt-auto pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center gap-3">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Runs:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={devQaBatchCount}
                                            onChange={(e) => setDevQaBatchCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                            disabled={devQaStatus === 'running'}
                                            className="w-16 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-center text-gray-900 dark:text-white focus:ring-2 disabled:opacity-50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={runBatchMemberQa}
                                        disabled={devQaStatus === 'running' || !currentTable}
                                        className="flex-1 h-9 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {devQaStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Run Batch QA
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Pencil className="w-4 h-4 text-cyan-500" />
                                        Existing Member QA
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Pick one real member and run a focused editability test or a separate badge and tag test.
                                    </p>
                                </div>
                                <div className="relative w-full lg:max-w-sm" ref={devMemberDropdownRef}>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                                        Target member
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            selection()
                                            setIsDevMemberDropdownOpen((value) => !value)
                                        }}
                                        disabled={devQaStatus === 'running' || devQaExistingMemberOptions.length === 0}
                                        data-testid="dev-member-picker-toggle"
                                        aria-haspopup="listbox"
                                        aria-expanded={isDevMemberDropdownOpen}
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
                                    >
                                        <span className="truncate">
                                            {selectedDevQaMember
                                                ? `${selectedDevQaMember.name}${selectedDevQaMember.missingCount > 0 ? ` (${selectedDevQaMember.missingCount} missing)` : ' (ready)'}`
                                                : 'No members available yet'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isDevMemberDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDevMemberDropdownOpen && devQaExistingMemberOptions.length > 0 && (
                                        <div
                                            role="listbox"
                                            className="absolute z-[70] mt-2 w-[min(24rem,calc(100vw-2rem))] max-h-56 overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 shadow-2xl backdrop-blur-md p-1.5"
                                            data-testid="dev-member-picker-list"
                                        >
                                            {devQaExistingMemberOptions.map((member) => {
                                                const isSelected = member.id === devQaSelectedMemberId
                                                return (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        onClick={() => {
                                                            selection()
                                                            setDevQaSelectedMemberId(member.id)
                                                            setIsDevMemberDropdownOpen(false)
                                                        }}
                                                        className={`w-full min-h-10 px-3 py-2 rounded-xl text-left text-sm transition-colors flex items-center justify-between gap-3 ${
                                                            isSelected
                                                                ? 'bg-primary-50 text-primary-900 dark:bg-primary-500/15 dark:text-primary-100'
                                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <span className="min-w-0 truncate font-medium">{member.name}</span>
                                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                            member.missingCount > 0
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                                                        }`}>
                                                            {member.missingCount > 0 ? `${member.missingCount} missing` : 'ready'}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={runExistingMemberEditQa}
                                    disabled={devQaStatus === 'running' || !devQaSelectedMemberId}
                                    data-testid="dev-run-existing-edit-qa"
                                    className="px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {devQaStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                                    Existing Member Edit QA
                                </button>
                                <button
                                    type="button"
                                    onClick={runBadgeTagQa}
                                    disabled={devQaStatus === 'running' || !devQaSelectedMemberId}
                                    data-testid="dev-run-badge-tag-qa"
                                    className="px-3 py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {devQaStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                    Badge + Tag QA
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">QA Queue</p>
                        <div className="space-y-2 mb-4 max-h-[14rem] overflow-y-auto pr-1">
                            {devQaQueue.map((step) => (
                                <div key={step.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white/70 dark:bg-gray-950/40">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{step.label}</p>
                                        {step.detail && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.detail}</p>
                                        )}
                                    </div>
                                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${
                                        step.status === 'passed'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : step.status === 'failed'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                : step.status === 'running'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                        {step.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Latest QA Report</p>
                            <button
                                type="button"
                                onClick={() => copyTextToClipboard(devQaReport, 'QA report copied to clipboard')}
                                className="px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Copy Report
                            </button>
                        </div>
                        <div className="max-h-[16rem] overflow-y-auto rounded-lg bg-white/60 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-700 p-3">
                            <pre className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">{devQaReport}</pre>
                        </div>
                    </div>
                </div>

                {isDevQaModalOpen && !isDevQaMinimized && (
                    <div className="fixed bottom-4 right-4 z-[95] w-[min(24rem,calc(100vw-1.5rem))] max-h-[min(30rem,calc(100vh-2rem))] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-950/95 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Developer QA Monitor</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Non-blocking live view while the real add and edit modals are operated on screen.
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        selection()
                                        setIsDevQaMinimized(true)
                                    }}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Minimize QA monitor"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        selection()
                                        setIsDevQaModalOpen(false)
                                        setIsDevQaMinimized(false)
                                    }}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Close QA monitor"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 min-h-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                    devQaStatus === 'passed'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        : devQaStatus === 'failed'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : devQaStatus === 'running'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                    {devQaStatus === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {devQaStatus === 'passed' && <CheckCircle className="w-4 h-4" />}
                                    {devQaStatus === 'failed' && <AlertTriangle className="w-4 h-4" />}
                                    {devQaStatus === 'idle' && <Monitor className="w-4 h-4" />}
                                    {devQaStatus === 'passed'
                                        ? 'Passed'
                                        : devQaStatus === 'failed'
                                            ? 'Failed'
                                            : devQaStatus === 'running'
                                                ? 'Running'
                                                : 'Ready'}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    You can keep watching the actual website popups behind this panel.
                                </p>
                            </div>

                            <div ref={devQaQueueScrollRef} className="space-y-2 max-h-[10rem] overflow-y-auto pr-1">
                                {devQaQueue.map((step) => (
                                    <div key={step.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 bg-white/60 dark:bg-gray-900/40">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-900 dark:text-white">{step.label}</p>
                                            {step.detail && (
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{step.detail}</p>
                                            )}
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${
                                            step.status === 'passed'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : step.status === 'failed'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    : step.status === 'running'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                            {step.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {devQaPausedSql && (
                                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-300 dark:border-indigo-700 p-3 space-y-3 animate-pulse-once">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                            {devQaPausedLabel || 'Supabase Verification'}
                                        </p>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {Math.floor(devQaCountdown / 60)}:{String(devQaCountdown % 60).padStart(2, '0')}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                                        Copy this SQL, open your Supabase SQL Editor, and run it to verify the data. Press Continue when done, or let the countdown auto-resume the QA flow.
                                    </p>
                                    <div className="relative">
                                        <pre className="text-[11px] text-indigo-900 dark:text-indigo-100 whitespace-pre-wrap break-words bg-white/80 dark:bg-gray-950/60 rounded-lg p-2.5 border border-indigo-100 dark:border-indigo-800/50 font-mono max-h-[8rem] overflow-y-auto">{devQaPausedSql}</pre>
                                        <button
                                            type="button"
                                            onClick={() => copyTextToClipboard(devQaPausedSql, 'SQL copied to clipboard')}
                                            className="absolute top-1.5 right-1.5 px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-800/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-700/60 transition-colors text-[10px] font-semibold"
                                        >
                                            Copy SQL
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDevQaResume}
                                        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        Continue - I've verified in Supabase
                                    </button>
                                </div>
                            )}

                            <div ref={devQaReportScrollRef} className="rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 max-h-[12rem] overflow-y-auto">
                                <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">{devQaReport}</pre>
                            </div>
                        </div>
                    </div>
                )}

                {isDevQaModalOpen && isDevQaMinimized && (
                    <button
                        type="button"
                        onClick={() => {
                            selection()
                            setIsDevQaMinimized(false)
                        }}
                        className="fixed bottom-4 right-4 z-[95] inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-950/95 shadow-xl backdrop-blur-md px-4 py-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        <Monitor className="w-4 h-4" />
                        <span>QA Monitor</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            devQaStatus === 'passed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : devQaStatus === 'failed'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : devQaStatus === 'running'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                            {devQaStatus}
                        </span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Suggested Test Order</h4>
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>1. Run Add + Edit QA and confirm it passes cleanly.</p>
                        <p>2. Open Create Month and test each carry-over option card.</p>
                        <p>3. Open Share Access and confirm invite actions still feel correct.</p>
                        <p>4. Run <code>npm run test:preflight</code> before you push.</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'account': return renderAccountSection()
            case 'workspace': return renderWorkspaceSection()
            case 'team': return renderTeamSection()
            case 'data': return renderDataSection()
            case 'export': return (
                <React.Suspense fallback={<LazyPanelFallback />}>
                    <ExportCenterPage onBack={() => setActiveSection(null)} />
                </React.Suspense>
            )
            case 'appearance': return renderAppearanceSection()
            case 'accessibility': return renderAccessibilitySection()
            case 'activity': return (
                <React.Suspense fallback={<LazyPanelFallback />}>
                    <ActivityLogViewer />
                </React.Suspense>
            )
            case 'danger': return renderDangerSection()
            case 'developer': return renderDeveloperSection()
            default: return renderAccountSection()
        }
    }



    // Settings sections and searchable items come from the shared registry used by Ctrl+K.
    const sections = useMemo(
        () => getVisibleSettingsSections(isDeveloperToolsEnabled),
        [isDeveloperToolsEnabled]
    )

    const visibleRegistryItems = useMemo(
        () => getVisibleSettingsSearchItems(isDeveloperToolsEnabled),
        [isDeveloperToolsEnabled]
    )

    const handleSettingsItemAction = useCallback((item) => {
        const preferredMonth = currentTable || oldestMonthTable?.table_name || monthlyTables?.[monthlyTables.length - 1] || null

        switch (item.id) {
            case 'profile_photo':
                navigateToSetting('account', item.id)
                setIsPhotoEditorOpen(true)
                return
            case 'set_password':
                navigateToSetting('account', item.id)
                window.setTimeout(() => {
                    if (window.__openSetPassword) {
                        window.__openSetPassword()
                    } else {
                        toast.info('Password setup is not available right now')
                    }
                }, 150)
                return
            case 'edit_workspace':
                navigateToSetting('workspace', item.id)
                setIsWorkspaceModalOpen(true)
                return
            case 'admin_controls':
                navigateToSetting('workspace', item.id)
                setIsAdminControlsOpen(true)
                return
            case 'invite_team':
                navigateToSetting('team', item.id)
                setIsShareModalOpen(true)
                return
            case 'export_data':
                navigateToSetting('data', item.id)
                setIsExportModalOpen(true)
                return
            case 'import_data':
                navigateToSetting('data', item.id)
                toast.info('Import feature coming soon!')
                return
            case 'clean_duplicates':
                navigateToSetting('data', item.id)
                toast.info('Duplicate cleanup is available from the Dashboard search tools.')
                return
            case 'archive_month':
                navigateToSetting('data', item.id)
                if (preferredMonth) setArchiveMonth(preferredMonth)
                return
            case 'storage_limits':
                navigateToSetting('data', item.id)
                setShowStorageLimits(true)
                setShowUsageDetails(true)
                return
            case 'theme_light':
                setThemeMode('light')
                navigateToSetting('appearance', item.id)
                return
            case 'theme_dark':
                setThemeMode('dark')
                navigateToSetting('appearance', item.id)
                return
            case 'theme_auto':
                setThemeMode('system')
                navigateToSetting('appearance', item.id)
                return
            case 'help_center':
                setShowHelpCenter(true)
                return
            case 'delete_account':
                navigateToSetting('danger', item.id)
                setIsDeleteAccountOpen(true)
                return
            default:
                navigateToSetting(item.section, item.id)
        }
    }, [
        currentTable,
        monthlyTables,
        navigateToSetting,
        oldestMonthTable,
        setThemeMode
    ])

    const dynamicItemDetails = useMemo(() => ({
        account_name: {
            description: 'Display name: ' + (user?.user_metadata?.full_name || 'User')
        },
        account_email: {
            description: 'Current email: ' + (user?.email || 'Not available')
        },
        app_version: {
            description: installedAppInfo
                ? 'Installed: ' + installedAppInfo.versionName + ' (' + (installedAppInfo.versionCode || 'web') + ') - ' + installedAppInfo.runtimeMode
                : 'View installed APK version and wrapper mode'
        },
        current_month: {
            description: 'Active: ' + (currentTable?.replace('_', ' ') || 'None')
        },
        offline_mode: {
            description: pendingSyncCount > 0
                ? 'Offline cache ready with ' + pendingSyncCount + ' pending change' + (pendingSyncCount === 1 ? '' : 's')
                : 'Download offline data, sync changes, or clear the local cache'
        },
        storage_limits: {
            description: dbUsage
                ? 'Database storage: ' + dbUsage.db_size_mb + ' / ' + DB_LIMIT_MB + ' MB'
                : 'Review database storage, free plan limits, and auth email limits'
        },
        command_menu: {
            description: 'Press ' + (navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl') + ' + K to open quick navigation'
        },
        manage_team: {
            description: 'View and manage ' + collaborators.length + ' collaborator' + (collaborators.length === 1 ? '' : 's')
        }
    }), [collaborators.length, currentTable, dbUsage, installedAppInfo, pendingSyncCount, user])

    const allSearchableItems = useMemo(() => visibleRegistryItems.map((item) => {
        const section = sections.find(candidate => candidate.id === item.section)
        const dynamic = dynamicItemDetails[item.id] || {}
        const merged = {
            ...item,
            ...dynamic,
            sectionLabel: section?.label || 'Settings',
            icon: item.icon || section?.icon || Search
        }
        return {
            ...merged,
            action: () => handleSettingsItemAction(merged)
        }
    }), [dynamicItemDetails, handleSettingsItemAction, sections, visibleRegistryItems])

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return []
        return searchSettingsIndex(searchQuery, allSearchableItems, sections)
    }, [searchQuery, allSearchableItems, sections])

    const getIconBgColor = (color) => {
        const colors = {
            blue: 'bg-orange-100 dark:bg-orange-900/30',
            purple: 'bg-purple-100 dark:bg-purple-900/30',
            green: 'bg-green-100 dark:bg-green-900/30',
            orange: 'bg-orange-100 dark:bg-orange-900/30',
            pink: 'bg-pink-100 dark:bg-pink-900/30',
            cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
            red: 'bg-red-100 dark:bg-red-900/30'
        }
        return colors[color] || colors.blue
    }

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-orange-600 dark:text-orange-400',
            purple: 'text-purple-600 dark:text-purple-400',
            green: 'text-green-600 dark:text-green-400',
            orange: 'text-orange-600 dark:text-orange-400',
            pink: 'text-pink-600 dark:text-pink-400',
            cyan: 'text-cyan-600 dark:text-cyan-400',
            red: 'text-red-600 dark:text-red-400'
        }
        return colors[color] || colors.blue
    }

    const getSettingTargetClass = (settingId) =>
        highlightedSettingId === settingId ? 'settings-search-target-highlight' : ''

    // Show Help Center Page
    if (showHelpCenter) {
        return (
            <React.Suspense fallback={<LazyPanelFallback />}>
                <HelpCenterPage
                    onBack={() => setShowHelpCenter(false)}
                    onNavigate={(target, options) => {
                        setShowHelpCenter(false)
                        if (target === 'dashboard' || target === 'settings') {
                            onBack?.()
                        }
                    }}
                />
            </React.Suspense>
        )
    }

    // Render main settings list (when no section is active)
    const renderMainList = () => (
        <div className="min-h-screen">
            {/* Header */}
            <div className="settings-detail-header-safe sticky z-30 w-full sm:-mx-4 sm:w-[calc(100%+2rem)] bg-white/85 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
                <div className="max-w-4xl mx-auto w-full px-3 sm:px-8 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4 font-[var(--font-family)]">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm touch-target"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-8 space-y-3">
                {/* Search Bar */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search settings... (e.g., 'change profile picture', 'make text bigger')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Usage / Free plan awareness */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-orange-200/70 dark:border-orange-900/50 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setShowStorageLimits(prev => !prev)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-orange-500" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Storage & Limits</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">Free Plan</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showStorageLimits ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {showStorageLimits && (
                        <div className="px-4 pb-4 space-y-4">
                            {/* Database Size Bar */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">Database Storage</span>
                                    {dbLoading ? (
                                        <span className="text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
                                    ) : dbUsage ? (
                                        <span className={`font-medium ${dbUsage.db_size_mb > DB_LIMIT_MB * 0.8 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {dbUsage.db_size_mb} / {DB_LIMIT_MB} MB ({Math.round((dbUsage.db_size_mb / DB_LIMIT_MB) * 100)}%)
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Unavailable</span>
                                    )}
                                </div>
                                <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            dbUsage && dbUsage.db_size_mb > DB_LIMIT_MB * 0.8
                                                ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                        }`}
                                        style={{ width: `${dbUsage ? Math.max(1, Math.min(100, Math.round((dbUsage.db_size_mb / DB_LIMIT_MB) * 100))) : 0}%` }}
                                    />
                                </div>
                                {dbUsage && (
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            {(DB_LIMIT_MB - dbUsage.db_size_mb).toFixed(1)} MB free
                                        </span>
                                        <button onClick={fetchDbUsage} className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${dbLoading ? 'animate-spin' : ''}`} /> Refresh
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Archive Recommendation */}
                            {oldestMonthTable && (
                                <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-lg p-2.5 flex items-start gap-2">
                                    <Archive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                            <span className="font-semibold">Tip:</span> Archive <strong>{oldestMonthTable.table_name.replace('_', ' ')}</strong> ({oldestMonthTable.size_mb} MB) to free up space.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setActiveSection('data'); setArchiveMonth(oldestMonthTable.table_name) }}
                                        className="text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 whitespace-nowrap underline"
                                    >
                                        Archive
                                    </button>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-gray-700" />

                            {/* Email Rate Limit Bar */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                                        Auth Emails
                                    </span>
                                    <span className={`font-medium ${emailsRemaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {emailSends.length} / {EMAIL_RATE_LIMIT} per hour
                                    </span>
                                </div>
                                <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            emailsRemaining === 0
                                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                                : emailPct >= 66
                                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                                : 'bg-gradient-to-r from-purple-400 to-purple-500'
                                        }`}
                                        style={{ width: `${Math.max(emailPct > 0 ? 4 : 0, Math.min(100, emailPct))}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    {emailsRemaining > 0 ? (
                                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                                            {emailsRemaining} email{emailsRemaining !== 1 ? 's' : ''} remaining
                                        </span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                            Rate limit reached
                                        </span>
                                    )}
                                    {emailCountdown && (
                                        <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Resets in {emailCountdown}
                                        </span>
                                    )}
                                    {!emailCountdown && emailSends.length === 0 && (
                                        <span className="text-gray-400">No emails sent recently</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                Includes magic links, password resets, and invites. Resets hourly.
                            </p>

                            {/* Brief explanation */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
    <strong className="text-gray-800 dark:text-gray-200">Database Storage</strong> is the space your member data, attendance records, badges, tags, and monthly tables use on the server.{' '}
    <strong className="text-gray-800 dark:text-gray-200">Auth Emails</strong> are login-related emails such as magic links, password resets, and invites, and they are limited to 3 per hour on the free plan.{' '}
    Archiving old months exports them as CSV and removes them from the database, which frees up storage.
</p>

                                {/* Learn More dropdown */}
                                <button
                                    onClick={() => setShowUsageDetails(prev => !prev)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                >
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUsageDetails ? 'rotate-180' : ''}`} />
                                    {showUsageDetails ? 'Show less' : 'Learn more about how this works'}
                                </button>

                                {showUsageDetails && (
                                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 space-y-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed animate-in fade-in">

                                        {/* What is Supabase */}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                                                <Database className="w-3.5 h-3.5 text-emerald-500" />
                                                What powers this app?
                                            </p>
                                            <p>
                                                This app uses <strong>Supabase</strong> for the hosted database and authentication.
                                                Supabase handles your database, user authentication (login/signup), and secure access control so your data stays private and only accessible to you and your team.
                                            </p>
                                        </div>

                                        {/* Database Storage explained */}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                                                <Database className="w-3.5 h-3.5 text-orange-500" />
                                                Database Storage (500 MB limit)
                                            </p>
                                            <p>
                                                Every member you add, every attendance record you mark, and every monthly table you create takes up space in the database.
                                                On the <strong>free plan</strong>, you get <strong>500 MB</strong> of total database storage. The bar above shows how much you've used.
                                            </p>
                                            <p className="mt-1">
                                                For context, 500 MB can comfortably hold <strong>thousands of members</strong> across dozens of monthly tables.
                                                You'll likely never hit this limit with normal use, but it's good to keep an eye on it.
                                            </p>
                                        </div>

                                        {/* Why archive */}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                                                <Archive className="w-3.5 h-3.5 text-amber-500" />
                                                Why archive old months?
                                            </p>
                                            <p>
                                                Each monthly table (e.g. "January 2026") stores member names, attendance dates, and status for that month.
                                                Over time, old months you no longer need to edit just sit in the database taking up space.
                                            </p>
                                            <p className="mt-1">
                                                <strong>Archiving</strong> exports the month's data as a CSV file (which you download and keep), then deletes the table from the database.
                                                This frees up storage while keeping your records safe on your device. You can always re-import the CSV later if needed.
                                            </p>
                                            <p className="mt-1 text-amber-700 dark:text-amber-400">
                                                <strong>Recommendation:</strong> Archive months that are more than 2 months old when you no longer need to edit them.
                                            </p>
                                        </div>

                                        {/* Auth Emails explained */}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-purple-500" />
                                                Auth Emails (3 per hour limit)
                                            </p>
                                            <p>
                                                Supabase sends authentication emails on your behalf for:
                                            </p>
                                            <ul className="list-disc list-inside mt-1 space-y-0.5 ml-1">
                                                <li><strong>Magic links</strong> for passwordless login</li>
                                                <li><strong>Password resets</strong> for account recovery</li>
                                                <li><strong>Invites</strong> for shared workspace access</li>
                                                <li><strong>Signup confirmations</strong> for new accounts</li>
                                            </ul>
                                            <p className="mt-1">
                                                On the free plan, Supabase limits this to <strong>3 emails per hour</strong> to prevent abuse.
                                                The counter above tracks how many you've sent in the current hour. Once you hit 3, you'll need to wait for the timer to reset before sending more.
                                            </p>
                                            <p className="mt-1">
                                                This is a <strong>server-side limit</strong> set by Supabase.
                                                Normal usage (occasional invites or password resets) will rarely hit this limit.
                                            </p>
                                        </div>

                                        {/* Free plan summary */}
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-2.5">
                                            <p className="font-semibold text-orange-800 dark:text-orange-300 mb-1 text-[11px]">Free Plan Summary</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                                <span className="text-gray-600 dark:text-gray-400">Database</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">500 MB</span>
                                                <span className="text-gray-600 dark:text-gray-400">Auth emails</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">3 per hour</span>
                                                <span className="text-gray-600 dark:text-gray-400">File storage</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">1 GB</span>
                                                <span className="text-gray-600 dark:text-gray-400">Realtime connections</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">200 concurrent</span>
                                                <span className="text-gray-600 dark:text-gray-400">Edge functions</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">500K invocations/month</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                            {(() => {
                                const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_avatar_url') : null
                                const avatarUrl = localAvatar || user?.user_metadata?.avatar_url
                                return avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )
                            })()}
                            <button
                                onClick={() => setIsPhotoEditorOpen(true)}
                                className="absolute -bottom-1 -right-1 p-1 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-colors"
                            >
                                <Pencil className="w-2.5 h-2.5" />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => setActiveSection('account')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Tutorial / Onboarding */}
                <button
                    onClick={() => window.openOnboarding?.()}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                    <div className="p-2 bg-white/20 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold">Show Tutorial</p>
                        <p className="text-sm text-white/80">Replay the getting started guide</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/70" />
                </button>

                {/* Content Area: Either Search Results or Section List */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {searchQuery ? (
                        /* Search Results */
                        searchResults.length > 0 ? (
                            searchResults.map((item) => {
                                const Icon = item.icon || Search
                                const sectionColor = sections.find(s => s.id === item.section)?.color || 'blue'

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            item.action()
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                                    >
                                        <div className={`p-2 rounded-lg ${item.isDestructive ? 'bg-red-100 dark:bg-red-900/30' : getIconBgColor(sectionColor)}`}>
                                            <Icon className={`w-5 h-5 ${item.isDestructive ? 'text-red-600 dark:text-red-400' : getIconColor(sectionColor)}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium ${item.isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {item.label}
                                                </p>
                                                {/* Section Badge */}
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 truncate">
                                                    {sections.find(s => s.id === item.section)?.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                                {item.description}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </button>
                                )
                            })
                        ) : (
                            /* No Results */
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                                    <Search className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-medium mb-1">No settings found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No results for "{searchQuery}". Try different keywords.
                                </p>
                            </div>
                        )
                    ) : (
                        /* Default Section List */
                        sections.filter(s => s.id !== 'danger').map((section) => {
                            const Icon = section.icon
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        if (section.id === 'help') {
                                            setShowHelpCenter(true)
                                        } else {
                                            setActiveSection(section.id)
                                        }
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                >
                                    <div className={`p-2 rounded-lg ${getIconBgColor(section.color)}`}>
                                        <Icon className={`w-5 h-5 ${getIconColor(section.color)}`} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white">{section.label}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                            {getSectionPreview(section.id)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {section.id === 'account' && window.__needsPasswordSetup && (
                                            <span className="relative flex h-5 w-5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">1</span>
                                            </span>
                                        )}
                                        {section.highlight && (
                                            <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                                                New
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>

                {/* Danger Zone - Separate Card (Only show if no search or if matching) */}
                {!searchQuery && (
                    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden mt-4">
                        <button
                            onClick={() => setActiveSection('danger')}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                        >
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-red-600 dark:text-red-400">Danger Zone</p>
                                <p className="text-sm text-red-500/70 dark:text-red-400/70 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">Delete account</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                        </button>
                    </div>
                )}

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )

    // Render detail view (when a section is active)
    const renderDetailView = () => {
        const currentSection = sections.find(s => s.id === activeSection)
        const Icon = currentSection?.icon || User

        return (
            <div className="min-h-screen">
                {/* Sticky Header - full-bleed across the detail page */}
                <div className="settings-detail-header-safe sticky z-30 w-full sm:-mx-4 sm:w-[calc(100%+2rem)] bg-white/85 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
                    <div className="max-w-4xl mx-auto w-full px-3 sm:px-8 py-2.5 sm:py-3 font-[var(--font-family)]">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setActiveSection(null)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm touch-target"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`p-1.5 rounded-lg ${getIconBgColor(currentSection?.color || 'blue')}`}>
                                    <Icon className={`w-4 h-4 ${getIconColor(currentSection?.color || 'blue')}`} />
                                </div>
                                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{currentSection?.label || 'Settings'}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 pb-8 space-y-3">
                    {renderContent()}
                </div>
            </div>
        )
    }

    // Main render
    return (
        <div onClickCapture={handleInteractionFeedback}>
            {activeSection === null ? renderMainList() : renderDetailView()}

            {/* Modals */}
            {isShareModalOpen && (
                <React.Suspense fallback={null}>
                    <ShareAccessModal
                        isOpen={isShareModalOpen}
                        onClose={handleShareModalClose}
                        user={user}
                    />
                </React.Suspense>
            )}
            {isWorkspaceModalOpen && (
                <React.Suspense fallback={null}>
                    <WorkspaceSettingsModal
                        isOpen={isWorkspaceModalOpen}
                        onClose={() => setIsWorkspaceModalOpen(false)}
                    />
                </React.Suspense>
            )}
            {isDeleteAccountOpen && (
                <React.Suspense fallback={null}>
                    <DeleteAccountModal
                        isOpen={isDeleteAccountOpen}
                        onClose={() => setIsDeleteAccountOpen(false)}
                    />
                </React.Suspense>
            )}
            {isExportModalOpen && (
                <React.Suspense fallback={null}>
                    <ExportDataModal
                        isOpen={isExportModalOpen}
                        onClose={() => setIsExportModalOpen(false)}
                    />
                </React.Suspense>
            )}
            {isPhotoEditorOpen && (
                <React.Suspense fallback={null}>
                    <ProfilePhotoEditor
                        isOpen={isPhotoEditorOpen}
                        onClose={() => setIsPhotoEditorOpen(false)}
                        user={user}
                    />
                </React.Suspense>
            )}

            {isAdminControlsOpen && (
                <React.Suspense fallback={null}>
                    <AdminControlsModal
                        isOpen={isAdminControlsOpen}
                        onClose={() => setIsAdminControlsOpen(false)}
                    />
                </React.Suspense>
            )}

            <ConfirmModal
                isOpen={deletePrompt.isOpen}
                onClose={() => setDeletePrompt({ isOpen: false, tableName: null, label: '' })}
                onConfirm={handleDeleteTable}
                title="Delete Month"
                confirmText={deletingTable ? 'Deleting...' : 'Delete'}
                confirmButtonClass={`bg-red-600 hover:bg-red-700 text-white ${deletingTable ? 'opacity-70 cursor-not-allowed' : ''}`}
                cancelText="Cancel"
                cancelButtonClass="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <p className="text-base text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete <strong>{deletePrompt.label}</strong>? This will permanently remove the month's table and its data.
                </p>
                <p className="text-sm text-red-500 mt-3">
                    This action cannot be undone.
                </p>
            </ConfirmModal>

            {/* Remove Collaborator Modal */}
            {pendingRemoval && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Header */}
                        <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Remove access?</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{pendingRemoval.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeRemoveModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 space-y-4">
                            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'}`}>
                                    This removes their workspace access. It does not delete their Supabase account.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Wait time</p>
                                <div className="flex items-center gap-3">
                                    {[0, 5, 10].map((m) => (
                                        <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="removeDelay"
                                                value={m}
                                                checked={removeDelay === m}
                                                onChange={() => setRemoveDelay(m)}
                                                disabled={isRemovingCollaborator}
                                            />
                                            <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                                                {m === 0 ? 'No wait' : `${m} minutes`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {isRemovingCollaborator && removeDelay > 0 && (
                                    <p className={`text-xs ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                                        Scheduled... time left: {Math.ceil(removeCountdownMs / 1000)}s
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Export this collaborator's access notes before removing them.</p>
                                <button
                                    onClick={handleExportCollaboratorData}
                                    disabled={isExportingCollaborator}
                                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
                                >
                                    {isExportingCollaborator ? 'Preparing...' : 'Export to CSV (placeholder)'}
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 flex gap-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                onClick={closeRemoveModal}
                                disabled={isRemovingCollaborator}
                                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} disabled:opacity-50`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveCollaborator}
                                disabled={isRemovingCollaborator}
                                className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${isRemovingCollaborator ? 'bg-gray-400 text-gray-700' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                {isRemovingCollaborator ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        {removeDelay ? 'Schedule Remove' : 'Remove Now'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Month Modal */}
            {!!archiveMonth && (
                <React.Suspense fallback={null}>
                    <ArchiveMonthModal
                        isOpen={!!archiveMonth}
                        onClose={() => setArchiveMonth(null)}
                        tableName={archiveMonth}
                        onArchiveComplete={(archivedTable) => {
                            setArchiveMonth(null)
                            toast.success(`${archivedTable.replace('_', ' ')} archived successfully!`)
                        }}
                    />
                </React.Suspense>
            )}

            {showPersonalMonthPicker && (
                <React.Suspense fallback={null}>
                    <MonthPickerPopup
                        isOpen={showPersonalMonthPicker}
                        onClose={() => setShowPersonalMonthPicker(false)}
                        anchorRef={personalMonthButtonRef}
                        onCreateMonth={onCreateMonth}
                        onSelectSunday={handlePersonalSundaySelection}
                        autoEnabled={isPersonalAutoMode}
                        onToggleAuto={handlePersonalModeToggle}
                        toggleLabel="Personal Auto"
                        manualModeDisabled={personalModeDisabled}
                        disabledReason="The workspace owner override is active right now, so your personal manual mode is temporarily locked."
                        manualStatus={isPersonalAutoMode
                            ? 'Auto is on. The app follows the live month and Sunday for you.'
                            : `Manual mode is active${manualModeCountdown ? ` - ${manualModeCountdown}` : ''}. Pick the exact month and Sunday you want to use.`}
                    />
                </React.Suspense>
            )}

            {showOverridePicker && (
                <React.Suspense fallback={null}>
                    <MonthPickerPopup
                        isOpen={showOverridePicker}
                        onClose={() => setShowOverridePicker(false)}
                        anchorRef={overrideButtonRef}
                        onCreateMonth={onCreateMonth}
                        onSelectSunday={handleOverrideSundaySelect}
                    />
                </React.Suspense>
            )}
        </div>
    )
}

export default SettingsPage
