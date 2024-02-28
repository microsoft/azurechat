'use server'
import "server-only";
import { ChatThreadModel } from "./models";
import { UpsertChatThread } from "./chat-thread-service";
import { GenericChatAPI } from "./generic-chat-api";
import { translator } from "./chat-translator-service";

async function generateChatName(chatMessage: string): Promise<string> {
    const apiName = "generateChatName";
    try {
        let name = await GenericChatAPI(apiName, {
            messages: [
                {
                    role: "system",
                    content: `- create a succinct title, limited to five words and 20 characters, for the following chat """ ${chatMessage}""" conversation with a generative AI assistant:
                    - this title should effectively summarise the main topic or theme of the chat.
                    - it will be used in the app's navigation interface, so it should be easily understandable and reflective of the chat's content 
                    to help users quickly grasp what the conversation was about.`
                },
            ],
        });

        const translatedChatName = await translator(name);
        name = translatedChatName;
        
        if (name) {
            return name.replace(/^"+|"+$/g, ''); // Remove proceeding and trailing quotes from the returned message
        } else {
            console.log('Error: Unexpected response structure from OpenAI API.');
            return "";
        }

    } catch (e) {
        console.log(`An error occurred: ${e}`);
        const words: string[] = chatMessage.split(' ');
        const name: string = 'New Chat by Error';
        return name;
    }
}

async function generateChatCategory(chatMessage: string): Promise<string> {
    const apiName = "generateChatCategory";
    let categories = [
        'Information Processing and Management',
        'Communication and Interaction',
        'Decision Support and Advisory',
        'Educational and Training Services',
        'Operational Efficiency and Automation',
        'Public Engagement and Services',
        'Innovation and Development',
        'Creative Assistance',
        'Lifestyle and Personal Productivity',
        'Entertainment and Engagement',
        'Emotional and Mental Support'
    ];

    try {
        const category = await GenericChatAPI(apiName, {
            messages: [
                {
                    role: "user",
                    content: `Categorise this chat session inside double quotes "" ${chatMessage} "" into only one of the following 
                    categories: ${categories.join(', ')} inside square brackets based on my query`
                },
            ],
        });


        if (category != null) {
            return category;
        }
        else {
            console.log(`Uncategorised chat.`);
            return "Uncategorised!";
        }

    } catch (e) {
        console.log(`An error occurred: ${e}`);
        const words: string[] = chatMessage.split(' ');
        const category: string = 'Uncategorised';
        return category;
    }
}

export async function StoreOriginalChatName(currentChatName: string) {
    let previousChatName: string = "";
    if (currentChatName !== previousChatName) {
        previousChatName = currentChatName; // store the original chat name
    }
    return previousChatName;
}

export async function chatCatName(chatThread: ChatThreadModel, content: string) {
    try {

        if (chatThread.chatCategory === "Uncategorised") {
            chatThread.chatCategory = await generateChatCategory(content);
            chatThread.name = await generateChatName(content);
            chatThread.previousChatName = await StoreOriginalChatName(chatThread.name)

            UpsertChatThread(chatThread);
        }

    } catch (e) {
        console.log("Do some magic failed", e);
    }
}