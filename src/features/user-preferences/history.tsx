import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { FindAllChatThreadsForReporting } from "./history-service"
import { showError } from "../globals/global-message-store"

export type ReportingProp = {
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}

export const Reporting = async (props: ReportingProp): Promise<JSX.Element> => {
  const _pageNumber = Number(props.searchParams.pageNumber ?? 0)
  const pageSize = Number(props.searchParams.pageSize ?? 10)
  const pageNumber = _pageNumber < 0 ? 0 : _pageNumber
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  const chatThreads = await FindAllChatThreadsForReporting(pageSize, pageNumber)
  if (chatThreads.status !== "OK") showError(chatThreads.errors[0].message)

  const hasMoreResults = chatThreads.status === "OK" && chatThreads.response.length === pageSize

  return (
    <Card className="flex h-full overflow-y-auto pt-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat Reporting</h2>
          <p className="text-muted-foreground">Your history for this month</p>
        </div>
        <div className="flex items-center space-x-2">
          <Card className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chat Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Sensitivity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatThreads.status === "OK" &&
                  chatThreads.response?.map(chatThread => (
                    <TableRow key={chatThread.id}>
                      <TableCell className="font-medium">
                        <Link href={"/reporting/" + chatThread.id}>{chatThread.name}</Link>
                      </TableCell>
                      <TableCell>{chatThread.chatCategory}</TableCell>
                      <TableCell>{chatThread.chatType}</TableCell>
                      <TableCell>{chatThread.conversationStyle}</TableCell>
                      <TableCell>{chatThread.conversationSensitivity}</TableCell>
                      <TableCell>{new Date(chatThread.createdAt).toLocaleDateString("en-AU")}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2 p-2">
              {previousPage >= 0 && (
                <Button asChild size={"icon"} variant={"outline"}>
                  <Link
                    href={{
                      pathname: "/reporting",
                      search: `?pageNumber=${previousPage}`,
                    }}
                  >
                    <ChevronLeft />
                  </Link>
                </Button>
              )}
              {hasMoreResults && (
                <Button asChild size={"icon"} variant={"outline"}>
                  <Link
                    href={{
                      pathname: "/reporting",
                      search: `?pageNumber=${nextPage}`,
                    }}
                  >
                    <ChevronRight />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}
