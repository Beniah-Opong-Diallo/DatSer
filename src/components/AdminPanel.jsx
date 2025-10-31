import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Calendar, Database, Users, Activity, LogOut, RefreshCw } from 'lucide-react'

const AdminPanel = ({ onLogout }) => {
  const { monthlyTables, currentTable, setCurrentTable, members } = useApp()
  const [systemStats, setSystemStats] = useState({
    totalMembers: 0,
    activeMonth: '',
    totalTables: 0,
    lastUpdated: new Date().toLocaleString()
  })

  useEffect(() => {
    setSystemStats({
      totalMembers: members.length,
      activeMonth: currentTable,
      totalTables: monthlyTables.length,
      lastUpdated: new Date().toLocaleString()
    })
  }, [members, currentTable, monthlyTables])

  const handleTableSwitch = (tableName) => {
    setCurrentTable(tableName)
  }

  const getMonthDisplayName = (tableName) => {
    // Convert table name like "October_2025" to "October 2025"
    return tableName.replace('_', ' ')
  }

  const getTableStatus = (tableName) => {
    return tableName === currentTable ? 'Active' : 'Available'
  }

  const refreshStats = () => {
    setSystemStats(prev => ({
      ...prev,
      lastUpdated: new Date().toLocaleString()
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">TMHT Check-in System Administration</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Month</p>
                <p className="text-lg font-bold text-gray-900">{getMonthDisplayName(systemStats.activeMonth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Databases</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalTables}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <button
                    onClick={refreshStats}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-lg font-bold text-green-600">Online</p>
                <p className="text-xs text-gray-500">Updated: {systemStats.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Databases */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Monthly Databases</h2>
            <div className="text-sm text-gray-600">
              {monthlyTables.length} database{monthlyTables.length !== 1 ? 's' : ''} available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyTables.map((table) => (
              <div
                key={table}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  table === currentTable
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleTableSwitch(table)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      table === currentTable ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Database className={`w-5 h-5 ${
                        table === currentTable ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">
                        {getMonthDisplayName(table)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: {getTableStatus(table)}
                      </p>
                    </div>
                  </div>
                  {table === currentTable && (
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Current
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Table: {table}</span>
                    <span>
                      {table === currentTable ? `${members.length} members` : 'Click to switch'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {monthlyTables.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Monthly Databases Found</h3>
              <p className="text-gray-600">
                No monthly tables are currently available in the system.
              </p>
            </div>
          )}
        </div>

        {/* Database Connection Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Database Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Connection Status</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">Connected to Supabase</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Project: TMH TEEN Data Compilation
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current Configuration</h3>
              <div className="text-sm text-gray-600">
                <p>Environment: Production</p>
                <p>Region: US East</p>
                <p>Last Sync: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel