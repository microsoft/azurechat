"use client";
import { Config } from "@markdoc/markdoc";
import { FC } from "react";
import { CitationSlider } from "./citation-slider";

interface Citation {
  name: string;
  id: string;
}

interface Props {
  items: Citation[];
}

export const citationConfig: Config = {
  tags: {
    citation: {
      render: "Citation",
      selfClosing: true,
      attributes: {
        items: {
          type: Array,
        },
      },
    },
  },
};

export const Citation: FC<Props> = (props: Props) => {
  return (
    <div className="interactive-citation p-4 border mt-4 flex flex-col rounded-md gap-2">
      {props.items.map((item, index: number) => {
        return (
          <div key={index}>
            <CitationSlider index={index + 1} name={item.name} id={item.id} />
          </div>
        );
      })}
    </div>
  );
};
