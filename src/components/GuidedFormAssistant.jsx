import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { sortGuidedSteps } from '../utils/guidedFormSettings'

export const GuidedField = React.forwardRef(({
  active = false,
  children,
  className = '',
  cueLabel = 'Next',
  pulseCue = true
}, ref) => (
  <div ref={ref} className={`guided-form-field ${active ? 'guided-form-field-active' : ''} ${className}`}>
    {children}
    {active && (
      <button
        type="button"
        className={`guided-form-cue ${pulseCue ? 'guided-form-cue-pulse' : ''}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          window.dispatchEvent(new CustomEvent('datser-guided-form-next'))
        }}
        aria-label="Go to next guided field"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span>{cueLabel}</span>
      </button>
    )}
  </div>
))

GuidedField.displayName = 'GuidedField'

const isStepComplete = (step) => {
  if (!step) return true
  if (typeof step.isComplete === 'function') return Boolean(step.isComplete())
  return Boolean(step.isComplete)
}

const findFirstIncompleteStep = (steps = []) => (
  steps.find(step => !isStepComplete(step)) || null
)

const getFocusableElement = (step) => {
  const explicit = step?.focusRef?.current
  if (explicit && typeof explicit.focus === 'function') return explicit
  const target = step?.targetRef?.current
  if (!target) return null
  if (typeof target.focus === 'function' && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)) {
    return target
  }
  return target.querySelector?.('input, textarea, select, button, [tabindex]:not([tabindex="-1"])') || null
}

const scrollActiveStepIntoView = (element, scrollContainer) => {
  if (!element) return

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  })

  window.setTimeout(() => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight || 0
    const footerGuard = 132
    const rect = element.getBoundingClientRect()
    if (viewportHeight && rect.bottom > viewportHeight - footerGuard) {
      const delta = rect.bottom - (viewportHeight - footerGuard)
      if (scrollContainer) {
        scrollContainer.scrollTop += delta + 12
      } else {
        window.scrollBy({ top: delta + 12, behavior: 'smooth' })
      }
    }
  }, 260)
}

export const useGuidedFormAssistant = ({
  steps = [],
  settings,
  enabled = true,
  scrollContainerRef,
  onStepChange
}) => {
  const [manualStepId, setManualStepId] = useState(null)

  const visibleSteps = useMemo(
    () => sortGuidedSteps(steps, settings).filter(step => step.enabled !== false),
    [steps, settings]
  )

  const activeStep = useMemo(() => {
    if (!enabled || !settings?.enabled) return null
    const manualNext = settings?.manualNextAfterTyping === true
    if (manualStepId) {
      const manualStep = visibleSteps.find(step => step.id === manualStepId)
      if (manualStep && (manualNext || !isStepComplete(manualStep))) return manualStep
    }
    return findFirstIncompleteStep(visibleSteps)
  }, [enabled, manualStepId, settings?.enabled, settings?.manualNextAfterTyping, visibleSteps])

  const goToStep = useCallback((step) => {
    if (!step) return
    setManualStepId(step.id)
    step.onActive?.()
    const target = step.targetRef?.current
    scrollActiveStepIntoView(target, scrollContainerRef?.current)
    window.setTimeout(() => {
      const focusTarget = getFocusableElement(step)
      focusTarget?.focus?.({ preventScroll: true })
    }, 160)
  }, [scrollContainerRef])

  const goToNextStep = useCallback(() => {
    if (!activeStep) return
    const currentIndex = visibleSteps.findIndex(step => step.id === activeStep.id)
    const nextStep = visibleSteps
      .slice(Math.max(currentIndex + 1, 0))
      .find(step => !isStepComplete(step))

    if (nextStep) {
      goToStep(nextStep)
    } else {
      setManualStepId(null)
    }
  }, [activeStep, goToStep, visibleSteps])

  useEffect(() => {
    if (!activeStep || !manualStepId) return
    if (settings?.manualNextAfterTyping === true) return
    if (activeStep.id !== manualStepId) setManualStepId(null)
  }, [activeStep, manualStepId, settings?.manualNextAfterTyping])

  useEffect(() => {
    if (!enabled || !settings?.enabled) {
      setManualStepId(null)
      return
    }
    if (settings?.manualNextAfterTyping !== true) return
    setManualStepId((currentId) => {
      if (currentId && visibleSteps.some(step => step.id === currentId)) return currentId
      return findFirstIncompleteStep(visibleSteps)?.id || null
    })
  }, [enabled, settings?.enabled, settings?.manualNextAfterTyping, visibleSteps])

  useEffect(() => {
    if (!enabled || !settings?.enabled) return undefined
    window.addEventListener('datser-guided-form-next', goToNextStep)
    return () => window.removeEventListener('datser-guided-form-next', goToNextStep)
  }, [enabled, goToNextStep, settings?.enabled])

  useEffect(() => {
    if (!activeStep) {
      onStepChange?.(null)
      return
    }

    onStepChange?.(activeStep)
    activeStep.onActive?.()

    const target = activeStep.targetRef?.current
    if (settings?.autoScrollToActiveField) {
      window.setTimeout(() => scrollActiveStepIntoView(target, scrollContainerRef?.current), 80)
    }

    if (settings?.autoFocusNextField) {
      window.setTimeout(() => {
        const focusTarget = getFocusableElement(activeStep)
        focusTarget?.focus?.({ preventScroll: true })
      }, 180)
    }
  }, [
    activeStep,
    onStepChange,
    scrollContainerRef,
    settings?.autoFocusNextField,
    settings?.autoScrollToActiveField
  ])

  return {
    activeStepId: activeStep?.id || null,
    activeStep,
    goToNextStep
  }
}
