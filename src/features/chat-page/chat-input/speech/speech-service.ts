"use server";

export const GetSpeechToken = async () => {
  if (
    process.env.AZURE_SPEECH_REGION === undefined ||
    process.env.AZURE_SPEECH_KEY === undefined
  ) {
    return {
      error: true,
      errorMessage: "Missing Azure Speech credentials",
      token: "",
      region: "",
    };
  }

  const response = await fetch(
    `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY!,
      },
      cache: "no-store",
    }
  );

  return {
    error: response.status !== 200,
    errorMessage: response.statusText,
    token: await response.text(),
    region: process.env.AZURE_SPEECH_REGION,
  };
};
