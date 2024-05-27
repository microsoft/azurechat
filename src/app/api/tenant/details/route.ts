import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { TenantDetails } from "@/features/tenant-management/models"
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

export async function POST(request: NextRequest, _response: NextResponse): Promise<Response> {
  try {
    const [requestBody, user] = await Promise.all([request.json(), userSession()])
    const validatedData = await tenantUpdateSchema.validate(
      { ...requestBody, tenantId: user?.tenantId },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    )
    const { tenantId, contextPrompt, groups, requiresGroupLogin } = validatedData

    const existingTenantResult = await GetTenantById(tenantId)
    if (existingTenantResult.status !== "OK") {
      return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })
    }
    if (!user || !existingTenantResult.response.administrators.includes(user.email)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

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
      const newGroups = validGroups.filter(group => !existingTenantResult.response.groups.includes(group))
      if (newGroups.length > 0) {
        updatedData.groups = [...existingTenantResult.response.groups, ...newGroups]
        hasUpdates = true
      }
    }

    if (!hasUpdates) {
      return new Response(JSON.stringify({ message: "No changes to update" }), { status: 200 })
    }

    const updatedTenantResult = await UpdateTenant(updatedData)

    if (updatedTenantResult.status === "OK") {
      return new Response(JSON.stringify(updatedTenantResult.response), { status: 200 })
    }
    return new Response(JSON.stringify({ error: "Failed to update tenant" }), { status: 400 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}

export async function GET(): Promise<Response> {
  const user = await userSession()
  if (!user) {
    return new Response(JSON.stringify({ status: 400, error: "No user session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const existingTenantResult = await GetTenantById(user.tenantId)
  if (existingTenantResult.status !== "OK") {
    return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })
  }

  const tenantDetails: TenantDetails = {
    primaryDomain: existingTenantResult.response.primaryDomain || "",
    supportEmail: existingTenantResult.response.supportEmail,
    departmentName: existingTenantResult.response.departmentName || "",
    administrators: existingTenantResult.response.administrators,
    groups: existingTenantResult.response.groups || ["No groups found"],
    preferences: existingTenantResult.response.preferences || { contextPrompt: "" },
    requiresGroupLogin: existingTenantResult.response.requiresGroupLogin,
  }

  return new Response(JSON.stringify({ status: "OK", data: tenantDetails }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
