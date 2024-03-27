import { ZodIssue } from "zod"

export type ServerActionError = {
  message: string
}

type ServerActionValidationError = {
  status: "ERROR" | "NOT_FOUND" | "UNAUTHORIZED"
  errors: ServerActionError[]
}

type ServerActionSuccess<T = unknown> = {
  status: "OK"
  response: T
}

export type ServerActionResponse<T = unknown> = ServerActionValidationError | ServerActionSuccess<T>

export type ServerActionResponseAsync<T = unknown> = Promise<ServerActionResponse<T>>

export const zodErrorsToServerActionErrors = (errors: ZodIssue[]): ServerActionError[] => {
  return errors.map(error => {
    return {
      message: error.message,
    }
  })
}
