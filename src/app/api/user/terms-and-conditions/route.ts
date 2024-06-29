import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { GetUserByUpn, UpdateUser } from "@/features/user-management/user-service"

const userUpdateSchema = yup
  .object({
    upn: yup.string().required(),
    tenantId: yup.string().required(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(_request: NextRequest, _response: NextResponse): Promise<Response> {
  try {
    const user = await userSession()
    const validatedData = await userUpdateSchema.validate(
      { upn: user?.upn, tenantId: user?.tenantId },
      { abortEarly: false, stripUnknown: true }
    )
    const { upn, tenantId } = validatedData

    const existingUserResult = await GetUserByUpn(tenantId, upn)
    if (existingUserResult.status !== "OK") {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const updatedUserResult = await UpdateUser(tenantId, existingUserResult.response.userId, {
      ...existingUserResult.response,
      accepted_terms: true,
      accepted_terms_date: new Date().toISOString(),
    })
    if (updatedUserResult.status === "OK") {
      return new Response(JSON.stringify(updatedUserResult.response), { status: 200 })
    }
    return new Response(JSON.stringify({ error: "Failed to update T&Cs" }), { status: 400 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify(errorMessage), { status: error instanceof yup.ValidationError ? 400 : 500 })
  }
}
