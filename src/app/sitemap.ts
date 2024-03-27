import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://qchat.ai.qld.gov.au",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ]
}
