import React from "react"
import { Card } from "@/features/ui/card"
import { PromptForm } from "@/features/ui/form"

export const dynamic = "force-dynamic"

export default function Home(): JSX.Element {
  return (
    <div className="col-span-5 size-full">
      <Card className="col-span-6 flex h-full flex-1 items-center justify-center sm:col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5">
        <div className="bg-altBackground text-foreground col-span-5 h-full shadow-sm">
          <section className="bg-altBackground container mx-auto size-full max-w-3xl justify-center gap-9">
            <PromptForm />
            <div className="col-span-5 gap-8 py-8 sm:col-span-6">
              <div className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-4xl break-words"></div>
            </div>
          </section>
        </div>
      </Card>
    </div>
  )
}
