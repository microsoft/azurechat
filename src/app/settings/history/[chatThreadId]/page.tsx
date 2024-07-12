import { ChatReportingUI } from "@/features/reporting/chat-reporting-ui"

export const dynamic = "force-dynamic"

export default function Home({ params }: { params: { chatThreadId: string } }): JSX.Element {
  return <ChatReportingUI chatThreadId={params.chatThreadId} />
}
