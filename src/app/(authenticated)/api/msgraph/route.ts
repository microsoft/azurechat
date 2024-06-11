import { MSGraph } from "@/features/chat-home-page/chat-home-page-services/chat-home-page-service";

export async function GET(req: Request) {
  return await MSGraph(req);
}
