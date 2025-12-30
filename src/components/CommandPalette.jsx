import React, { useState, useEffect, useRef } from 'react'
import { Search, UserPlus, Settings, Moon, Sun, Download, Home, X, Users, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const CommandPalette = ({ setCurrentView, onAddMember }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)

    const { isDarkMode, toggleTheme, commandKEnabled } = useTheme()
    const { signOut } = useAuth()

    // Toggle open on Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!commandKEnabled) return
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    const actions = [
        {
            id: 'add-member',
            label: 'Add New Member',
            icon: UserPlus,
            shortcut: 'A',
            action: () => {
                // Open Add Member Modal
                if (onAddMember) onAddMember()
                setIsOpen(false)
            }
        },
        {
            id: 'dashboard',
            label: 'Go to Dashboard',
            icon: Home,
            action: () => setCurrentView('dashboard')
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            action: () => setCurrentView('settings')
        },
        {
            id: 'analytics',
            label: 'View Analytics',
            icon: Users,
            action: () => setCurrentView('analytics')
        },
        {
            id: 'theme',
            label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: isDarkMode ? Sun : Moon,
            action: () => toggleTheme()
        },
        {
            id: 'admin',
            label: 'Admin Panel',
            icon: Users,
            action: () => setCurrentView('admin')
        },
        {
            id: 'logout',
            label: 'Log Out',
            icon: LogOut,
            action: () => signOut()
        }
    ]

    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    )

    const handleSelect = (action) => {
        action.action()
        setIsOpen(false)
    }

    // Handle arrow navigation
    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % filteredActions.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredActions[selectedIndex]) {
                handleSelect(filteredActions[selectedIndex])
            }
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg h-10"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value)
                            setSelectedIndex(0)
                        }}
                        onKeyDown={handleInputKeyDown}
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded"
                    >
                        ESC
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {filteredActions.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No results found.
                        </div>
                    ) : (
                        <div className="px-2">
                            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
                                Suggestions
                            </div>
                            {filteredActions.map((action, index) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelect(action)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-left
                    ${index === selectedIndex
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <action.icon className={`w-5 h-5 ${index === selectedIndex ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                                        <span className="font-medium">{action.label}</span>
                                    </div>
                                    {action.shortcut && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded border
                      ${index === selectedIndex
                                                ? 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                                                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'
                                            }`}>
                                            {action.shortcut}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 flex justify-between">
                    <span>Pro tip: Use arrow keys to navigate</span>
                    <span>DatSer v1.2</span>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
