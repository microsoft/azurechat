export const Paragraph = ({ children, className }: any) => {
  return <div className={...className}>{children}</div>;
};

export const paragraph = {
  render: "Paragraph",
};
