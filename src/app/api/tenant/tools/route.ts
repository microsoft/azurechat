import { GetTenantToolConfig } from "@/features/tenant-management/tenant-service"

export async function GET(): Promise<Response> {
  const results = await GetTenantToolConfig()
  if (results.status !== "OK")
    return new Response(JSON.stringify({ error: "Failed to get tenant tools config" }), { status: 500 })

  return new Response(JSON.stringify(results.response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
