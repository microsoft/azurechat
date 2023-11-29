import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import {
  UploadIndexAndSaveDocument,
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
      formData.append("fileName", file.name);
      
      let index = 0;

      const uploadResponse = await UploadIndexAndSaveDocument(formData);
      if (uploadResponse.error) {
        throw new Error(uploadResponse.error);
      }

      if (index === uploadResponse.response.length) {
        showSuccess({
          title: "File upload",
          description: `${file.name} uploaded successfully.`,
        });
        setUploadButtonLabel("");
        setChatBody({ ...chatBody, chatOverFileName: file.name });
      } else {
        showError(
          "Looks like not all documents were indexed. Please try again."
        );
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
