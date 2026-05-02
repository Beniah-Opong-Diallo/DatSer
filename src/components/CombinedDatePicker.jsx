import React from 'react'

const CombinedDatePicker = ({
  name,
  value,
  onChange,
  label,
  error,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e) => {
    // Keep exact same onChange signature as previous custom picker
    if (name) {
      onChange({ target: { name, value: e.target.value } })
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <input
        type="date"
        name={name}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        data-testid={`native-date-picker-${name || 'date'}`}
        className={`
          w-full px-3 py-2.5 bg-white dark:bg-gray-800 border rounded-lg
          text-sm text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
          transition-all duration-150 ease-in-out
          ${error ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : 'cursor-pointer'}
        `}
        style={{
          // Ensures the native browser calendar popover matches the system dark/light mode
          colorScheme: 'light dark',
          // Minimum height to match the previous button size
          minHeight: '44px'
        }}
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export default CombinedDatePicker
