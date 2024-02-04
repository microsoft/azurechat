import { customAlphabet } from "nanoid";

import { ChatThreadModel } from "../chat-page/chat-services/models";

export const uniqueId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 36);
  return nanoid();
};

export const sortByTimestamp = (a: ChatThreadModel, b: ChatThreadModel) => {
  return (
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
};
