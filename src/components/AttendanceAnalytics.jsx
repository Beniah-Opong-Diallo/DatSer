import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  UserCheck, 
  Clock, 
  BarChart3,
  Filter,
  Star,
  Activity
} from 'lucide-react'

const AttendanceAnalytics = () => {
  const { supabase, isSupabaseConfigured } = useApp()
  const { isDarkMode } = useTheme()
  
  const [analytics, setAnalytics] = useState({
    regularAttendees: [],
    attendanceStats: [],
    monthlyTrends: [],
    newcomers: []
  })
  
  const [filters, setFilters] = useState({
    monthsBack: 6,
    minAttendanceRate: 75,
    newcomerMonths: 3
  })
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('regulars') // regulars, trends, newcomers, stats

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - showing demo data')
      return
    }

    setLoading(true)
    try {
      // Fetch regular attendees
      const { data: regulars, error: regularsError } = await supabase.rpc('get_regular_attendees', {
        months_back: filters.monthsBack
      })
      
      if (regularsError) {
        console.error('Error fetching regular attendees:', regularsError)
      }

      // Fetch attendance statistics
      const { data: stats, error: statsError } = await supabase.rpc('get_attendance_statistics', {
        min_attendance_rate: filters.minAttendanceRate
      })
      
      if (statsError) {
        console.error('Error fetching attendance stats:', statsError)
      }

      // Fetch monthly trends
      const { data: trends, error: trendsError } = await supabase.rpc('get_monthly_attendance_trends')
      
      if (trendsError) {
        console.error('Error fetching monthly trends:', trendsError)
      }

      // Fetch newcomers
      const { data: newcomers, error: newcomersError } = await supabase.rpc('get_newcomers', {
        months_back: filters.newcomerMonths
      })
      
      if (newcomersError) {
        console.error('Error fetching newcomers:', newcomersError)
      }

      setAnalytics({
        regularAttendees: regulars || [],
        attendanceStats: stats || [],
        monthlyTrends: trends || [],
        newcomers: newcomers || []
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  // Regular Attendees Tab
  const RegularAttendeesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Regular Attendees ({analytics.regularAttendees.length})
        </h3>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            75%+ attendance rate
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {analytics.regularAttendees.map((member, index) => (
          <div 
            key={member.member_id} 
            className={`rounded-lg border p-4 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                }`}>
                  {index < 3 ? (index + 1) : <UserCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {member.member_name}
                  </h4>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {member.total_attended} of {member.total_possible} Sundays
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  member.attendance_rate >= 95 ? 'text-green-500' :
                  member.attendance_rate >= 85 ? 'text-blue-500' :
                  'text-yellow-500'
                }`}>
                  {member.attendance_rate}%
                </div>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last: {member.last_attendance ? new Date(member.last_attendance).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Monthly Trends Tab
  const MonthlyTrendsTab = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Monthly Attendance Trends
      </h3>

      <div className="grid gap-4">
        {analytics.monthlyTrends.map((trend) => (
          <div 
            key={trend.month_year}
            className={`rounded-lg border p-4 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Date(trend.month_year + '-01').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </h4>
              <div className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {trend.total_members} members
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-500">
                  {trend.average_attendance}
                </div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Attendance
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-500">
                  {trend.highest_attendance}
                </div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Highest
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-500">
                  {trend.lowest_attendance}
                </div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Lowest
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Newcomers Tab
  const NewcomersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Newcomers ({analytics.newcomers.length})
        </h3>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last {filters.newcomerMonths} months
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {analytics.newcomers.map((newcomer) => (
          <div 
            key={newcomer.member_id}
            className={`rounded-lg border p-4 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {newcomer.member_name}
                  </h4>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    First visit: {new Date(newcomer.first_attendance_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-500">
                  {newcomer.total_attendances} visits
                </div>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {newcomer.weeks_since_first_visit} weeks ago
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // All Stats Tab
  const AllStatsTab = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        All Member Statistics
      </h3>

      <div className="grid gap-4">
        {analytics.attendanceStats.map((stat) => (
          <div 
            key={stat.member_id}
            className={`rounded-lg border p-4 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  stat.is_regular ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {stat.is_regular ? <Award className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.member_name}
                  </h4>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.attended_sundays} of {stat.total_sundays} Sundays
                    {stat.is_regular && <span className="ml-2 text-green-500 font-medium">• Regular</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${
                  stat.attendance_rate >= 75 ? 'text-green-500' :
                  stat.attendance_rate >= 50 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {stat.attendance_rate}%
                </div>
                <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last: {stat.last_attendance_date ? new Date(stat.last_attendance_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Attendance Analytics
          </h1>
          <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track attendance patterns, identify regular attendees, and discover trends
          </p>
        </div>

        {/* Filters */}
        <div className={`rounded-lg border p-4 mb-6 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Filters:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Months back:
              </label>
              <select 
                value={filters.monthsBack}
                onChange={(e) => setFilters(prev => ({ ...prev, monthsBack: parseInt(e.target.value) }))}
                className={`px-2 py-1 rounded border text-sm transition-colors ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Min attendance:
              </label>
              <select 
                value={filters.minAttendanceRate}
                onChange={(e) => setFilters(prev => ({ ...prev, minAttendanceRate: parseInt(e.target.value) }))}
                className={`px-2 py-1 rounded border text-sm transition-colors ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={0}>0%</option>
                <option value={25}>25%</option>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            {[
              { id: 'regulars', label: 'Regular Attendees', icon: Award },
              { id: 'trends', label: 'Monthly Trends', icon: TrendingUp },
              { id: 'newcomers', label: 'Newcomers', icon: Users },
              { id: 'stats', label: 'All Stats', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'regulars' && <RegularAttendeesTab />}
            {activeTab === 'trends' && <MonthlyTrendsTab />}
            {activeTab === 'newcomers' && <NewcomersTab />}
            {activeTab === 'stats' && <AllStatsTab />}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceAnalytics