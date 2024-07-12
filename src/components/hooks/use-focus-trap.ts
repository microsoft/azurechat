import { RefObject, useEffect, useRef } from "react"

export default function useFocusTrap<T extends HTMLElement>(ref?: RefObject<T> | null): RefObject<T> {
  const elementRef = useRef<T>(ref?.current || null)

  useEffect(() => {
    const focusTrap = (event: KeyboardEvent): void => {
      if (event.key !== "Tab" || !elementRef.current) return

      const focusableElements = elementRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        }
      } else if (document.activeElement === lastElement) {
        firstElement.focus()
        event.preventDefault()
      }
    }

    elementRef.current?.addEventListener("keydown", focusTrap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => elementRef.current?.removeEventListener("keydown", focusTrap)
  }, [])

  return elementRef
}
