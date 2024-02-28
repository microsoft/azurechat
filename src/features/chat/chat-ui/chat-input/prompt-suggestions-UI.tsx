import { useEffect, useState } from "react";
import { getPromptSuggestions } from "../../chat-services/prompt-suggestions";
import React from 'react';

interface PromptSuggestionProps {
  newInputValue: string;
  onSelect: (selectedValue: string) => void;
  onHide: () => void;
}
export const PromptSuggestion: React.FC<PromptSuggestionProps> = ({ newInputValue, onSelect, onHide }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const fetchedSuggestions = await getPromptSuggestions(newInputValue);
      setSuggestions(fetchedSuggestions);
    };

    fetchSuggestions();
  }, [newInputValue]);

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    onHide();
  };

  return (
    <div>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};