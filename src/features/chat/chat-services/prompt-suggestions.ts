"use server";
import "server-only";
import { GenericChatAPI } from "./generic-chat-api"; 


export const getPromptSuggestions = async (input: string): Promise<string[]> => {
    try {
      const apiName = 'getPromptSuggestions';
      const promptSuggestion = await GenericChatAPI(apiName, {
        messages: [
          {
            role: 'system',
            content: `- create a succinct prompt suggestion, to complete the chat inside double quotes ""  ${input} "" without repeating the chat.
                - this prompt will complete the user input with the most relevant words.`,
          },
        ],
      });
  
      if (!promptSuggestion || promptSuggestion.length === 0) {
        console.log('Error: Unexpected prompt suggestion structure from OpenAI API.');
        return [];
      }
  
      const prompt = promptSuggestion;
  
      if (prompt == null) {
        console.log('Error: Prompt is null or undefined.');
        return [];
      }
  
      const cleanedPrompt = prompt.replace(/^"+|"+$/g, '');
  
      if (cleanedPrompt.trim() === '') {
        console.log('Error: Cleaned prompt is empty.');
        return [];
      }
  
      return [cleanedPrompt];
    } catch (e) {
      console.log(`An error occurred: ${e}`);
      return [''];
    }
  };