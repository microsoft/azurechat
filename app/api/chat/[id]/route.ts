import { PromptGPT } from "@/features/chat/chat-api";

type Prop = {
  params: {
    id: string;
  };
};

export async function POST(req: Request, props: Prop) {
  const { message, model } = await req.json();
  return await PromptGPT(props.params.id, message, model);
}
