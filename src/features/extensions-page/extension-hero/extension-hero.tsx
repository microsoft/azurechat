"use client";

import { AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { Blocks } from "lucide-react";
import { AISearch } from "./ai-search-issues";
import { BingSearch } from "./bing-search";
import { NewExtension } from "./new-extension";

interface ExtensionHeroProps {
  user: any;
}

export const ExtensionHero = (props: ExtensionHeroProps) => {
  return (
    <Hero
      title={
        <>
          <Blocks size={36} strokeWidth={1.5} /> Extensions
        </>
      }
      description={`Seamlessly connect ${AI_NAME} with internal APIs or external
        resources`}
    >
      {props.user.isAdmin && <NewExtension />}
      <BingSearch />
      <AISearch />
    </Hero>
  );
};
