"use server";

import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store";

export const CitationAction = async (
  previousState: any,
  formData: FormData
) => {
  const id = formData.get("id") as string;
  const chatThreadId = formData.get("chatThreadId") as string;
  const userId = formData.get("userId") as string;
  const tenantId = formData.get("tenantId") as string;

  const filter = {
    filter: `id eq '${id}' and chatThreadId eq '${chatThreadId}' and userId eq '${userId}' and tenantId eq '${tenantId}'`,
  };
  const result = await simpleSearch(userId, chatThreadId, tenantId, filter);

  if (result.length === 0) return <div>Not found</div>;
  const firstResult = result[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-sm p-2">
        <div className="font-bold">File name</div>
        <div>{firstResult.metadata}</div>
      </div>
      <p>{firstResult.pageContent}</p>
    </div>
  );
};
