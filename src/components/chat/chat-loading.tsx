import { Loader } from "lucide-react"
import { FC } from "react"

interface Props {}

const ChatLoading: FC<Props> = () => {
  return (
    <div className="container mx-auto py-6">
      <Loader className="animate-spin" />
    </div>
  )
}

export default ChatLoading
