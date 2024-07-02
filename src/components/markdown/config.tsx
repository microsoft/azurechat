import { Config } from "@markdoc/markdoc"

import { fence } from "./code-block"
import { paragraph } from "./paragraph"

const citation = {
  render: "Citation",
  selfClosing: true,
  attributes: {
    items: {
      type: Array,
    },
  },
}

export const citationConfig: Config = {
  nodes: {
    paragraph,
    fence,
  },
  tags: {
    citation,
  },
}
