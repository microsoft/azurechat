import { NextRequest } from "next/server"
import * as yup from "yup"

import { isAdmin, isAdminOrTenantAdmin } from "@/features/auth/helpers"
import { GetTenantDetailsById, UpdateTenant } from "@/features/services/tenant-service"

const tenantUpdateSchema = yup
  .object({
    tenantId: yup.string().required(),
    contextPrompt: yup.string().max(500).optional(),
    groups: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^[a-fA-F0-9-]{36}$/, "Invalid group GUID")
          .required()
      )
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

    if (!isAdmin()) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const { tenantId, contextPrompt, groups, requiresGroupLogin } = validatedData

    const updatedTenantResult = await UpdateTenant({
      id: tenantId,
      preferences: { contextPrompt },
      groups,
      requiresGroupLogin,
    })

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

  const tenantResult = await GetTenantDetailsById(tenantId)
  if (tenantResult.status !== "OK") return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })

  return new Response(JSON.stringify({ status: "OK", data: tenantResult.response }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
