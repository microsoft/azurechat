"use client"
import { FC } from "react"

import Typography from "@/components/typography"

import { CitationSlider } from "./citation-slider"

interface Citation {
  name: string
  id: string
  tenantId: string
  userId: string
  chatThreadId: string
  order: number
}

interface Props {
  items: Citation[]
}

export const citation = {
  render: "Citation",
  selfClosing: true,
  attributes: {
    items: {
      type: Array,
    },
  },
}

export const Citation: FC<Props> = (props: Props) => {
  const citations = props.items.reduce(
    (acc, citation) => {
      const { name } = citation
      if (!acc[name]) {
        acc[name] = []
      }
      acc[name].push(citation)
      return acc
    },
    {} as Record<string, Citation[]>
  )

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-md bg-altBackgroundShade p-4">
      {Object.entries(citations).map(([name, items], index: number) => {
        return (
          <div key={index} className="grid grid-cols-3 items-center gap-2">
            <Typography variant="span" className="font-semibold">
              {name}
            </Typography>
            <div className="col-span-2 flex gap-2">
              {items.map((item, index: number) => {
                return (
                  <div key={index}>
                    <CitationSlider
                      index={index + 1}
                      name={item.name}
                      id={item.id}
                      tenantId={item.tenantId}
                      userId={item.userId}
                      order={item.order}
                      chatThreadId={item.chatThreadId}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
