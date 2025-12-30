import React from 'react'
import { useTheme } from '../context/ThemeContext'

const TableSkeleton = () => {
    const { isDarkMode } = useTheme()

    // Generate 15 placeholder items (show 6 on mobile, 15 on desktop)
    const items = Array.from({ length: 15 })

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((_, index) => (
                <div
                    key={index}
                    className={`relative rounded-xl border p-4 shadow-sm animate-pulse
            ${isDarkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'}
            ${index >= 6 ? 'hidden md:block' : ''}`}
                >
                    {/* Main Row */}
                    <div className="flex items-center gap-3">
                        {/* Expand Icon */}
                        <div className={`w-8 h-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                        {/* Name & Details */}
                        <div className="flex-1 space-y-2">
                            <div className={`h-5 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        </div>
                    </div>

                    {/* Buttons Row */}
                    <div className="flex gap-2 mt-4">
                        <div className={`h-9 flex-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className={`h-9 flex-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className={`hidden md:block h-9 flex-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TableSkeleton
