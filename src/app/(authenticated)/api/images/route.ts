import { ImageAPIEntry } from "@/features/chat-page/chat-services/images-api";

export async function GET(req: Request) {
  return await ImageAPIEntry(req);
}