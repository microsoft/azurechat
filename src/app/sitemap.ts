import { MetadataRoute } from "next"

import { APP_URL } from "@/features/theme/theme-config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ]
}
