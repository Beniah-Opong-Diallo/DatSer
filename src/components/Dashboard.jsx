import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Search, Users, Filter, Edit3, Trash2, Calendar } from 'lucide-react'
import EditMemberModal from './EditMemberModal'

const Dashboard = () => {
  const { 
    filteredMembers, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    deleteMember, 
    markAttendance, 
    bulkAttendance,
    fetchAttendanceForDate,
    attendanceData 
  } = useApp()
  const [selectedDate, setSelectedDate] = useState('2025-09-01')
  const [editingMember, setEditingMember] = useState(null)
  const [attendanceLoading, setAttendanceLoading] = useState({})

  // September 2025 Sunday dates
  const sundayDates = [
    '2025-09-07',
    '2025-09-14', 
    '2025-09-21',
    '2025-09-28'
  ]

  // Fetch attendance when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(new Date(selectedDate))
    }
  }, [selectedDate, fetchAttendanceForDate])

  // Fetch attendance for all Sunday dates
  useEffect(() => {
    sundayDates.forEach(date => {
      fetchAttendanceForDate(new Date(date))
    })
  }, [fetchAttendanceForDate])

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member['Full Name']}?`)) {
      try {
        await deleteMember(member.id)
        // Show success toast (would be implemented with react-toastify)
      } catch (error) {
        console.error('Error deleting member:', error)
      }
    }
  }

  const handleAttendance = async (memberId, present) => {
    setAttendanceLoading(prev => ({ ...prev, [memberId]: true }))
    try {
      await markAttendance(memberId, new Date(selectedDate), present)
      // Show success message
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Error marking attendance. Please try again.')
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [memberId]: false }))
    }
  }

  const handleAttendanceForDate = async (memberId, present, specificDate) => {
    const loadingKey = `${memberId}_${specificDate}`
    setAttendanceLoading(prev => ({ ...prev, [loadingKey]: true }))
    try {
      await markAttendance(memberId, new Date(specificDate), present)
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Error marking attendance. Please try again.')
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleBulkAttendance = async (present, specificDate = null) => {
    const dateToUse = specificDate || selectedDate
    const dateLabel = specificDate ? new Date(specificDate).toLocaleDateString() : selectedDate
    
    if (window.confirm(`Mark all members as ${present ? 'present' : 'absent'} on ${dateLabel}?`)) {
      try {
        const memberIds = filteredMembers.map(member => member.id)
        await bulkAttendance(memberIds, new Date(dateToUse), present)
        alert(`All members marked as ${present ? 'present' : 'absent'} successfully!`)
      } catch (error) {
        console.error('Error with bulk attendance:', error)
        alert('Error updating attendance. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Dashboard</h2>
          <p className="text-gray-600">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 px-3 py-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-300 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search members by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg border border-gray-300 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAttendance(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Mark all present"
            >
              <span>All Present</span>
            </button>
            <button
              onClick={() => handleBulkAttendance(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Mark all absent"
            >
              <span>All Absent</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* September 2025 Sunday Dates */}
      <div className="bg-white rounded-lg border border-gray-300 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          September 2025 - Sunday Attendance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { date: '2025-09-07', day: 7, label: 'Sunday, Sep 7th' },
            { date: '2025-09-14', day: 14, label: 'Sunday, Sep 14th' },
            { date: '2025-09-21', day: 21, label: 'Sunday, Sep 21st' },
            { date: '2025-09-28', day: 28, label: 'Sunday, Sep 28th' }
          ].map((sunday) => (
            <div key={sunday.date} className="border border-gray-200 rounded-lg p-3">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-900">{sunday.label}</div>
                <div className="text-xs text-gray-500">Attendance {sunday.day}{sunday.day === 7 || sunday.day === 21 ? 'th' : sunday.day === 14 ? 'th' : 'th'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAttendance(true, sunday.date)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  title={`Mark all present for ${sunday.label}`}
                >
                  All Present
                </button>
                <button
                  onClick={() => handleBulkAttendance(false, sunday.date)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  title={`Mark all absent for ${sunday.label}`}
                >
                  All Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member['Full Name']}</h3>
                  <p className="text-sm text-gray-600 capitalize">{member['Gender']}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingMember(member)}
                  className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{member['Phone Number'] || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{member['Age'] || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium text-primary-600 capitalize">
                  {member['Current Level']?.toLowerCase() || 'N/A'}
                </span>
              </div>
            </div>

            {/* Attendance Actions */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAttendance(member.id, true)}
                  disabled={attendanceLoading[member.id]}
                  className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
                    attendanceData[`${member.id}_${selectedDate}`] === true
                      ? 'bg-green-600 text-white'
                      : attendanceLoading[member.id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title="Mark present"
                >
                  {attendanceLoading[member.id] ? '...' : 'Present'}
                </button>
                <button
                  onClick={() => handleAttendance(member.id, false)}
                  disabled={attendanceLoading[member.id]}
                  className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
                    attendanceData[`${member.id}_${selectedDate}`] === false
                      ? 'bg-red-600 text-white'
                      : attendanceLoading[member.id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  title="Mark absent"
                >
                  {attendanceLoading[member.id] ? '...' : 'Absent'}
                </button>
              </div>
            </div>

            {/* September 2025 Sunday Attendance */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 mb-2">September 2025 Sundays</h4>
              <div className="space-y-2">
                {sundayDates.map(date => {
                  const dateKey = date
                  const dateAttendance = attendanceData[dateKey] || {}
                  const isPresent = dateAttendance[member.id] === true
                  const isAbsent = dateAttendance[member.id] === false
                  const isLoading = attendanceLoading[`${member.id}_${dateKey}`]
                  
                  return (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAttendanceForDate(member.id, true, date)}
                          disabled={isLoading}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isPresent
                              ? 'bg-green-600 text-white'
                              : isLoading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isLoading ? '...' : 'P'}
                        </button>
                        <button
                          onClick={() => handleAttendanceForDate(member.id, false, date)}
                          disabled={isLoading}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isAbsent
                              ? 'bg-red-600 text-white'
                              : isLoading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isLoading ? '...' : 'A'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first member'}
          </p>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          member={editingMember}
        />
      )}
    </div>
  )
}

export default Dashboard