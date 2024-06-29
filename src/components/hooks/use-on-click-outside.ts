import { RefObject, useEffect } from "react"

const useOnClickOutside = (
  ref: RefObject<Element>,
  handler: (e: MouseEvent | KeyboardEvent | undefined) => void
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent): void => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    const escapeListener = (event: KeyboardEvent): void => {
      if (!ref.current || event.key !== "Escape") {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("keydown", escapeListener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("keydown", escapeListener)
    }
  }, [ref, handler])
}

export default useOnClickOutside
