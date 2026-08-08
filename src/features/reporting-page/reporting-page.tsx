import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FC, Suspense } from "react";
import { Button } from "../ui/button";
import { DisplayError } from "../ui/error/display-error";
import { PageLoader } from "../ui/page-loader";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ReportingHero } from "./reporting-hero";
import { FindAllChatThreadsForAdmin } from "./reporting-services/reporting-service";
import ChatThreadRow from "./table-row";

const SEARCH_PAGE_SIZE = 100;

interface ChatReportingProps {
  page: number;
}

export const ChatReportingPage: FC<ChatReportingProps> = async (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ReportingHero />
        <Suspense fallback={<PageLoader />} key={props.page}>
          <ReportingContent {...props} />
        </Suspense>
      </main>
    </ScrollArea>
  );
};

async function ReportingContent(props: ChatReportingProps) {
  let pageNumber = props.page < 0 ? 0 : props.page;
  let nextPage = pageNumber + 1;
  let previousPage = pageNumber - 1;

  const chatHistoryResponse = await FindAllChatThreadsForAdmin(
    SEARCH_PAGE_SIZE,
    props.page * SEARCH_PAGE_SIZE
  );

  if (chatHistoryResponse.status !== "OK") {
    return <DisplayError errors={chatHistoryResponse.errors} />;
  }

  const chatThreads = chatHistoryResponse.response;
  const hasMoreResults = chatThreads.length === SEARCH_PAGE_SIZE;
  return (
    <div className="container max-w-5xl py-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conversation</TableHead>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chatThreads &&
            chatThreads.map((chatThread) => (
              <ChatThreadRow key={chatThread.id} {...chatThread} />
            ))}
        </TableBody>
      </Table>
      <div className="flex gap-2 py-4 justify-end">
        {previousPage >= 0 && (
          <Button
            asChild
            size={"icon"}
            variant={"outline"}
            className="rounded-full"
          >
            <Link
              href={"/reporting?pageNumber=" + previousPage}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </Link>
          </Button>
        )}
        {hasMoreResults && (
          <Button
            asChild
            size={"icon"}
            variant={"outline"}
            className="rounded-full"
          >
            <Link
              href={"/reporting?pageNumber=" + nextPage}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
