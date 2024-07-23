import { FC } from "react"

import Typography from "@/components/typography"

interface ChatFilesDisplayProps {
  files: string[]
}

export const ChatFilesDisplay: FC<ChatFilesDisplayProps> = ({ files }) => {
  const descriptor = files.length > 1 ? "Files" : "File"

  return (
    <div className="flex min-h-[40px] items-center gap-1 rounded-md bg-backgroundShade p-2">
      <Typography variant="p" className="font-bold" tabIndex={0}>
        Uploaded {descriptor}:
      </Typography>
      <div className="flex flex-wrap">
        {files.map((file, index) => (
          <Typography key={index} variant="span" className="ml-1" tabIndex={0}>
            {file}
          </Typography>
        ))}
      </div>
    </div>
  )
}
