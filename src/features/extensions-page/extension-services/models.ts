import { refineFromEmpty } from "@/features/common/schema-validation";
import { z } from "zod";

export const EXTENSION_ATTRIBUTE = "EXTENSION";

export type ExtensionModel = z.infer<typeof ExtensionModelSchema>;
export type ExtensionFunctionModel = z.infer<typeof ExtensionFunctionSchema>;
export type HeaderModel = z.infer<typeof HeaderSchema>;

export const HeaderSchema = z.object({
  id: z.string(),
  key: z
    .string()
    .min(1, {
      message: "Header key cannot be empty",
    })
    .refine(refineFromEmpty, "Header key cannot be empty"),
  value: z
    .string()
    .min(1, {
      message: "Header value cannot be empty",
    })
    .refine(refineFromEmpty, "Header value cannot be empty"),
});

export type EndpointType = z.infer<typeof EndpointTypeSchema>;

export const EndpointTypeSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export const ExtensionFunctionSchema = z.object({
  id: z.string({ required_error: "Function ID is required" }),
  code: z
    .string()
    .min(1, {
      message: "Function code cannot be empty",
    })
    .refine(refineFromEmpty, "Function code cannot be empty"),
  endpoint: z
    .string()
    .min(1, {
      message: "Function endpoint cannot be empty",
    })
    .refine(refineFromEmpty, "Function endpoint cannot be empty"),
  endpointType: EndpointTypeSchema,
  isOpen: z.boolean(),
});

export const ExtensionModelSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, {
      message: "Title cannot be empty",
    })
    .refine(refineFromEmpty, "Title cannot be empty"),
  description: z
    .string()
    .min(1, {
      message: "Description cannot be empty",
    })
    .refine(refineFromEmpty, "Description cannot be empty"),
  executionSteps: z
    .string()
    .min(1, {
      message: "persona cannot be empty",
    })
    .refine(refineFromEmpty, "Description cannot be empty"),
  headers: z.array(HeaderSchema),
  userId: z.string(),
  isPublished: z.boolean(),
  createdAt: z.date(),
  functions: z.array(ExtensionFunctionSchema), // validation is done in the function schema
  type: z.literal(EXTENSION_ATTRIBUTE),
});
