import { IndexDocuments, UploadDocument } from "@/features/chat/chat-services/chat-document-service"
import { UpdateChatThreadToFileDetails } from "@/features/chat/chat-services/chat-thread-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"

interface Props {
  id: string
}

export const useFileSelection = (
  props: Props
): { onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> } => {
  const { setChatBody, chatBody, fileState } = useChatContext()
  const { setIsUploadingFile, setUploadButtonLabel } = fileState
  const { showError, showSuccess } = useGlobalMessageContext()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    await onFileChange(formData)
  }

  const onFileChange = async (formData: FormData): Promise<void> => {
    try {
      setIsUploadingFile(true)
      setUploadButtonLabel(chatBody.chatType === "audio" ? "Uploading and transcribing file..." : "Uploading file...")

      formData.append("chatType", chatBody.chatType)
      formData.append("id", props.id)

      const file = formData.get(chatBody.chatType) as File | null

      if (!file) {
        throw new Error("No file selected.")
      }

      const uploadResponse = await UploadDocument(formData)
      if (uploadResponse.status !== "OK") {
        throw new Error(uploadResponse.errors[0].message)
      }

      const indexErrors: string[] = []
      const [splitDocuments, contents, vtt] = uploadResponse.response

      try {
        setUploadButtonLabel(`Indexing file ${file.name}...`)
        const indexResponse = await IndexDocuments(file.name, splitDocuments, props.id, contents, vtt)
        if (indexResponse.status !== "OK") {
          indexErrors.push(indexResponse.errors[0].message)
        }
      } catch (e) {
        indexErrors.push(e instanceof Error ? e.message : "An unknown error occurred during indexing.")
      }

      if (indexErrors.length) {
        throw new Error(`Not all documents were indexed. Errors: ${indexErrors.join(", ")}`)
      }

      fileState.setIsFileNull(true)
      showSuccess({
        title: "File upload",
        description: `${file.name} uploaded successfully.`,
      })

      await UpdateChatThreadToFileDetails(props.id, chatBody.chatType, file.name)

      const chatOverFileName = chatBody.chatOverFileName ? `${file.name}, ${chatBody.chatOverFileName}` : file.name

      setChatBody({ ...chatBody, chatOverFileName })
    } catch (error) {
      showError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsUploadingFile(false)
      setUploadButtonLabel("")
    }
  }

  return { onSubmit }
}
