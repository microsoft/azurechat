import { BlobServiceClient, RestError } from "@azure/storage-blob"

import { ServerActionResponse } from "@/features/common/server-action-response"

const InitBlobServiceClient = (): BlobServiceClient => {
  const acc = process.env.AZURE_STORAGE_ACCOUNT_NAME
  const key = process.env.AZURE_STORAGE_ACCOUNT_KEY

  if (!acc || !key) throw new Error("Azure Storage Account not configured correctly, check environment variables.")

  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${acc};AccountKey=${key};EndpointSuffix=core.windows.net`

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  return blobServiceClient
}

export const UploadBlob = async (
  containerName: string,
  blobName: string,
  blobData: Buffer
): Promise<ServerActionResponse<string>> => {
  const blobServiceClient = InitBlobServiceClient()

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const response = await blockBlobClient.uploadData(blobData)

  // Check for upload success
  if (response.errorCode !== undefined) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error uploading blob to storage: ${response.errorCode}`,
        },
      ],
    }
  }
  return {
    status: "OK",
    response: blockBlobClient.url,
  }
}

export const GetBlob = async (
  containerName: string,
  blobPath: string
): Promise<ServerActionResponse<ReadableStream<unknown>>> => {
  const blobServiceClient = InitBlobServiceClient()

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)

  try {
    const downloadBlockBlobResponse = await blockBlobClient.download(0)

    if (!downloadBlockBlobResponse.readableStreamBody) {
      return {
        status: "ERROR",
        errors: [
          {
            message: `Error downloading blob: ${blobPath}`,
          },
        ],
      }
    }

    return {
      status: "OK",
      response: downloadBlockBlobResponse.readableStreamBody as unknown as ReadableStream<unknown>,
    }
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
        }
      }
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Error downloading blob: ${blobPath}`,
        },
      ],
    }
  }
}
