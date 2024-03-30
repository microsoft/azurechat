import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"
import { GetUserByUpn, UpdateUser } from "@/features/user-management/user-service"

const userUpdateSchema = yup
  .object({
    upn: yup.string().required(),
    tenantId: yup.string().required(),
    contextPrompt: yup.string().optional(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await request.json()
    const validatedData = await userUpdateSchema.validate(requestBody, {
      abortEarly: false,
      stripUnknown: true,
    })

    const { upn, tenantId, contextPrompt } = validatedData

    const existingUserResult = await GetUserByUpn(tenantId, upn)
    if (existingUserResult.status !== "OK") {
      return new NextResponse(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const updates = { contextPrompt }
    const updatedUserResult = await UpdateUser(tenantId, existingUserResult.response.userId, {
      ...existingUserResult.response,
      ...updates,
    })
    if (updatedUserResult.status === "OK") {
      return new NextResponse(JSON.stringify(updatedUserResult.response), { status: 200 })
    } else {
      return new NextResponse(JSON.stringify({ error: "Failed to update user" }), { status: 400 })
    }
  } catch (error) {
    console.error("Failed to update user:", error)
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new NextResponse(JSON.stringify(errorMessage), { status: error instanceof yup.ValidationError ? 400 : 500 })
  }
}
