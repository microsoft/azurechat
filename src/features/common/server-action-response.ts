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
