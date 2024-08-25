import { NextRequest } from "next/server"
import * as yup from "yup"

import { isAdminOrTenantAdmin } from "@/features/auth/helpers"
import { UpdateTenantToolConfig } from "@/features/services/tenant-service"

const smartToolUpdateSchema = yup
  .object({
    id: yup.string().required(),
    tenantId: yup.string().required(),
    tool: yup.object({
      enabled: yup.boolean().required(),
      template: yup.string().optional().default(""),
      accessGroups: yup.array().of(yup.string().required()).required(),
    }),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string; smartToolId: string } }
): Promise<Response> {
  try {
    const isAuthorized = await isAdminOrTenantAdmin()
    if (!isAuthorized) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const requestBody = await request.json()
    const validatedData = await smartToolUpdateSchema.validate(
      { ...requestBody, tenantId: params.tenantId, id: params.smartToolId },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    )
    const { id, tenantId, tool } = validatedData

    const results = await UpdateTenantToolConfig(tenantId, {
      id,
      enabled: tool.enabled,
      template: tool.template,
      accessGroups: tool.accessGroups,
    })
    if (results.status !== "OK")
      return new Response(JSON.stringify({ error: "Failed to get tenant tools config" }), { status: 500 })

    return new Response(JSON.stringify(results.response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
