import { IndexDocuments, UploadDocument } from "@/features/chat/chat-services/chat-document-service"
import { UpdateChatThreadToFileDetails } from "@/features/chat/chat-services/chat-thread-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"

import { shouldUseWhisper } from "./chat-file-ui"

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
      setUploadButtonLabel("Uploading file...")

      formData.append("chatType", chatBody.chatType)
      formData.append("id", props.id)

      const runList = formData.get("chatType") === "audio" && shouldUseWhisper() ? ["acs", "whisper"] : [""]

      const file: File | null = formData.get(chatBody.chatType) as unknown as File

      runList.forEach(async element => {
        if (element !== "acs") formData.append(element, "1")

        const fileName =
          runList.length === 1
            ? file.name
            : `${file.name.split(".")[0]} (transcribed with ${element}).${file.name.split(".")[1]}`

        const uploadResponse = await UploadDocument(formData)
        if (uploadResponse.status !== "OK") throw showError(uploadResponse.errors[0].message)

        const indexErrors = []
        const [splitDocuments, contents, vtt] = uploadResponse.response

        try {
          setUploadButtonLabel(`Indexing file ${fileName}...`)
          const indexResponse = await IndexDocuments(fileName, splitDocuments, props.id, contents, vtt)

          if (indexResponse.status !== "OK") {
            showError(`${file.name} failed to be indexed. ${indexResponse.errors[0].message}`)
            indexErrors.push(indexResponse.errors[0].message)
          }
        } catch (e) {
          alert(e)
        }

        if (indexErrors.length)
          throw new Error("Looks like not all documents were indexed. Please try again.", {
            cause: indexErrors,
          })

        fileState.setIsFileNull(true)
        showSuccess({
          title: "File upload",
          description: `${file.name} uploaded successfully.`,
        })
      })

      await UpdateChatThreadToFileDetails(props.id, chatBody.chatType, file.name)

      const chatOverFileName = chatBody.chatOverFileName ? `${file.name}, ${chatBody.chatOverFileName}` : file.name
      setChatBody({ ...chatBody, chatOverFileName })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      showError(errorMessage)
    } finally {
      setIsUploadingFile(false)
      setUploadButtonLabel("")
    }
  }

  return { onSubmit }
}
