import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { TenantDetails } from "@/features/tenant-management/models"
import { GetTenantById, UpdateTenant } from "@/features/tenant-management/tenant-service"

const tenantUpdateSchema = yup
  .object({
    tenantId: yup.string().required(),
    contextPrompt: yup.string().optional(),
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
    const { tenantId, contextPrompt = "" } = validatedData

    const existingTenantResult = await GetTenantById(tenantId)
    if (existingTenantResult.status !== "OK") {
      return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })
    }
    if (!user || !existingTenantResult.response.administrators.includes(user.email)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }
    if (contextPrompt === existingTenantResult.response.preferences?.contextPrompt) {
      return new Response("Context prompt already set", { status: 200 })
    }

    // TODO: validate new prompt

    const updatedTenantResult = await UpdateTenant({
      ...existingTenantResult.response,
      preferences: {
        contextPrompt,
      },
    })
    if (updatedTenantResult.status === "OK") {
      return new Response(JSON.stringify(updatedTenantResult.response), { status: 200 })
    }
    return new Response(JSON.stringify({ error: "Failed to update tenant" }), { status: 400 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify(errorMessage), { status: error instanceof yup.ValidationError ? 400 : 500 })
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
    preferences: existingTenantResult.response.preferences || { contextPrompt: "" },
  }

  return new Response(JSON.stringify({ status: "OK", data: tenantDetails }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
