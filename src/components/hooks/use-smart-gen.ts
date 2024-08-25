import logger from "@/features/insights/app-insights"
import { TenantSmartToolConfig } from "@/features/models/tenant-models"
import { SmartGenRequest } from "@/features/smart-gen/models"
import SmartGenToolAgent, { SmartGenToolAgentConfig } from "@/features/smart-gen/smart-gen-agent"

type UseSmartGenHook = {
  smartGen: (smartGen: SmartGenRequest) => Promise<string | null>
}
export default function useSmartGen(config?: TenantSmartToolConfig[]): UseSmartGenHook {
  const smartGen: UseSmartGenHook["smartGen"] = async request => {
    try {
      if (!config) throw new Error("Smart-gen config not loaded")
      const smartGenAgent = SmartGenToolAgent(
        config.reduce((acc, tool) => {
          if (!tool.enabled) return acc
          acc.push({
            id: tool.smartToolId,
            name: tool.name,
            enabled: tool.enabled,
            template: tool.template,
            description: tool.description,
          })
          return acc
        }, [] as SmartGenToolAgentConfig)
      )
      const output = await smartGenAgent.execute(request)

      fetch("/api/user/smart-gen", {
        method: "POST",
        body: JSON.stringify({ action: request.toolId, context: request.context, output }),
      })
        .then(response => !response.ok && logger.error("Error recording smart-gen content", { error: response }))
        .catch(error => logger.error("Error recording smart-gen content", { error }))

      return output
    } catch (error) {
      logger.error("Error recording smart-gen content", { error })
      return null
    }
  }

  return { smartGen }
}
