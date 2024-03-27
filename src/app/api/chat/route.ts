import { ChatAPIEntry } from "@/features/chat/chat-services/chat-api-entry"

const delay = async (ms: number | undefined): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

const errorMessages: { [key: number]: string } = {
  400: "Oops! Something went wrong with your request.",
  401: "Access denied. Please ensure your credentials are correct.",
  402: "Whoops, looks like you've exceeded your limit! Please try again later.",
  403: "Sorry, we're unable to fulfill your request.",
  429: "Hold on! Too many requests at the moment, please try again after a while.",
}
const defaultErrorMessage = "Our apologies, we're facing some internal issues currently."

export async function POST(req: Request): Promise<Response> {
  const body = await req.json()

  const maxRetries = 2
  const retryDelay = 5000
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ChatAPIEntry(body)
      return response
    } catch (error: unknown) {
      const errorStatus = (error as { status: number })?.status

      if (errorStatus && errorMessages[errorStatus])
        return new Response(errorMessages[errorStatus] || defaultErrorMessage, { status: errorStatus || 500 })

      if (attempt < maxRetries && errorStatus === 504) await delay(retryDelay)
      else return new Response(errorMessages[errorStatus] || defaultErrorMessage, { status: errorStatus || 500 })
    }
  }
  return new Response("We're sorry, the server timed-out after several retries.", { status: 504 })
}
