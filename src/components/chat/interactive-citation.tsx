import { Config } from "@markdoc/markdoc";

interface Citation {
  name: string;
  url: string;
}

interface Props {
  items: Citation[];
}

export const citationConfig: Config = {
  tags: {
    citation: {
      render: "InteractiveCitation",
      selfClosing: true,
      attributes: {
        items: {
          type: Array,
        },
      },
    },
  },
};

export const InteractiveCitation = (props: Props) => (
  <span className="interactive-citation">
    {props.items.map((item, index: number) => (
      <span className="flex gap-2" key={index}>
        <span>{item.name}</span>
        <span>{item.url}</span>
      </span>
    ))}
  </span>
);
