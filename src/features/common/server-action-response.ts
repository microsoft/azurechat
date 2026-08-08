import { ZodIssue } from "zod";

export type ServerActionError = {
  message: string;
};

type ServerActionValidationError = {
  status: "ERROR" | "NOT_FOUND" | "UNAUTHORIZED";
  errors: ServerActionError[];
};

type ServerActionSuccess<T = any> = {
  status: "OK";
  response: T;
};

export type ServerActionResponse<T = any> =
  | ServerActionValidationError
  | ServerActionSuccess<T>;

export const zodErrorsToServerActionErrors = (errors: ZodIssue[]) => {
  return errors.map((error) => {
    return {
      message: error.message,
    };
  });
};
