import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ReportingFilter } from "./reporting-services/reporting-service";

interface Props extends ReportingFilter {}

// A plain GET form: filters live in the URL, so a filtered view is
// shareable, survives a refresh, and works without client-side JS.
export const ReportingFilters: FC<Props> = (props) => {
  const isFiltered = Boolean(props.user || props.startDate || props.endDate);

  return (
    <form
      method="get"
      action="/reporting"
      className="flex flex-wrap items-end gap-3 pb-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="user" className="text-xs text-muted-foreground">
          User
        </label>
        <Input
          id="user"
          name="user"
          type="search"
          placeholder="Name contains"
          defaultValue={props.user ?? ""}
          className="h-9 w-56 rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="startDate" className="text-xs text-muted-foreground">
          From
        </label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          defaultValue={props.startDate ?? ""}
          className="h-9 w-40 rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="endDate" className="text-xs text-muted-foreground">
          To
        </label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={props.endDate ?? ""}
          className="h-9 w-40 rounded-lg"
        />
      </div>

      <Button type="submit" className="h-9 rounded-lg">
        Apply
      </Button>

      {isFiltered && (
        <Button
          asChild
          variant={"ghost"}
          className="h-9 rounded-lg text-muted-foreground"
        >
          <Link href="/reporting">Clear</Link>
        </Button>
      )}
    </form>
  );
};
