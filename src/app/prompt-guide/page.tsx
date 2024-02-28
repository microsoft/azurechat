import { Markdown } from "@/components/markdown/markdown";
import { Card } from "@/components/ui/card";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await loadContent();
  return (
    <Card className="h-full flex justify-center flex-1 overflow-y-scroll">
        <div className="flex flex-col gap-8 py-8">
        <div className="prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-4xl ">
            <Markdown content={content} />
            </div>
        </div>
    </Card>
  );
}

const loadContent = async () => {
  return await fs.readFile(
    process.cwd() + "/public/guide.md",
    "utf8"
  );
};