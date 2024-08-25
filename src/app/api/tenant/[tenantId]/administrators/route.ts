import { NextRequest } from "next/server"
import * as yup from "yup"

import { isAdmin, isTenantAdmin } from "@/features/auth/helpers"
import { GetTenantById, UpdateTenant } from "@/features/services/tenant-service"

const tenantUpdateSchema = yup
  .object({
    tenantId: yup.string().required(),
    administrators: yup
      .array()
      .of(
        yup
          .string()
          .required()
          .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid tenant admin email")
      )
      .required(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }): Promise<Response> {
  try {
    const requestBody = await request.json()
    const validatedData = await tenantUpdateSchema.validate(
      { ...requestBody, tenantId: params.tenantId },
      { abortEarly: false, stripUnknown: true }
    )
    const { tenantId, administrators } = validatedData

    const isAuthorized = (await isAdmin()) || (await isTenantAdmin())
    if (!isAuthorized) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const existingTenantResult = await GetTenantById(tenantId)
    if (existingTenantResult.status !== "OK")
      return new Response(JSON.stringify({ error: "Tenant not found" }), { status: 404 })

    let hasUpdates = false
    const updatedData = { ...existingTenantResult.response }

    if (JSON.stringify(administrators.sort()) !== JSON.stringify(existingTenantResult.response.administrators.sort())) {
      updatedData.administrators = administrators || []
      hasUpdates = true
    }

    if (!hasUpdates) return new Response(JSON.stringify({ message: "No changes to update" }), { status: 200 })

    const updatedTenantResult = await UpdateTenant(updatedData)
    if (updatedTenantResult.status === "OK")
      return new Response(JSON.stringify(updatedTenantResult.response), { status: 200 })

    return new Response(JSON.stringify({ error: "Failed to update tenant" }), { status: 500 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
