import { describe, expect, it } from 'vitest'
import { calculateAttendanceFollowUps } from './attendanceFollowUp'

const sundayDates = [
  '2026-01-04',
  '2026-01-11',
  '2026-01-18',
  '2026-01-25',
  '2026-02-01',
  '2026-02-08',
  '2026-02-15',
  '2026-02-22',
  '2026-03-01',
  '2026-03-08',
  '2026-03-15',
  '2026-03-22'
]

const makeAttendance = (memberId, statuses) => sundayDates.reduce((acc, date, index) => {
  acc[date] = { ...(acc[date] || {}), [memberId]: statuses[index] }
  return acc
}, {})

describe('calculateAttendanceFollowUps', () => {
  it('marks a member regular when they attended at least 3 of the last 4 Sundays', () => {
    const members = [{ id: 'member-1', full_name: 'Regular Member', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-1', [
      false, true, true, false, true, false, true, true, false, true, true, true
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.regular).toHaveLength(1)
    expect(result.regular[0].last4Present).toBe(3)
  })

  it('does not turn missing records into follow-up absences', () => {
    const members = [{ id: 'member-2', full_name: 'Missing Data', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-2', [
      true, true, true, true, true, true, true, true, null, null, null, null
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.follow_up).toHaveLength(0)
    expect(result.new[0].followUpReason).toMatch(/Not enough marked/)
  })

  it('marks explicit repeated absences as follow up', () => {
    const members = [{ id: 'member-3', full_name: 'Needs Care', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-3', [
      true, true, true, true, true, true, true, true, false, false, false, false
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.follow_up).toHaveLength(1)
    expect(result.follow_up[0].consecutiveAbsences).toBe(4)
  })

  it('marks a member inactive when they have no present records in the last 12 Sundays', () => {
    const members = [{ id: 'member-6', full_name: 'Inactive Member', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-6', [
      false, false, false, false, false, false, false, false, false, false, false, false
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.inactive).toHaveLength(1)
    expect(result.inactive[0].presentCount).toBe(0)
    expect(result.inactive[0].absentCount).toBe(12)
  })

  it('does not count excused absences the same as normal absences', () => {
    const members = [{ id: 'member-7', full_name: 'Excused Member', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-7', [
      true, true, true, true, true, true, true, true, 'excused', false, 'excused', false
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.follow_up).toHaveLength(0)
    expect(result.watch).toHaveLength(1)
    expect(result.watch[0].excusedCount).toBe(2)
  })

  it('keeps new members as insufficient data until 4 sessions after registration', () => {
    const members = [{ id: 'member-4', full_name: 'New Member', created_at: '2026-03-05' }]
    const attendanceData = makeAttendance('member-4', [
      null, null, null, null, null, null, null, null, false, false, false, false
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      now: new Date('2026-03-23')
    })

    expect(result.follow_up).toHaveLength(0)
    expect(result.new).toHaveLength(1)
  })

  it('moves recently contacted members to the contacted tab', () => {
    const members = [{ id: 'member-5', full_name: 'Contacted Member', created_at: '2025-12-01' }]
    const attendanceData = makeAttendance('member-5', [
      true, true, true, true, true, true, true, true, false, false, false, false
    ])

    const result = calculateAttendanceFollowUps({
      members,
      attendanceData,
      availableSundayDates: sundayDates,
      followUpRecords: [{
        member_id: 'member-5',
        follow_up_status: 'called',
        response: 'Parent said they will try this Sunday.',
        created_at: '2026-03-21T12:00:00Z'
      }],
      now: new Date('2026-03-23')
    })

    expect(result.follow_up).toHaveLength(0)
    expect(result.contacted).toHaveLength(1)
    expect(result.contacted[0].followUpStatus).toBe('called')
  })
})
