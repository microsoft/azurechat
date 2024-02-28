import React, { FormEvent, useEffect, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from "@/components/ui/button";
import { Menu, Bird, File, Clipboard } from "lucide-react";
import { Message } from 'ai';
import { toast } from '@/components/ui/use-toast';

interface ChatInputMenuProps {
  onDocExport: () => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setInput: (input: string) => void;
  messageCopy: Message[];
}

const ChatInputMenu: React.FC<ChatInputMenuProps> = ({ onDocExport, handleSubmit, setInput, messageCopy }) => {
  const firstMenuItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    }
  }, []);

  const fairClickHandler = () => {
    const fairInput = "Help me complete a Queensland Government Fast AI Risk Assessment (FAIRA)";
    setInput(fairInput);
    setTimeout(() => {
      const syntheticEvent = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent);
    }, 0);
  };

  const copyToClipboard = () => {
    const formattedMessages = messageCopy.map(message => {
      const author = message.role === 'system' || message.role === 'assistant' ? "AI" : "You";
      // fix the author name on export and copy to clipboard
      return `${author}: ${message.content}`;
    }).join('\n');
  
    navigator.clipboard.writeText(formattedMessages)
      .then(() => toast({ title: "Success", description: "Messages copied to clipboard" }))
      .catch(err => toast({ title: "Error", description: "Failed to copy messages to clipboard" }));
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="chat-input-options"
          aria-label="Open chat input options menu"
          type="button"
          variant="ghost"
          size="icon"
        >
          <Menu aria-hidden="true" focusable="false" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          id="chat-input-options"
          role="menu"
          aria-label="Chat input options"
          className="min-w-[220px] bg-background text-popover-foreground p-[5px] shadow-lg rounded-md"
          sideOffset={5}
        >
          <DropdownMenu.Item
            asChild
            onSelect={fairClickHandler}
            className="DropdownMenuItem bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground rounded-md cursor-pointer"
          >
            <div tabIndex={0} ref={firstMenuItemRef} style={{display: 'flex', alignItems: 'center', padding: '5px'}}>
              <Bird size={20} className="mr-2" aria-hidden="true"/>
              Complete a Fast AI Risk Assessment
            </div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-secondary my-2" />
          <DropdownMenu.Item
            asChild
            onSelect={onDocExport}
            className="DropdownMenuItem bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground rounded-md cursor-pointer"
          >
            <div tabIndex={0} style={{display: 'flex', alignItems: 'center', padding: '5px'}}>
              <File size={20} className="mr-2" aria-hidden="true"/>
              Export your Chat to File
            </div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-secondary my-2" />
          <DropdownMenu.Item
            asChild
            onSelect={copyToClipboard}
            className="DropdownMenuItem bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground rounded-md cursor-pointer"
          >
            <div tabIndex={0} style={{display: 'flex', alignItems: 'center', padding: '5px'}}>
              <Clipboard size={20} className="mr-2" aria-hidden="true"/>
              Copy Chat to Clipboard
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ChatInputMenu;
