import { writeFileSync } from "fs"
import * as path from "path"

import { Project } from "ts-morph"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const modelsDirectoriesPatterns = [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./features/**/*.{ts,tsx}",
  "./lib/**/*.{ts,tsx}",
  "./types/**/*.{ts,tsx}",
]

const sourceFiles = modelsDirectoriesPatterns.flatMap(pattern => project.getSourceFiles(pattern))

interface EnumMember {
  name: string
  value: string | number
}

interface ModelInfo {
  filePath: string
  fileName: string
  interfaces: { name: string; properties: string[] }[]
  classes: { name: string; properties: string[] }[]
  types: { name: string; definition: string }[]
  enums: { name: string; members: EnumMember[] }[]
}

const simplifyType = (typeText: string): string => {
  return typeText.replace(/import\(".*"\)\./, "")
}

const extractModelInformation = (): ModelInfo[] => {
  return sourceFiles.map(sourceFile => {
    const filePath = sourceFile.getFilePath()
    const fileName = sourceFile.getBaseNameWithoutExtension()
    const interfaces = sourceFile.getInterfaces().map(i => ({
      name: i.getName(),
      properties: i.getProperties().map(p => `${p.getName()}: ${simplifyType(p.getType().getText())}`),
    }))
    const classes = sourceFile.getClasses().map(c => ({
      name: c.getName() || "UnnamedClass",
      properties: c.getProperties().map(p => `${p.getName()}: ${simplifyType(p.getType().getText())}`),
    }))
    const types = sourceFile.getTypeAliases().map(t => ({
      name: t.getName(),
      definition: simplifyType(t.getType().getText()),
    }))
    const enums = sourceFile.getEnums().map(e => ({
      name: e.getName(),
      members: e.getMembers().map(m => ({
        name: m.getName(),
        value: m.getValue() || "",
      })),
    }))

    return { filePath, fileName, interfaces, classes, types, enums }
  })
}

const generateMarkdownReport = (modelsInfo: ModelInfo[]): void => {
  modelsInfo.sort((a, b) => {
    const fileNameComparison = a.fileName.localeCompare(b.fileName)
    if (fileNameComparison !== 0) return fileNameComparison
    return a.filePath.localeCompare(b.filePath)
  })

  let markdownContent = "# Model and Type Information\n\n"

  modelsInfo.forEach(({ filePath, fileName, interfaces, classes, types, enums }) => {
    if (interfaces.length || classes.length || types.length || enums.length) {
      const relativeFilePath = path.relative(process.cwd(), filePath)
      markdownContent += `## ${fileName} (${relativeFilePath})\n\n`

      interfaces.forEach(({ name, properties }) => {
        markdownContent += `### Interface: ${name}\n`
        properties.forEach(property => (markdownContent += `- ${property}\n`))
        markdownContent += "\n"
      })

      classes.forEach(({ name, properties }) => {
        markdownContent += `### Class: ${name}\n`
        properties.forEach(property => (markdownContent += `- ${property}\n`))
        markdownContent += "\n"
      })

      types.forEach(({ name, definition }) => {
        markdownContent += `### Type: ${name}\n- ${definition}\n\n`
      })

      enums.forEach(({ name, members }) => {
        markdownContent += `### Enum: ${name}\n`
        members.forEach(member => {
          markdownContent += `- ${member.name} = ${member.value}\n`
        })
        markdownContent += "\n"
      })
    }
  })

  writeFileSync("./model-report.md", markdownContent, "utf8")
}

const run = (): void => {
  const modelsInfo = extractModelInformation().filter(
    ({ interfaces, classes, types, enums }) => interfaces.length || classes.length || types.length || enums.length
  )
  generateMarkdownReport(modelsInfo)
}

run()
