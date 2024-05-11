// ChatFilesDisplay.tsx

import { FC } from "react"

import Typography from "@/components/typography"

interface ChatFilesDisplayProps {
  files: string[]
}

export const ChatFilesDisplay: FC<ChatFilesDisplayProps> = ({ files }) => {
  const descriptor = files.length > 1 ? "Files" : "File"

  return (
    <div className="flex size-auto flex-col items-center justify-center gap-1 rounded-md bg-backgroundShade p-2">
      <Typography variant="p" className="items-center font-bold" tabIndex={0}>
        Uploaded {descriptor}:
      </Typography>
      {files.map((file, index) => (
        <Typography key={index} variant="span" className="mt-0 items-center" tabIndex={0}>
          {file}
        </Typography>
      ))}
    </div>
  )
}
