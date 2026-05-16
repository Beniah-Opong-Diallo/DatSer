import React, { useCallback, useMemo, useState } from 'react'
import {
    ChevronLeft,
    Download,
    Calendar,
    FileSpreadsheet,
    GripVertical,
    Eye,
    Users,
    Loader2,
    X,
    Check,
    ClipboardList,
    Table2,
    Phone,
    UserRound,
    UserCheck,
    MessageCircle,
    Copy
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import ExportContactsModal from './ExportContactsModal'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const defaultColumns = [
    'Full Name',
    'Gender',
    'Phone Number',
    'Age',
    'Current Level',
    'Parent Name',
    'Parent Phone Number'
]

const getOrdinalSuffix = (day) => {
    const value = Number(day)
    if (!Number.isFinite(value)) return 'th'
    if (value % 100 >= 11 && value % 100 <= 13) return 'th'
    switch (value % 10) {
        case 1:
            return 'st'
        case 2:
            return 'nd'
        case 3:
            return 'rd'
        default:
            return 'th'
    }
}

const parseTableName = (tableName) => {
    if (!tableName || typeof tableName !== 'string') return null
    const [monthName, yearValue] = tableName.split('_')
    const monthIndex = MONTHS.indexOf(monthName)
    const year = Number(yearValue)
    if (monthIndex < 0 || !Number.isFinite(year)) return null
    return { monthName, monthIndex, year }
}

const getLocalDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getSundaysForTable = (tableName) => {
    const parsed = parseTableName(tableName)
    if (!parsed) return []

    const date = new Date(parsed.year, parsed.monthIndex, 1)
    while (date.getDay() !== 0) date.setDate(date.getDate() + 1)

    const sundays = []
    while (date.getMonth() === parsed.monthIndex) {
        const day = date.getDate()
        const dateKey = getLocalDateKey(date)
        sundays.push({
            table: tableName,
            dateKey,
            columnKey: `attendance_${dateKey.replace(/-/g, '_')}`,
            legacyColumnKey: `Attendance ${day}${getOrdinalSuffix(day)}`,
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weekdayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
            day
        })
        date.setDate(date.getDate() + 7)
    }
    return sundays
}

const formatTableName = (tableName) => tableName ? tableName.replace('_', ' ') : ''

const getRowValue = (row, column) => {
    if (!row) return ''
    const snake = column.toLowerCase().replace(/ /g, '_')
    const aliases = {
        'Full Name': ['Full Name', 'full_name', 'name'],
        'Gender': ['Gender', 'gender'],
        'Phone Number': ['Phone Number', 'phone_number', 'phoneNumber', 'phone', 'Phone'],
        'Age': ['Age', 'age'],
        'Current Level': ['Current Level', 'current_level', 'currentLevel', 'age_group'],
        'Parent Name': ['Parent Name', 'parent_name', 'parent_name_1', 'parentName'],
        'Parent Phone Number': ['Parent Phone Number', 'parent_phone_number', 'parent_phone_1', 'parentPhone']
    }

    const keys = aliases[column] || [column, snake]
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key]
    }
    return ''
}

const normalizeGender = (value) => {
    if (value === undefined || value === null) return ''
    const normalized = String(value).trim().toLowerCase()
    if (normalized === 'm' || normalized === 'male') return 'Male'
    if (normalized === 'f' || normalized === 'female') return 'Female'
    return String(value).trim()
}

const normalizeLevel = (value) => {
    if (value === undefined || value === null) return ''
    return String(value).trim().toUpperCase()
}

const normalizePhone = (value) => {
    if (value === undefined || value === null) return ''
    const raw = String(value).trim()
    if (!raw) return ''

    const digits = raw.replace(/\D/g, '')
    if (!digits) return raw
    if (digits.startsWith('233') && digits.length >= 12) return `0${digits.slice(3)}`
    if (digits.startsWith('0')) return digits
    return `0${digits}`
}

const normalizeExportCell = (column, value, csvPhone = false) => {
    if (column === 'Gender') return normalizeGender(value)
    if (column === 'Current Level') return normalizeLevel(value)
    if (column === 'Phone Number' || column === 'Parent Phone Number') {
        const phone = normalizePhone(value)
        return csvPhone && phone ? `="${phone}"` : phone
    }
    return value ?? ''
}

const normalizeAttendanceValue = (value) => {
    if (value === true || value === false) return value
    if (typeof value !== 'string') return undefined
    const normalized = value.trim().toLowerCase()
    if (normalized === 'present' || normalized === 'p' || normalized === 'true') return true
    if (normalized === 'absent' || normalized === 'a' || normalized === 'false') return false
    return undefined
}

