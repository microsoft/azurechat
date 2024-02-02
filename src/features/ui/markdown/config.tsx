import { Config } from "@markdoc/markdoc";
import { citation } from "./citation";
import { fence } from "./code-block";
import { paragraph } from "./paragraph";

export const citationConfig: Config = {
  nodes: {
    paragraph,
    fence,
  },
  tags: {
    citation,
  },
};
