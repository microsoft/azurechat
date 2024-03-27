import {
  Shield,
  ShieldAlert,
  ShieldX,
  Brush,
  Scale,
  CircleDot,
  MessageCircle,
  FileText,
  AudioLines,
} from "lucide-react"

export const getSensitivityIcon = (value: string): JSX.Element | null => {
  switch (value) {
    case "official":
      return <Shield size={20} aria-label="Official" />
    case "sensitive":
      return <ShieldAlert size={20} aria-label="Sensitive" />
    case "protected":
      return <ShieldX size={20} aria-label="Protected" />
    default:
      return null
  }
}

export const getStyleIcon = (value: string): JSX.Element | null => {
  switch (value) {
    case "creative":
      return <Brush size={20} aria-label="Creative" />
    case "balanced":
      return <Scale size={20} aria-label="Balanced" />
    case "precise":
      return <CircleDot size={20} aria-label="Precise" />
    default:
      return null
  }
}

export const getTypeIcon = (value: string): JSX.Element | null => {
  switch (value) {
    case "simple":
      return <MessageCircle size={20} aria-label="General" />
    case "data":
      return <FileText size={20} aria-label="File" />
    case "audio":
      return <AudioLines size={20} aria-label="Audio" />
    default:
      return null
  }
}

export const formatSensitivityValue = (value: string): string => {
  const sensitivityMap: { [key: string]: string } = {
    official: "Official",
    sensitive: "Sensitive",
    protected: "Protected",
  }
  return sensitivityMap[value] || value
}

export const formatStyleValue = (value: string): string => {
  const styleMap: { [key: string]: string } = {
    creative: "Creative",
    balanced: "Balanced",
    precise: "Precise",
  }
  return styleMap[value] || value
}

export const formatTypeValue = (value: string): string => {
  const typeMap: { [key: string]: string } = {
    simple: "General",
    data: "Data",
    audio: "Audio",
  }
  return typeMap[value] || value
}
