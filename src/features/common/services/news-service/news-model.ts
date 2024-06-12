import { refineFromEmpty } from "@/features/common/schema-validation";
import { z } from "zod";

export const NEWS_ARTICLE = "NEWS_ARTICLE";
export type NewsArticleModel = z.infer<typeof NewsArticleModelSchema>;

export const NewsArticleModelSchema = z.object({
  id: z.string(),
  title: z
    .string({
      invalid_type_error: "Invalid title",
    })
    .min(1, "Title cannot be empty") // Ensuring title is not empty
    .refine(refineFromEmpty, "Title cannot be empty"),
  description: z
    .string({
      invalid_type_error: "Invalid description",
    })
    .min(1, "Description cannot be empty") // Ensuring description is not empty
    .refine(refineFromEmpty, "Description cannot be empty"),
  link: z
    .string({
      invalid_type_error: "Invalid link",
    })
    .url("Link must be a valid URL"), // Ensuring link is a valid URL
  createdAt: z.date(),
  type: z.literal(NEWS_ARTICLE),
});