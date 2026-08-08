import { ChatReportingPage } from "@/features/reporting-page/reporting-page";

interface Props {
  params: {};
  searchParams: {
    pageNumber?: string;
    user?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function Home(props: Props) {
  return (
    <ChatReportingPage
      page={Number(props.searchParams.pageNumber ?? 0)}
      filter={{
        user: props.searchParams.user,
        startDate: props.searchParams.startDate,
        endDate: props.searchParams.endDate,
      }}
    />
  );
}
