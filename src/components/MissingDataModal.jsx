import React, { useState, useEffect, useRef } from 'react'
import DatePicker from './DatePicker'
import CustomSelect from './CustomSelect'
import ExpandedSelect from './ExpandedSelect'
import CombinedDatePicker from './CombinedDatePicker'
import { X, AlertCircle, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { toast } from 'react-toastify'

const MissingDataModal = ({
    member,
    missingFields = [],
    missingDates = [],
    pendingAttendanceAction = null,
    selectedAttendanceDate = null,
    onClose,
    onSave
}) => {
    // Debug: Log all props received
    console.log('=== MissingDataModalProps ===')
    console.log('member:', member?.id, member?.name)
    console.log('missingFields:', missingFields)
    console.log('missingDates:', missingDates)
    console.log('pendingAttendanceAction:', pendingAttendanceAction)
    console.log('selectedAttendanceDate:', selectedAttendanceDate)
    
    const { updateMember, markAttendance, selectedAttendanceDate: contextAttendanceDate } = useApp()
    const [formData, setFormData] = useState({})
    const [attendanceData, setAttendanceData] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
    const [isOverrideMode, setIsOverrideMode] = useState(false)
    const [showLevelDropdown, setShowLevelDropdown] = useState(false)
    const isSaveInFlightRef = useRef(false)
    // Tracks whether we have already initiated closing to block ghost-click re-opens
    const isClosingRef = useRef(false)

    const levelOptions = [
        'JHS1', 'JHS2', 'JHS3',
        'SHS1', 'SHS2', 'SHS3',
        'COMPLETED', 'UNIVERSITY'
    ]
    const [showGenderDropdown, setShowGenderDropdown] = useState(false)
    const genderOptions = ['Male', 'Female']

    // Local selection for which missing Sunday should be considered the "selectedAttendanceDate"
    // This lets the admin choose a date from the missingDates dropdown inside the modal.
    const [selectedDateKey, setSelectedDateKey] = useState(null)

    useEffect(() => {
        // Initialize the selected date key from the prop if available, otherwise pick the first missing date
        if (selectedDateKey) return // Don't override user's manual selection
        
        if (selectedAttendanceDate) {
            try {
                // Handle both string ("2026-03-15") and Date objects
                let dateKey
                if (typeof selectedAttendanceDate === 'string') {
                    dateKey = selectedAttendanceDate
                } else {
                    dateKey = selectedAttendanceDate.toISOString().split('T')[0]
                }
                setSelectedDateKey(dateKey)
                return
            } catch { }
        }
        if (missingDates && missingDates.length > 0) {
            setSelectedDateKey(missingDates[0].toISOString().split('T')[0])
        } else {
            setSelectedDateKey(null)
        }
    }, [selectedAttendanceDate, missingDates])

    // Initialize form data with member's current values
    useEffect(() => {
        const initialData = {}
        if (missingFields.includes('Phone Number')) {
            initialData.phoneNumber = member['Phone Number'] || ''
        }
        if (missingFields.includes('Gender')) {
            initialData.gender = member['Gender'] || ''
        }
        if (missingFields.includes('Age')) {
            initialData.age = member['Age'] || ''
        }
        if (missingFields.includes('Date of Birth')) {
            initialData.dateOfBirth = member['date_of_birth'] || member.date_of_birth || ''
        }
        if (missingFields.includes('Current Level')) {
            initialData.currentLevel = member['Current Level'] || ''
        }
        if (missingFields.includes('Parent Name 1')) {
            initialData.parentName1 = member['parent_name_1'] || ''
        }
        if (missingFields.includes('Parent Phone 1')) {
            initialData.parentPhone1 = member['parent_phone_1'] || ''
        }
        setFormData(initialData)

        // Initialize attendance data - use consistent date format matching the rest of the app
        const initialAttendance = {}
        missingDates.forEach(date => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const dateKey = `${year}-${month}-${day}`
            initialAttendance[dateKey] = null
        })
        setAttendanceData(initialAttendance)
    }, [member, missingFields, missingDates])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user makes changes
        if (saveError) setSaveError(null)
    }

    const handleAttendanceChange = async (dateKey, status) => {
        setAttendanceData(prev => ({ ...prev, [dateKey]: status }))
        // Clear error when user makes changes
        if (saveError) setSaveError(null)
        
        // Auto-save when user selects Present/Absent
        try {
            const parseLocalDate = (dateStr) => {
                if (!dateStr) return null
                const [year, month, day] = dateStr.split('-').map(Number)
                return new Date(year, month - 1, day)
            }
            await markAttendance(member.id, parseLocalDate(dateKey), status)
            toast.success(status === null ? 'Attendance cleared' : (status ? 'Marked present' : 'Marked absent'))
        } catch (error) {
            console.error('Error marking attendance:', error)
            toast.error('Failed to mark attendance')
        }
    }

    // Check if all required fields are filled
    const isFormComplete = () => {
        // Check member fields
        for (const field of missingFields) {
            if (field === 'Phone Number' && (!formData.phoneNumber || formData.phoneNumber.length !== 10)) {
                return false
            }
            if (field === 'Gender' && (!formData.gender || formData.gender === '')) {
                return false
            }
            if (field === 'Age' && (!formData.age || formData.age === '')) {
                return false
            }
            if (field === 'Date of Birth' && (!formData.dateOfBirth || formData.dateOfBirth === '')) {
                return false
            }
            if (field === 'Current Level' && (!formData.currentLevel || formData.currentLevel === '')) {
                return false
            }
            if (field === 'Parent Name 1' && (!formData.parentName1 || formData.parentName1 === '')) {
                return false
            }
            if (field === 'Parent Phone 1' && (!formData.parentPhone1 || formData.parentPhone1.length !== 10)) {
                return false
            }
        }

        // Check attendance dates
        for (const dateKey of Object.keys(attendanceData)) {
            if (attendanceData[dateKey] === null) {
                return false
            }
        }

        return true
    }

    // Helper to check if a specific field is invalid
    const isFieldInvalid = (field) => {
        if (!hasAttemptedSave) return false

        if (field === 'Phone Number') return !formData.phoneNumber || formData.phoneNumber.length !== 10
        if (field === 'Gender') return !formData.gender || formData.gender === ''
        if (field === 'Age') return !formData.age || formData.age === ''
        if (field === 'Date of Birth') return !formData.dateOfBirth || formData.dateOfBirth === ''
        if (field === 'Current Level') return !formData.currentLevel || formData.currentLevel === ''
        if (field === 'Parent Name 1') return !formData.parentName1 || formData.parentName1 === ''
        if (field === 'Parent Phone 1') return !formData.parentPhone1 || formData.parentPhone1.length !== 10

        return false
    }

    const handleSave = async () => {
        if (isSaveInFlightRef.current || isClosingRef.current) {
            return
        }

        setHasAttemptedSave(true)

        // In override mode, skip validation
        if (!isOverrideMode && !isFormComplete()) {
            toast.error('Please fill in all highlighted fields')
            setIsSaving(false)
            return
        }

        // Mark as in-flight immediately to block any re-entry
        isSaveInFlightRef.current = true
        isClosingRef.current = true
        setIsSaving(true)
        setSaveError(null)

        try {
            // Update member data if there are missing fields
            if (missingFields.length > 0) {
                const updates = {}
                if (missingFields.includes('Phone Number')) {
                    updates['Phone Number'] = formData.phoneNumber
                }
                if (missingFields.includes('Gender')) {
                    updates['Gender'] = formData.gender
                }
                if (missingFields.includes('Age')) {
                    updates['Age'] = formData.age
                }
                if (missingFields.includes('Date of Birth')) {
                    updates.date_of_birth = formData.dateOfBirth
                }
                if (missingFields.includes('Current Level')) {
                    updates['Current Level'] = formData.currentLevel
                }
                if (missingFields.includes('Parent Name 1')) {
                    updates.parent_name_1 = formData.parentName1
                }
                if (missingFields.includes('Parent Phone 1')) {
                    updates.parent_phone_1 = formData.parentPhone1
                }

                console.log('Updating member with:', updates)
                await updateMember(member.id, updates)
                console.log('Member updated successfully')
            }

            // Helper functions for date handling
            const getLocalDateKey = (date) => {
                if (!date) return null
                if (typeof date === 'string') return date
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }
            
            const parseLocalDate = (dateStr) => {
                if (!dateStr) return null
                const [year, month, day] = dateStr.split('-').map(Number)
                return new Date(year, month - 1, day)
            }
            
            // Mark attendance for the pending action (the date that was clicked on Dashboard)
            // Use selectedDateKey from dropdown, or fall back to selectedAttendanceDate prop
            // Override mode OR pendingAttendanceAction means we should save attendance
            let selectedKey = selectedDateKey
            if (!selectedKey && selectedAttendanceDate) {
                // Handle both string ("2026-03-15") and Date objects
                if (typeof selectedAttendanceDate === 'string') {
                    selectedKey = selectedAttendanceDate
                } else {
                    selectedKey = selectedAttendanceDate.toISOString().split('T')[0]
                }
            }
            
            // Fallback: use context attendance date if still no key
            if (!selectedKey && contextAttendanceDate) {
                if (typeof contextAttendanceDate === 'string') {
                    selectedKey = contextAttendanceDate
                } else {
                    selectedKey = contextAttendanceDate.toISOString().split('T')[0]
                }
            }
            
            // Last fallback: use today's date
            if (!selectedKey) {
                const today = new Date()
                selectedKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            }
            
            console.log('selectedKey for pending action:', selectedKey)
            console.log('pendingAttendanceAction:', pendingAttendanceAction)
            console.log('pendingAttendanceAction.present:', pendingAttendanceAction?.present)
            console.log('isOverrideMode:', isOverrideMode)
            
            // Always mark attendance if we have Override mode OR pending action
            // This ensures attendance is saved even if member update fails
            if (selectedKey) {
                // Determine action: use pendingAttendanceAction.present if available, otherwise default based on what user tapped
                const actionBool = pendingAttendanceAction?.present ?? true // Default to present if not specified
                console.log(`Marking attendance for ${selectedKey}: ${actionBool}`)
                await markAttendance(member.id, parseLocalDate(selectedKey), actionBool)
            } else {
                console.warn('No selectedKey - attendance will not be marked!')
            }

            // Mark attendance for all dates in attendanceData (the Sunday dates shown in modal)
            const dateKeys = Object.keys(attendanceData)
            console.log('Attendance data date keys:', dateKeys)
            
            for (const dateKey of dateKeys) {
                // Skip if this is the same as selectedKey (already marked above)
                if (selectedKey && dateKey === selectedKey) continue
                
                const status = attendanceData[dateKey]
                console.log(`Checking date ${dateKey}: status =`, status)
                
                if (status !== null && status !== undefined) {
                    console.log(`Marking attendance for ${dateKey}: ${status}`)
                    await markAttendance(member.id, parseLocalDate(dateKey), status)
                }
            }

            const updatedSnapshot = {
                ...member,
                ...(missingFields.includes('Phone Number') ? { 'Phone Number': formData.phoneNumber } : {}),
                ...(missingFields.includes('Gender') ? { 'Gender': formData.gender } : {}),
                ...(missingFields.includes('Age') ? { 'Age': formData.age } : {}),
                ...(missingFields.includes('Date of Birth') ? { date_of_birth: formData.dateOfBirth } : {}),
                ...(missingFields.includes('Current Level') ? { 'Current Level': formData.currentLevel } : {}),
                ...(missingFields.includes('Parent Name 1') ? { parent_name_1: formData.parentName1 } : {}),
                ...(missingFields.includes('Parent Phone 1') ? { parent_phone_1: formData.parentPhone1 } : {})
            }

            toast.success(isOverrideMode ? 'Attendance saved (Override)' : 'Missing data saved successfully!')
            setIsSaving(false)
            isSaveInFlightRef.current = false
            // Call onSave which will close the modal – isClosingRef stays true to block ghost re-opens
            if (onSave) {
                await onSave(updatedSnapshot)
            } else {
                onClose?.()
            }
        } catch (error) {
            console.error('Error saving missing data:', error)
            const errorMsg = error.message || 'Unknown error occurred'
            setSaveError(errorMsg)
            toast.error(`Failed to save data: ${errorMsg}`)
            setIsSaving(false)
            isSaveInFlightRef.current = false
            isClosingRef.current = false
        }
    }
    return (
        <div data-testid="missing-data-modal" className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60] backdrop-animate">
            <div className={`w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto transition-all duration-300 scrollbar-hide ring-1 sm:rounded-xl rounded-t-2xl animate-scale-in ${isOverrideMode
                ? 'bg-orange-50/90 dark:bg-orange-900/40 backdrop-blur-md ring-orange-300 dark:ring-orange-700'
                : 'bg-white dark:bg-gray-800 ring-gray-200 dark:ring-gray-700'
                }`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {/* Drag handle for mobile sheet style */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
                <div className={`sticky top-0 border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10 transition-all duration-300 rounded-t-2xl sm:rounded-t-xl ${isOverrideMode
                    ? 'bg-orange-100/80 dark:bg-orange-800/80 border-orange-200 dark:border-orange-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isOverrideMode ? 'text-orange-500' : 'text-orange-500'}`} />
                        <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                            Complete Missing Info
                        </h2>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            type="button"
                            data-testid="missing-data-override-toggle"
                            onClick={() => setIsOverrideMode(!isOverrideMode)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors min-h-[36px] touch-target ${isOverrideMode
                                ? 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600 font-medium'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                                }`}
                            title="Toggle Override Mode (Bypass Validation)"
                        >
                            {isOverrideMode ? '✓ Override' : 'Override'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5">
                    {saveError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-medium mb-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>Error Saving Data</span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 break-words">
                                {saveError}
                            </p>
                        </div>
                    )}

                    {/* Missing Member Fields */}
                    {missingFields.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Member Information</h3>

                            {missingFields.includes('Phone Number') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone Number * (10 digits)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            data-testid="missing-data-phone"
                                            value={formData.phoneNumber || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                handleInputChange('phoneNumber', value)
                                            }}
                                            maxLength="10"
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${isFieldInvalid('Phone Number')
                                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                                }`}
                                            placeholder="Enter 10-digit phone number"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('phoneNumber', '0000000000')}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            No Phone
                                        </button>
                                    </div>
                                    {formData.phoneNumber && formData.phoneNumber.length !== 10 && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Must be exactly 10 digits</p>
                                    )}
                                    {isFieldInvalid('Phone Number') && !formData.phoneNumber && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Phone number is required</p>
                                    )}
                                </div>
                            )}

                            {missingFields.includes('Gender') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Gender *
                                    </label>
                                    <div className="relative">
                                        {/* Custom dropdown trigger */}
                                        <button
                                            type="button"
                                            data-testid="missing-data-gender-toggle"
                                            onClick={() => setShowGenderDropdown(prev => !prev)}
                                            className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center justify-between ${isFieldInvalid('Gender')
                                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                                }`}
                                        >
                                            <span className={formData.gender ? '' : 'text-gray-400 dark:text-gray-400'}>
                                                {formData.gender || 'Select gender'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown list - opens downward */}
                                        {showGenderDropdown && (
                                            <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
                                                {genderOptions.map(gender => {
                                                    const isActive = formData.gender === gender
                                                    return (
                                                        <button
                                                            key={gender}
                                                            type="button"
                                                            data-testid={`missing-data-gender-${gender.toLowerCase()}`}
                                                            onClick={() => {
                                                                handleInputChange('gender', gender)
                                                                setShowGenderDropdown(false)
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${isActive
                                                                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                                                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                        >
                                                            {gender}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {isFieldInvalid('Gender') && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Gender is required</p>
                                    )}
                                </div>
                            )}

                            {/* Date of Birth and Age - Side by side */}
                            {(missingFields.includes('Date of Birth') || missingFields.includes('Age')) && (
                                <div className="grid grid-cols-2 gap-3 items-end">
                                    {missingFields.includes('Date of Birth') && (
                                        <div>
                                            {/* Combined Date Picker - All three in ONE unified dropdown */}
                                            <CombinedDatePicker
                                                value={formData.dateOfBirth || ''}
                                                onChange={(date) => handleInputChange('dateOfBirth', date)}
                                                label="Date of Birth"
                                                placeholder="Select date"
                                                error={isFieldInvalid('Date of Birth') ? 'Date of birth is required' : undefined}
                                            />
                                        </div>
                                    )}

                                    {missingFields.includes('Age') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Age *
                                            </label>
                                            <input
                                                type="text"
                                                data-testid="missing-data-age"
                                                value={formData.age || ''}
                                                onChange={(e) => handleInputChange('age', e.target.value)}
                                                className={`w-full px-3 py-2 md:py-3 md:text-base border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${isFieldInvalid('Age')
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                                    }`}
                                                placeholder="Enter age"
                                            />
                                            {isFieldInvalid('Age') && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Age is required</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {missingFields.includes('Current Level') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Level *
                                    </label>
                                    <div className="relative">
                                        {/* Custom dropdown trigger */}
                                        <button
                                            type="button"
                                            data-testid="missing-data-level-toggle"
                                            onClick={() => setShowLevelDropdown(prev => !prev)}
                                            className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center justify-between ${isFieldInvalid('Current Level')
                                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                                }`}
                                        >
                                            <span className={formData.currentLevel ? '' : 'text-gray-400 dark:text-gray-400'}>
                                                {formData.currentLevel || 'Select level'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown list - opens downward */}
                                        {showLevelDropdown && (
                                            <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
                                                {levelOptions.map(level => {
                                                    const isActive = formData.currentLevel === level
                                                    return (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            data-testid={`missing-data-level-${level.toLowerCase()}`}
                                                            onClick={() => {
                                                                handleInputChange('currentLevel', level)
                                                                setShowLevelDropdown(false)
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${isActive
                                                                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                                                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {isFieldInvalid('Current Level') && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Current level is required</p>
                                    )}
                                </div>
                            )}

                            {missingFields.includes('Parent Name 1') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Parent/Guardian Name *
                                    </label>
                                    <input
                                        type="text"
                                        data-testid="missing-data-parent1-name"
                                        value={formData.parentName1 || ''}
                                        onChange={(e) => handleInputChange('parentName1', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${isFieldInvalid('Parent Name 1')
                                            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                            }`}
                                        placeholder="Enter parent/guardian name"
                                    />
                                    {isFieldInvalid('Parent Name 1') && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Parent name is required</p>
                                    )}
                                </div>
                            )}

                            {missingFields.includes('Parent Phone 1') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Parent/Guardian Phone * (10 digits)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            data-testid="missing-data-parent1-phone"
                                            value={formData.parentPhone1 || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                handleInputChange('parentPhone1', value)
                                            }}
                                            maxLength="10"
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${isFieldInvalid('Parent Phone 1')
                                                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                                                }`}
                                            placeholder="Enter 10-digit phone number"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('parentPhone1', '0000000000')}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            No Phone
                                        </button>
                                    </div>
                                    {formData.parentPhone1 && formData.parentPhone1.length !== 10 && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Must be exactly 10 digits</p>
                                    )}
                                    {isFieldInvalid('Parent Phone 1') && !formData.parentPhone1 && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Parent phone is required</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Missing Attendance Dates */}
                    {missingDates.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Past Sunday Attendance</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please mark attendance for the following past Sundays:
                            </p>

                            {/* Optional dropdown to choose which missing Sunday should be used as the "selected" date.
                                    This is used to apply the pending attendance action (if any) to the chosen date. */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apply pending attendance to</label>
                                <select
                                    data-testid="missing-data-date-select"
                                    value={selectedDateKey || ''}
                                    onChange={(e) => setSelectedDateKey(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                                >
                                    {(missingDates || []).map(d => {
                                        const k = d.toISOString().split('T')[0]
                                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        return <option key={k} value={k}>{label}</option>
                                    })}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">The selected date will be used for the pending attendance action (the one that triggered this modal).</p>
                            </div>

                            <div className="space-y-3">
                                {missingDates.map(date => {
                                    const dateKey = date.toISOString().split('T')[0]
                                    const dateLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' })
                                    const isMissing = hasAttemptedSave && attendanceData[dateKey] === null

                                    return (
                                        <div
                                            key={dateKey}
                                            data-testid={`missing-data-attendance-card-${dateKey}`}
                                            className={`border rounded-lg p-3 ${isMissing ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'} transition-colors`}
                                        >
                                            <div className={`text-sm font-medium mb-2 ${isMissing ? 'text-red-800 dark:text-red-200' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {dateLabel} {isMissing && '(Required)'}
                                            </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        data-testid={`missing-data-attendance-${dateKey}-present`}
                        onClick={() => handleAttendanceChange(dateKey, true)}
                        className={`flex-1 py-2 text-sm rounded-xl font-semibold transition-all duration-150 min-h-[44px] ${attendanceData[dateKey] === true
                            ? 'bg-green-600 text-white shadow-md ring-2 ring-green-300 dark:ring-green-500'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                            }`}
                    >
                        Present
                    </button>
                    <button
                        type="button"
                        data-testid={`missing-data-attendance-${dateKey}-absent`}
                        onClick={() => handleAttendanceChange(dateKey, false)}
                        className={`flex-1 py-2 text-sm rounded-xl font-semibold transition-all duration-150 min-h-[44px] ${attendanceData[dateKey] === false
                            ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300 dark:ring-red-500'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                            }`}
                    >
                        Absent
                    </button>
                    <button
                        type="button"
                        data-testid={`missing-data-attendance-${dateKey}-clear`}
                        onClick={() => handleAttendanceChange(dateKey, null)}
                        className="px-3 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-500 min-h-[44px]"
                    >
                        ×
                    </button>
                </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Save button */}
                <div className="sticky bottom-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3 z-10 rounded-b-2xl sm:rounded-b-xl safe-area-bottom">
                    <button
                        onClick={onClose}
                        className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors min-h-[48px] sm:min-h-[40px] font-medium"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        data-testid="missing-data-save"
                        onClick={handleSave}
                        className={`flex-1 sm:flex-none px-6 py-3 sm:py-2 rounded-xl font-semibold transition-colors min-h-[48px] sm:min-h-[40px] ${isSaving
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                            : (isOverrideMode ? 'bg-orange-600 active:bg-orange-700 text-white shadow-sm' : 'bg-primary-600 active:bg-primary-700 text-white shadow-sm')
                            }`}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : (isOverrideMode ? 'Save (Override)' : 'Save')}
                    </button>
                </div>
            </div >
        </div >
    )
}

export default MissingDataModal
