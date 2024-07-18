import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import Typography from "@/components/typography"
import {
  formatSensitivityValue,
  formatStyleValue,
  formatTypeValue,
} from "@/features/chat/chat-ui/chat-header-display/icon-helpers"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"

import { FindAllChatThreadsForUserReporting } from "./reporting-service"

export type ReportingProp = {
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}
export const Reporting = async (props: ReportingProp): Promise<JSX.Element> => {
  const pageSize = Number(props.searchParams.pageSize ?? 20)
  const pageNumber = Math.max(Number(props.searchParams.pageNumber ?? 0), 0)
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  const chatThreadsData = await FindAllChatThreadsForUserReporting(pageSize, pageNumber)
  if (chatThreadsData.status !== "OK") return <div>Error</div>

  const { threads, totalCount } = chatThreadsData.response
  const hasMoreResults = threads && threads.length === pageSize
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex size-full overflow-y-auto bg-altBackground pt-8">
      <div className="container mx-auto size-full space-y-8">
        <div>
          <Typography variant="h2" className="text-2xl font-bold tracking-tight">
            Chat Reporting
          </Typography>
          <Typography variant="p" className="text-muted-foreground">
            See all your chats below from the past three months.
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <Card className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Chat Title</TableHead>
                  <TableHead scope="col">Category</TableHead>
                  <TableHead scope="col">Type</TableHead>
                  <TableHead scope="col">Style</TableHead>
                  <TableHead scope="col">Sensitivity</TableHead>
                  <TableHead scope="col">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads &&
                  threads.map(chatThread => (
                    <TableRow key={chatThread.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={"/settings/history/" + chatThread.id}
                          aria-label={`View chat details for ${chatThread.name}`}
                        >
                          {chatThread.name}
                        </Link>
                      </TableCell>
                      <TableCell>{chatThread.chatCategory === "None" ? "-" : chatThread.chatCategory}</TableCell>
                      <TableCell>{formatTypeValue(chatThread.chatType)}</TableCell>
                      <TableCell>{formatStyleValue(chatThread.conversationStyle)}</TableCell>
                      <TableCell>{formatSensitivityValue(chatThread.conversationSensitivity)}</TableCell>
                      <TableCell>
                        {new Date(chatThread.createdAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-2">
              <div>
                Page {pageNumber + 1} of {totalPages} (Total Records: {totalCount})
              </div>
              <div className="flex gap-2">
                <Button size={"icon"} variant={"outline"} ariaLabel="Previous page" disabled={pageNumber === 0}>
                  <Link
                    href={{
                      pathname: "/settings/history",
                      search: `?pageNumber=${previousPage}`,
                    }}
                  >
                    <ChevronLeft />
                  </Link>
                </Button>
                <Button size={"icon"} variant={"outline"} ariaLabel="Next page" disabled={!hasMoreResults}>
                  <Link
                    href={{
                      pathname: "/settings/history",
                      search: `?pageNumber=${nextPage}`,
                    }}
                  >
                    <ChevronRight />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
