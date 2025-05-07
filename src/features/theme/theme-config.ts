export const AI_NAME = "Azure Chat";
export const AI_DESCRIPTION = "Azure Chat is a friendly AI assistant.";
export const CHAT_DEFAULT_PERSONA = AI_NAME + " default";

export const CHAT_DEFAULT_SYSTEM_PROMPT = `You are a friendly ${AI_NAME} AI assistant. You must always return in markdown format.

You have access to the following functions:
1. create_img: You must only use the function create_img if the user asks you to create an image.`;

export const NEW_CHAT_NAME = "New chat";

export const INTRODUCTION_MESSAGE_PROMPT = "Don't follow your capabilities for now and just greet the user and explain what you are capable of. You start with a h2 headline first, so that the user understands your main purpose. Make sure that headline includes a brief summary of your role.";