import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx"
import { saveAs } from "file-saver"

import { showError, showSuccess } from "@/features/globals/global-message-store"
import { UserRecord } from "@/features/user-management/models"

export const convertUserListToWordDocument = async (users: UserRecord[], fileName: string): Promise<void> => {
  try {
    const tableRows = users.map(
      user =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(user.name || "Uknown")],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(user.email || "Uknown")],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(user.last_login ? new Date(user.last_login).toLocaleString("en-AU") : "-")],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(user.last_failed_login ? new Date(user.last_failed_login).toLocaleString("en-AU") : "-"),
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(user.failed_login_attempts.toString())],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    )

    const doc = new Document({
      sections: [
        {
          children: [
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Name")],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph("Email")],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph("Last Login")],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph("Last Failed Login")],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph("Failed Login Count")],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                ...tableRows,
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, fileName)
    showSuccess({
      title: "Success",
      description: "User list exported to Word document",
    })
  } catch (error) {
    showError("Failed to export user list to Word document: " + error)
  }
}
