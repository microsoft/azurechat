"use server"

import { getTenantAndUser } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { SmartGenContainer } from "@/features/database/cosmos-containers"
import logger from "@/features/insights/app-insights"
import { uniqueId } from "@/lib/utils"

import { SupportedSmartGenToolId, SmartGenEntity, SmartGenModel } from "./models"

export const UpsertSmartGen = async (
  smartGen: SmartGenModel<SupportedSmartGenToolId>
): ServerActionResponseAsync<void> => {
  try {
    logger.event("UpsertSmartGen", { smartGen })
    const [tenant, user] = await getTenantAndUser()

    const container = await SmartGenContainer()
    await container.items.upsert<SmartGenEntity>({
      ...smartGen,
      id: uniqueId(),
      userId: user.id,
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
    })
    return { status: "OK", response: undefined }
  } catch (error) {
    logger.error("Error upserting smart-gen", { error })
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
