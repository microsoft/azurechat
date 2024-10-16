import { Markdown } from "@/features/ui/markdown/markdown";
import { FunctionSquare } from "lucide-react";
import React, { useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { RecursiveUI } from "../ui/recursive-ui";
import { CitationAction } from "./citation/citation-action";
import MermaidComponent from "./mermaid-diagram";


interface MessageContentProps {
  message: {
    role: string;
    content: string;
    name: string;
    multiModalImage?: string;
  };
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const getMermaidCode = (content: string): string | null => {
    const mermaidRegex = /```mermaid((.*\n)+?)```/; // Adjust regex based on how Mermaid diagrams are identified
    const match = content.match(mermaidRegex);
    return match ? match[1] : null;
  };

  if (message.role === "assistant" || message.role === "user") {
    const mermaidCode = getMermaidCode(message.content);
    const mermaidDiagramId = useMemo(() => `mermaid-${Date.now()}`, []); // Generate a unique ID

    return (
      <>
        {/* Render message content and optionally a mermaid diagram */}
        <Markdown content={message.content} onCitationClick={CitationAction} />
        {mermaidCode && (
          <>
            <br />
            {/* Render Mermaid diagram with the extracted code and unique ID */}
            <MermaidComponent source={mermaidCode.trim()} id={mermaidDiagramId} />
          </>
        )}
        {message.multiModalImage && <img src={message.multiModalImage} alt="Multimodal" />}
      </>
    );
  }

  if (message.role === "tool" || message.role === "function") {
    return (
      <div className="py-3">
        <Accordion
          type="multiple"
          className="bg-background rounded-md border p-2"
        >
          <AccordionItem value="item-1" className="">
            <AccordionTrigger className="text-sm py-1 items-center gap-2">
              <div className="flex gap-2 items-center">
                <FunctionSquare
                  size={18}
                  strokeWidth={1.4}
                  className="text-muted-foreground"
                />{" "}
                Show {message.name}{" "}
                {message.name === "tool" ? "output" : "function"}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <RecursiveUI documentField={toJson(message.content)} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return null;
};

const toJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export default MessageContent;

