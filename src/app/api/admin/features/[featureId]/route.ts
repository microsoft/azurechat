import { NextRequest } from "next/server"
import * as yup from "yup"

import { DeleteFeature, UpdateFeature } from "@/features/services/admin-service"

const featureSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  enabled: yup.boolean().required(),
  isPublic: yup.boolean().required(),
})
export async function POST(request: NextRequest, { params }: { params: { featureId: string } }): Promise<Response> {
  try {
    const requestBody = await request.json()
    const validatedData = await featureSchema.validate(requestBody, { abortEarly: false, stripUnknown: true })
    const result = await UpdateFeature({ ...validatedData, id: params.featureId })
    if (result.status === "OK") return new Response(JSON.stringify(result.response), { status: 200 })
    return new Response(JSON.stringify({ error: "Failed to update feature" }), { status: 500 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { featureId: string } }): Promise<Response> {
  try {
    const result = await DeleteFeature(params.featureId)
    if (result.status === "OK") return new Response(JSON.stringify(result.response), { status: 200 })
    return new Response(JSON.stringify({ error: "Failed to delete feature" }), { status: 500 })
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
