import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
    Building2,
    Users,
    Calendar,
    Database,
    Download,
    Copy,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Check,
    TrendingUp
} from 'lucide-react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'

const WorkspaceInsights = () => {
    const { isDarkMode } = useTheme()
    const { user, preferences } = useAuth()
    const {
        monthlyTables,
        currentTable,
        members,
        setCurrentTable
    } = useApp()

    const [isOpen, setIsOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)
    const [memberCountsByMonth, setMemberCountsByMonth] = useState({})
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [lastRefreshed, setLastRefreshed] = useState(new Date())

    // Load member counts for all months
    const loadMemberCounts = async () => {
        if (!user) return

        setIsLoadingStats(true)
        try {
            const counts = {}

            for (const tableName of monthlyTables) {
                try {
                    const { count, error } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)

                    if (!error) {
                        counts[tableName] = count || 0
                    }
                } catch (err) {
                    console.error(`Error counting ${tableName}:`, err)
                    counts[tableName] = 0
                }
            }

            setMemberCountsByMonth(counts)
            setLastRefreshed(new Date())
        } catch (error) {
            console.error('Error loading member counts:', error)
            toast.error('Failed to load member statistics')
        } finally {
            setIsLoadingStats(false)
        }
    }

    // Load stats when component mounts or when opened
    useEffect(() => {
        if (isOpen && monthlyTables.length > 0) {
            loadMemberCounts()
        }
    }, [isOpen, monthlyTables.length])

    // Export current month to CSV
    const exportCurrentMonth = () => {
        if (members.length === 0) {
            toast.warning('No members to export in current month')
            return
        }

        try {
            // Prepare CSV headers
            const headers = Object.keys(members[0]).filter(key => key !== 'id' && key !== 'user_id')
            const csvHeaders = headers.join(',')

            // Prepare CSV rows
            const csvRows = members.map(member => {
                return headers.map(header => {
                    const value = member[header] || ''
                    // Escape commas and quotes
                    return `"${String(value).replace(/"/g, '""')}"`
                }).join(',')
            }).join('\n')

            const csv = `${csvHeaders}\n${csvRows}`

            // Create download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            const workspaceName = preferences?.workspace_name || 'workspace'
            const monthName = currentTable.replace('_', '-')
            const filename = `${workspaceName}_${monthName}_members_${new Date().toISOString().split('T')[0]}.csv`

            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Exported ${members.length} members from ${currentTable}`)
        } catch (error) {
            console.error('Error exporting:', error)
            toast.error('Failed to export members')
        }
    }

    // Export all members from all months
    const exportAllMembers = async () => {
        if (monthlyTables.length === 0) {
            toast.warning('No monthly tables found')
            return
        }

        setIsLoadingStats(true)
        try {
            let allMembers = []

            for (const tableName of monthlyTables) {
                try {
                    const { data, error } = await supabase
                        .from(tableName)
                        .select('*')
                        .eq('user_id', user.id)

                    if (!error && data) {
                        // Add month column to each member
                        const membersWithMonth = data.map(member => ({
                            ...member,
                            month_table: tableName
                        }))
                        allMembers = [...allMembers, ...membersWithMonth]
                    }
                } catch (err) {
                    console.error(`Error fetching ${tableName}:`, err)
                }
            }

            if (allMembers.length === 0) {
                toast.warning('No members found across all months')
                return
            }

            // Get unique headers from all members
            const allHeaders = new Set()
            allMembers.forEach(member => {
                Object.keys(member).forEach(key => {
                    if (key !== 'id' && key !== 'user_id') {
                        allHeaders.add(key)
                    }
                })
            })
            const headers = Array.from(allHeaders)

            // Create CSV
            const csvHeaders = headers.join(',')
            const csvRows = allMembers.map(member => {
                return headers.map(header => {
                    const value = member[header] || ''
                    return `"${String(value).replace(/"/g, '""')}"`
                }).join(',')
            }).join('\n')

            const csv = `${csvHeaders}\n${csvRows}`

            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)

            const workspaceName = preferences?.workspace_name || 'workspace'
            const filename = `${workspaceName}_all_members_${new Date().toISOString().split('T')[0]}.csv`

            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success(`Exported ${allMembers.length} members from ${monthlyTables.length} months`)
        } catch (error) {
            console.error('Error exporting all members:', error)
            toast.error('Failed to export all members')
        } finally {
            setIsLoadingStats(false)
        }
    }

    // Copy member count to clipboard
    const copyMemberCount = async () => {
        try {
            await navigator.clipboard.writeText(members.length.toString())
            setIsCopied(true)
            toast.success(`Copied: ${members.length} members`)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            console.error('Error copying:', error)
            toast.error('Failed to copy to clipboard')
        }
    }

    // Refresh all stats
    const refreshStats = async () => {
        toast.info('Refreshing statistics...')
        await loadMemberCounts()
        toast.success('Statistics refreshed!')
    }

    // Get total members across all months
    const totalMembersAllMonths = Object.values(memberCountsByMonth).reduce((sum, count) => sum + count, 0)

    // Format date nicely
    const formatDate = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Get month display name
    const getMonthDisplayName = (tableName) => {
        return tableName.replace('_', ' ')
    }

    if (!user) return null

    return (
        <div className={`rounded-lg shadow-sm mb-4 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Workspace Insights
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({members.length} members in {getMonthDisplayName(currentTable)})
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">

                    {/* Workspace Overview Card */}
                    <div className={`p-4 rounded-lg border ${isDarkMode
                            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-800'
                            : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                        }`}>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Workspace
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                    {preferences?.workspace_name || 'Not Set'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Total Members
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                    {members.length} ({getMonthDisplayName(currentTable)})
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active Month
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                    {getMonthDisplayName(currentTable)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Monthly Tables
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                                    {monthlyTables.length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Last Updated
                                    </span>
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {formatDate(lastRefreshed)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] grid-animate">
                            <button
                                onClick={exportCurrentMonth}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                                        ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export Month</span>
                                <span className="sm:hidden">Month</span>
                            </button>

                            <button
                                onClick={exportAllMembers}
                                disabled={isLoadingStats}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLoadingStats
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    } ${isDarkMode
                                        ? 'bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800'
                                        : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                                    }`}
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export All</span>
                                <span className="sm:hidden">All</span>
                            </button>

                            <button
                                onClick={copyMemberCount}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                                        ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800'
                                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                                    }`}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span className="hidden sm:inline">Copied!</span>
                                        <span className="sm:hidden">✓</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">Copy Count</span>
                                        <span className="sm:hidden">Copy</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={refreshStats}
                                disabled={isLoadingStats}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLoadingStats
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    } ${isDarkMode
                                        ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 border border-orange-800'
                                        : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                                    }`}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                                <span className="sm:hidden">↻</span>
                            </button>
                        </div>
                    </div>

                    {/* Member Statistics */}
                    <div>
                        <button
                            onClick={() => setIsStatsOpen(!isStatsOpen)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode
                                    ? 'bg-gray-700 hover:bg-gray-650'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Member Statistics by Month
                                </span>
                            </div>
                            {isStatsOpen ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        {isStatsOpen && (
                            <div className={`mt-2 p-3 rounded-lg border ${isDarkMode
                                    ? 'bg-gray-750 border-gray-700'
                                    : 'bg-gray-50 border-gray-200'
                                }`}>
                                {isLoadingStats ? (
                                    <div className="text-center py-4">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading statistics...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {monthlyTables.map((tableName) => (
                                            <div
                                                key={tableName}
                                                className={`flex items-center justify-between p-2 rounded ${tableName === currentTable
                                                        ? isDarkMode
                                                            ? 'bg-blue-900/20 border border-blue-800'
                                                            : 'bg-blue-50 border border-blue-200'
                                                        : isDarkMode
                                                            ? 'bg-gray-800'
                                                            : 'bg-white'
                                                    }`}
                                            >
                                                <span className={`text-sm ${tableName === currentTable
                                                        ? 'font-medium text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {getMonthDisplayName(tableName)}
                                                    {tableName === currentTable && (
                                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                                            Active
                                                        </span>
                                                    )}
                                                </span>
                                                <span className={`text-sm font-bold ${tableName === currentTable
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {memberCountsByMonth[tableName] ?? '...'} members
                                                </span>
                                            </div>
                                        ))}

                                        {monthlyTables.length > 0 && (
                                            <div className={`flex items-center justify-between p-2 rounded mt-3 pt-3 border-t ${isDarkMode
                                                    ? 'border-gray-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20'
                                                    : 'border-gray-300 bg-gradient-to-r from-purple-50 to-blue-50'
                                                }`}>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    Total Across All Months
                                                </span>
                                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                                    {totalMembersAllMonths} members
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkspaceInsights
