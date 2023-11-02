import { citation } from "@/features/chat/chat-ui/markdown/citation";
import { Config } from "@markdoc/markdoc";
import { paragraph } from "./paragraph";

export const citationConfig: Config = {
  nodes: {
    paragraph: paragraph,
  },
  tags: {
    citation,
  },
};
