import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CombinedDatePicker from './CombinedDatePicker'

describe('CombinedDatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 6))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('emits an event-style payload when name is provided', () => {
    const handleChange = vi.fn()

    render(
      <CombinedDatePicker
        name="date_of_birth"
        value=""
        onChange={handleChange}
        label="Date of Birth"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /select date/i }))
    const dropdown = screen.getByTestId('combined-date-picker-date-of-birth-dropdown')
    fireEvent.click(within(dropdown).getByRole('button', { name: '12' }))
    fireEvent.click(within(dropdown).getByRole('button', { name: 'Save' }))

    expect(handleChange).toHaveBeenCalledWith({
      target: {
        name: 'date_of_birth',
        value: '2026-05-12'
      }
    })
  })

  it('emits a raw value when name is not provided', () => {
    const handleChange = vi.fn()

    render(
      <CombinedDatePicker
        value=""
        onChange={handleChange}
        label="Date of Birth"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /select date/i }))
    const dropdown = screen.getByTestId('combined-date-picker-date-of-birth-dropdown')
    fireEvent.click(within(dropdown).getByRole('button', { name: '5' }))
    fireEvent.click(within(dropdown).getByRole('button', { name: 'Save' }))

    expect(handleChange).toHaveBeenCalledWith('2026-05-05')
  })

  it('keeps month/year selection open until the user applies it', () => {
    const handleChange = vi.fn()

    render(
      <CombinedDatePicker
        value=""
        onChange={handleChange}
        label="Date of Birth"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /select date/i }))
    const dropdown = screen.getByTestId('combined-date-picker-date-of-birth-dropdown')

    fireEvent.click(within(dropdown).getByRole('button', { name: /tap to change month and year/i }))
    expect(within(dropdown).getByText('Select Month & Year')).toBeTruthy()

    fireEvent.click(within(dropdown).getByRole('button', { name: 'February' }))
    expect(within(dropdown).getByText('Select Month & Year')).toBeTruthy()

    fireEvent.click(within(dropdown).getByRole('button', { name: '2020' }))
    expect(within(dropdown).getByText('Select Month & Year')).toBeTruthy()

    fireEvent.click(within(dropdown).getByRole('button', { name: 'Apply' }))

    expect(within(dropdown).getByRole('button', { name: /tap to change month and year/i }).textContent).toContain('February 2020')
  })
})
