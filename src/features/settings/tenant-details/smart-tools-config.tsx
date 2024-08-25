"use client"

import * as Form from "@radix-ui/react-form"
import { useState, useEffect, useRef } from "react"

import Typography from "@/components/typography"

import { showError, showSuccess } from "@/features/globals/global-message-store"
import { TenantSmartToolConfig } from "@/features/models/tenant-models"
import { SupportedSmartGenToolId, SupportedSmartGenTools } from "@/features/smart-gen/models"
import { SwitchComponent } from "@/features/ui/switch"
import { Textarea } from "@/features/ui/textarea"

type Props = {
  tools: TenantSmartToolConfig[]
  tenantId: string
}

export const SmartToolsConfig = (props: Props): JSX.Element => {
  const toolsRef = useRef<TenantSmartToolConfig[]>(props.tools)
  const smartGentToolNameMapping = SupportedSmartGenTools.reduce(
    (acc, toolName) => {
      acc[toolName] = false
      return acc
    },
    {} as Record<SupportedSmartGenToolId, boolean>
  )
  const [isSubmitting, setIsSubmitting] = useState(smartGentToolNameMapping)
  const [isSaved, setIsSaved] = useState(smartGentToolNameMapping)
  const [error, setError] = useState(smartGentToolNameMapping)
  const [tools, setTools] = useState(props.tools)

  const debouncedTools = useDebounce(tools, 1000)

  useEffect(() => {
    if (!debouncedTools?.length) return
    const detectedChanges = debouncedTools.filter(tool => {
      const existingTool = toolsRef.current.find(t => t.smartToolId === tool.smartToolId)
      return !existingTool || existingTool.enabled !== tool.enabled || existingTool.template !== tool.template
    })

    const handleUpdate = async (detectedChanges: TenantSmartToolConfig[]): Promise<void> => {
      for (const tool of detectedChanges) {
        setIsSubmitting(prev => ({ ...prev, [tool.smartToolId]: true }))
        try {
          const response = await fetch(`/api/tenant/${props.tenantId}/smart-tools/${tool.smartToolId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool }),
          })
          if (!response.ok)
            throw new Error(`An error occurred while updating ${tool.smartToolId}. Please try again later.`)
          showSuccess({ title: "Success", description: `${tool.name} updated successfully!` })
          setIsSaved(prev => ({ ...prev, [tool.smartToolId]: true }))
          setTimeout(() => setIsSaved(prev => ({ ...prev, [tool.smartToolId]: false })), 5000)
        } catch (error) {
          setError(prev => ({ ...prev, [tool.smartToolId]: true }))
          throw error
        } finally {
          setIsSubmitting(prev => ({ ...prev, [tool.smartToolId]: false }))
        }
      }
    }

    handleUpdate(detectedChanges)
      .then(() => (toolsRef.current = debouncedTools))
      .catch(error => showError(error instanceof Error ? error.message : JSON.stringify(error)))
  }, [debouncedTools, props.tenantId])

  return (
    <div className="mb-20">
      <Typography variant="h4" className="mb-4 mt-8 font-bold underline underline-offset-2">
        Smart tools configuration
      </Typography>
      <div className="flex flex-col gap-4 rounded-md bg-altBackgroundShade">
        {tools.map(({ name, smartToolId, enabled, template }) => (
          <section key={smartToolId} className="rounded-md border-2 p-2">
            <Form.Root>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <Typography variant="h5" className="text-md font-bold">
                    {name}
                  </Typography>
                  <SwitchComponent
                    id={`${smartToolId}Enabled`}
                    name={`${smartToolId}Enabled`}
                    variant="default"
                    label={`${enabled ? "Enabled" : "Disabled"}`}
                    isChecked={!!enabled}
                    disabled={isSubmitting[smartToolId as SupportedSmartGenToolId]}
                    onCheckedChange={() => {
                      setTools(prev => prev.map(t => (t.smartToolId === smartToolId ? { ...t, enabled: !enabled } : t)))
                    }}
                  />
                </div>
                {isSubmitting[smartToolId as SupportedSmartGenToolId] && (
                  <Typography variant="span" className="text-sm italic opacity-80">
                    ⚙️ SAVING...
                  </Typography>
                )}
                {!isSubmitting[smartToolId as SupportedSmartGenToolId] &&
                  isSaved[smartToolId as SupportedSmartGenToolId] === true && (
                    <Typography variant="span" className="text-sm opacity-80">
                      SAVED ✅
                    </Typography>
                  )}
                {!isSubmitting[smartToolId as SupportedSmartGenToolId] &&
                  error[smartToolId as SupportedSmartGenToolId] && (
                    <Typography variant="span" className="text-sm opacity-80">
                      ERROR❗
                    </Typography>
                  )}
              </div>

              <Form.Field name={`${smartToolId}Template`} serverInvalid={error[smartToolId as SupportedSmartGenToolId]}>
                <Form.Label htmlFor={`${smartToolId}Template`} className="flex items-center gap-2">
                  Request template:
                </Form.Label>
                <Form.Control asChild>
                  <Textarea
                    id={`${smartToolId}Template`}
                    className="my-4 w-full rounded-md border-2 p-2"
                    placeholder="Enter new context prompt..."
                    rows={10}
                    maxLength={900}
                    required
                    aria-label="New context prompt"
                    value={template}
                    onChange={e =>
                      setTools(prev =>
                        prev.map(t => (t.smartToolId === smartToolId ? { ...t, template: e.target.value } : t))
                      )
                    }
                    disabled={!enabled}
                  />
                </Form.Control>
              </Form.Field>
            </Form.Root>
          </section>
        ))}
      </div>
    </div>
  )
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
