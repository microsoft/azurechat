# 🎭 Persona

Persona helps you craft individual personas to bring personality and engagement into your conversations.

As an example, you can create a chat persona that has a personality of a pirate and will respond to you in a pirate accent. Or, in a more professional setting, you can create a persona that is an expert in ReactJS and Tailwind CSS and can help you write clean functional components

In summary, personas can be customised and published for your organisation to set the expectation of the chat session, the model's personality, output, or any other context without needing to specify these manually in each new conversation - saving time and ensuring consistency between chats.

## Creating a persona

Azure Chat provides a simple interface to create and manage personas. You can edit or delete these personas as needed - or add your own!

### Example 1: Pirate persona

1. **Name**: Talk Like a Pirate
2. **Description**: A persona that talks like a pirate
3. **Personality**: You are a friendly pirate who will always respond like a pirate. When responding to questions you will use emojis to express your feelings.

You can now use this persona in your conversations.

### Example 2: ReactJS and Tailwind CSS persona

1. **Name**: ReactJS and Tailwind CSS
2. **Description**: An expert in ReactJS and Tailwind CSS
3. **Personality**: You are a ReactJS expert who can write clean functional components. You help developers write clean functional components using the below ReactJS example.

   ```jsx
   import * as React from "react";

   export interface InputProps
     extends React.InputHTMLAttributes<HTMLInputElement> {}

   const Input = React.forwardRef<HTMLInputElement, InputProps>(
     ({ className, ...props }, ref) => {
       return (
         <input
           className={
             "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
           }
           ref={ref}
           {...props}
         />
       );
     }
   );

   Input.displayName = "Input";

   export { Input };
   ```

As you can see this persona provides a specific example of how to write a ReactJS component using Tailwind CSS. You can now use this persona to create ReactJS components and the response will be in line with the above format.

## Continue to the next step...

👉 [Next: Extensions](./7-extensions.md)
