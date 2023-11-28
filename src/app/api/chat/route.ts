import { chatAPIEntry } from "@/features/chat/chat-services/chat-api-entry";

export async function POST(req: Request) {
  const body = await req.json();
  return await chatAPIEntry({
    ...body,
    model: "gpt-3.5-turbo"
  });
}
