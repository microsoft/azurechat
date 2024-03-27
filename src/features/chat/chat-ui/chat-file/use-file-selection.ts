import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { IndexDocuments, UploadDocument } from "@/features/chat/chat-services/chat-document-service"
import { useChatContext } from "../chat-context"

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
      const chatType = fileState.showFileUpload
      formData.append("chatType", chatType)
      formData.append("id", props.id)
      const file: File | null = formData.get(chatType) as unknown as File
      const uploadResponse = await UploadDocument(formData)
      if (uploadResponse.status !== "OK") throw showError(uploadResponse.errors[0].message)

      const indexErrors = []
      for (let i = 0; i < uploadResponse.response.length; i++) {
        try {
          setUploadButtonLabel(`Indexing file [${i + 1}]/[${uploadResponse.response.length}]`)
          const indexResponse = await IndexDocuments(file.name, [uploadResponse.response[i]], props.id, i + 1)

          if (indexResponse.status !== "OK") {
            showError(`${file.name} failed to be indexed. ${indexResponse.errors[0].message}`)
            indexErrors.push(indexResponse.errors[0].message)
          }
        } catch (e) {
          alert(e)
        }
      }

      if (indexErrors.length)
        throw new Error("Looks like not all documents were indexed. Please try again.", {
          cause: indexErrors,
        })

      showSuccess({
        title: "File upload",
        description: `${file.name} uploaded successfully.`,
      })
      setChatBody({ ...chatBody, chatOverFileName: file.name })
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
