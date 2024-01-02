import React, { FC, useState } from 'react';

interface Prop {
  onPromptSelected: (prompt: string) => void;
}

export const PromptButton: React.FC<Prop> = ({ onPromptSelected }) => {
  const prompts = ['prompt 1', 'prompt 2', 'prompt 3', 'prompt 4'];
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined);

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    onPromptSelected(prompt);

    switch (prompt) {
      case 'prompt 1':
        console.log('prompt 1 clicked');
        break;
      case 'prompt 2':
        console.log('prompt 2 clicked');
        break;
      case 'prompt 3':
        console.log('prompt 3 clicked');
        break;
      case 'prompt 4':
        console.log('prompt 4 clicked');
        break;
      default:
        break;
    }
  };

  return (  
    <div className="grid grid-cols-2 grid-rows-2 gap-4">
      <button
        onClick={() => handlePromptClick('prompt 1')}
        className={`bg-gray-300 rounded cursor-pointer ${selectedPrompt === 'prompt 1' ? 'bg-blue-500' : ''}`}
      >
        prompt 1
      </button>
      <button
        onClick={() => handlePromptClick('prompt 2')}
        className={`bg-gray-300 rounded cursor-pointer ${selectedPrompt === 'prompt 2' ? 'bg-blue-500' : ''}`}
      >
        prompt 2
      </button>
      <button
        onClick={() => handlePromptClick('prompt 3')}
        className={`bg-gray-300 rounded cursor-pointer ${selectedPrompt === 'prompt 3' ? 'bg-blue-500' : ''}`}
      >
        prompt 3
      </button>
      <button
        onClick={() => handlePromptClick('prompt 4')}
        className={`bg-gray-300 rounded cursor-pointer ${selectedPrompt === 'prompt 4' ? 'bg-blue-500' : ''}`}
      >
        prompt 4
      </button>
    </div>
  );
};
