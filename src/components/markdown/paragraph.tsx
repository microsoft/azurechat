export const Paragraph = ({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element => {
  const combinedClassName = `size-full bg-altbackground ${className || ""}`

  return <div className={combinedClassName}>{children}</div>
}

export const paragraph = {
  render: "Paragraph",
}
