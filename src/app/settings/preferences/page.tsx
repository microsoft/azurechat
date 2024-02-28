import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {;
  return (
    <Card className="h-full items-center flex justify-center flex-1 col-span-6 sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
      <div className="col-span-5 bg-altBackground text-foreground shadow-sm h-full items-left">
        <section className="w-full container mx-auto max-w-3xl justify-center h-full gap-9 bg-altBackground" aria-labelledby="startChatTitle">
            Preferences go here
          <div className="col-span-5 sm:col-span-6 gap-8 py-8">
            <div className="prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-4xl items-left">
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
};