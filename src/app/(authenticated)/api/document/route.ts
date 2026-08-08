import { SearchAzureAISimilarDocuments } from "@/features/chat-page/chat-services/chat-api/chat-api-rag-extension";
import { GetFeatureFlags } from "@/features/common/feature-flags";

export async function POST(req: Request) {
  if (!GetFeatureFlags().chatWithFileEnabled) {
    return new Response("Document search is not enabled on this deployment.", {
      status: 404,
    });
  }
  return SearchAzureAISimilarDocuments(req);
}
