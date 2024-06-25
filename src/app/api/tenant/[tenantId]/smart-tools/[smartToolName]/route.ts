import { NextRequest } from "next/server"
import * as yup from "yup"

import { isAdminOrTenantAdmin } from "@/features/auth/helpers"
import { UpdateTenantToolConfig } from "@/features/tenant-management/tenant-service"

const smartToolUpdateSchema = yup
  .object({
    tenantId: yup.string().required(),
    tool: yup.object({
      name: yup.string().required(),
      enabled: yup.boolean().required(),
      template: yup.string().optional().default(""),
    }),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string; smartToolName: string } }
): Promise<Response> {
  try {
    const isAuthorized = await isAdminOrTenantAdmin()
    if (!isAuthorized) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const requestBody = await request.json()
    const validatedData = await smartToolUpdateSchema.validate(
      { ...requestBody, tenantId: params.tenantId },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    )
    const { tenantId, tool } = validatedData

    const results = await UpdateTenantToolConfig(tenantId, tool)
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
