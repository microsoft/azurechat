"use client"

import { useState } from "react"

import Typography from "@/components/typography"

import { showSuccess, showError } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { IndexModel } from "@/features/models/index-models"
import IndexForm from "@/features/settings/admin/index-form"
import { useIndexesContext } from "@/features/settings/admin/indexes-provider"
import { Button } from "@/features/ui/button"

export default function IndexesPage(): JSX.Element {
  const { indexes, setIndexes } = useIndexesContext()
  const [isCreating, setIsCreating] = useState(false)

  const saveIndex = async (index: IndexModel): Promise<void> => {
    const errorMsg = `Failed to save index ${index.name}`
    try {
      const result = await fetch(`/api/admin/indexes/${index.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(index),
      })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Index updated successfully!" })
      const isIndexNew = !indexes.find(t => t.id === index.id)
      setIndexes(isIndexNew ? [index, ...indexes] : indexes.map(t => (t.id === index.id ? index : t)))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error updating indexes", { error })
    }
  }

  const deleteIndex = async (indexId: string): Promise<void> => {
    const errorMsg = `Failed to delete index ${indexId}`
    try {
      const result = await fetch(`/api/admin/indexes/${indexId}`, { method: "DELETE" })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Index deleted successfully!" })
      setIndexes(indexes.filter(t => t.id !== indexId))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error deleting index", { error })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      <Typography variant="h2" className="text-2xl font-bold tracking-tight">
        Indexes management
      </Typography>
      <div className="flex flex-col gap-4 rounded-md">
        {isCreating ? (
          <section className="w-full max-w-[800px] rounded-md border-2 p-2">
            <IndexForm
              formValues={{
                id: "",
                name: "",
                description: "",
                enabled: false,
                isPublic: true,
              }}
              onSubmit={saveIndex}
              onClose={() => setIsCreating(false)}
            />
          </section>
        ) : (
          <Button
            variant="default"
            className="w-[14rem] self-start p-2"
            onClick={() => setIsCreating(true)}
            ariaLabel={"Creare new index"}
          >
            Create new index
          </Button>
        )}
        {indexes.map(index => (
          <section key={index.id} className="w-full max-w-[800px] rounded-md border-2 bg-altBackgroundShade p-2">
            <IndexForm formValues={index} onSubmit={saveIndex} onDelete={deleteIndex} />
          </section>
        ))}
      </div>
    </div>
  )
}
