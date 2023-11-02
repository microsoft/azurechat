import { Markdown } from "@/components/markdown/markdown";
import { Card } from "@/components/ui/card";
import { VersionDisplay } from "@/features/change-log/version-display";
import { promises as fs } from "fs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  // read local file from src/app/update/page.tsx
  const file = await fs.readFile(
    process.cwd() + "/app/change-log/update.md",
    "utf8"
  );

  return (
    <Card className="h-full flex justify-center flex-1 overflow-y-scroll">
      <div className="flex flex-col gap-8 py-8">
        <Suspense fallback={"Getting version"}>
          <VersionDisplay />
        </Suspense>
        <div className="prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-4xl ">
          <Markdown content={file} />
        </div>
      </div>
    </Card>
  );
}
