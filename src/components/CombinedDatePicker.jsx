import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

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
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const pickerId = String(name || label || placeholder || 'date')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const parseDateParts = (dateValue) => {
    if (!dateValue) return { day: '', month: '', year: '' }
    const parts = String(dateValue).split('-')
    return {
      day: parts[2] || '',
      month: parts[1] || '',
      year: parts[0] || ''
    }
  }

  const [selectedParts, setSelectedParts] = useState(() => parseDateParts(value))
  const { day, month, year } = selectedParts

  useEffect(() => {
    setSelectedParts(parseDateParts(value))
  }, [value])
  
  // Format display text
  const getDisplayText = () => {
    if (!day && !month && !year) return placeholder
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    
    const monthIndex = parseInt(month) - 1
    const monthName = monthNames[monthIndex] || ''

    if (day && monthName && year) return `${monthName} ${day}, ${year}`
    if (monthName && year) return `${monthName} ${year}`
    if (monthName && day) return `${monthName} ${day}`
    return [day, monthName, year].filter(Boolean).join(' / ')
  }

  // Options
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1)
  }))
  
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  
  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i)
  }))

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const commitDateIfComplete = (nextParts) => {
    if (nextParts.day && nextParts.month && nextParts.year) {
      const nextValue = `${nextParts.year}-${nextParts.month}-${nextParts.day}`
      if (name) {
        onChange({ target: { name, value: nextValue } })
      } else {
        onChange(nextValue)
      }
      setIsOpen(false)
    }
  }

  const updateSelectedParts = (patch) => {
    setSelectedParts(prev => {
      const nextParts = { ...prev, ...patch }
      commitDateIfComplete(nextParts)
      return nextParts
    })
  }

  const handleDayChange = (newDay) => {
    if (!newDay) {
      setSelectedParts({ day: '', month: '', year: '' })
      if (name) {
        onChange({ target: { name, value: '' } })
      } else {
        onChange('')
      }
      return
    }
    updateSelectedParts({ day: newDay })
  }
  
  const handleMonthChange = (newMonth) => {
    if (!newMonth) {
      setSelectedParts({ day: '', month: '', year: '' })
      if (name) {
        onChange({ target: { name, value: '' } })
      } else {
        onChange('')
      }
      return
    }
    updateSelectedParts({ month: newMonth })
  }
  
  const handleYearChange = (newYear) => {
    if (!newYear) {
      setSelectedParts({ day: '', month: '', year: '' })
      if (name) {
        onChange({ target: { name, value: '' } })
      } else {
        onChange('')
      }
      return
    }
    updateSelectedParts({ year: newYear })
  }

  return (
    <div 
      ref={containerRef}
      data-testid={`combined-date-picker-${pickerId}`}
      className={`relative ${className}`}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Main Button / Closed State */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        data-testid={`combined-date-picker-${pickerId}-toggle`}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 text-left
          bg-white dark:bg-gray-800 border rounded-lg
          transition-all duration-150 ease-in-out
          ${error 
            ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900' 
            : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <span className={`text-sm ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Expanded Dropdown - Shows ALL date components in ONE unified box */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          data-testid={`combined-date-picker-${pickerId}-dropdown`}
          className={`
            absolute z-50 w-full mt-1 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg 
            overflow-hidden
          `}
        >
          {/* Single unified container with all three sections */}
          <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
            {/* Day Column */}
            <div className="flex-1 max-h-64 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Day
              </div>
              {dayOptions.map((opt) => (
                <div
                  key={opt.value}
                  data-testid={`combined-date-picker-${pickerId}-day-${opt.value}`}
                  onClick={() => handleDayChange(opt.value)}
                  className={`
                    flex items-center justify-between px-3 py-2 cursor-pointer
                    transition-colors duration-100
                    ${day === opt.value 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <span className="text-sm">{opt.label}</span>
                  {day === opt.value && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Month Column */}
            <div className="flex-1 max-h-64 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Month
              </div>
              {monthOptions.map((opt) => (
                <div
                  key={opt.value}
                  data-testid={`combined-date-picker-${pickerId}-month-${opt.value}`}
                  onClick={() => handleMonthChange(opt.value)}
                  className={`
                    flex items-center justify-between px-3 py-2 cursor-pointer
                    transition-colors duration-100
                    ${month === opt.value 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <span className="text-sm">{opt.label}</span>
                  {month === opt.value && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Year Column */}
            <div className="flex-1 max-h-64 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Year
              </div>
              {yearOptions.map((opt) => (
                <div
                  key={opt.value}
                  data-testid={`combined-date-picker-${pickerId}-year-${opt.value}`}
                  onClick={() => handleYearChange(opt.value)}
                  className={`
                    flex items-center justify-between px-3 py-2 cursor-pointer
                    transition-colors duration-100
                    ${year === opt.value 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <span className="text-sm">{opt.label}</span>
                  {year === opt.value && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export default CombinedDatePicker
