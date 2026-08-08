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
import { ReportingFilters } from "./reporting-filters";
import { ReportingHero } from "./reporting-hero";
import {
  FindAllChatThreadsForAdmin,
  ReportingFilter,
} from "./reporting-services/reporting-service";
import ChatThreadRow from "./table-row";

const SEARCH_PAGE_SIZE = 100;

interface ChatReportingProps {
  page: number;
  filter: ReportingFilter;
}

export const ChatReportingPage: FC<ChatReportingProps> = async (props) => {
  const { user, startDate, endDate } = props.filter;
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ReportingHero />
        <div className="container max-w-5xl pt-8">
          <ReportingFilters {...props.filter} />
        </div>
        <Suspense
          fallback={<PageLoader />}
          key={`${props.page}-${user ?? ""}-${startDate ?? ""}-${endDate ?? ""}`}
        >
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
    pageNumber * SEARCH_PAGE_SIZE,
    props.filter
  );

  if (chatHistoryResponse.status !== "OK") {
    return <DisplayError errors={chatHistoryResponse.errors} />;
  }

  const chatThreads = chatHistoryResponse.response;
  const hasMoreResults = chatThreads.length === SEARCH_PAGE_SIZE;

  // Carry the active filter across pagination, otherwise page 2 silently
  // drops it and shows unfiltered results.
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ pageNumber: String(page) });
    if (props.filter.user) params.set("user", props.filter.user);
    if (props.filter.startDate) params.set("startDate", props.filter.startDate);
    if (props.filter.endDate) params.set("endDate", props.filter.endDate);
    return `/reporting?${params.toString()}`;
  };

  if (chatThreads.length === 0) {
    return (
      <div className="container max-w-5xl pb-8">
        <p className="text-sm text-muted-foreground">
          No conversations match these filters.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl pb-8">
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
            <Link href={pageHref(previousPage)} aria-label="Previous page">
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
            <Link href={pageHref(nextPage)} aria-label="Next page">
              <ChevronRight size={18} />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
