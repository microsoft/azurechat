"use server";

import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store";

export const CitationAction = async (
  previousState: any,
  formData: FormData
) => {
  const result = await simpleSearch({
    filter: `id eq '${formData.get("id")}'`,
  });

  if (result.length === 0) return <div>Not found</div>;

  const firstResult = result[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-sm p-2">
        <div className="font-bold">Idd</div>
        <div>{firstResult.id} </div>
      </div>
      <div className="border rounded-sm p-2">
        <div className="font-bold">File name</div>
        <div>{firstResult.metadata} </div>
      </div>
      <p>{firstResult.pageContent}</p>
    </div>
  );
};
