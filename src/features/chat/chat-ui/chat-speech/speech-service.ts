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
    process.env.REGION_NAME === undefined ||
    process.env.APIM_KEY === undefined ||
    process.env.APIM_BASE_WSS === undefined ||
    process.env.APIM_BASE === undefined
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

  const response = await fetch(`${process.env.APIM_BASE}/sts/v1.0/issueToken`, {
    method: "POST",
    headers: {
      "api-key": process.env.APIM_KEY!,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return {
      error: true,
      errorMessage: response.statusText || "Error fetching token",
      token: "",
      region: process.env.REGION_NAME,
      sttUrl: process.env.APIM_BASE_WSS,
      apimKey: process.env.APIM_KEY,
    }
  }

  return {
    error: false,
    errorMessage: "",
    token: await response.text(),
    region: process.env.REGION_NAME,
    sttUrl: process.env.APIM_BASE_WSS,
    apimKey: process.env.APIM_KEY,
  }
}
