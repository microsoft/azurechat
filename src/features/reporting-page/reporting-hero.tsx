"use client";
import { Sheet } from "lucide-react";

export const ReportingHero = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <Sheet size={36} strokeWidth={1.5} />
        <p className="text-3xl">Chat Report</p>
      </div>
      <div>
        <p className="font-normal">
          Administration view for monitoring conversation history for all users
        </p>
      </div>
    </div>
  );
};
