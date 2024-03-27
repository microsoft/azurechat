import { ChatReportingUI } from "@/features/reporting/chat-reporting-ui"

export default function Home({ params }: { params: { chatid: string; chatThreadId: string } }): JSX.Element {
  return <ChatReportingUI chatThreadId={params.chatThreadId} />
}
