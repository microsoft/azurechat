export const Paragraph = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const combinedClassName = `bg-altbackground ${className || ''}`;

  return <div className={combinedClassName}>{children}</div>;
};

export const paragraph = {
  render: "Paragraph",
};
