import { ChatReportingPage } from "@/features/reporting-page/reporting-page";

interface Props {
  params: {};
  searchParams: {
    pageNumber?: string;
  };
}

export default async function Home(props: Props) {
  return <ChatReportingPage page={Number(props.searchParams.pageNumber ?? 0)} />;
}
