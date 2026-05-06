import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

const CombinedDatePicker = ({
  name,
  value,
  onChange,
  placeholder = 'Select date',
  label,
  error,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  const pickerId = String(name || label || placeholder || 'date').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const [selectedDate, setSelectedDate] = useState(null)
  const [viewDate, setViewDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (value) {
      const parts = value.split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        if (!isNaN(d.getTime())) {
          setSelectedDate(d)
          if (!isOpen) setViewDate(d)
        }
      }
    } else {
      setSelectedDate(null)
    }
  }, [value, isOpen])

  const toggleDropdown = () => {
    if (disabled) return
    if (!isOpen) {
      const mobile = window.innerWidth < 640
      
      if (!mobile && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = 430
        const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
        const insideModal = Boolean(containerRef.current.closest('[data-testid="add-member-modal"], [data-testid="edit-member-modal"], [data-testid="missing-data-modal"]'))
        
        const dropdownWidth = 340 // Wider for desktop
        let calcLeft = rect.left
        if (calcLeft + dropdownWidth > window.innerWidth - 16) {
          calcLeft = window.innerWidth - dropdownWidth - 16
        }
        calcLeft = Math.max(16, calcLeft)

        const unclampedTop = rect.bottom + 8
        const clampedTop = Math.max(16, Math.min(unclampedTop, window.innerHeight - dropdownHeight - 16))

        setDropdownStyle({
          position: 'fixed',
          top: insideModal ? `${Math.max(16, Math.round((window.innerHeight - dropdownHeight) / 2))}px` : (openUpwards ? 'auto' : `${clampedTop}px`),
          bottom: insideModal ? 'auto' : (openUpwards ? `${window.innerHeight - rect.top + 8}px` : 'auto'),
          left: insideModal ? `${Math.max(16, Math.round((window.innerWidth - dropdownWidth) / 2))}px` : `${calcLeft}px`,
          width: `${dropdownWidth}px`,
          zIndex: 999999
        })
      }
      
      setViewMode('grid')
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile) return // Handled by overlay click on mobile
      if (containerRef.current && containerRef.current.contains(e.target)) return
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return
      setIsOpen(false)
    }
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isMobile])

  const handleSave = () => {
    if (selectedDate) {
      const y = selectedDate.getFullYear()
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const d = String(selectedDate.getDate()).padStart(2, '0')
      const dateVal = `${y}-${m}-${d}`
      
      if (name) onChange({ target: { name, value: dateVal } })
      else onChange(dateVal)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (value) {
      const parts = value.split('-')
      if (parts.length === 3) setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])))
    } else {
      setSelectedDate(null)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (name) onChange({ target: { name, value: '' } })
    else onChange('')
    setSelectedDate(null)
    setIsOpen(false)
  }

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const isSelected = (day) => {
    if (!selectedDate || !day) return false
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
  }

  const onDayClick = (day) => {
    if (!day) return
    setSelectedDate(new Date(currentYear, currentMonth, day))
  }

  const currentYearActual = new Date().getFullYear()
  const years = Array.from({ length: 120 }, (_, i) => currentYearActual - i)

  const getDisplayText = () => {
    if (!selectedDate) return null
    return `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
  }
  const displayText = getDisplayText()

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up-sheet {
          animation: slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        data-testid={`combined-date-picker-${pickerId}-toggle`}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 text-left
          bg-white dark:bg-gray-800 border rounded-lg
          transition-all duration-150 ease-in-out min-h-[44px]
          ${error ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500/20' : isOpen ? 'border-primary-500 dark:border-primary-400 ring-1 ring-primary-500/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
        `}
      >
        <span className={`text-sm flex items-center gap-2 ${displayText ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          <Calendar className="w-4 h-4 opacity-70 flex-shrink-0" />
          {displayText || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {displayText && (
            <span role="button" tabIndex={0} onMouseDown={handleClear} onKeyDown={(e) => e.key === 'Enter' && handleClear(e)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm px-1.5 py-0.5 rounded transition-colors" title="Clear date">
              ×
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/60 z-[999998] backdrop-animate"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Dropdown / Bottom Sheet */}
          <div
            ref={dropdownRef}
            data-testid={`combined-date-picker-${pickerId}-dropdown`}
            className={`
              bg-white dark:bg-[#1c1c1e] shadow-2xl overflow-hidden font-sans z-[999999] flex flex-col
              ${isMobile 
                ? 'fixed bottom-0 left-0 right-0 w-full rounded-t-2xl animate-slide-up-sheet pb-safe' 
                : 'border border-gray-200 dark:border-gray-700/60 rounded-xl animate-scale-in'
              }
            `}
            style={isMobile ? { paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' } : { ...dropdownStyle, transformOrigin: dropdownStyle.bottom !== 'auto' ? 'bottom' : 'top' }}
          >
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0 bg-white dark:bg-[#1c1c1e]">
                <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
            )}

            {viewMode === 'grid' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <button 
                    onClick={() => setViewMode('wheels')}
                    className="flex items-center gap-1 text-[17px] font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500 transition-colors group"
                  >
                    {MONTHS[currentMonth]} {currentYear}
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors" />
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="text-primary-600 dark:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 transition-colors">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="text-primary-600 dark:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 px-3 pb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-center tracking-wider">{d}</div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 px-3 pb-4 gap-y-2 gap-x-1">
                  {days.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-center h-10">
                      {day && (
                        <button
                          onClick={() => onDayClick(day)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-[17px] transition-all
                            ${isSelected(day) 
                              ? 'bg-primary-600 dark:bg-primary-500 text-white font-semibold shadow-md' 
                              : isToday(day)
                                ? 'text-primary-600 dark:text-primary-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800'
                                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          {day}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-[380px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800/60">
                   <button onClick={() => setViewMode('grid')} className="text-primary-600 dark:text-primary-500 font-medium flex items-center text-[16px] hover:opacity-70 transition-opacity">
                     <ChevronLeft className="w-5 h-5 -ml-1" /> Back
                   </button>
                   <span className="font-semibold text-gray-900 dark:text-gray-100 text-[16px]">Select Month & Year</span>
                   <div className="w-16"></div>
                </div>
                <div className="flex-1 flex px-3 overflow-hidden bg-white dark:bg-[#151515]">
                  {/* Months Scroll */}
                  <div className="flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-800/60 p-2 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {MONTHS.map((m, i) => (
                      <button 
                        key={m} 
                        onClick={() => { setViewDate(new Date(currentYear, i, 1)); setViewMode('grid'); }}
                        className={`w-full py-3 text-center text-[16px] rounded-xl transition-colors ${currentMonth === i ? 'text-primary-700 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {/* Years Scroll */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {years.map(y => (
                      <button 
                        key={y} 
                        onClick={() => { setViewDate(new Date(y, currentMonth, 1)); setViewMode('grid'); }}
                        className={`w-full py-3 text-center text-[16px] rounded-xl transition-colors ${currentYear === y ? 'text-primary-700 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer (Cancel / Save) */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#1a1a1c]">
              <button 
                onClick={handleCancel}
                className="text-[17px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium px-4 py-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!selectedDate}
                className="text-[17px] text-white bg-primary-600 hover:bg-primary-700 transition-colors font-semibold px-8 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export default CombinedDatePicker
