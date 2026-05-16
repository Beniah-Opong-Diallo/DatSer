import { useCallback, useRef, useState } from 'react'

const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 0.7

const isMobileSheet = () => {
  if (typeof window === 'undefined') return false
  // Increased threshold to 1024px to cover more tablets and large phones
  return window.matchMedia('(max-width: 1024px)').matches
}

const useBottomSheetDrag = ({ onDismiss, enabled = true, dismissDistance = DISMISS_DISTANCE } = {}) => {
  const startYRef = useRef(0)
  const startTimeRef = useRef(0)
  const draggingRef = useRef(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const resetDrag = useCallback(() => {
    draggingRef.current = false
    setIsDragging(false)
    setDragY(0)
  }, [])

  const handlePointerDown = useCallback((event) => {
    if (!enabled || !isMobileSheet()) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    draggingRef.current = true
    startYRef.current = event.clientY
    startTimeRef.current = performance.now()
    setIsDragging(true)
    setDragY(0)

    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  }, [enabled])

  const handlePointerMove = useCallback((event) => {
    if (!draggingRef.current) return

    const deltaY = event.clientY - startYRef.current
    const resistedY = deltaY < 0 ? deltaY * 0.18 : deltaY
    setDragY(Math.max(-24, resistedY))
    event.preventDefault()
  }, [])

  const handlePointerUp = useCallback((event) => {
    if (!draggingRef.current) return

    const deltaY = event.clientY - startYRef.current
    const elapsed = Math.max(1, performance.now() - startTimeRef.current)
    const velocity = deltaY / elapsed
    const shouldDismiss = deltaY > dismissDistance || velocity > DISMISS_VELOCITY

    event.currentTarget.releasePointerCapture?.(event.pointerId)
    draggingRef.current = false
    setIsDragging(false)

    if (shouldDismiss) {
      setDragY(window.innerHeight)
      window.setTimeout(() => onDismiss?.(), 140)
      return
    }

    setDragY(0)
  }, [dismissDistance, onDismiss])

  const handlePointerCancel = useCallback((event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    resetDrag()
  }, [resetDrag])

  return {
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: { touchAction: 'none' } // Essential for preventing browser scroll interference
    },
    sheetStyle: {
      transform: `translateY(${dragY}px)`,
      transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
      willChange: 'transform'
    },
    isDragging
  }
}

export default useBottomSheetDrag
