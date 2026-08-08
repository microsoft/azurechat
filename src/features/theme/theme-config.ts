export const AI_NAME = "Azure Chat for OBGYN";
export const AI_DESCRIPTION = "Azure Chat is a friendly AI assistant.";
export const CHAT_DEFAULT_PERSONA = AI_NAME + " default";

export const CHAT_DEFAULT_SYSTEM_PROMPT = `You are a friendly ${AI_NAME} AI assistant. You must always return in markdown format.`;

// Appended to the system prompt only when image generation is enabled —
// otherwise the model is told about a tool that is not registered.
export const CHAT_IMAGE_GEN_PROMPT = `You have access to the following functions:
1. create_img: You must only use the function create_img if the user asks you to create an image.`;

export const NEW_CHAT_NAME = "New chat";
