import "server-only";
import { getTenantId, userHashedId } from "@/features/auth/helpers";
import { CosmosDBContainer } from "./cosmos";
import { ChatRole, ChatUtilityModel } from "../chat/chat-services/models";

export const SaveUtilityFunctionUsage = async (chatThreadId: string, utilityFunctionName: string, utilityFunctionParams: any, utilityFunctionResult: any) => {
    const container = await CosmosDBContainer.getInstance().getContainer();
    const tenantId = await getTenantId();
    const userId = await userHashedId();
    
    const chatUtilityMessage: ChatUtilityModel = {
        id: `uf-${Date.now()}`,
        name: utilityFunctionName,
        chatThreadId: chatThreadId,
        userId: userId,
        tenantId: tenantId,
        isDeleted: false,
        createdAt: new Date(),
        content: `Parameters: ${JSON.stringify(utilityFunctionParams)}, Result: ${JSON.stringify(utilityFunctionResult)}`,
        role: ChatRole.System,
        type: "CHAT_UTILITY",
    };
    await container.items.create<ChatUtilityModel>(chatUtilityMessage);
};

export const UseUtilityFunctionAndLog = async (chatThreadId: string) => {
    const utilityFunctionName = "ExampleUtilityFunction";
    const utilityFunctionParams = { param1: "value1", param2: "value2" };
    const utilityFunctionResult = "Result of the utility function";
    await SaveUtilityFunctionUsage(chatThreadId, utilityFunctionName, utilityFunctionParams, utilityFunctionResult);
};
