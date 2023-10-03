import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import {
  IndexDocuments,
  UploadDocument,
} from "../../chat-services/chat-document-service";
import { useChatContext } from "../chat-context";

interface Props {
  id: string;
}

export const useFileSelection = (props: Props) => {
  const { setChatBody, chatBody, fileState } = useChatContext();
  const { setIsUploadingFile, setUploadButtonLabel } = fileState;

  const { showError, showSuccess } = useGlobalMessageContext();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onFileChange(formData);
  };

  const onFileChange = async (formData: FormData) => {
    try {
      setIsUploadingFile(true);
      setUploadButtonLabel("Uploading document...");
      formData.append("id", props.id);
      const file: File | null = formData.get("file") as unknown as File;
      const uploadResponse = await UploadDocument(formData);

      if (uploadResponse.success) {
        setUploadButtonLabel("Indexing document...");

        const indexResponse = await IndexDocuments(
          file.name,
          uploadResponse.response,
          props.id
        );

        if (indexResponse.success) {
          showSuccess({
            title: "File upload",
            description: `${file.name} uploaded successfully.`,
          });
          setUploadButtonLabel("");
          setChatBody({ ...chatBody, chatOverFileName: file.name });
        } else {
          showError(indexResponse.error);
        }
      } else {
        showError(uploadResponse.error);
      }
    } catch (error) {
      showError("" + error);
    } finally {
      setIsUploadingFile(false);
      setUploadButtonLabel("");
    }
  };

  return { onSubmit };
};
