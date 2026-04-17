import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CombinedDatePicker from './CombinedDatePicker'

describe('CombinedDatePicker', () => {
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
    fireEvent.click(screen.getByText('12', { selector: 'span' }))
    fireEvent.click(screen.getByText('April', { selector: 'span' }))
    fireEvent.click(screen.getByText('2024', { selector: 'span' }))

    expect(handleChange).toHaveBeenCalledWith({
      target: {
        name: 'date_of_birth',
        value: '2024-04-12'
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
    fireEvent.click(screen.getByText('5', { selector: 'span' }))
    fireEvent.click(screen.getByText('May', { selector: 'span' }))
    fireEvent.click(screen.getByText('2023', { selector: 'span' }))

    expect(handleChange).toHaveBeenCalledWith('2023-05-05')
  })
})
