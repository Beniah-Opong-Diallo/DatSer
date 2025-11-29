import React from 'react'
import { Check, X } from 'lucide-react'

/**
 * Green selection toolbar for long-press multi-selection
 */
const SelectionToolbar = ({
    selectedCount,
    onPresent,
    onAbsent,
    onCancel,
    isLoading = false
}) => {
    if (selectedCount === 0) return null

    return (
        <div className="sticky top-0 sm:top-2 z-40 bg-green-50/95 dark:bg-green-900/95 border-2 border-green-400 dark:border-green-600 rounded-xl p-2 sm:p-4 mb-2 sm:mb-3 shadow-lg backdrop-blur flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
                    {selectedCount}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-100">
                    {selectedCount} name{selectedCount !== 1 ? 's' : ''} selected
                </span>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                <button
                    onClick={onPresent}
                    disabled={isLoading}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                        } text-white`}
                    style={{ minHeight: '36px' }}
                >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Present</span>
                    <span className="sm:hidden text-xs">P</span>
                </button>
                <button
                    onClick={onAbsent}
                    disabled={isLoading}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all ${isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95'
                        } text-white`}
                    style={{ minHeight: '36px' }}
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Absent</span>
                    <span className="sm:hidden text-xs">A</span>
                </button>
                <button
                    onClick={onCancel}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    style={{ minHeight: '36px' }}
                >
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">✕</span>
                </button>
            </div>
        </div>
    )
}

export default SelectionToolbar
