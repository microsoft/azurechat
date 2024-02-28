"use server";

export const GetSpeechToken = async () => {
  if (
    process.env.AZURE_SPEECH_REGION === undefined ||
    process.env.AZURE_SPEECH_KEY === undefined ||
    process.env.AZURE_SPEECH_STT_URL === undefined
  ) {
    return {
      error: true,
      errorMessage: "Missing Azure Speech credentials",
      token: "",
      region: "",
      sttUrl: "",
      apimKey: ""
    };
  }

  const response = await fetch(
    `${process.env.AZURE_SPEECH_URL}/sts/v1.0/issueToken`,
    {
      method: "POST",
      headers: {
        "api-key": process.env.AZURE_SPEECH_KEY!,
      },
      cache: "no-store",
    }
  );

  return {
    error: response.status !== 200,
    errorMessage: response.statusText,
    token: await response.text(),
    region: process.env.AZURE_SPEECH_REGION,
    sttUrl: process.env.AZURE_SPEECH_STT_URL,
    apimKey: process.env.AZURE_SPEECH_KEY
  };
};
