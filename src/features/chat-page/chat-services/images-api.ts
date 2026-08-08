import {
  GetImageFromStore,
  GetThreadAndImageFromUrl,
} from "./chat-image-service";

export const ImageAPIEntry = async (request: Request): Promise<Response> => {
  const urlPath = request.url;

  const response = GetThreadAndImageFromUrl(urlPath);

  if (response.status !== "OK") {
    return new Response(response.errors[0].message, { status: 404 });
  }

  const { threadId, imgName } = response.response;
  const imageData = await GetImageFromStore(threadId, imgName);

  if (imageData.status === "OK") {
    return new Response(imageData.response, {
      headers: { "content-type": "image/png" },
    });
  } else {
    return new Response(imageData.errors[0].message, { status: 404 });
  }
};
