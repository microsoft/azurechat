export const APP_VERSION = "2.0.0"
export const APP_NAME = "QChat"
export const AGENCY_NAME = "Queensland Government"
export const signInProvider = "azure-ad"
export const SUPPORT_EMAIL = "help@ai.qld.gov.au"
export const STATUS_ERROR = "ERROR"
export const STATUS_UNAUTHORIZED = "UNAUTHORIZED"
export const STATUS_NOT_FOUND = "NOT_FOUND"
export const STATUS_OK = "OK"
export const SUPPORT_EMAIL_PREFIX = "support@"
export const CONTEXT_PROMPT_DEFAULT = ""
export const INTRANET_NAME = "ForGov"
export const APP_URL = process.env.NEXTAUTH_URL || "https://qchat.ai.qld.gov.au"
export const APP_VANITY_URL = APP_URL.replace(/^https?:\/\//, "")
export const INTRANET_URL =
  "https://www.forgov.qld.gov.au/information-and-communication-technology/qchat/qchat-assistant"

export const APP_DESCRIPTION = `${APP_NAME} is a chatbot for the ${AGENCY_NAME}`
export const AI_TAGLINE = `The ${AGENCY_NAME} AI Assistant`
export const AI_AUTHOR = `${AGENCY_NAME} AI Unit`

export const errorMessages = {
  NotAuthorised: `Your agency may not yet be using ${APP_NAME}. If they are, it appears as if you are not in one of the permitted groups. Please contact your agency IT support team to request additional details or how to gain access.`,
  SignInFailed: `It appears we ran into an error while logging you in to ${APP_NAME}. If you believe your agency has been set up and you continue to receive these errors, please contact our support team.`,
  UnknownError: `An unknown error occurred while logging you in to ${APP_NAME}. Please contact support if the issue persists.`,
}
