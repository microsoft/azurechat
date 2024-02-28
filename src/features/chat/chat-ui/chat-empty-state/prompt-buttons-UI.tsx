import React, { useState, useEffect } from 'react';
import { PromptButtons } from '../../chat-services/prompt-buttons';
import { Button } from '@/components/ui/button';

interface Prop {
  onPromptSelected: (prompt: string) => void;
  selectedPrompt: string | undefined;
}

export const PromptButton: React.FC<Prop> = ({ onPromptSelected, selectedPrompt }) => {
  const [prompts, setPrompts] = useState<string[]>([]);
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await PromptButtons();
        setPrompts(data);
      } catch (error) {
        console.log('Error fetching prompts from backend:', error);
      }
    };

    fetchPrompts();
  }, []);

  const handlePromptClick = (prompt: string) => {
    onPromptSelected(prompt);
  };

  return (
    <div className="space-container">
      <ul aria-live="polite" className="w-full mb-2 ">
        {prompts.map((prompt, index) => (
          <li key={index} className="mb-2 bg-background rounded text-foreground">
            <Button
              onClick={() => handlePromptClick(prompt)}
              className={`w-full text-center p-2 rounded text-buttonText ${selectedPrompt === prompt ? 'bg-button' : 'text-buttonText'}`}
              disabled={selectedPrompt === prompt}
              aria-pressed={selectedPrompt === prompt}
            >
              {prompt}
            </Button>
          </li>
        ))}
      </ul>
      <div className="additional-spacing" />
    </div>
  );
};
