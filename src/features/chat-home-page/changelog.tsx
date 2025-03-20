"use client"
import type React from "react"

import { useEffect, useState } from "react"
import { getChangelog } from "@/features/common/services/changelog"
import { Badge } from "@/features/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/features/ui/card"
import { PlusCircle, WrenchIcon, RefreshCw, Trash2 } from "lucide-react"
import Loading from "@/app/(authenticated)/chat/loading"

type ChangelogEntry = {
  version: string
  date: string
  changes: {
    type: "Fixed" | "Added" | "Changed" | "Removed"
    description: string
  }[]
}

export function Changelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChangelog() {
      try {
        setLoading(true)
        const content = await getChangelog()
        const parsedEntries = parseChangelog(content)
        setEntries(parsedEntries)
        setError(null)
      } catch (err) {
        setError("Failed to load changelog. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadChangelog()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <div className="text-red-500 w-full flex justify-center">{error}</div>
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <Card key={index} className={`overflow-hidden border-l-4 ${getVersionColor(entry.version, index === 0)}`}>
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center justify-between">
              <span>{entry.version}</span>
              {entry.date && <span className="text-sm font-normal text-muted-foreground">{entry.date}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {entry.changes.map((change, changeIndex) => (
                <li key={changeIndex} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className={`flex items-center justify-center min-w-20 px-2.5 ${getBadgeVariant(change.type).className || ""}`}
                  >
                    {getBadgeVariant(change.type).icon}
                    <p>{change.type}</p>
                  </Badge>
                  <span>{change.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getBadgeVariant(type: string): {
  variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning"
  icon: React.ReactNode
  className?: string
} {
  switch (type) {
    case "Added":
      return {
        variant: "outline",
        icon: <PlusCircle className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />,
        className:
          "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
      }
    case "Fixed":
      return {
        variant: "outline",
        icon: <WrenchIcon className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />,
        className:
          "border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30",
      }
    case "Changed":
      return {
        variant: "outline",
        icon: <RefreshCw className="h-3.5 w-3.5 mr-1 text-amber-600 dark:text-amber-400" />,
        className:
          "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30",
      }
    case "Removed":
      return {
        variant: "outline",
        icon: <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-600 dark:text-rose-400" />,
        className:
          "border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30",
      }
    default:
      return {
        variant: "outline",
        icon: null,
      }
  }
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  const lines = content.split("\n")

  let currentEntry: ChangelogEntry | null = null

  for (const line of lines) {
    const versionMatch = line.match(/\[(v\d+\.\d+\.\d+|Unreleased)\]\s*–?\s*(.+)?/)

    if (versionMatch) {
      if (currentEntry && currentEntry.changes.length > 0) {
        entries.push(currentEntry)
      }

      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2] || "",
        changes: [],
      }
    } else if (currentEntry) {
      const changeMatch = line.match(/\s*(Added|Fixed|Changed|Removed):\s*(.*)/)

      if (changeMatch) {
        currentEntry.changes.push({
          type: changeMatch[1] as "Added" | "Fixed" | "Changed" | "Removed",
          description: changeMatch[2].trim(),
        })
      }
    }
  }

  if (currentEntry && currentEntry.changes.length > 0) {
    entries.push(currentEntry)
  }

  return entries
}

function getVersionColor(version: string, isNewest = false): string {
  if (isNewest) {
    return "border-l-primary dark:border-l-primary"
  }

  // Extract the minor number
  const match = version.match(/v\d+\.(\d+)\.\d+/)
  const middleNumber = match ? Number.parseInt(match[1]) : null

  if (version === "Unreleased") {
    return "border-l-gray-400 dark:border-l-gray-600"
  } else if (middleNumber !== null) {
    switch (middleNumber % 4) {
      case 0:
        return "border-l-blue-400 dark:border-l-blue-600"
      case 1:
        return "border-l-purple-400 dark:border-l-purple-600"
      case 2:
        return "border-l-teal-400 dark:border-l-teal-600"
      case 3:
        return "border-l-orange-400 dark:border-l-orange-600"
      default:
        return "border-l-gray-400 dark:border-l-gray-600"
    }
  }
  return "border-l-gray-400 dark:border-l-gray-600"
}