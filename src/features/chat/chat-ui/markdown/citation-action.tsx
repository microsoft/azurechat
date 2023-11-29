"use server";

import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store";

export const CitationAction = async (
  previousState: any,
  formData: FormData
) => {
  const documentId = formData.get("id");
  const result = await simpleSearch(documentId as string);

  if (!result) return <div>Not found</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-sm p-2">
        <div className="font-bold">Idd</div>
        <div>{result.id} </div>
      </div>
      <div className="border rounded-sm p-2">
        <div className="font-bold">File name</div>
        <div>{result.name} </div>
      </div>
      <p>{result.textContent}</p>
    </div>
  );
};
