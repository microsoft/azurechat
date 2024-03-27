import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import { XCircle, Ban, FileQuestion } from "lucide-react"
import { FeedbackType } from "../chat/models"

interface FeedbackButtonsProps {
  areTabsEnabled: boolean
  onFeedbackTypeChange: (type: FeedbackType) => void
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ areTabsEnabled, onFeedbackTypeChange }) => {
  const mapToFeedbackType = (type: string): FeedbackType => {
    switch (type) {
      case "harmful":
        return FeedbackType.HarmfulUnsafe
      case "inaccurate":
        return FeedbackType.Inaccurate
      case "unhelpful":
        return FeedbackType.Unhelpful
      default:
        return FeedbackType.None
    }
  }
  return (
    <div className="p-4">
      <Tabs defaultValue={""} onValueChange={type => onFeedbackTypeChange(mapToFeedbackType(type))}>
        <TabsList className="grid h-12 w-full grid-cols-3 items-stretch">
          <TabsTrigger
            value={FeedbackType.HarmfulUnsafe}
            className="flex grow items-center justify-center gap-2 px-3 py-2"
            disabled={!areTabsEnabled}
            aria-label="Mark feedback as unsafe"
          >
            <Ban size={20} aria-hidden="true" /> Unsafe
          </TabsTrigger>
          <TabsTrigger
            value={FeedbackType.Inaccurate}
            className="flex grow items-center justify-center gap-2 px-3 py-2"
            disabled={!areTabsEnabled}
            aria-label="Mark feedback as inaccurate"
          >
            <XCircle size={20} aria-hidden="true" /> Inaccurate
          </TabsTrigger>
          <TabsTrigger
            value={FeedbackType.Unhelpful}
            className="flex grow items-center justify-center gap-2 px-3 py-2"
            disabled={!areTabsEnabled}
            aria-label="Mark feedback as unhelpful"
          >
            <FileQuestion size={20} aria-hidden="true" /> Unhelpful
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

export default FeedbackButtons
