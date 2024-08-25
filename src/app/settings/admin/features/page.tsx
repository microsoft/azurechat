"use client"

import { useState } from "react"

import Typography from "@/components/typography"

import { showSuccess, showError } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { FeatureModel } from "@/features/models/feature-models"
import FeatureForm from "@/features/settings/admin/feature-form"
import { useFeaturesContext } from "@/features/settings/admin/features-provider"
import { Button } from "@/features/ui/button"

export default function FeaturesPage(): JSX.Element {
  const { features, setFeatures } = useFeaturesContext()
  const [isCreating, setIsCreating] = useState(false)

  const saveFeature = async (feat: FeatureModel): Promise<void> => {
    const errorMsg = `Failed to save feature ${feat.name}`
    try {
      const result = await fetch(`/api/admin/features/${feat.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feat),
      })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Feature updated successfully!" })
      const isFeatureNew = !features.find(t => t.id === feat.id)
      setFeatures(isFeatureNew ? [feat, ...features] : features.map(t => (t.id === feat.id ? feat : t)))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error updating features", { error })
    }
  }

  const deleteFeature = async (featureId: string): Promise<void> => {
    const errorMsg = `Failed to delete feature ${featureId}`
    try {
      const result = await fetch(`/api/admin/features/${featureId}`, { method: "DELETE" })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Feature deleted successfully!" })
      setFeatures(features.filter(t => t.id !== featureId))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error deleting feature", { error })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      <Typography variant="h2" className="text-2xl font-bold tracking-tight">
        Features management
      </Typography>
      <div className="flex flex-col gap-4 rounded-md">
        {isCreating ? (
          <section className="w-full max-w-[800px] rounded-md border-2 p-2">
            <FeatureForm
              formValues={{
                id: "",
                name: "",
                description: "",
                enabled: false,
                isPublic: true,
              }}
              onSubmit={saveFeature}
              onClose={() => setIsCreating(false)}
            />
          </section>
        ) : (
          <Button
            variant="default"
            className="w-[14rem] self-start p-2"
            onClick={() => setIsCreating(true)}
            ariaLabel={"Creare new feature"}
          >
            Create new feature
          </Button>
        )}
        {features.map(feat => (
          <section key={feat.id} className="w-full max-w-[800px] rounded-md border-2 bg-altBackgroundShade p-2">
            <FeatureForm formValues={feat} onSubmit={saveFeature} onDelete={deleteFeature} />
          </section>
        ))}
      </div>
    </div>
  )
}
