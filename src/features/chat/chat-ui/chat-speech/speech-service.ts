"use server"

interface SpeechTokenResponse {
  error: boolean
  errorMessage: string
  token: string
  region: string
  sttUrl: string
  apimKey: string
}

export const GetSpeechToken = async (): Promise<SpeechTokenResponse> => {
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
      apimKey: "",
    }
  }

  const response = await fetch(`${process.env.AZURE_SPEECH_URL}/sts/v1.0/issueToken`, {
    method: "POST",
    headers: {
      "api-key": process.env.AZURE_SPEECH_KEY!,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return {
      error: true,
      errorMessage: response.statusText || "Error fetching token",
      token: "",
      region: process.env.AZURE_SPEECH_REGION,
      sttUrl: process.env.AZURE_SPEECH_STT_URL,
      apimKey: process.env.AZURE_SPEECH_KEY,
    }
  }

  return {
    error: false,
    errorMessage: "",
    token: await response.text(),
    region: process.env.AZURE_SPEECH_REGION,
    sttUrl: process.env.AZURE_SPEECH_STT_URL,
    apimKey: process.env.AZURE_SPEECH_KEY,
  }
}
