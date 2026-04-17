import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  
  // Get the display text for the current value
  const selectedOption = options.find(opt => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : placeholder

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value)
          setIsOpen(false)
          setHighlightedIndex(-1)
        } else {
          setIsOpen(!isOpen)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          )
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case 'Tab':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const options = dropdownRef.current.querySelectorAll('[role="option"]')
      if (options[highlightedIndex]) {
        options[highlightedIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
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
          {displayText}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          role="listbox"
          className={`
            absolute z-50 w-full mt-1 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg 
            max-h-60 overflow-y-auto
          `}
          style={{
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
                setHighlightedIndex(-1)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                flex items-center justify-between px-3 py-2.5 cursor-pointer
                transition-colors duration-100
                ${highlightedIndex === index 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                ${value === option.value 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                  : ''
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === options.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              <span className="text-sm">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export default CustomSelect
