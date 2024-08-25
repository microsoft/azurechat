"use client"

import { useState } from "react"

import Typography from "@/components/typography"

import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { SmartToolModel } from "@/features/models/smart-tool-models"
import SmartToolForm from "@/features/settings/admin/smart-tool-form"
import { useSmartToolsContext } from "@/features/settings/admin/smart-tools-provider"
import { Button } from "@/features/ui/button"

export default function SmartToolsPage(): JSX.Element {
  const { smartTools, setSmartTools } = useSmartToolsContext()
  const [isCreating, setIsCreating] = useState(false)

  const saveTool = async (tool: SmartToolModel): Promise<void> => {
    const errorMsg = `Failed to save smart tool ${tool.name}`
    try {
      const result = await fetch(`/api/admin/smart-tools/${tool.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tool),
      })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Smart tool updated successfully!" })
      const isToolNew = !smartTools.find(t => t.id === tool.id)
      setSmartTools(isToolNew ? [tool, ...smartTools] : smartTools.map(t => (t.id === tool.id ? tool : t)))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error updating smart tools", { error })
    }
  }

  const deleteTool = async (toolId: string): Promise<void> => {
    const errorMsg = `Failed to delete smart tool ${toolId}`
    try {
      const result = await fetch(`/api/admin/smart-tools/${toolId}`, { method: "DELETE" })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Smart tool deleted successfully!" })
      setSmartTools(smartTools.filter(t => t.id !== toolId))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error deleting smart tool", { error })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      <Typography variant="h2" className="text-2xl font-bold tracking-tight">
        Smart tools management
      </Typography>
      <div className="flex flex-col gap-4 rounded-md">
        {isCreating ? (
          <section className="w-full max-w-[800px] rounded-md border-2 p-2">
            <SmartToolForm
              formValues={{
                id: "",
                name: "",
                description: "",
                template: "",
                enabled: false,
                isPublic: true,
              }}
              onSubmit={saveTool}
              onClose={() => setIsCreating(false)}
            />
          </section>
        ) : (
          <Button
            variant="default"
            className="w-[14rem] self-start p-2"
            onClick={() => setIsCreating(true)}
            ariaLabel={"Creare new smart tool"}
          >
            Create new tool
          </Button>
        )}
        {smartTools.map(tool => (
          <section key={tool.id} className="w-full max-w-[800px] rounded-md border-2 bg-altBackgroundShade p-2">
            <SmartToolForm formValues={tool} onSubmit={saveTool} onDelete={deleteTool} />
          </section>
        ))}
      </div>
    </div>
  )
}
