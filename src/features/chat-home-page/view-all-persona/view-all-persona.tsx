"use client";

import { Button } from "@/features/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export const ViewAllPersonas = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/persona")}
      className=" text-primary font-bold pr-0"
      variant="link"
    >
      View All
    </Button>
  );
};
