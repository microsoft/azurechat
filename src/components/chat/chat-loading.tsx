import { Loader } from "lucide-react"
import { FC } from "react"

import Typography from "@/components/typography"

interface Props {}

const ChatLoading: FC<Props> = () => {
  return (
    <div className="justify-left container mx-auto flex items-center space-x-4 py-3 pl-10">
      <Typography variant="p" className="animate-pulse">
        Crafting a response...
      </Typography>
      <Loader className="animate-pulse" size={12} />
    </div>
  )
}

export default ChatLoading
