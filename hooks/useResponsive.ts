'use client'

import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large'

interface BreakpointValues {
  mobile: boolean
  tablet: boolean
  desktop: boolean
  large: boolean
}

/**
 * Hook for responsive design breakpoints.
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: 1024px - 1439px
 * - large: >= 1440px
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>({
    mobile: false,
    tablet: false,
    desktop: true,
    large: false,
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width < 768) {
        setBreakpoint('mobile')
        setBreakpoints({ mobile: true, tablet: false, desktop: false, large: false })
      } else if (width < 1024) {
        setBreakpoint('tablet')
        setBreakpoints({ mobile: false, tablet: true, desktop: false, large: false })
      } else if (width < 1440) {
        setBreakpoint('desktop')
        setBreakpoints({ mobile: false, tablet: false, desktop: true, large: false })
      } else {
        setBreakpoint('large')
        setBreakpoints({ mobile: false, tablet: false, desktop: false, large: true })
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  return {
    breakpoint,
    ...breakpoints,
    isMounted,
  }
}

/**
 * Hook to check if touch is supported (mobile device)
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check various touch-related properties
    const hasTouch =
      () =>
        !!(
          typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0)
        )

    setIsTouchDevice(hasTouch())
  }, [])

  return isTouchDevice
}

/**
 * Hook for debounced window resize
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return windowSize
}

/**
 * Hook to check if viewport is portrait or landscape
 */
export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(true)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return {
    isPortrait,
    isLandscape: !isPortrait,
  }
}
