"use server";

import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store";

export const citationRetrieval = async (id:string, userId:string, tenantId:string, chatThreadId:string, ) => {
    const filter = {
        filter: `id eq '${id}' and chatThreadId eq '${chatThreadId}' and userId eq '${userId}' and tenantId eq '${tenantId}'`,
      };
      const result = await simpleSearch(userId, chatThreadId, tenantId, filter);

      if (result.length === 0) return null;
      const firstResult = result[0];
    
      return {
        Filename: firstResult.metadata,
        Content: firstResult.pageContent,
        Section: firstResult.order,
    };
};