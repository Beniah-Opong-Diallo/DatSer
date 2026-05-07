export const compareVersions = (leftVersion, rightVersion) => {
  const parsePart = (part) => {
    const match = String(part ?? '').match(/\d+/)
    return match ? Number(match[0]) : 0
  }

  const leftParts = String(leftVersion || '0').split(/[.-]/).map(parsePart)
  const rightParts = String(rightVersion || '0').split(/[.-]/).map(parsePart)
  const length = Math.max(leftParts.length, rightParts.length, 3)

  for (let index = 0; index < length; index += 1) {
    const left = leftParts[index] ?? 0
    const right = rightParts[index] ?? 0

    if (left > right) return 1
    if (left < right) return -1
  }

  return 0
}

export const isVersionGreater = (latestVersion, currentVersion) =>
  compareVersions(latestVersion, currentVersion) > 0
