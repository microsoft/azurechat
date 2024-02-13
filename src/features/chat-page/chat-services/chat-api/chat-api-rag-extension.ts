import { ExtensionSimilaritySearch } from "../azure-ai-search/azure-ai-search";
import { CreateCitations, FormatCitations } from "../citation-service";

export const SearchAzureAISimilarDocuments = async (req: Request) => {
  try {
    const body = await req.json();
    const search = body.search as string;

    const vectors = req.headers.get("vectors") as string;
    const apiKey = req.headers.get("apiKey") as string;
    const searchName = req.headers.get("searchName") as string;
    const indexName = req.headers.get("indexName") as string;
    const userId = req.headers.get("authorization") as string;

    const result = await ExtensionSimilaritySearch({
      apiKey,
      searchName,
      indexName,
      vectors: vectors.split(","),
      searchText: search,
    });

    if (result.status !== "OK") {
      console.error("🔴 Retrieving documents", result.errors);
      return new Response(JSON.stringify(result));
    }

    const withoutEmbedding = FormatCitations(result.response);
    const citationResponse = await CreateCitations(withoutEmbedding, userId);

    // only get the citations that are ok
    const allCitations = [];
    for (const citation of citationResponse) {
      if (citation.status === "OK") {
        allCitations.push({
          id: citation.response.id,
          content: citation.response.content,
        });
      }
    }

    return new Response(JSON.stringify(allCitations));
  } catch (e) {
    console.error("🔴 Retrieving documents", e);
    return new Response(JSON.stringify(e));
  }
};
