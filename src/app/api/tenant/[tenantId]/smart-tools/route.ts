import { NextRequest } from "next/server"

import { isAdminOrTenantAdmin } from "@/features/auth/helpers"
import { GetTenantToolConfig } from "@/features/services/tenant-service"

export async function GET(_request: NextRequest, { params }: { params: { tenantId: string } }): Promise<Response> {
  const { tenantId } = params

  const isAuthorized = await isAdminOrTenantAdmin()
  if (!isAuthorized) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const results = await GetTenantToolConfig(tenantId)
  if (results.status !== "OK")
    return new Response(JSON.stringify({ error: "Failed to get tenant tools config" }), { status: 500 })

  return new Response(JSON.stringify(results.response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
