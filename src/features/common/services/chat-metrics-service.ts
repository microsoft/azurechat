'use server';
import "server-only";

import { metrics } from "@opentelemetry/api";
import { userHashedId, userSession } from "@/features/auth-page/helpers";

function getChatMeter(){
    const meter = metrics.getMeter("chat");
    return meter;
}

async function getAttributes(chatModel: string){
    const user = await userSession();
    const userId = await userHashedId();
    const attributes = { "email": user?.email, "name": user?.name, "userHashedId": userId, "chatModel": chatModel };
    return attributes;
}

export async function reportPromptTokens(tokenCount: number, model: string, role: string, attributes: any = {}) {

    const meter = getChatMeter();

    const promptTokensUsed = meter.createHistogram("promptTokensUsed", {
        description: "Number of tokens used in the input prompt",
        unit: "tokens",
    });

    let defaultAttributes = <any>await getAttributes(model);
    attributes["role"] = role;

    let compbinedAttributes = { ...defaultAttributes, ...attributes };

    promptTokensUsed.record(tokenCount, compbinedAttributes);
}

export async function reportCompletionTokens(tokenCount: number, model: string, attributes: any = {}) {

        const meter = getChatMeter();

        const completionsTokensUsed = meter.createHistogram("completionsTokensUsed", {
            description: "Number of tokens used in the completions",
            unit: "tokens",
        });

        let combinedAttributes = { ...attributes, ...await getAttributes(model) };

        completionsTokensUsed.record(tokenCount, combinedAttributes);
}

export async function reportUserChatMessage(model: string, attributes: any = {}) {

    const meter = getChatMeter();

    const userChatMessage = meter.createCounter("userChatMessage", {
        description: "Number of messages",
        unit: "messages",
    });

    let combinedAttributes = { ...attributes, ...await getAttributes(model) };

    userChatMessage.add(1, combinedAttributes);
}
