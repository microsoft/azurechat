import { SearchAzureAISimilarDocuments } from "@/features/chat-page/chat-services/chat-api/chat-api-rag-extension";

export async function POST(req: Request) {
  return SearchAzureAISimilarDocuments(req);
}
