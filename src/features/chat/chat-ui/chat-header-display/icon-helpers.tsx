import { Shield, ShieldAlert, ShieldX, Brush, Scale, CircleDot, MessageCircle, FileText } from 'lucide-react';

export const getSensitivityIcon = (value: string) => {
  switch (value) {
    case "official":
      return <Shield size={20} />;
    case "sensitive":
      return <ShieldAlert size={20} />;
    case "protected":
      return <ShieldX size={20} />;
    default:
      return null;
  }
};

export const getStyleIcon = (value: string) => {
  switch (value) {
    case "creative":
      return <Brush size={20} />;
    case "balanced":
      return <Scale size={20} />;
    case "precise":
      return <CircleDot size={20} />;
    default:
      return null;
  }
};

export const getTypeIcon = (value: string) => {
  switch (value) {
    case "simple":
      return <MessageCircle size={20} />;
    case "data":
      return <FileText size={20} />;
    default:
      return null;
  }
};

export const formatSensitivityValue = (value: string) => {
  const sensitivityMap: { [key: string]: string } = {
    "official": "Official",
    "sensitive": "Sensitive",
    "protected": "Protected",
  };
  return sensitivityMap[value] || value;
};

export const formatStyleValue = (value: string) => {
  const styleMap: { [key: string]: string } = {
    "creative": "Creative",
    "balanced": "Balanced",
    "precise": "Precise",
  };
  return styleMap[value] || value;
};

export const formatTypeValue = (value: string) => {
  const typeMap: { [key: string]: string } = {
    "simple": "General",
    "data": "File",
  };
  return typeMap[value] || value;
};