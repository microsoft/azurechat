import logger from "@/features/insights/app-insights"
import { SmartGenRequest } from "@/features/smart-gen/models"
import SmartGenToolAgent, { SmartToolConfig } from "@/features/smart-gen/smart-gen-agent"

type UseSmartGenHook = {
  smartGen: (smartGen: SmartGenRequest) => Promise<string | null>
}
export default function useSmartGen(config?: SmartToolConfig[]): UseSmartGenHook {
  const smartGen: UseSmartGenHook["smartGen"] = async request => {
    try {
      if (!config) throw new Error("Smart-gen config not loaded")
      const smartGenAgent = SmartGenToolAgent(config)
      const output = await smartGenAgent.execute(request)

      fetch("/api/user/smart-gen", {
        method: "POST",
        body: JSON.stringify({ action: request.toolName, context: request.context, output }),
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
