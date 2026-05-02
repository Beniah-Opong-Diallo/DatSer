import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

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

  const pickerId = String(name || label || placeholder || 'date')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const parseDateParts = (dateValue) => {
    if (!dateValue) return { day: '', month: '', year: '' }
    const parts = String(dateValue).split('-')
    return {
      day: parts[2] ? String(parseInt(parts[2], 10)) : '',
      month: parts[1] ? String(parseInt(parts[1], 10)) : '',
      year: parts[0] || ''
    }
  }

  const [selectedParts, setSelectedParts] = useState(() => parseDateParts(value))
  const { day, month, year } = selectedParts

  // Year input local state (so user can type freely)
  const [yearInput, setYearInput] = useState(year)

  useEffect(() => {
    const parsed = parseDateParts(value)
    setSelectedParts(parsed)
    setYearInput(parsed.year)
  }, [value])

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

  const getDisplayText = () => {
    if (!day && !month && !year) return null
    const monthName = month ? MONTH_FULL[parseInt(month) - 1] : ''
    if (day && monthName && year) return `${monthName} ${day}, ${year}`
    if (monthName && year) return `${monthName} ${year}`
    return [day, monthName, year].filter(Boolean).join(' / ')
  }

  const commit = (parts) => {
    if (parts.day && parts.month && parts.year && parts.year.length === 4) {
      const d = parts.day.padStart(2, '0')
      const m = parts.month.padStart(2, '0')
      const dateVal = `${parts.year}-${m}-${d}`
      if (name) {
        onChange({ target: { name, value: dateVal } })
      } else {
        onChange(dateVal)
      }
      // Auto-close only when all three parts are selected
      setTimeout(() => setIsOpen(false), 120)
    }
  }

  const handleMonthSelect = (mIndex) => {
    const mStr = String(mIndex + 1)
    const next = { ...selectedParts, month: mStr }
    setSelectedParts(next)
    commit(next)
  }

  const handleDayChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
    const num = parseInt(raw, 10)
    const valid = raw === '' ? '' : (num >= 1 && num <= 31 ? raw : selectedParts.day)
    const next = { ...selectedParts, day: valid }
    setSelectedParts(next)
    commit(next)
  }

  const handleYearChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setYearInput(raw)
    const next = { ...selectedParts, year: raw }
    setSelectedParts(next)
    if (raw.length === 4) commit(next)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedParts({ day: '', month: '', year: '' })
    setYearInput('')
    if (name) {
      onChange({ target: { name, value: '' } })
    } else {
      onChange('')
    }
  }

  const displayText = getDisplayText()

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

      {/* Trigger button */}
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
            ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500/20'
            : isOpen
              ? 'border-primary-500 dark:border-primary-400 ring-1 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600'
          }
          ${disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900'
            : 'cursor-pointer'
          }
        `}
      >
        <span className={`text-sm flex items-center gap-2 ${displayText ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>
          <Calendar className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
          {displayText || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {displayText && (
            <span
              role="button"
              tabIndex={0}
              onMouseDown={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-1 rounded"
              title="Clear date"
            >
              ×
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Inline picker panel */}
      {isOpen && (
        <div
          data-testid={`combined-date-picker-${pickerId}-dropdown`}
          className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          style={{ minWidth: '220px' }}
        >
          {/* Day + Year row */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Day</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="DD"
                value={selectedParts.day}
                onChange={handleDayChange}
                maxLength={2}
                data-testid={`combined-date-picker-${pickerId}-day-input`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-center"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Year</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="YYYY"
                value={yearInput}
                onChange={handleYearChange}
                maxLength={4}
                data-testid={`combined-date-picker-${pickerId}-year-input`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-center"
              />
            </div>
          </div>

          {/* Divider + Month label */}
          <div className="px-3 pb-1.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Month</p>
            {/* 3×4 month grid */}
            <div className="grid grid-cols-3 gap-1.5 pb-3">
              {MONTHS.map((m, i) => {
                const mNum = i + 1
                const isSelected = parseInt(month) === mNum
                return (
                  <button
                    key={m}
                    type="button"
                    data-testid={`combined-date-picker-${pickerId}-month-${String(mNum).padStart(2, '0')}`}
                    onClick={() => handleMonthSelect(i)}
                    className={`py-1.5 text-sm font-medium rounded-lg transition-all duration-100 ${isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
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
