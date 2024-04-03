import { Square } from "lucide-react"
import { FC } from "react"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { Button } from "@/features/ui/button"

interface StopButtonProps {
  disabled: boolean
}

export const StopSpeech: FC<StopButtonProps> = props => {
  const { speech } = useChatContext()
  return (
    <Button disabled={props.disabled} onClick={speech.stopPlaying} type="button" size="icon" variant={"ghost"}>
      <Square size={18} />
    </Button>
  )
}
