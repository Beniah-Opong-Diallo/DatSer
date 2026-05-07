import { describe, expect, it } from 'vitest'
import { compareVersions, isVersionGreater } from './versionCompare'

describe('versionCompare', () => {
  it('detects a newer patch version', () => {
    expect(isVersionGreater('1.0.1', '1.0.0')).toBe(true)
  })

  it('treats equal versions with omitted patch parts as equal', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0)
  })

  it('does not mark older versions as newer', () => {
    expect(isVersionGreater('1.0.0', '1.1.0')).toBe(false)
  })

  it('compares multi-digit version parts numerically', () => {
    expect(isVersionGreater('1.10.0', '1.9.9')).toBe(true)
  })
})
