import { BlobServiceClient, RestError } from "@azure/storage-blob";
import { ServerActionResponse } from "../server-action-response";

// initialize the blobServiceClient
const InitBlobServiceClient = () => {
  const acc = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!acc || !key)
    throw new Error(
      "Azure Storage Account not configured correctly, check environment variables."
    );

  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${acc};AccountKey=${key};EndpointSuffix=core.windows.net`;

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient;
};

export const UploadBlob = async (
  containerName: string,
  blobName: string,
  blobData: Buffer
): Promise<ServerActionResponse<string>> => {
  const blobServiceClient = InitBlobServiceClient();

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try{
    
  const response = await blockBlobClient.uploadData(blobData);

  // Check for upload success
  if (response.errorCode !== undefined) {
    console.error(response);
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error uploading blob to storage: ${response.errorCode}`,
        },
      ],
    };
  }

  console.log("Upload of generated image was successfull");

  return {
    status: "OK",
    response: blockBlobClient.url,
  };
  
  } catch (error){
    console.error(error);
    throw error;
  }
};

export const GetBlob = async (
  containerName: string,
  blobPath: string
): Promise<ServerActionResponse<ReadableStream<any>>> => {
  const blobServiceClient = InitBlobServiceClient();

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  try {
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    // Passes stream to caller to decide what to do with
    if (!downloadBlockBlobResponse.readableStreamBody) {
      return {
        status: "ERROR",
        errors: [
          {
            message: `Error downloading blob: ${blobPath}`,
          },
        ],
      };
    }

    return {
      status: "OK",
      response:
        downloadBlockBlobResponse.readableStreamBody as unknown as ReadableStream<any>,
    };
  } catch (error) {
    if (error instanceof RestError) {
      if (error.statusCode === 404) {
        return {
          status: "NOT_FOUND",
          errors: [
            {
              message: `Blob not found: ${blobPath}`,
            },
          ],
        };
      }
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Error downloading blob: ${blobPath}`,
        },
      ],
    };
  }
};
