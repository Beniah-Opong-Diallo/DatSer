import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'

const AppContext = createContext()

// Get current month table name
const getCurrentMonthTable = () => {
  const now = new Date()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const currentMonth = monthNames[now.getMonth()]
  const currentYear = now.getFullYear()
  return `${currentMonth}_${currentYear}`
}

// Fallback monthly tables for when Supabase is not configured
const FALLBACK_MONTHLY_TABLES = [
  'January_2025', 'February_2025', 'April_2025', 'May_2025', 
  'June_2025', 'July_2025', 'August_2025', 'September_2025', 'October_2025', 'November_2025'
]

// Get the latest available table with persistence
const getLatestTable = () => {
  // Try to get saved table from localStorage
  const savedTable = localStorage.getItem('selectedMonthTable')
  if (savedTable && FALLBACK_MONTHLY_TABLES.includes(savedTable)) {
    return savedTable
  }
  
  // Default to current month if available, otherwise October_2025
  const currentMonthTable = getCurrentMonthTable()
  if (FALLBACK_MONTHLY_TABLES.includes(currentMonthTable)) {
    return currentMonthTable
  }
  
  return 'October_2025'
}

// Mock data for development when Supabase is not configured
const mockMembers = [
  {
    id: '1',
    'Full Name': 'John Doe',
    'Gender': 'Male',
    'Phone Number': '123-456-7890',
    'Age': '16',
    'Current Level': 'SHS1',
    inserted_at: new Date().toISOString()
  },
  {
    id: '2',
    'Full Name': 'Jane Smith',
    'Gender': 'Female',
    'Phone Number': '098-765-4321',
    'Age': '15',
    'Current Level': 'JHS3',
    inserted_at: new Date().toISOString()
  },
  {
    id: '3',
    'Full Name': 'Michael Johnson',
    'Gender': 'Male',
    'Phone Number': '555-123-4567',
    'Age': '17',
    'Current Level': 'SHS2',
    inserted_at: new Date().toISOString()
  }
]

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [attendanceData, setAttendanceData] = useState({})
  const [currentTable, setCurrentTable] = useState(getLatestTable())
  const [monthlyTables, setMonthlyTables] = useState(FALLBACK_MONTHLY_TABLES)
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(null)
  const [availableSundayDates, setAvailableSundayDates] = useState([])
  
  // Badge filter state - persisted across all components
  const [badgeFilter, setBadgeFilter] = useState(() => {
    const saved = localStorage.getItem('badgeFilter')
    return saved ? JSON.parse(saved) : [] // Start with no badges selected
  })

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    return supabase && import.meta.env.VITE_SUPABASE_URL && 
           import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_url_here' &&
           import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  }

  // Fetch members from current monthly table or use mock data
  const fetchMembers = async (tableName = currentTable) => {
    try {
      setLoading(true)
      console.log(`Fetching members from table: ${tableName}`)
      
      if (!isSupabaseConfigured()) {
        console.log('Using mock data - Supabase not configured')
        setMembers(mockMembers)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('inserted_at', { ascending: false })

      if (error) {
        console.error('Error fetching members:', error)
        console.log('Error details:', error.message, error.code)
        
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          toast.error(`Table ${tableName} does not exist in database. Using mock data.`)
          console.log(`Table ${tableName} not found, using mock data`)
        } else {
          toast.error(`Failed to fetch members from ${tableName}: ${error.message}`)
        }
        setMembers(mockMembers) // Fallback to mock data
      } else {
        // Filter out records with null Full Name
        const validMembers = (data || []).filter(member => member['Full Name'])
        setMembers(validMembers)
        console.log(`Successfully loaded ${validMembers.length} members from ${tableName}`)
        // Removed automatic toast notification on page load
      }
    } catch (error) {
      console.error('Unexpected error in fetchMembers:', error)
      console.log(`Setting mock members (${mockMembers.length} members) due to error`)
      setMembers(mockMembers) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  // Add new member to current monthly table
  const addMember = async (memberData) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - add to local state
        const newMember = {
          id: Date.now().toString(),
          'Full Name': memberData.fullName || memberData['Full Name'],
          'Gender': memberData.gender || memberData['Gender'],
          'Phone Number': memberData.phoneNumber || memberData['Phone Number'],
          'Age': memberData.age || memberData['Age'],
          'Current Level': memberData.currentLevel || memberData['Current Level'],
          'Member Status': 'New', // Default status for new members
          'Badge Type': 'newcomer', // Default badge
          'Join Date': new Date().toISOString().split('T')[0], // Join date
          'Manual Badge': null, // For manually assigned badges
          inserted_at: new Date().toISOString()
        }
        setMembers(prev => [newMember, ...prev])
        toast.success('Member added successfully! (Demo Mode)')
        return { success: true, data: newMember }
      }

      // Transform data to match monthly table structure
      const transformedData = {
        'Full Name': memberData.fullName || memberData['Full Name'],
        'Gender': memberData.gender || memberData['Gender'],
        'Phone Number': parseInt(memberData.phoneNumber || memberData['Phone Number']),
        'Age': memberData.age || memberData['Age'],
        'Current Level': memberData.currentLevel || memberData['Current Level']
      }

      const { data, error } = await supabase
        .from(currentTable)
        .insert([transformedData])
        .select()

      if (error) throw error

      setMembers(prev => [data[0], ...prev])
      toast.success(`Member added successfully to ${currentTable}!`)
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Failed to add member')
      return { success: false, error }
    }
  }

  // Get attendance column name for a given date
  const getAttendanceColumn = (date) => {
    const day = date.getDate()
    let suffix = 'th'
    if (day === 1 || day === 21 || day === 31) suffix = 'st'
    else if (day === 2 || day === 22) suffix = 'nd'
    else if (day === 3 || day === 23) suffix = 'rd'
    return `Attendance ${day}${suffix}`
  }

  // Get all attendance columns for the current table
  const getAttendanceColumns = async () => {
    try {
      if (!isSupabaseConfigured()) return []
      
      const { data, error } = await supabase.rpc('get_table_columns', {
        table_name: currentTable
      })
      
      if (error) {
        console.error('Error getting table columns:', error)
        return []
      }
      
      // Filter for attendance columns
      return data?.filter(col => col.column_name.startsWith('Attendance ')) || []
    } catch (error) {
      console.error('Error getting attendance columns:', error)
      return []
    }
  }

  // Get available attendance dates for the current table
  const getAvailableAttendanceDates = async () => {
    try {
      const attendanceColumns = await getAttendanceColumns()
      
      // Extract dates from column names and sort them
      const dates = attendanceColumns
        .map(col => {
          const match = col.column_name.match(/Attendance (\d+)(st|nd|rd|th)/)
          return match ? parseInt(match[1]) : null
        })
        .filter(date => date !== null)
        .sort((a, b) => a - b)
      
      return dates
    } catch (error) {
      console.error('Error getting available attendance dates:', error)
      return []
    }
  }

  // Helper function to get all Sundays in a month
  const getSundaysInMonth = (monthName, year) => {
    const monthIndex = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ].indexOf(monthName)
    
    if (monthIndex === -1) {
      throw new Error(`Invalid month name: ${monthName}`)
    }
    
    const sundays = []
    const date = new Date(year, monthIndex, 1)
    
    // Find the first Sunday of the month
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1)
    }
    
    // Collect all Sundays in the month
    while (date.getMonth() === monthIndex) {
      sundays.push(new Date(date))
      date.setDate(date.getDate() + 7)
    }
    
    return sundays
  }

  // Get available Sunday dates for the current table
  const getAvailableSundayDates = async () => {
    try {
      // Parse the current table to get month and year
      const [monthName, year] = currentTable.split('_')
      const yearNum = parseInt(year)
      
      // Get all Sundays in the month
      const allSundays = getSundaysInMonth(monthName, yearNum)
      
      // Get attendance columns to see which Sundays have columns
      const attendanceColumns = await getAttendanceColumns()
      
      // Filter Sundays that have corresponding attendance columns
      const availableSundays = allSundays.filter(sunday => {
        const dayOfMonth = sunday.getDate()
        return attendanceColumns.some(col => {
          const match = col.column_name.match(/Attendance (\d+)(st|nd|rd|th)/)
          return match && parseInt(match[1]) === dayOfMonth
        })
      })
      
      return availableSundays
    } catch (error) {
      console.error('Error getting available Sunday dates:', error)
      return []
    }
  }

  // Initialize available Sunday dates and set default selected date
  const initializeAttendanceDates = async () => {
    const sundays = await getAvailableSundayDates()
    setAvailableSundayDates(sundays)
    
    if (sundays.length > 0) {
      // Try to restore user's last selected date from localStorage
      const savedDateKey = `selectedAttendanceDate_${currentTable}`
      const savedDate = localStorage.getItem(savedDateKey)
      
      if (savedDate) {
        // Check if the saved date is still available in current month
        const savedDateTime = new Date(savedDate)
        const matchingDate = sundays.find(sunday => {
          // Compare dates by year, month, and day (ignore time differences)
          return sunday.getFullYear() === savedDateTime.getFullYear() &&
                 sunday.getMonth() === savedDateTime.getMonth() &&
                 sunday.getDate() === savedDateTime.getDate()
        })
        
        if (matchingDate) {
          setSelectedAttendanceDate(matchingDate)
          return
        }
      }
      
      // Fallback: Set default to 2nd Sunday if available, otherwise first available Sunday
      const defaultDate = sundays.length >= 2 ? sundays[1] : sundays[0]
      setSelectedAttendanceDate(defaultDate)
    }
  }

  // Calculate member attendance rate
  const calculateAttendanceRate = (member) => {
    const attendanceColumns = Object.keys(member).filter(key => 
      key.startsWith('Attendance ') && member[key] !== null && member[key] !== undefined
    )
    
    if (attendanceColumns.length === 0) return 0
    
    const presentCount = attendanceColumns.filter(col => 
      member[col] === 'Present' || member[col] === true
    ).length
    
    return Math.round((presentCount / attendanceColumns.length) * 100)
  }

  // Calculate member badge based on attendance and join date
  const calculateMemberBadge = (member) => {
    const joinDate = new Date(member['Join Date'] || member.inserted_at)
    const now = new Date()
    const daysSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24))
    const attendanceRate = calculateAttendanceRate(member)
    
    // Check for manual badge first
    if (member['Manual Badge']) {
      return member['Manual Badge']
    }
    
    // New member (less than 30 days)
    if (daysSinceJoin < 30) {
      return 'newcomer'
    }
    
    // Regular member badges based on attendance
    if (attendanceRate >= 75) {
      return 'regular'
    } else if (attendanceRate >= 50) {
      return 'member'
    } else {
      return 'newcomer'
    }
  }

  // Update member badges for all members
  const updateMemberBadges = () => {
    setMembers(prev => prev.map(member => ({
      ...member,
      // Only update Badge Type if there's no Manual Badge assigned
      'Badge Type': member['Manual Badge'] || calculateMemberBadge(member),
      'Attendance Rate': calculateAttendanceRate(member)
    })))
  }

  // Toggle badge for member (supports multiple badges)
  const toggleMemberBadge = async (memberId, badgeType) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - update local state
        setMembers(prev => prev.map(member => {
          if (member.id === memberId) {
            const currentBadges = member['Manual Badges'] || []
            let updatedBadges
            
            if (currentBadges.includes(badgeType)) {
              // Remove badge if already selected
              updatedBadges = currentBadges.filter(badge => badge !== badgeType)
            } else {
              // Add badge if not selected
              updatedBadges = [...currentBadges, badgeType]
            }
            
            const updatedMember = { ...member, 'Manual Badges': updatedBadges }
            return updatedMember
          }
          return member
        }))
        return { success: true }
      }

      // For Supabase, we'll store the badges as a JSON array
      const member = members.find(m => m.id === memberId)
      const currentBadges = member['Manual Badges'] || []
      let updatedBadges
      
      if (currentBadges.includes(badgeType)) {
        updatedBadges = currentBadges.filter(badge => badge !== badgeType)
      } else {
        updatedBadges = [...currentBadges, badgeType]
      }

      // Prepare update object
      const updateData = { 'Manual Badges': JSON.stringify(updatedBadges) }
      
      // If current table is November_2025, also update role columns
      if (currentTable === 'November_2025') {
        // Clear all role columns first
        updateData.Member = null
        updateData.Regular = null
        updateData.Newcomer = null
        
        // Set role columns based on selected badges
        if (updatedBadges.includes('member')) {
          updateData.Member = 'Yes'
        }
        if (updatedBadges.includes('regular')) {
          updateData.Regular = 'Yes'
        }
        if (updatedBadges.includes('newcomer')) {
          updateData.Newcomer = 'Yes'
        }
      }

      const { data, error } = await supabase
        .from(currentTable)
        .update(updateData)
        .eq('id', memberId)
        .select()

      if (error) throw error

      setMembers(prev => prev.map(member => {
        if (member.id === memberId) {
          const updatedMember = { 
            ...member, 
            'Manual Badges': updatedBadges,
            // Update role columns for November_2025 table
            ...(currentTable === 'November_2025' && {
              'Member': updatedBadges.includes('member') ? 'Yes' : null,
              'Regular': updatedBadges.includes('regular') ? 'Yes' : null,
              'Newcomer': updatedBadges.includes('newcomer') ? 'Yes' : null
            })
          }
          
          return updatedMember
        }
        return member
      }))

      return { success: true }
    } catch (error) {
      console.error('Error assigning badge:', error)
      return { success: false, error }
    }
  }

  const findAttendanceColumnForDate = async (date) => {
    try {
      const attendanceColumns = await getAttendanceColumns()
      const dayOfMonth = date.getDate()
      
      // Find the column that matches this day of month
      const matchingColumn = attendanceColumns.find(col => {
        const match = col.column_name.match(/Attendance (\d+)(st|nd|rd|th)/)
        return match && parseInt(match[1]) === dayOfMonth
      })
      
      return matchingColumn ? matchingColumn.column_name : null
    } catch (error) {
      console.error('Error finding attendance column for date:', error)
      return null
    }
  }

  // Check if attendance column exists in the current table
  const checkAttendanceColumnExists = async (attendanceColumn) => {
    try {
      if (!isSupabaseConfigured()) return true
      
      // Get all attendance columns and check if the requested one exists
      const attendanceColumns = await getAttendanceColumns()
      return attendanceColumns.some(col => col.column_name === attendanceColumn)
    } catch (error) {
      console.error('Error checking attendance column:', error)
      return false
    }
  }

  // Mark attendance for a member in monthly table
  const markAttendance = async (memberId, date, present) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - update local state
        const dateKey = date.toISOString().split('T')[0]
        setAttendanceData(prev => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            [memberId]: present
          }
        }))
        toast.success(`Attendance marked! (Demo Mode)`)
        return { success: true }
      }

      const attendanceColumn = await findAttendanceColumnForDate(date)
      
      if (!attendanceColumn) {
        toast.error(`No attendance column found for this date in ${currentTable}`)
        return { success: false, error: 'Column does not exist' }
      }
      
      const { data, error } = await supabase
        .from(currentTable)
        .update({
          [attendanceColumn]: present ? 'Present' : 'Absent'
        })
        .eq('id', memberId)

      if (error) throw error

      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, [attendanceColumn]: present ? 'Present' : 'Absent' }
          : member
      ))

      return { success: true }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
      return { success: false, error }
    }
  }

  // Bulk attendance marking for monthly table
  const bulkAttendance = async (memberIds, date, present) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - update local state
        const dateKey = date.toISOString().split('T')[0]
        const updates = {}
        memberIds.forEach(id => {
          updates[id] = present
        })
        setAttendanceData(prev => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            ...updates
          }
        }))
        toast.success(`Bulk attendance marked! (Demo Mode)`)
        return { success: true }
      }

      const attendanceColumn = await findAttendanceColumnForDate(date)
      
      if (!attendanceColumn) {
        toast.error(`No attendance column found for this date in ${currentTable}`)
        return { success: false, error: 'Column does not exist' }
      }
      
      const attendanceValue = present ? 'Present' : 'Absent'

      // Update each member's attendance in the monthly table
      const updatePromises = memberIds.map(memberId => 
        supabase
          .from(currentTable)
          .update({ [attendanceColumn]: attendanceValue })
          .eq('id', memberId)
      )

      const results = await Promise.all(updatePromises)
      
      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} records`)
      }

      // Update local state
      setMembers(prev => prev.map(member => 
        memberIds.includes(member.id)
          ? { ...member, [attendanceColumn]: attendanceValue }
          : member
      ))

      toast.success(`Bulk attendance marked successfully for ${memberIds.length} members!`)
      return { success: true }
    } catch (error) {
      console.error('Error marking bulk attendance:', error)
      toast.error('Failed to mark bulk attendance')
      return { success: false, error }
    }
  }

  // Fetch attendance for a specific date from monthly table
  const fetchAttendanceForDate = async (date) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - return mock attendance data
        const dateKey = date.toISOString().split('T')[0]
        return attendanceData[dateKey] || {}
      }

      const attendanceColumn = await findAttendanceColumnForDate(date)
      
      if (!attendanceColumn) {
        console.log(`No attendance column found for this date in ${currentTable}`)
        return {}
      }
      
      const { data, error } = await supabase
        .from(currentTable)
        .select(`id, "${attendanceColumn}"`)

      if (error) throw error

      // Transform to object format
      const attendanceMap = {}
      data.forEach(record => {
        if (record[attendanceColumn]) {
          attendanceMap[record.id] = record[attendanceColumn] === 'Present'
        }
      })

      return attendanceMap
    } catch (error) {
      console.error('Error fetching attendance:', error)
      return {}
    }
  }

  // Update member
  const updateMember = async (id, updates) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - update local state
        const updatedMember = { ...members.find(m => m.id === id), ...updates }
        setMembers(prev => prev.map(m => m.id === id ? updatedMember : m))
        toast.success('Member updated successfully! (Demo Mode)')
        // Refresh search results to ensure updated data is visible
        setTimeout(() => refreshSearch(), 100)
        return updatedMember
      }

      const { data, error } = await supabase
        .from(currentTable)
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      setMembers(prev => prev.map(m => m.id === id ? data[0] : m))
      toast.success(`Member updated successfully in ${currentTable}!`)
      // Refresh search results to ensure updated data is visible
      setTimeout(() => refreshSearch(), 100)
      return data[0]
    } catch (error) {
      console.error('Error updating member:', error)
      toast.error('Failed to update member')
      throw error
    }
  }

  // Delete member
  const deleteMember = async (id) => {
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - remove from local state
        setMembers(prev => prev.filter(m => m.id !== id))
        toast.success('Member deleted successfully! (Demo Mode)')
        return
      }

      const { error } = await supabase
        .from(currentTable)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setMembers(prev => prev.filter(m => m.id !== id))
      toast.success(`Member deleted successfully from ${currentTable}!`)
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Failed to delete member')
      throw error
    }
  }

  // Create new month by copying October's structure
  const createNewMonth = async ({ month, year, monthName, sundays }) => {
    try {
      const monthIdentifier = `${monthName}_${year}`
      
      if (!isSupabaseConfigured()) {
        // Demo mode - just show success message
        toast.success(`${monthIdentifier} created successfully! (Demo Mode)`)
        return { success: true, tableName: monthIdentifier }
      }

      console.log(`Creating new month table: ${monthIdentifier}`)

      // Use our new function to create month table by copying October's structure
      const { data: result, error: createError } = await supabase.rpc(
        'create_new_month_table',
        {
          new_month_name: monthIdentifier
        }
      )

      if (createError) {
        console.error('Error creating month table:', createError)
        throw new Error(`Failed to create month table: ${createError.message}`)
      }

      console.log('Month table creation result:', result)

      toast.success(`Month ${monthName} ${year} created successfully! Table copied from October template.`)
      
      // Refresh the monthly tables list from database
      await fetchMonthlyTables()
      
      // Switch to the new month
      changeCurrentTable(monthIdentifier)
      
      console.log(`Successfully created month: ${monthIdentifier}`)
      return { success: true, tableName: monthIdentifier, result }
    } catch (error) {
      console.error('Error creating new month:', error)
      
      // Provide detailed error information
      let errorMessage = 'Failed to create new month'
      if (error.message) {
        errorMessage += `: ${error.message}`
      } else if (error.error) {
        errorMessage += `: ${error.error}`
      }
      
      toast.error(errorMessage)
      throw error
    }
  }

  // Fetch available month tables from database
  const fetchMonthlyTables = async () => {
    try {
      if (!isSupabaseConfigured()) {
        console.log('Using fallback monthly tables - Supabase not configured')
        return
      }

      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
      const years = ['2024', '2025', '2026']
      const availableTables = []

      // Check each potential month table by trying to fetch from it
      for (const year of years) {
        for (const month of months) {
          const tableName = `${month}_${year}`
          try {
            // Try to fetch just one record to check if table exists
            const { data, error } = await supabase
              .from(tableName)
              .select('id')
              .limit(1)

            if (!error) {
              availableTables.push(tableName)
            }
          } catch (err) {
            // Table doesn't exist, skip it
            continue
          }
        }
      }

      if (availableTables.length > 0) {
        // Sort tables by year and then by month
        availableTables.sort((a, b) => {
          const [monthA, yearA] = a.split('_')
          const [monthB, yearB] = b.split('_')
          
          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB)
          }
          
          return months.indexOf(monthA) - months.indexOf(monthB)
        })
        
        setMonthlyTables(availableTables)
        console.log('Found monthly tables:', availableTables)
        // Removed automatic toast notification on page load
      } else {
        console.log('No monthly tables found, using fallback')
      }
    } catch (error) {
      console.error('Error fetching monthly tables:', error)
    }
  }

  // Debounce search term to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms debounce delay for better performance

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Enhanced filter members based on debounced search term with robust matching
  // Pre-compute searchable data for better performance
  const membersWithSearchData = useMemo(() => {
    return members.map(member => {
      const fullName = member['Full Name']?.toLowerCase() || ''
      const gender = member.Gender?.toLowerCase() || ''
      const phoneNumber = member['Phone Number']?.toString().toLowerCase() || ''
      const currentLevel = member['Current Level']?.toLowerCase() || ''
      const age = member.Age?.toString().toLowerCase() || ''
      
      // Pre-compute phone number without separators for faster matching
      const cleanPhoneNumber = phoneNumber.replace(/[-\s()]/g, '')
      
      // Create a single searchable text for faster single-pass searching
      const searchableText = `${fullName} ${gender} ${phoneNumber} ${currentLevel} ${age} ${cleanPhoneNumber}`
      
      return {
        ...member,
        _searchData: {
          fullName,
          gender,
          phoneNumber,
          currentLevel,
          age,
          cleanPhoneNumber,
          searchableText,
          nameWords: fullName.split(/\s+/).filter(word => word.length > 0)
        }
      }
    })
  }, [members])

  const filteredMembers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return membersWithSearchData
    }

    // Split search term into individual words for partial matching
    const searchWords = debouncedSearchTerm.toLowerCase().trim().split(/\s+/)
    
    return membersWithSearchData.filter(member => {
      const { searchableText, nameWords } = member._searchData
      
      // Check if ALL search words match somewhere in the member data
      return searchWords.every(searchWord => {
        // First check the combined searchable text (fastest)
        if (searchableText.includes(searchWord)) {
          return true
        }
        
        // If not found in combined text, check individual name words
        return nameWords.some(nameWord => nameWord.includes(searchWord))
      })
    })
  }, [membersWithSearchData, debouncedSearchTerm])

  // Function to refresh search results
  const refreshSearch = useCallback(() => {
    // Force immediate update of debounced search term
    setDebouncedSearchTerm(searchTerm)
  }, [searchTerm])

  // Wrapper function to set attendance date and save to localStorage
  const setAndSaveAttendanceDate = useCallback((date) => {
    setSelectedAttendanceDate(date)
    // Save to localStorage with current table as key
    const savedDateKey = `selectedAttendanceDate_${currentTable}`
    localStorage.setItem(savedDateKey, date.toISOString())
  }, [currentTable])

  // Fetch monthly tables on component mount
  useEffect(() => {
    fetchMonthlyTables()
  }, [])

  // Fetch members on component mount and when current table changes
  useEffect(() => {
    fetchMembers()
  }, [currentTable])

  // Initialize attendance dates when current table changes
  useEffect(() => {
    initializeAttendanceDates()
  }, [currentTable])

  // Wrapper function for setCurrentTable with localStorage persistence
  const changeCurrentTable = (tableName) => {
    setCurrentTable(tableName)
    localStorage.setItem('selectedMonthTable', tableName)
  }

  // Badge filter functions
  const toggleBadgeFilter = (badgeType) => {
    setBadgeFilter(prev => {
      const newFilter = prev.includes(badgeType)
        ? prev.filter(type => type !== badgeType)
        : [...prev, badgeType]
      
      // Save to localStorage
      localStorage.setItem('badgeFilter', JSON.stringify(newFilter))
      return newFilter
    })
  }

  // Helper function to check if member has a specific badge
  const memberHasBadge = (member, badgeType) => {
    const manualBadges = member['Manual Badges'] || []
    return manualBadges.includes(badgeType)
  }

  const value = {
    members,
    filteredMembers,
    loading,
    searchTerm,
    setSearchTerm,
    refreshSearch,
    addMember,
    updateMember,
    deleteMember,
    fetchMembers,
    attendanceData,
    setAttendanceData,
    markAttendance,
    bulkAttendance,
    fetchAttendanceForDate,
    currentTable,
    monthlyTables,
    setCurrentTable: changeCurrentTable,
    createNewMonth,
    fetchMonthlyTables,
    getAttendanceColumns,
    getAvailableAttendanceDates,
    findAttendanceColumnForDate,
    calculateAttendanceRate,
    calculateMemberBadge,
    updateMemberBadges,
    
    toggleMemberBadge,
    memberHasBadge,
    selectedAttendanceDate,
    setSelectedAttendanceDate,
    setAndSaveAttendanceDate,
    availableSundayDates,
    getAvailableSundayDates,
    initializeAttendanceDates,
    getSundaysInMonth,
    badgeFilter,
    toggleBadgeFilter
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext