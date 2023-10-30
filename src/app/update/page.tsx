import { Card } from "@/components/ui/card";
import { VersionDisplay } from "@/features/update/version-display";
import { promises as fs } from "fs";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default async function Home() {
  // read local file from src/app/update/page.tsx
  const file = await fs.readFile(
    process.cwd() + "/app/update/update.md",
    "utf8"
  );

  return (
    <Card className="h-full flex justify-center flex-1">
      <div className="flex flex-col gap-8 py-8">
        <Suspense fallback={"Getting version"}>
          <VersionDisplay />
        </Suspense>
        <ReactMarkdown className="prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-4xl">
          {file}
        </ReactMarkdown>
      </div>
    </Card>
  );
}
