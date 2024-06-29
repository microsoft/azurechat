import { Dispatch, ReactNode, useEffect, useReducer, useRef } from "react"
import { createPortal } from "react-dom"

import Overlay from "@/features/ui/overlay"
import { ActionBase } from "@/lib/utils"

export default function Announcements(): JSX.Element | null {
  const [state, dispatch] = useReducer(announcementReducer, { show: false })
  const announcementRootElementId = "announcement-container"
  const overlayRef = useRef<HTMLDivElement>()

  const callback = (action: Action): void => dispatch({ ...action })

  useEffect(() => {
    controller.subscribe(callback)
  }, [])

  useEffect(() => {
    const node = document.createElement("div")
    node.setAttribute("id", announcementRootElementId)
    node.setAttribute("style", "position: absolute; z-index: 999;")
    document.body.appendChild(node)
    overlayRef.current = node
    return () => {
      document.body.removeChild(node)
    }
  }, [])

  if (!overlayRef?.current || !state.content) return null

  return createPortal(<Overlay>{state.content}</Overlay>, overlayRef.current)
}

export const announcement = {
  newsflash: (content: ReactNode) => controller.show(content),
  dismiss: () => controller.hide(),
}

type State = {
  show: boolean
  content?: ReactNode
}
type Action = ActionBase<"SHOW", { payload: { content: ReactNode } }> | ActionBase<"HIDE">

function announcementReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SHOW":
      return {
        content: action.payload.content,
        show: true,
      }
    case "HIDE":
      return {
        content: undefined,
        show: false,
      }
    default:
      return state
  }
}

const controller = (function Controller() {
  let callbackFn: Dispatch<Action>
  return {
    subscribe(callback: Dispatch<Action>) {
      callbackFn = callback
    },
    show(content: ReactNode) {
      callbackFn({ type: "SHOW", payload: { content } })
    },
    hide() {
      callbackFn({ type: "HIDE" })
    },
  }
})()
