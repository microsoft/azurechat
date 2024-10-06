import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { DefaultAzureCredential } from "@azure/identity";


const USE_MANAGED_IDENTITIES = process.env.USE_MANAGED_IDENTITIES === "true";

export const DocumentIntelligenceInstance = () => {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  
  if (!endpoint) {
    throw new Error(
      "Document Intelligence environment variable for the endpoint is not set"
    );
  }
  
  const credential = USE_MANAGED_IDENTITIES
    ? new DefaultAzureCredential()
    : new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY);

  if (!USE_MANAGED_IDENTITIES && !process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY) {
    throw new Error(
      "Document Intelligence environment variable for the key is not set"
    );
  }

  const client = new DocumentAnalysisClient(endpoint, credential);

  return client;
};