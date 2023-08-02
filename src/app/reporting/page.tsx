import { Reporting, ReportingProp } from "@/features/reporting/reporting";

export default async function Home(props: ReportingProp) {
  return <Reporting {...props} />;
}
