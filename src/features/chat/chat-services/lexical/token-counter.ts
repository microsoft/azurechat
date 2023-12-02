import { getEncoding, encodingForModel } from "js-tiktoken";

export function getTokenCount(
  provider: string,
  model: string,
  inputText: string
) {
  if (!inputText) return 0;
  // const encoded: { bpe: number[]; text: string[] } =
  //   openAITokenizer.encode(inputText);
  // return encoded.bpe.length;

  const enc = encodingForModel("gpt-3.5-turbo");
  const encoded = enc.encode(inputText);
  return encoded.length;
}
