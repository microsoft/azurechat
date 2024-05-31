import * as yup from "yup"

import { SmartGenModel } from "@/features/smart-gen/models"
import { UpsertSmartGen } from "@/features/smart-gen/smart-gen-service"

const smartGenItemSchema = yup.object<SmartGenModel>({
  id: yup.string().required(),
  action: yup.string().required(),
  context: yup.mixed().required(),
  output: yup.string().required(),
})
export async function POST(request: Request, _response: Response): Promise<Response> {
  try {
    const requestBody = await request.json()
    const validatedData = (await smartGenItemSchema.validate(requestBody, {
      abortEarly: false,
      stripUnknown: true,
    })) as SmartGenModel
    const response = await UpsertSmartGen(validatedData)
    if (response.status !== "OK") throw response.errors
    return new Response(JSON.stringify({ status: "OK" }), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify(errorMessage), { status: error instanceof yup.ValidationError ? 400 : 500 })
  }
}
