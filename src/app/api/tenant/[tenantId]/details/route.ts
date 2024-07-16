import { NextRequest } from "next/server"
import * as yup from "yup"

import { isAdmin, isAdminOrTenantAdmin } from "@/features/auth/helpers"
import { TenantDetails, toTenantDetails } from "@/features/tenant-management/models"
import { GetTenantById, UpdateTenant } from "@/features/tenant-management/tenant-service"

const tenantUpdateSchema = yup
  .object({
    tenantId: yup.string().required(),
    contextPrompt: yup.string().optional(),
    groups: yup
      .array()
      .of(yup.string().matches(/^[a-fA-F0-9-]{36}$/, "Invalid group GUID"))
      .optional(),
    requiresGroupLogin: yup.boolean().optional(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }): Promise<Response> {
  try {
    const requestBody = await request.json()
    const validatedData = await tenantUpdateSchema.validate(
      { ...requestBody, tenantId: params.tenantId },
      { abortEarly: false, stripUnknown: true }
    )
    const { tenantId, contextPrompt, groups, requiresGroupLogin } = validatedData

    const existingTenantResult = await GetTenantById(tenantId)
    if (existingTenantResult.status !== "OK") {
      return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })
    }
    if (!isAdmin()) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const updatedData = { ...existingTenantResult.response }
    let hasUpdates = false

    if (contextPrompt !== undefined) {
      if (contextPrompt.length > 500) {
        return new Response(JSON.stringify({ error: "Context prompt too long" }), { status: 400 })
      }
      if (contextPrompt !== existingTenantResult.response.preferences?.contextPrompt) {
        updatedData.preferences = { ...updatedData.preferences, contextPrompt }
        hasUpdates = true
      }
    }

    if (requiresGroupLogin !== undefined) {
      if (requiresGroupLogin !== existingTenantResult.response.requiresGroupLogin) {
        updatedData.requiresGroupLogin = requiresGroupLogin
        hasUpdates = true
      }
    }

    if (requiresGroupLogin !== false && groups !== undefined) {
      const validGroups = groups.filter((group): group is string => group !== undefined && group.length === 36)
      updatedData.groups = validGroups
      hasUpdates = true
    }

    if (!hasUpdates) {
      return new Response(JSON.stringify({ message: "No changes to update" }), { status: 200 })
    }

    const updatedTenantResult = await UpdateTenant(updatedData)

    if (updatedTenantResult.status === "OK") {
      return new Response(JSON.stringify(updatedTenantResult.response), { status: 200 })
    }
    return new Response(JSON.stringify({ error: "Failed to update tenant" }), { status: 500 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}

export async function GET(_request: NextRequest, { params }: { params: { tenantId: string } }): Promise<Response> {
  const { tenantId } = params
  const isAuthorized = await isAdminOrTenantAdmin()
  if (!isAuthorized) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const existingTenantResult = await GetTenantById(tenantId)
  if (existingTenantResult.status !== "OK")
    return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })

  const tenantDetails: TenantDetails = toTenantDetails(existingTenantResult.response)

  return new Response(JSON.stringify({ status: "OK", data: tenantDetails }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
