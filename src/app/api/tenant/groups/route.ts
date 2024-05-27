// import { Client } from "@microsoft/microsoft-graph-client"
import { NextRequest, NextResponse } from "next/server"
// import { getToken, JWT } from "next-auth/jwt"
import * as yup from "yup"

const groupValidationSchema = yup
  .object({
    groupGuids: yup.array().of(yup.string().required()).required(),
  })
  .noUnknown(true, "Attempted to validate invalid fields")

const _getNewAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch("https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        scope: "https://graph.microsoft.com/.default",
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error_description || "Failed to fetch new access token")
    }

    return data.access_token
  } catch (error) {
    console.error("Error fetching new access token:", error)
    return null
  }
}

// Temporarily commented out the accessToken retrieval logic
// const getAccessTokenFromJWT = async (req: NextRequest): Promise<string | null> => {
//   const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as JWT | null;
//   console.log("JWT Token:", token); // Debug statement
//   if (!token) {
//     console.error("No token found");
//     return null;
//   }

//   // Temporarily skip validation if the JWT is not expired
//   if (token.exp && Date.now() < token.exp * 1000) {
//     return token.accessToken as string; // Assuming token contains accessToken
//   }

//   const refreshToken = token.refreshToken as string | null;
//   if (!refreshToken) {
//     console.error("No refresh token found in JWT");
//     return null;
//   }

//   const accessToken = await getNewAccessToken(refreshToken);
//   return accessToken;
// };

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await req.json()
    // Temporarily skipped accessToken retrieval
    // const accessToken = await getAccessTokenFromJWT(req);

    // if (!accessToken) {
    //   console.error("Unauthorized: No access token available");
    //   return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    // }

    const validatedData = await groupValidationSchema.validate(requestBody, {
      abortEarly: false,
      stripUnknown: true,
    })

    // Temporarily bypassing actual group fetching
    // const client = Client.init({
    //   authProvider: done => {
    //     done(null, accessToken);
    //   },
    // });

    const { groupGuids } = validatedData

    try {
      const groupDetails = await Promise.all(
        groupGuids.map(async guid => {
          // Temporarily returning hardcoded response
          return {
            guid,
            name: `Group ${guid}`,
            isValid: true,
          }
        })
      )

      const response = groupDetails.map(group => ({
        guid: group.guid,
        name: group.name,
        isValid: group.isValid,
      }))

      return new NextResponse(JSON.stringify(response), { status: 200 })
    } catch (error: unknown) {
      console.error("Error validating groups:", error)
      return new NextResponse(JSON.stringify({ error: "Error validating groups", details: (error as Error).message }), {
        status: 500,
      })
    }
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    console.error("Validation or Internal Server Error:", errorMessage)
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
