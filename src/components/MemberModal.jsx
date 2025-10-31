import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { X, User, Phone, Calendar, BookOpen } from 'lucide-react'

const MemberModal = ({ isOpen, onClose }) => {
  const { addMember, markAttendance } = useApp()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    phone_number: '',
    age: '',
    current_level: ''
  })

  // Sunday dates for September 2025
  const sundayDates = ['2025-09-07', '2025-09-14', '2025-09-21', '2025-09-28']
  const [sundayAttendance, setSundayAttendance] = useState({
    '2025-09-07': null, // null = not set, true = present, false = absent
    '2025-09-14': null,
    '2025-09-21': null,
    '2025-09-28': null
  })

  const levels = [
    'SHS1', 'SHS2', 'SHS3', 
    'JHS1', 'JHS2', 'JHS3', 
    'COMPLETED', 'UNIVERSITY'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newMember = await addMember({
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        phone_number: formData.phone_number || null
      })
      
      // Mark attendance for selected Sunday dates
      for (const [date, attendance] of Object.entries(sundayAttendance)) {
        if (attendance !== null) {
          try {
            await markAttendance(newMember.id, new Date(date), attendance)
          } catch (attendanceError) {
            console.error(`Error marking attendance for ${date}:`, attendanceError)
          }
        }
      }
      
      // Reset form and close modal
      setFormData({
        full_name: '',
        gender: '',
        phone_number: '',
        age: '',
        current_level: ''
      })
      setSundayAttendance({
        '2025-09-07': null,
        '2025-09-14': null,
        '2025-09-21': null,
        '2025-09-28': null
      })
      onClose()
      
      // Show success message (would use toast in real implementation)
      alert('Member added successfully!')
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Error adding member. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Member</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter full name"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  required
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Male</span>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  required
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="120"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter age"
              />
            </div>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                name="current_level"
                value={formData.current_level}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="">Select level</option>
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sunday Attendance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              September 2025 Sunday Attendance (Optional)
            </label>
            <div className="space-y-3">
              {sundayDates.map(date => {
                const dateObj = new Date(date)
                const dateLabel = dateObj.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })
                
                return (
                  <div key={date} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {dateLabel}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSundayAttendance(prev => ({ ...prev, [date]: true }))}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          sundayAttendance[date] === true
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setSundayAttendance(prev => ({ ...prev, [date]: false }))}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          sundayAttendance[date] === false
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setSundayAttendance(prev => ({ ...prev, [date]: null }))}
                        className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.full_name || !formData.gender}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MemberModal