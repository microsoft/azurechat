import { refineFromEmpty } from "@/features/common/schema-validation";
import { z } from "zod";

export const PROMPT_ATTRIBUTE = "PROMPT";
export type PromptModel = z.infer<typeof PromptModelSchema>;

export const PromptModelSchema = z.object({
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
  createdAt: z.date(),
  isPublished: z.boolean(),
  userId: z.string(),
  type: z.literal(PROMPT_ATTRIBUTE),
});
