const DAY_MS = 24 * 60 * 60 * 1000
const THREE_MONTH_DAYS = 84
const RECENT_CONTACT_DAYS = 30

export const DEFAULT_FOLLOW_UP_TEMPLATE =
  'Hi {name}, we missed you at teen ministry. Hope you are doing well. Will you be able to join us this Sunday?'

export const FOLLOW_UP_TABS = [
  { id: 'regular', label: 'Regular' },
  { id: 'watch', label: 'Watch' },
  { id: 'follow_up', label: 'Follow Up' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'new', label: 'New/Insufficient Data' }
]

export const FOLLOW_UP_STAGES = [
  { id: 'not_contacted', label: 'Not Contacted' },
  { id: 'message_sent', label: 'Message Sent' },
  { id: 'called', label: 'Called' },
  { id: 'responded', label: 'Responded' },
  { id: 'promised_to_come', label: 'Promised to Come' },
  { id: 'visited', label: 'Visited' },
  { id: 'resolved', label: 'Resolved' }
]

export const normalizeDateKey = (dateValue) => {
  if (!dateValue) return ''
  if (dateValue instanceof Date) {
    if (Number.isNaN(dateValue.getTime())) return ''
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const value = String(dateValue)
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : normalizeDateKey(parsed)
}

const parseDateKey = (dateKey) => {
  const normalized = normalizeDateKey(dateKey)
  if (!normalized) return null
  const [year, month, day] = normalized.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const normalizeAttendanceStatus = (status) => {
  if (status === true) return 'present'
  if (status === false) return 'absent'
  if (status == null || status === '') return 'unknown'

  const normalized = String(status).trim().toLowerCase()
  if (['present', 'p', 'yes', 'true'].includes(normalized)) return 'present'
  if (['absent', 'a', 'no', 'false'].includes(normalized)) return 'absent'
  if (['excused', 'excuse', 'excused_absence'].includes(normalized)) return 'excused'
  return 'unknown'
}

export const getMemberDisplayName = (member) =>
  member?.full_name || member?.['Full Name'] || member?.name || 'Unknown'

export const getMemberPhoneValue = (member) =>
  member?.phone_number ||
  member?.['Phone Number'] ||
  member?.parent_phone_number ||
  member?.['Parent Phone Number'] ||
  member?.phone ||
  member?.Phone ||
  ''

const getMemberRegistrationDate = (member) => {
  const value =
    member?.created_at ||
    member?.inserted_at ||
    member?.registration_date ||
    member?.['Registration Date'] ||
    member?.['Joined Date'] ||
    member?.joined_at

  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null
}

const countStatuses = (records) => records.reduce((counts, record) => {
  counts.total += 1
  counts[record.status] = (counts[record.status] || 0) + 1
  return counts
}, { total: 0, present: 0, absent: 0, excused: 0, unknown: 0 })

const getConsecutiveAbsences = (records) => {
  let count = 0
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const status = records[index]?.status
    if (status === 'absent') {
      count += 1
      continue
    }
    break
  }
  return count
}

const getLastAttendedDate = (records) => {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index]?.status === 'present') {
      return records[index].dateKey
    }
  }
  return null
}

const getLatestFollowUpByMember = (followUpRecords = []) => {
  const latest = new Map()
  followUpRecords.forEach((record) => {
    const memberId = record?.member_id || record?.memberId
    if (!memberId) return
    const createdAt = new Date(record.created_at || record.createdAt || 0).getTime()
    const current = latest.get(memberId)
    const currentCreatedAt = current ? new Date(current.created_at || current.createdAt || 0).getTime() : -1
    if (!current || createdAt >= currentCreatedAt) {
      latest.set(memberId, record)
    }
  })
  return latest
}

const getStageLabel = (stageId) => FOLLOW_UP_STAGES.find((stage) => stage.id === stageId)?.label || 'Not Contacted'

