import { Loader } from "lucide-react"
import { FC } from "react"

import Typography from "@/components/typography"

interface Props {}

const ChatLoading: FC<Props> = () => {
  return (
    <div className="container pt-2">
      <div className="justify-left flex items-center rounded-md bg-information p-3">
        <Typography variant="p" className="animate-pulse font-semibold text-white">
          Crafting a response...
        </Typography>
        <Loader className="animate-pulse" size={12} />
      </div>
    </div>
  )
}

export default ChatLoading
