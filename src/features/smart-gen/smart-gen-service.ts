"use server"

import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { SmartGenContainer } from "@/features/common/services/cosmos"

import { SmartGenEntity, SmartGenModel } from "./models"

export const UpsertSmartGen = async (smartGen: SmartGenModel): ServerActionResponseAsync<void> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const container = await SmartGenContainer()
    await container.items.upsert<SmartGenEntity>({ ...smartGen, userId, tenantId })
    return { status: "OK", response: undefined }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
