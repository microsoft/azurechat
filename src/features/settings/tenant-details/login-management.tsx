"use client"
import React, { useState } from "react"

import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { AI_NAME } from "@/features/theme/theme-config"
import { SwitchComponent } from "@/ui/switch"

export const LoginManagement: React.FC<{ requiresGroupLogin: boolean }> = ({ requiresGroupLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequiresGroupLogin, setIsRequiresGroupLogin] = useState(requiresGroupLogin)

  const handleToggle = async (): Promise<void> => {
    setIsSubmitting(true)
    setIsRequiresGroupLogin(!isRequiresGroupLogin)
    const defaultErrorMessage = "Could not update group login requirement. Please try again later."

    try {
      const response = await fetch("/api/tenant/details", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requiresGroupLogin: !isRequiresGroupLogin }),
      })
      if (!response.ok) throw new Error(defaultErrorMessage)
      showSuccess({ title: "Success", description: "Group login updated successfully!" })
    } catch (error) {
      setIsRequiresGroupLogin(isRequiresGroupLogin)
      showError(defaultErrorMessage)
      logger.error("Error updating group login", { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Typography variant="h5" className="mb-4">
        Login Management:
      </Typography>
      <div className="my-4 flex flex-col gap-4 rounded-md bg-altBackgroundShade">
        <div className="flex items-center gap-4 p-2">
          <Typography variant="h5">Requires Group Login:</Typography>
          <SwitchComponent
            id="requires-group-login"
            variant="default"
            label=""
            isChecked={isRequiresGroupLogin}
            disabled={isSubmitting}
            onCheckedChange={handleToggle}
          />
        </div>
        <div className="flex justify-between p-2">
          <Typography variant="p">
            Please note that{" "}
            {requiresGroupLogin ? (
              <>
                disabling group login will allow all Internal users in your Tenant to have access to {AI_NAME}. This
                does not include Guest Users. This change or adding groups will take effect immediately.
              </>
            ) : (
              <>
                enabling group login will restrict access to {AI_NAME} to only users who belong to specified groups or
                Global Administrators. This does not include Guest Users. This change will take effect immediately.
              </>
            )}
          </Typography>
        </div>
      </div>
    </>
  )
}
