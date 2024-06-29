import { RefObject, useEffect, useState } from "react"

export default function useOnScreen(ref: RefObject<Element>): boolean {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const onIntersection = ([entry]: IntersectionObserverEntry[]): void => setIntersecting(entry.isIntersecting)
    const observer = new IntersectionObserver(onIntersection)

    if (!ref.current) return () => {}
    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}
