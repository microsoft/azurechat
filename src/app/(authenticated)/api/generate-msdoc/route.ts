import { NextRequest, NextResponse } from "next/server";
import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { Document, Packer, Paragraph, TextRun } from "docx";
import "isomorphic-fetch";

export async function POST(req: NextRequest) {
  const { filename, content } = await req.json();

  if (!filename || !content) {
    return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
  }

  try {
    const msalConfig = {
      auth: {
        clientId: process.env.MS_GRAPH_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.MS_GRAPH_TENANT_ID}`,
        clientSecret: process.env.MS_GRAPH_CLIENT_SECRET!,
      },
    };

    const cca = new ConfidentialClientApplication(msalConfig);
    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });

    const accessToken = tokenResponse?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to acquire token" }, { status: 401 });
    }

    // Create Word document
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: filename, bold: true, size: 28 })] }),
            new Paragraph({ children: [new TextRun(content)] }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const graphClient = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    const uploadResponse = await graphClient
      .api(`/me/drive/root:/${filename}.docx:/content`)
      .put(buffer);

    return NextResponse.json({
      message: "File created in OneDrive",
      fileUrl: uploadResponse.webUrl,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}