import ReportingChatPage from "@/features/reporting-page/reporting-chat-page";
import { FindAllChatMessagesForAdmin } from "@/features/reporting-page/reporting-services/reporting-service";
import { DisplayError } from "@/features/ui/error/display-error";

interface HomeParams {
  params: {
    id: string;
  };
}

export default async function Home(props: HomeParams) {
  const [chatResponse] = await Promise.all([
    FindAllChatMessagesForAdmin(props.params.id),
  ]);

  if (chatResponse.status !== "OK") {
    return <DisplayError errors={chatResponse.errors} />;
  }

  return (
    <ReportingChatPage chatDocuments={[]} messages={chatResponse.response} />
  );
}
