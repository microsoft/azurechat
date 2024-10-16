import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

export const DocumentIntelligenceInstance = () => {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "One or more Document Intelligence environment variables are not set"
    );
  }

  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  return client;
};
