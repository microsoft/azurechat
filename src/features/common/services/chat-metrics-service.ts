import { metrics } from "@opentelemetry/api";
import { userHashedId, userSession } from "@/features/auth/helpers";

function getChatMeter(){
    const meter = metrics.getMeter("chat");
    return meter;
}

async function getAttributes(chatModel: string){
    const user = await userSession();
    const userId = await userHashedId();
    const attributes = { "email": user?.email, "name": user?.name, "userHashedId": userId, "chatModel": chatModel || "unknown", "userId": userId };
    return attributes;
}

export async function reportPromptTokens(tokenCount: number, model: string) {

    const meter = getChatMeter();

    const promptTokensUsed = meter.createHistogram("promptTokensUsed", {
        description: "Number of tokens used in the input prompt",
        unit: "tokens",
    });

    promptTokensUsed.record(tokenCount, await getAttributes(model));
}

export async function reportCompletionTokens(tokenCount: number, model: string) {

        const meter = getChatMeter();

        const completionsTokensUsed = meter.createHistogram("completionsTokensUsed", {
            description: "Number of tokens used in the completions",
            unit: "tokens",
        });

        completionsTokensUsed.record(tokenCount, await getAttributes(model));
}

export async function reportUserChatMessage(model: string) {

    const meter = getChatMeter();

    const userChatMessage = meter.createCounter("userChatMessage", {
        description: "Number of messages",
        unit: "messages",
    });

    userChatMessage.add(1, await getAttributes(model));
}
