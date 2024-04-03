import { useState } from "react"

import { ChatType } from "@/features/chat/models"

export interface FileState {
  showFileUpload: ChatType
  setShowFileUpload: (value: ChatType) => void
  isFileNull: boolean
  setIsFileNull: (value: boolean) => void
  isUploadingFile: boolean
  setIsUploadingFile: (value: boolean) => void
  uploadButtonLabel: string
  setUploadButtonLabel: (value: string) => void
}

export const useFileState = (): FileState => {
  const [showFileUpload, _setShowFileUpload] = useState<ChatType>(ChatType.Simple)
  const [isFileNull, _setIsFileNull] = useState(true)
  const [isUploadingFile, _setIsUploadingFile] = useState(false)
  const [uploadButtonLabel, _setUploadButtonLabel] = useState("")

  return {
    showFileUpload,
    setShowFileUpload: (value: ChatType) => {
      _setShowFileUpload(value)
    },
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
