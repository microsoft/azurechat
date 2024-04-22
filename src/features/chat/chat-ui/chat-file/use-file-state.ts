import { useState } from "react"

export interface FileState {
  isFileNull: boolean
  setIsFileNull: (value: boolean) => void
  isUploadingFile: boolean
  setIsUploadingFile: (value: boolean) => void
  uploadButtonLabel: string
  setUploadButtonLabel: (value: string) => void
}

export const useFileState = (): FileState => {
  const [isFileNull, _setIsFileNull] = useState(true)
  const [isUploadingFile, _setIsUploadingFile] = useState(false)
  const [uploadButtonLabel, _setUploadButtonLabel] = useState("")

  return {
    isFileNull,
    setIsFileNull: (value: boolean) => {
      _setIsFileNull(value)
    },
    isUploadingFile,
    setIsUploadingFile: (value: boolean) => {
      _setIsUploadingFile(value)
    },
    uploadButtonLabel,
    setUploadButtonLabel: (value: string) => {
      _setUploadButtonLabel(value)
    },
  }
}
