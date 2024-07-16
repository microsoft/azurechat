"use client"

import * as Form from "@radix-ui/react-form"
import { useState, useEffect, useRef } from "react"

import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import { SmartGenToolName, SmartGenToolNames } from "@/features/smart-gen/models"
import { SmartToolConfig } from "@/features/tenant-management/models"
import { SwitchComponent } from "@/features/ui/switch"
import { Textarea } from "@/features/ui/textarea"

type Props = {
  tools: SmartToolConfig[]
  tenantId: string
}

export const SmartToolsConfig = (props: Props): JSX.Element => {
  const toolsRef = useRef<SmartToolConfig[]>(props.tools)
  const smartGentToolNameMapping = SmartGenToolNames.reduce(
    (acc, toolName) => {
      acc[toolName] = false
      return acc
    },
    {} as Record<SmartGenToolName, boolean>
  )
  const [isSubmitting, setIsSubmitting] = useState(smartGentToolNameMapping)
  const [isSaved, setIsSaved] = useState(smartGentToolNameMapping)
  const [error, setError] = useState(smartGentToolNameMapping)
  const [tools, setTools] = useState(
    SmartGenToolNames.map<SmartToolConfig>(
      toolName => props.tools.find(tool => tool.name === toolName) || { name: toolName, enabled: false, template: "" }
    )
  )

  const debouncedTools = useDebounce(tools, 1000)

  useEffect(() => {
    if (!debouncedTools?.length) return
    const detectedChanges = debouncedTools.filter(tool => {
      const existingTool = toolsRef.current.find(t => t.name === tool.name)
      return !existingTool || existingTool.enabled !== tool.enabled || existingTool.template !== tool.template
    })

    const handleUpdate = async (detectedChanges: SmartToolConfig[]): Promise<void> => {
      for (const tool of detectedChanges) {
        setIsSubmitting(prev => ({ ...prev, [tool.name]: true }))
        try {
          const response = await fetch(`/api/tenant/${props.tenantId}/smart-tools/${tool.name}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool }),
          })
          if (!response.ok) throw new Error(`An error occurred while updating ${tool.name}. Please try again later.`)
          showSuccess({ title: "Success", description: `${tool.name} updated successfully!` })
          setIsSaved(prev => ({ ...prev, [tool.name]: true }))
          setTimeout(() => setIsSaved(prev => ({ ...prev, [tool.name]: false })), 5000)
        } catch (error) {
          setError(prev => ({ ...prev, [tool.name]: true }))
          throw error
        } finally {
          setIsSubmitting(prev => ({ ...prev, [tool.name]: false }))
        }
      }
    }

    handleUpdate(detectedChanges)
      .then(() => (toolsRef.current = debouncedTools))
      .catch(error => showError(error instanceof Error ? error.message : JSON.stringify(error)))
  }, [debouncedTools, props.tenantId])

  return (
    <>
      <Typography variant="h4" className="mb-4 mt-8 font-bold underline underline-offset-2">
        Smart tools configuration
      </Typography>
      <div className="flex flex-col gap-4 rounded-md bg-altBackgroundShade">
        {tools.map(({ name, enabled, template }) => (
          <section key={name} className="rounded-md border-2 p-2">
            <Form.Root>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <Typography variant="h5" className="text-md font-bold">
                    {name.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <SwitchComponent
                    id={`${name}Enabled`}
                    name={`${name}Enabled`}
                    variant="default"
                    label={`${enabled ? "Enabled" : "Disabled"}`}
                    isChecked={!!enabled}
                    disabled={isSubmitting[name as SmartGenToolName]}
                    onCheckedChange={() => {
                      setTools(prev => prev.map(t => (t.name === name ? { ...t, enabled: !enabled } : t)))
                    }}
                  />
                </div>
                {isSubmitting[name as SmartGenToolName] && (
                  <Typography variant="span" className="text-sm italic opacity-80">
                    ⚙️ SAVING...
                  </Typography>
                )}
                {!isSubmitting[name as SmartGenToolName] && isSaved[name as SmartGenToolName] === true && (
                  <Typography variant="span" className="text-sm opacity-80">
                    SAVED ✅
                  </Typography>
                )}
                {!isSubmitting[name as SmartGenToolName] && error[name as SmartGenToolName] && (
                  <Typography variant="span" className="text-sm opacity-80">
                    ERROR❗
                  </Typography>
                )}
              </div>

              <Form.Field name={`${name}Template`} serverInvalid={error[name as SmartGenToolName]}>
                <Form.Label htmlFor={`${name}Template`} className="flex items-center gap-2">
                  Request template:
                </Form.Label>
                <Form.Control asChild>
                  <Textarea
                    id={`${name}Template`}
                    className="my-4 w-full rounded-md border-2 p-2"
                    placeholder="Enter new context prompt..."
                    rows={10}
                    maxLength={900}
                    required
                    aria-label="New context prompt"
                    value={template}
                    onChange={e =>
                      setTools(prev => prev.map(t => (t.name === name ? { ...t, template: e.target.value } : t)))
                    }
                    disabled={!enabled}
                  />
                </Form.Control>
              </Form.Field>
            </Form.Root>
          </section>
        ))}
      </div>
    </>
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
