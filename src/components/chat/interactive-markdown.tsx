import Markdoc from "@markdoc/markdoc";
import React, { FC } from "react";
import { InteractiveCitation, citationConfig } from "./interactive-citation";

interface Props {
  content: string;
}

export const InteractiveMarkdown: FC<Props> = (props) => {
  const ast = Markdoc.parse(props.content);

  const content = Markdoc.transform(ast, {
    ...citationConfig,
  });
  return Markdoc.renderers.react(content, React, {
    components: { InteractiveCitation },
  });
};
