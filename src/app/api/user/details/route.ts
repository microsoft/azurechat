import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { GetUserByUpn, UpdateUser } from "@/features/user-management/user-service"

const userUpdateSchema = yup
  .object({
    upn: yup.string().required(),
    tenantId: yup.string().required(),
    contextPrompt: yup.string().optional(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(request: NextRequest, _response: NextResponse): Promise<Response> {
  try {
    const [requestBody, user] = await Promise.all([request.json(), userSession()])
    const validatedData = await userUpdateSchema.validate(
      { ...requestBody, upn: user?.upn, tenantId: user?.tenantId },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    )
    const { upn, tenantId, contextPrompt = "" } = validatedData

    // TODO: validate new prompt

    const existingUserResult = await GetUserByUpn(tenantId, upn)
    if (existingUserResult.status !== "OK") {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }
    if (contextPrompt === existingUserResult.response?.preferences?.contextPrompt) {
      return new Response("Context prompt already set", { status: 200 })
    }
    const updatedUserResult = await UpdateUser(tenantId, existingUserResult.response.userId, {
      ...existingUserResult.response,
      preferences: { contextPrompt },
    })
    if (updatedUserResult.status === "OK") {
      return new Response(JSON.stringify(updatedUserResult.response), { status: 200 })
    }
    return new Response(JSON.stringify({ error: "Failed to update user" }), { status: 400 })
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
  const existingUserResult = await GetUserByUpn(user.tenantId, user.upn)
  if (existingUserResult.status !== "OK") {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
  }

  return new Response(
    JSON.stringify({
      status: "OK",
      data: existingUserResult.response.preferences || { contextPrompt: "" },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  )
}