const getFollowUpStageId = (record) => {
  const value = record?.follow_up_status || record?.followUpStatus || record?.stage || 'not_contacted'
  return FOLLOW_UP_STAGES.some((stage) => stage.id === value) ? value : 'not_contacted'
}

const daysBetween = (a, b) => Math.floor((a.getTime() - b.getTime()) / DAY_MS)

export const buildAttendanceSessions = ({ availableSundayDates = [], attendanceData = {} }) => {
  const keys = new Set()
  availableSundayDates.forEach((date) => {
    const key = normalizeDateKey(date)
    if (key) keys.add(key)
  })
  Object.keys(attendanceData || {}).forEach((date) => {
    const key = normalizeDateKey(date)
    if (key) keys.add(key)
  })

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return Array.from(keys)
    .map((dateKey) => ({ dateKey, date: parseDateKey(dateKey) }))
    .filter((session) => session.date && session.date <= todayStart)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export const buildSuggestedMessage = (template = DEFAULT_FOLLOW_UP_TEMPLATE, record = {}) =>
  String(template || DEFAULT_FOLLOW_UP_TEMPLATE)
    .replaceAll('{name}', record.name || 'there')
    .replaceAll('{rate}', `${record.attendanceRate ?? record.rate ?? 0}%`)
    .replaceAll('{lastAttendedDate}', record.lastAttendedDate || 'recently')
    .replaceAll('{reason}', record.followUpReason || record.reason || '')

export const calculateMemberFollowUp = ({
  member,
  sessions,
  attendanceData,
  latestFollowUp,
  messageTemplate = DEFAULT_FOLLOW_UP_TEMPLATE,
  now = new Date()
}) => {
  const registrationDate = getMemberRegistrationDate(member)
  const memberSessions = sessions
    .filter((session) => !registrationDate || session.date >= registrationDate)
    .map((session) => ({
      ...session,
      status: normalizeAttendanceStatus(attendanceData?.[session.dateKey]?.[member.id])
    }))

  const last4 = memberSessions.slice(-4)
  const last8 = memberSessions.slice(-8)
  const last12 = memberSessions.slice(-12)
  const counts4 = countStatuses(last4)
  const counts8 = countStatuses(last8)
  const counts12 = countStatuses(last12)
  const known4 = counts4.present + counts4.absent + counts4.excused
  const known12 = counts12.present + counts12.absent + counts12.excused
  const checkedDenominator = counts12.present + counts12.absent
  const attendanceRate = checkedDenominator > 0
    ? Math.round((counts12.present / checkedDenominator) * 100)
    : 0
  const lastAttendedDate = getLastAttendedDate(memberSessions)
  const lastAttended = lastAttendedDate ? parseDateKey(lastAttendedDate) : null
  const consecutiveAbsences = getConsecutiveAbsences(memberSessions)

  let category = 'new'
  let followUpStatus = 'new_insufficient_data'
  let followUpReason = `Only ${memberSessions.length} attendance sessions since registration.`

  if (memberSessions.length < 4 || known4 < 4) {
    category = 'new'
    followUpStatus = 'new_insufficient_data'
    followUpReason = memberSessions.length < 4
      ? `Only ${memberSessions.length} attendance sessions since registration.`
      : 'Not enough marked attendance records in the last 4 Sundays.'
  } else if (
    (last12.length >= 12 && known12 >= 12 && counts12.present === 0 && counts12.absent > 0) ||
    (lastAttended && daysBetween(new Date(now.getFullYear(), now.getMonth(), now.getDate()), lastAttended) >= THREE_MONTH_DAYS)
  ) {
    category = 'inactive'
    followUpStatus = 'inactive'
    followUpReason = lastAttendedDate
      ? `Last attended on ${lastAttendedDate}, about 3 months ago.`
      : 'No attendance recorded in the last 12 Sundays.'
  } else if (counts4.present >= 3) {
    category = 'regular'
    followUpStatus = 'regular'
    followUpReason = `Attended ${counts4.present} of the last 4 Sundays.`
  } else if (counts4.present >= 1 && counts4.present <= 2) {
    category = 'watch'
    followUpStatus = 'watch'
    followUpReason = `Attended only ${counts4.present} of the last 4 Sundays.`
  } else if (counts4.excused > 0 && counts4.absent < 3) {
    category = 'watch'
    followUpStatus = 'watch'
    followUpReason = 'Recent absences are mostly excused, so keep them on watch.'
  } else if (counts4.present === 0 && (counts4.absent >= 4 || consecutiveAbsences >= 3)) {
    category = 'follow_up'
    followUpStatus = 'follow_up'
    followUpReason = consecutiveAbsences >= 3
      ? `Missed ${consecutiveAbsences} Sundays in a row.`
      : 'No attendance in the last 4 Sundays.'
  }

  const stageId = getFollowUpStageId(latestFollowUp)
  const contactCreatedAt = latestFollowUp?.created_at || latestFollowUp?.createdAt
  const contactDate = contactCreatedAt ? new Date(contactCreatedAt) : null
  const wasContactedRecently = Boolean(
    contactDate &&
    !Number.isNaN(contactDate.getTime()) &&
    daysBetween(new Date(now.getFullYear(), now.getMonth(), now.getDate()), contactDate) <= RECENT_CONTACT_DAYS
  )

  if (stageId === 'resolved') {
    category = 'resolved'
    followUpStatus = 'resolved'
    followUpReason = latestFollowUp?.response || 'Follow-up was marked as resolved.'
  } else if (stageId !== 'not_contacted' && wasContactedRecently) {
    category = 'contacted'
    followUpStatus = stageId
    followUpReason = latestFollowUp?.response || `Current follow-up stage: ${getStageLabel(stageId)}.`
  }

  const record = {
    id: member.id,
    member,
    name: getMemberDisplayName(member),
    phone: getMemberPhoneValue(member),
    category,
    followUpStatus,
    followUpStage: stageId,
    followUpStageLabel: getStageLabel(stageId),
    followUpReason,
    totalSessionsChecked: last12.length,
    sessionsAfterRegistration: memberSessions.length,
    presentCount: counts12.present,
    absentCount: counts12.absent,
    excusedCount: counts12.excused,
    unknownCount: counts12.unknown,
    last4Present: counts4.present,
    last8Present: counts8.present,
    last12Present: counts12.present,
    attendanceRate,
    rate: attendanceRate,
    lastAttendedDate,
    consecutiveAbsences,
    latestFollowUp: latestFollowUp || null
  }

  return {
    ...record,
    suggestedMessage: buildSuggestedMessage(messageTemplate, record)
  }
}

export const calculateAttendanceFollowUps = ({
  members = [],
  attendanceData = {},
  availableSundayDates = [],
  followUpRecords = [],
  messageTemplate = DEFAULT_FOLLOW_UP_TEMPLATE,
  now = new Date()
}) => {
  const sessions = buildAttendanceSessions({ availableSundayDates, attendanceData })
  const latestByMember = getLatestFollowUpByMember(followUpRecords)
  const records = members.map((member) => calculateMemberFollowUp({
    member,
    sessions,
    attendanceData,
    latestFollowUp: latestByMember.get(member.id),
    messageTemplate,
    now
  }))

  const buckets = FOLLOW_UP_TABS.reduce((acc, tab) => {
    acc[tab.id] = []
    return acc
  }, {})

  records.forEach((record) => {
    const key = buckets[record.category] ? record.category : 'new'
    buckets[key].push(record)
  })

  Object.keys(buckets).forEach((key) => {
    buckets[key].sort((a, b) => (
      a.attendanceRate - b.attendanceRate ||
      b.consecutiveAbsences - a.consecutiveAbsences ||
      a.name.localeCompare(b.name)
    ))
  })

  return {
    sessions,
    totalSundays: sessions.length,
    records,
    buckets,
    ...buckets
  }
}