const resolveAttendanceForDate = (row, sunday, attendanceData = {}) => {
    if (!row || !sunday) return undefined

    const attendanceMap = attendanceData[sunday.dateKey] || {}
    if (row.id !== undefined && Object.prototype.hasOwnProperty.call(attendanceMap, row.id)) {
        const mapValue = normalizeAttendanceValue(attendanceMap[row.id])
        if (mapValue !== undefined) return mapValue
    }

    const possibleKeys = [
        sunday.columnKey,
        sunday.legacyColumnKey,
        sunday.dateKey,
        sunday.columnKey.toLowerCase(),
        sunday.legacyColumnKey.toLowerCase()
    ]

    for (const key of possibleKeys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            const rowValue = normalizeAttendanceValue(row[key])
            if (rowValue !== undefined) return rowValue
        }
    }

    for (const key in row) {
        const lower = key.toLowerCase()
        if (lower === sunday.columnKey || lower === sunday.legacyColumnKey.toLowerCase()) {
            const rowValue = normalizeAttendanceValue(row[key])
            if (rowValue !== undefined) return rowValue
        }
    }

    return undefined
}

const getAttendanceMark = (value) => {
    const normalized = normalizeAttendanceValue(value)
    if (normalized === true) return 'P'
    if (normalized === false) return 'A'
    return '-'
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const escapeVCardValue = (value) => String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')

const ExportCenterPage = ({ onBack }) => {
    const { monthlyTables, members, attendanceData, currentTable, isSupabaseConfigured } = useApp()

    const [selectedMonths, setSelectedMonths] = useState([])
    const [selectedDateKeys, setSelectedDateKeys] = useState([])
    const [columns, setColumns] = useState(defaultColumns)
    const [draggedIdx, setDraggedIdx] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [previewData, setPreviewData] = useState([])
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [previewMode, setPreviewMode] = useState('standard')
    const [isExporting, setIsExporting] = useState(false)
    const [exportMode, setExportMode] = useState('standard')
    const [reportNote, setReportNote] = useState('P means Present. A means Absent. Blank means no attendance was marked.')
    const [whatsAppMessage, setWhatsAppMessage] = useState('Please see the attendance update.')
    const [includeWhatsAppMessage, setIncludeWhatsAppMessage] = useState(false)
    const [summaryMode, setSummaryMode] = useState('all')
    const [summaryFields, setSummaryFields] = useState({
        month: true,
        total: true,
        male: true,
        female: true,
        present: true,
        absent: true,
        sundays: true,
        legend: true,
        note: true
    })
    const [isEditingWhatsAppDraft, setIsEditingWhatsAppDraft] = useState(false)
    const [whatsAppDraft, setWhatsAppDraft] = useState('')
    const [isExportContactsModalOpen, setIsExportContactsModalOpen] = useState(false)

    const allMonthSundays = useMemo(() => {
        const map = {}
        ;(monthlyTables || []).forEach(table => {
            map[table] = getSundaysForTable(table)
        })
        return map
    }, [monthlyTables])

    const monthsByYear = useMemo(() => {
        const grouped = {}
        ;(monthlyTables || []).forEach(table => {
            const parsed = parseTableName(table)
            const year = parsed?.year || 'Other'
            if (!grouped[year]) grouped[year] = []
            grouped[year].push(table)
        })

        Object.keys(grouped).forEach(year => {
            grouped[year].sort((a, b) => {
                const aParsed = parseTableName(a)
                const bParsed = parseTableName(b)
                return (aParsed?.monthIndex ?? 0) - (bParsed?.monthIndex ?? 0)
            })
        })

        return grouped
    }, [monthlyTables])

    const years = useMemo(() => (
        Object.keys(monthsByYear).sort((a, b) => Number(b) - Number(a))
    ), [monthsByYear])

    const selectedSundays = useMemo(() => (
        selectedMonths
            .flatMap(table => allMonthSundays[table] || [])
            .filter(sunday => selectedDateKeys.includes(sunday.dateKey))
            .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    ), [allMonthSundays, selectedDateKeys, selectedMonths])

    const totalAvailableSundays = useMemo(() => (
        selectedMonths.reduce((count, table) => count + (allMonthSundays[table]?.length || 0), 0)
    ), [allMonthSundays, selectedMonths])

    const toggleMonth = (table) => {
        const monthSundays = allMonthSundays[table] || []
        const monthDateKeys = monthSundays.map(sunday => sunday.dateKey)

        setSelectedMonths(prev => {
            const exists = prev.includes(table)
            return exists ? prev.filter(t => t !== table) : [...prev, table]
        })

        setSelectedDateKeys(prev => {
            const exists = selectedMonths.includes(table)
            if (exists) return prev.filter(dateKey => !monthDateKeys.includes(dateKey))
            return [...new Set([...prev, ...monthDateKeys])]
        })
    }

    const handleSelectAllMonths = () => {
        const allTables = monthlyTables || []
        const allSelected = selectedMonths.length === allTables.length && allTables.length > 0
        if (allSelected) {
            setSelectedMonths([])
            setSelectedDateKeys([])
            return
        }

        setSelectedMonths([...allTables])
        setSelectedDateKeys([...new Set(allTables.flatMap(table => (allMonthSundays[table] || []).map(sunday => sunday.dateKey)))])
    }

    const setMonthSundaySelection = (table, shouldSelectAll) => {
        const monthDateKeys = (allMonthSundays[table] || []).map(sunday => sunday.dateKey)
        setSelectedMonths(prev => {
            if (shouldSelectAll) return prev.includes(table) ? prev : [...prev, table]
            return prev.filter(item => item !== table)
        })
        setSelectedDateKeys(prev => {
            if (shouldSelectAll) return [...new Set([...prev, ...monthDateKeys])]
            return prev.filter(dateKey => !monthDateKeys.includes(dateKey))
        })
    }

    const toggleSunday = (table, dateKey) => {
        setSelectedMonths(prev => prev.includes(table) ? prev : [...prev, table])
        setSelectedDateKeys(prev => (
            prev.includes(dateKey) ? prev.filter(item => item !== dateKey) : [...prev, dateKey]
        ))
    }

    const handleDragStart = (idx) => setDraggedIdx(idx)
    const handleDragOver = (event) => event.preventDefault()
    const handleDrop = (idx) => {
        if (draggedIdx === null || draggedIdx === idx) return
        const newCols = [...columns]
        const [removed] = newCols.splice(draggedIdx, 1)
        newCols.splice(idx, 0, removed)
        setColumns(newCols)
        setDraggedIdx(null)
    }

    const fetchPreview = useCallback(async () => {
        if (selectedMonths.length === 0) {
            toast.info('Select at least one month to preview')
            return
        }
        if (selectedSundays.length === 0) {
            toast.info('Select at least one Sunday to include')
            return
        }

        setLoadingPreview(true)
        setShowPreview(true)
        try {
            let allRows = []
            for (const table of selectedMonths) {
                if (!isSupabaseConfigured()) {
                    allRows = allRows.concat(members.map(member => ({ ...member, _month: table })))
                } else {
                    let tableRows = []
                    let offset = 0
                    const pageSize = 1000
                    while (true) {
                        const { data, error } = await supabase
                            .from(table)
                            .select('*')
                            .range(offset, offset + pageSize - 1)

                        if (error) throw error
                        if (!data || data.length === 0) break
                        tableRows = tableRows.concat(data)
                        if (data.length < pageSize) break
                        offset += pageSize
                    }
                    allRows = allRows.concat(tableRows.map(row => ({ ...row, _month: table })))
                }
            }
            if (allRows.length === 0 && currentTable && selectedMonths.includes(currentTable) && members.length > 0) {
                allRows = members.map(member => ({ ...member, _month: currentTable }))
            }
            setPreviewData(allRows)
        } catch (err) {
            console.error('Preview fetch error:', err)
            toast.error('Failed to load preview')
        } finally {
            setLoadingPreview(false)
        }
    }, [currentTable, isSupabaseConfigured, members, selectedMonths, selectedSundays.length])

    const summary = useMemo(() => {
        const total = previewData.length
        const boys = previewData.filter(row => normalizeGender(getRowValue(row, 'Gender')) === 'Male').length
        const girls = previewData.filter(row => normalizeGender(getRowValue(row, 'Gender')) === 'Female').length
        const markedMembers = previewData.filter(row => (
            selectedSundays.some(sunday => resolveAttendanceForDate(row, sunday, attendanceData) !== undefined)
        )).length
        const markedAttendance = previewData.reduce((sum, row) => {
            return sum + selectedSundays.filter(sunday => resolveAttendanceForDate(row, sunday, attendanceData) !== undefined).length
        }, 0)
        return {
            total,
            boys,
            girls,
            markedMembers,
            monthsCount: selectedMonths.length,
            sundayCount: selectedSundays.length,
            markedAttendance
        }
    }, [attendanceData, previewData, selectedMonths.length, selectedSundays])

    const markedPreviewData = useMemo(() => (
        previewData.filter(row => (
            selectedSundays.some(sunday => resolveAttendanceForDate(row, sunday, attendanceData) !== undefined)
        ))
    ), [attendanceData, previewData, selectedSundays])

    const displayedPreviewData = exportMode === 'marked-members' ? markedPreviewData : previewData

    const displayedSummary = useMemo(() => ({
        total: displayedPreviewData.length,
        boys: displayedPreviewData.filter(row => normalizeGender(getRowValue(row, 'Gender')) === 'Male').length,
        girls: displayedPreviewData.filter(row => normalizeGender(getRowValue(row, 'Gender')) === 'Female').length
    }), [displayedPreviewData])

    const reportStats = useMemo(() => {
        let present = 0
        let absent = 0
        displayedPreviewData.forEach(row => {
            selectedSundays.forEach(sunday => {
                const value = resolveAttendanceForDate(row, sunday, attendanceData)
                if (value === true) present++
                if (value === false) absent++
            })
        })
        return {
            monthLabel: selectedMonths.map(formatTableName).join(', ') || 'No month selected',
            total: displayedSummary.total,
            male: displayedSummary.boys,
            female: displayedSummary.girls,
            present,
            absent,
            sundays: selectedSundays.length
        }
    }, [attendanceData, displayedPreviewData, displayedSummary, selectedMonths, selectedSundays])

    const allReportHeaderLines = useMemo(() => ({
        month: `Month: ${reportStats.monthLabel}`,
        total: `Total Members: ${reportStats.total}`,
        male: `Male: ${reportStats.male}`,
        female: `Female: ${reportStats.female}`,
        present: `Total Present: ${reportStats.present}`,
        absent: `Total Absent: ${reportStats.absent}`,
        sundays: `Selected Sundays: ${reportStats.sundays}`,
        legend: 'Legend: P = Present, A = Absent',
        note: reportNote.trim() ? `Note: ${reportNote.trim()}` : ''
    }), [reportNote, reportStats])

    const reportHeaderLines = useMemo(() => (
        Object.keys(summaryFields)
            .filter(key => summaryFields[key] && allReportHeaderLines[key])
            .map(key => allReportHeaderLines[key])
    ), [allReportHeaderLines, summaryFields])

    const whatsAppSummaryLines = useMemo(() => {
        if (summaryMode === 'none') return []
        if (summaryMode === 'all') return Object.values(allReportHeaderLines).filter(Boolean)
        return reportHeaderLines
    }, [allReportHeaderLines, reportHeaderLines, summaryMode])

    const buildWhatsAppFullReport = useCallback(() => {
        const lines = [
            '*Attendance Export Summary*',
            ...whatsAppSummaryLines,
            '',
            '*Members*'
        ]

        displayedPreviewData.forEach((row, index) => {
            const name = getRowValue(row, 'Full Name') || 'Unknown'
            const phone = normalizePhone(getRowValue(row, 'Phone Number')) || 'No phone'
            const marks = selectedSundays.map(sunday => `${sunday.label}: ${getAttendanceMark(resolveAttendanceForDate(row, sunday, attendanceData))}`).join(', ')
            lines.push(`${index + 1}. ${name} | ${phone} | ${marks || 'No selected Sundays'}`)
        })

        if (displayedPreviewData.length === 0) {
            lines.push('No members found for this selection.')
        }

        return lines.join('\n')
    }, [attendanceData, displayedPreviewData, selectedSundays, whatsAppSummaryLines])

    const buildWhatsAppPhoneList = useCallback(() => {
        const message = whatsAppMessage.trim()
        const lines = [
            '*Attendance Contact List*',
            ...whatsAppSummaryLines,
            includeWhatsAppMessage && message ? `Message: ${message}` : '',
            '',
            ...displayedPreviewData.map((row, index) => {
                const name = getRowValue(row, 'Full Name') || 'Unknown'
                const phone = normalizePhone(getRowValue(row, 'Phone Number')) || 'No phone'
                return `${index + 1}. ${name} - ${phone}${includeWhatsAppMessage && message ? ` - ${message}` : ''}`
            })
        ].filter(line => line !== '')

        if (displayedPreviewData.length === 0) {
            lines.push('No members found for this selection.')
        }

        return lines.join('\n')
    }, [displayedPreviewData, includeWhatsAppMessage, whatsAppMessage, whatsAppSummaryLines])

    const generatedWhatsAppDraft = useMemo(() => buildWhatsAppFullReport(), [buildWhatsAppFullReport])
    const generatedPhoneDraft = useMemo(() => buildWhatsAppPhoneList(), [buildWhatsAppPhoneList])
    const activeWhatsAppText = isEditingWhatsAppDraft ? whatsAppDraft : generatedWhatsAppDraft

    const copyToClipboard = useCallback(async (text, successMessage) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text)
            } else {
                throw new Error('Clipboard API unavailable')
            }
            toast.success(successMessage)
        } catch (error) {
            try {
                const textarea = document.createElement('textarea')
                textarea.value = text
                textarea.setAttribute('readonly', '')
                textarea.style.position = 'fixed'
                textarea.style.left = '-9999px'
                document.body.appendChild(textarea)
                textarea.select()
                document.execCommand('copy')
                document.body.removeChild(textarea)
                toast.success(successMessage)
            } catch (fallbackError) {
                console.error('Clipboard copy failed:', error, fallbackError)
                toast.error('Could not copy to clipboard')
            }
        }
    }, [])

    const handleStartEditWhatsAppDraft = () => {
        setWhatsAppDraft(activeWhatsAppText)
        setIsEditingWhatsAppDraft(true)
    }

    const handleResetWhatsAppDraft = () => {
        setWhatsAppDraft('')
        setIsEditingWhatsAppDraft(false)
    }

    const downloadVCardContacts = useCallback(() => {
        const contactRows = displayedPreviewData
            .map(row => {
                const name = String(getRowValue(row, 'Full Name') || '').trim()
                const phone = normalizePhone(getRowValue(row, 'Phone Number'))
                return { name, phone }
            })
            .filter(contact => contact.name && contact.phone && contact.phone !== 'No phone')

        if (contactRows.length === 0) {
            toast.info('No contacts with phone numbers to export.')
            return
        }

        const vcfContent = contactRows.map(contact => [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${escapeVCardValue(contact.name)}`,
            `N:${escapeVCardValue(contact.name)};;;;`,
            `TEL;TYPE=CELL:${contact.phone}`,
            'END:VCARD'
        ].join('\n')).join('\n')

        const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        
        if (isMobile) {
            // On mobile, navigating directly to the blob URL often triggers the system's contact handler
            window.location.href = url
        } else {
            const link = document.createElement('a')
            link.href = url
            link.download = `contacts_${selectedMonths.length > 1 ? 'multiple_months' : selectedMonths[0] || 'export'}.vcf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }

        // Delay revocation to ensure the browser has handled the URL
        setTimeout(() => URL.revokeObjectURL(url), 10000)
        toast.success(`Exported ${contactRows.length} contacts`)
    }, [displayedPreviewData, selectedMonths])

    const downloadCSVContacts = useCallback(() => {
        const contactRows = displayedPreviewData
            .map(row => {
                const name = String(getRowValue(row, 'Full Name') || '').trim()
                const phone = normalizePhone(getRowValue(row, 'Phone Number'))
                return { name, phone }
            })
            .filter(contact => contact.name && contact.phone && contact.phone !== 'No phone')

        if (contactRows.length === 0) {
            toast.info('No contacts with phone numbers to export.')
            return
        }

        const header = ['Full Name', 'Phone Number']
        const csvContent = [
            header.join(','),
            ...contactRows.map(c => `${csvCell(c.name)},${csvCell(c.phone)}`)
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `contacts_${selectedMonths.length > 1 ? 'multiple_months' : selectedMonths[0] || 'export'}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success(`Exported ${contactRows.length} contacts to CSV`)
    }, [displayedPreviewData, selectedMonths])

    const handleExport = useCallback(() => {
        const rowsToExport = exportMode === 'marked-members' ? markedPreviewData : previewData

        if (previewData.length === 0) {
            toast.info('No data to export. Load preview first.')
            return
        }
        if (selectedSundays.length === 0) {
            toast.info('Select at least one Sunday to export')
            return
        }
        if (rowsToExport.length === 0) {
            toast.info('No members have Present or Absent marks for the selected Sundays.')
            return
        }

        setIsExporting(true)
        try {
            const attendanceHeaders = selectedSundays.map(sunday => `${formatTableName(sunday.table)} ${sunday.label}`)
            const header = [...columns, 'Month', ...attendanceHeaders]
            const monthsList = selectedMonths.map(formatTableName).join(', ')
            const lines = [
                header.map(csvCell).join(','),
                ...rowsToExport.map(row => {
                    const memberCells = columns.map(column => {
                        const value = normalizeExportCell(column, getRowValue(row, column), true)
                        return csvCell(value)
                    })
                    const attendanceCells = selectedSundays.map(sunday => (
                        csvCell(getAttendanceMark(resolveAttendanceForDate(row, sunday, attendanceData)))
                    ))
                    return [...memberCells, csvCell(formatTableName(row._month)), ...attendanceCells].join(',')
                })
            ]

            lines.unshift('')
            lines.unshift(reportHeaderLines.map(csvCell).join(','))
            lines.unshift('')
            lines.unshift([
                csvCell(`Members: ${rowsToExport.length}`),
                csvCell(`Marked members: ${summary.markedMembers}`),
                csvCell(`Attendance marks: ${summary.markedAttendance}`),
                csvCell(`Sundays: ${summary.sundayCount}`),
                csvCell(`Generated: ${new Date().toLocaleDateString()}`)
            ].join(','))
            lines.unshift([csvCell(`${exportMode === 'marked-members' ? 'MARKED MEMBERS EXPORT' : 'EXPORT'}: ${monthsList}`)].join(','))

            const csvContent = lines.join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${exportMode === 'marked-members' ? 'marked_members' : 'export'}_${selectedMonths.length > 1 ? 'multiple_months' : selectedMonths[0] || 'data'}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success(`Exported ${rowsToExport.length} member records`)
        } catch (err) {
            console.error('Export error:', err)
            toast.error('Export failed')
        } finally {
            setIsExporting(false)
        }
    }, [attendanceData, columns, exportMode, markedPreviewData, previewData, reportHeaderLines, selectedMonths, selectedSundays, summary])

    const handleExportAttendanceOnly = useCallback(() => {
        if (previewData.length === 0) {
            toast.info('No data to export. Load preview first.')
            return
        }
        if (selectedSundays.length === 0) {
            toast.info('Select at least one Sunday to export')
            return
        }

        setIsExporting(true)
        try {
            const attendanceRecords = []
            previewData.forEach(row => {
                const memberName = getRowValue(row, 'Full Name') || 'Unknown'
                selectedSundays.forEach(sunday => {
                    const value = resolveAttendanceForDate(row, sunday, attendanceData)
                    if (value === true || value === false) {
                        attendanceRecords.push({
                            name: memberName,
                            month: formatTableName(row._month || sunday.table),
                            date: sunday.dateKey,
                            status: value ? 'Present' : 'Absent'
                        })
                    }
                })
            })

            attendanceRecords.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date)
                return a.name.localeCompare(b.name)
            })

            const monthsList = selectedMonths.map(formatTableName).join(', ')
            const lines = [
                [csvCell(`ATTENDANCE EXPORT: ${monthsList}`), '', '', csvCell(`Generated: ${new Date().toLocaleDateString()}`)].join(','),
                [csvCell(`Total Records`), csvCell(attendanceRecords.length)].join(','),
                reportHeaderLines.map(csvCell).join(','),
                '',
                ['Member Name', 'Month', 'Date', 'Status'].map(csvCell).join(','),
                ...attendanceRecords.map(record => (
                    [record.name, record.month, record.date, record.status].map(csvCell).join(',')
                ))
            ]

            const csvContent = lines.join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `attendance_only_${selectedMonths.length > 1 ? 'multiple_months' : selectedMonths[0] || 'data'}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success(`Exported ${attendanceRecords.length} attendance records`)
        } catch (err) {
            console.error('Attendance export error:', err)
            toast.error('Export failed')
        } finally {
            setIsExporting(false)
        }
    }, [attendanceData, previewData, reportHeaderLines, selectedMonths, selectedSundays])

    const allMonthsSelected = selectedMonths.length === (monthlyTables || []).length && (monthlyTables || []).length > 0

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-950 pb-24">
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Back to settings"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-950 dark:text-white">Export Center</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Build a clean CSV with only the Sundays you choose.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-5">
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Months</div>
                        <div className="text-2xl font-bold text-gray-950 dark:text-white">{selectedMonths.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sundays</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">{selectedSundays.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Preview Rows</div>
                        <div className="text-2xl font-bold text-gray-950 dark:text-white">{previewData.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Marked Members</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-300">{summary.markedMembers}</div>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 lg:p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-orange-500" /> Report Header
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This summary appears at the top of exports and WhatsApp copies.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                            <span>P = Present</span>
                            <span>A = Absent</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 col-span-2">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</div>
                            <div className="text-sm font-bold text-gray-950 dark:text-white truncate">{reportStats.monthLabel}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</div>
                            <div className="text-xl font-bold text-gray-950 dark:text-white">{reportStats.total}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Female</div>
                            <div className="text-xl font-bold text-pink-600 dark:text-pink-300">{reportStats.female}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Male</div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-300">{reportStats.male}</div>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Absent</div>
                            <div className="text-xl font-bold text-red-600 dark:text-red-300">{reportStats.absent}</div>
                        </div>
                    </div>

                    <label className="block">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Editable note</span>
                        <textarea
                            value={reportNote}
                            onChange={(event) => setReportNote(event.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Add a note for this export"
                        />
                    </label>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" /> Months and Sundays
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the exact Sundays to show in preview and export.</p>
                        </div>
                        <button
                            onClick={handleSelectAllMonths}
                            className="shrink-0 text-sm px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                        >
                            {allMonthsSelected ? 'Clear All' : 'Select All Months'}
                        </button>
                    </div>

                    <div className="p-4 lg:p-5 space-y-4 max-h-[360px] overflow-y-auto pr-2">
                        {years.map(year => (
                            <div key={year} className="space-y-3">
                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{year}</div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                    {(monthsByYear[year] || []).map(table => {
                                        const selected = selectedMonths.includes(table)
                                        const sundays = allMonthSundays[table] || []
                                        const selectedCount = sundays.filter(sunday => selectedDateKeys.includes(sunday.dateKey)).length
                                        const allSundaysSelected = selectedCount === sundays.length && sundays.length > 0

                                        return (
                                            <div
                                                key={table}
                                                className={`rounded-lg border p-3 transition-colors ${selected
                                                    ? 'border-orange-300 bg-orange-50/70 dark:border-orange-700 dark:bg-orange-950/20'
                                                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <button
                                                        onClick={() => toggleMonth(table)}
                                                        className={`min-w-0 flex items-center gap-2 text-left font-semibold ${selected ? 'text-orange-800 dark:text-orange-200' : 'text-gray-900 dark:text-gray-100'}`}
                                                    >
                                                        <span className={`h-5 w-5 rounded border flex items-center justify-center ${selected ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                                            {selected && <Check className="w-3.5 h-3.5" />}
                                                        </span>
                                                        <span className="truncate">{formatTableName(table)}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setMonthSundaySelection(table, !allSundaysSelected)}
                                                        className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"
                                                    >
                                                        {allSundaysSelected ? 'Clear Sundays' : 'All Sundays'}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {sundays.map(sunday => {
                                                        const isSelected = selectedDateKeys.includes(sunday.dateKey)
                                                        return (
                                                            <button
                                                                key={sunday.dateKey}
                                                                onClick={() => toggleSunday(table, sunday.dateKey)}
                                                                className={`px-3 py-2 rounded-lg border text-left transition-colors ${isSelected
                                                                    ? 'bg-orange-600 border-orange-600 text-white'
                                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-orange-300'
                                                                    }`}
                                                            >
                                                                <span className="block text-[11px] font-semibold opacity-80">{sunday.weekdayLabel}</span>
                                                                <span className="block text-sm font-bold">{sunday.label}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">{selectedCount} of {sundays.length} Sundays selected</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {years.length === 0 && (
                            <p className="text-gray-400 text-sm">No months available</p>
                        )}
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 lg:p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h2 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400" /> Column Order
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Drag to reorder. Remove fields you do not want in the standard export.</p>
                        </div>
                        <button
                            onClick={() => setColumns(defaultColumns)}
                            className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-2">
                        {columns.map((col, idx) => (
                            <div
                                key={col}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(idx)}
                                className={`flex items-center gap-2 px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 cursor-grab select-none ${draggedIdx === idx ? 'opacity-50' : ''}`}
                            >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{col}</span>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        setColumns(prev => prev.filter((_, i) => i !== idx))
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    aria-label={`Remove ${col}`}
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-3">
                    <button
                        onClick={fetchPreview}
                        disabled={selectedMonths.length === 0 || selectedSundays.length === 0 || loadingPreview}
                        className="flex items-center justify-center gap-2 py-4 rounded-lg bg-gray-950 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-950 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingPreview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                        {loadingPreview ? 'Loading Preview...' : 'Preview Data'}
                    </button>
                    <div className="grid grid-cols-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1">
                        <button
                            onClick={() => setExportMode('standard')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-md font-semibold transition-colors ${exportMode === 'standard'
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Table2 className="w-4 h-4" /> All Members
                        </button>
                        <button
                            onClick={() => setExportMode('marked-members')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-md font-semibold transition-colors ${exportMode === 'marked-members'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <UserCheck className="w-4 h-4" /> Marked
                        </button>
                        <button
                            onClick={() => setExportMode('attendance-only')}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-md font-semibold transition-colors ${exportMode === 'attendance-only'
                                ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <ClipboardList className="w-4 h-4" /> Log
                        </button>
                    </div>
                </div>

                <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 lg:p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp Format
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Copy a clean message instead of downloading a file. It uses the current preview mode.
                            </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Copy source: {exportMode === 'marked-members' ? 'Marked members' : exportMode === 'attendance-only' ? 'All previewed members' : 'All members'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Summary in copied text</span>
                                <div className="grid grid-cols-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                    {[
                                        ['all', 'All'],
                                        ['choose', 'Pick'],
                                        ['none', 'None']
                                    ].map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => setSummaryMode(value)}
                                            className={`rounded-md px-3 py-2 text-sm font-semibold ${summaryMode === value
                                                ? 'bg-white dark:bg-gray-950 text-gray-950 dark:text-white shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/60'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {summaryMode === 'choose' && (
                                <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3 max-h-40 overflow-y-auto">
                                    {[
                                        ['month', 'Month'],
                                        ['total', 'Total'],
                                        ['male', 'Male'],
                                        ['female', 'Female'],
                                        ['present', 'Present'],
                                        ['absent', 'Absent'],
                                        ['sundays', 'Sundays'],
                                        ['legend', 'Legend'],
                                        ['note', 'Note']
                                    ].map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={summaryFields[key]}
                                                onChange={(event) => setSummaryFields(prev => ({ ...prev, [key]: event.target.checked }))}
                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            )}

                            <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3 text-sm text-gray-700 dark:text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={includeWhatsAppMessage}
                                    onChange={(event) => setIncludeWhatsAppMessage(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                Add short message to names and phone list
                            </label>

                            {includeWhatsAppMessage && (
                                <label className="block">
                                    <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Short message for phone list</span>
                                    <input
                                        value={whatsAppMessage}
                                        onChange={(event) => setWhatsAppMessage(event.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Type the short WhatsApp message"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Full report preview</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleStartEditWhatsAppDraft}
                                        className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Edit
                                    </button>
                                    {isEditingWhatsAppDraft && (
                                        <button
                                            onClick={handleResetWhatsAppDraft}
                                            className="rounded-md bg-orange-50 dark:bg-orange-950/30 px-2 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                            <textarea
                                value={activeWhatsAppText}
                                onChange={(event) => {
                                    setIsEditingWhatsAppDraft(true)
                                    setWhatsAppDraft(event.target.value)
                                }}
                                rows={10}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-3 py-2 font-mono text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Preview appears after selecting months and loading data"
                            />
                            <div>
                                <span className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Names and phones preview</span>
                                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-3 py-2 font-mono text-xs text-gray-900 dark:text-white">
                                    {generatedPhoneDraft}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => copyToClipboard(activeWhatsAppText, 'Copied WhatsApp report')}
                            disabled={displayedPreviewData.length === 0}
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Copy className="w-4 h-4" /> Copy Full WhatsApp Report
                        </button>
                        <button
                            onClick={() => copyToClipboard(buildWhatsAppPhoneList(), 'Copied names and phone numbers')}
                            disabled={displayedPreviewData.length === 0}
                            className="flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                        >
                            <Phone className="w-4 h-4" /> Copy Names and Phones
                        </button>
                        <button
                            onClick={() => setIsExportContactsModalOpen(true)}
                            disabled={displayedPreviewData.length === 0}
                            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> Export Contacts
                        </button>
                    </div>
                </section>

                {showPreview && (
                    <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" /> Export Preview
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {exportMode === 'marked-members'
                                        ? 'Showing only members with at least one Present or Absent mark in the selected Sundays.'
                                        : 'Gender, level, phone numbers, and selected Sundays are shown exactly as the CSV will export.'}
                                </p>
                            </div>
                            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                <button
                                    onClick={() => setPreviewMode('standard')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold ${previewMode === 'standard' ? 'bg-white dark:bg-gray-950 text-gray-950 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    Standard View
                                </button>
                                <button
                                    onClick={() => setPreviewMode('attendance')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold ${previewMode === 'attendance' ? 'bg-white dark:bg-gray-950 text-gray-950 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    Attendance View
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4 lg:p-5 bg-gray-50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-800">
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Previewed</div>
                                <div className="text-xl font-bold text-gray-950 dark:text-white">{displayedSummary.total}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Male</div>
                                <div className="text-xl font-bold text-gray-950 dark:text-white">{displayedSummary.boys}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Female</div>
                                <div className="text-xl font-bold text-gray-950 dark:text-white">{displayedSummary.girls}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Marked Members</div>
                                <div className="text-xl font-bold text-green-600 dark:text-green-300">{summary.markedMembers}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 col-span-2 lg:col-span-1">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Format Fixes</div>
                                <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    <span className="flex items-center gap-1"><UserRound className="w-3.5 h-3.5" /> M/F</span>
                                    <span>ABC</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 0</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[620px]">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        {previewMode === 'standard' ? (
                                            <>
                                                {columns.map(col => (
                                                    <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">{col}</th>
                                                ))}
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">Month</th>
                                                {selectedSundays.map(sunday => (
                                                    <th key={`${sunday.table}-${sunday.dateKey}`} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        {formatTableName(sunday.table)} {sunday.label}
                                                    </th>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">Full Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">Month</th>
                                                {selectedSundays.map(sunday => (
                                                    <th key={`${sunday.table}-${sunday.dateKey}`} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        {sunday.label}
                                                    </th>
                                                ))}
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {displayedPreviewData.slice(0, 100).map((row, index) => (
                                        <tr key={`${row.id || index}-${row._month || ''}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                            {previewMode === 'standard' ? (
                                                <>
                                                    {columns.map(col => (
                                                        <td key={col} className="px-4 py-3 text-gray-800 dark:text-gray-100 whitespace-nowrap">
                                                            {normalizeExportCell(col, getRowValue(row, col)) || '-'}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTableName(row._month)}</td>
                                                    {selectedSundays.map(sunday => {
                                                        const mark = getAttendanceMark(resolveAttendanceForDate(row, sunday, attendanceData))
                                                        return (
                                                            <td key={`${sunday.table}-${sunday.dateKey}`} className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold ${mark === 'P'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                    : mark === 'A'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                                    }`}>
                                                                    {mark}
                                                                </span>
                                                            </td>
                                                        )
                                                    })}
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap font-semibold">{getRowValue(row, 'Full Name') || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatTableName(row._month)}</td>
                                                    {selectedSundays.map(sunday => {
                                                        const mark = getAttendanceMark(resolveAttendanceForDate(row, sunday, attendanceData))
                                                        return (
                                                            <td key={`${sunday.table}-${sunday.dateKey}`} className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold ${mark === 'P'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                    : mark === 'A'
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                                    }`}>
                                                                    {mark}
                                                                </span>
                                                            </td>
                                                        )
                                                    })}
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {displayedPreviewData.length > 100 && (
                                        <tr>
                                            <td colSpan={previewMode === 'standard' ? columns.length + selectedSundays.length + 1 : selectedSundays.length + 2} className="px-4 py-4 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                                                And {displayedPreviewData.length - 100} more rows. The CSV includes every row in this mode.
                                            </td>
                                        </tr>
                                    )}
                                    {displayedPreviewData.length === 0 && (
                                        <tr>
                                            <td colSpan={previewMode === 'standard' ? columns.length + selectedSundays.length + 1 : selectedSundays.length + 2} className="px-4 py-8 text-center text-gray-400">
                                                {exportMode === 'marked-members'
                                                    ? 'No selected members have Present or Absent marks yet.'
                                                    : 'No preview data yet.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4 lg:p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                            <h2 className="font-semibold text-gray-950 dark:text-white">Ready to Export</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {exportMode === 'standard' && `All Members CSV includes every loaded member plus ${selectedSundays.length || 0} selected Sunday attendance columns.`}
                                {exportMode === 'marked-members' && `Marked Members CSV includes only the ${summary.markedMembers} member${summary.markedMembers === 1 ? '' : 's'} with at least one Present or Absent mark.`}
                                {exportMode === 'attendance-only' && 'Attendance Log CSV includes one row per marked Present or Absent record for the selected Sundays.'}
                            </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedSundays.length} of {totalAvailableSundays} selected Sundays
                        </div>
                    </div>

                    <button
                        onClick={exportMode === 'attendance-only' ? handleExportAttendanceOnly : handleExport}
                        disabled={previewData.length === 0 || selectedSundays.length === 0 || isExporting}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white text-base font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${exportMode === 'standard'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : exportMode === 'marked-members'
                                ? 'bg-green-700 hover:bg-green-800'
                                : 'bg-gray-950 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-950'
                            }`}
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        {isExporting ? 'Exporting...' : `Export ${exportMode === 'standard'
                            ? 'All Members CSV'
                            : exportMode === 'marked-members'
                                ? 'Marked Members CSV'
                                : 'Attendance Log'}`}
                    </button>

                    <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 p-3">
                        <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
                            This export keeps your data in the database. To free up storage space, use <strong>Archive Month</strong> in Settings, Data Management.
                        </p>
                    </div>
                </section>
            </div>

            <ExportContactsModal
                isOpen={isExportContactsModalOpen}
                onClose={() => setIsExportContactsModalOpen(false)}
                onExportCSV={downloadCSVContacts}
                onExportVCard={downloadVCardContacts}
                contactCount={
                    displayedPreviewData.filter(row => {
                        const phone = normalizePhone(getRowValue(row, 'Phone Number'))
                        return phone && phone !== 'No phone'
                    }).length
                }
            />
        </div>
    )
}

export default ExportCenterPage
