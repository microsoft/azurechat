import { FC, memo } from "react";
import { Prism } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const fence = {
  render: "CodeBlock",
  attributes: {
    language: {
      type: String,
    },
    value: {
      type: String,
    },
  },
};

interface Props {
  language: string;
  children: string;
}

export const CodeBlock: FC<Props> = memo(({ language, children }) => {
  console.log(language);
  return (
    <Prism language={language} style={atomDark} PreTag="pre" showLineNumbers>
      {children}
    </Prism>
  );
});

CodeBlock.displayName = "CodeBlock";
