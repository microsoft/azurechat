"use client";
import { Hero } from "@/features/ui/hero";
import { Sheet } from "lucide-react";

export const ReportingHero = () => {
  return (
    <Hero
      title={
        <>
          <Sheet size={36} strokeWidth={1.5} />
          Chat Report
        </>
      }
      description={
        "Administration view for monitoring conversation history for all users"
      }
    ></Hero>
  );
};
