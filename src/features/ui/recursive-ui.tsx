import React, { FC } from "react";

interface Prop {
  documentField: any;
}

export const RecursiveUI: FC<Prop> = (props) => {
  const { documentField } = props;
  let node: React.ReactNode = null;

  if (
    typeof documentField === "string" ||
    typeof documentField === "number" ||
    typeof documentField === "boolean" ||
    typeof documentField === "bigint" ||
    typeof documentField === "symbol" ||
    typeof documentField === "undefined" ||
    typeof documentField === "function"
  ) {
    node = <div className="flex gap-1 flex-col">{documentField}</div>;
  }

  return (
    <div className="border border-foreground/5 rounded p-3 overflow-x-auto gap-3 flex flex-col text-sm">
      {node
        ? node
        : Object.entries(props.documentField).map(([key, value], index) => {
            if (typeof value === "object" && value !== null) {
              return (
                <div key={index} className="flex gap-1 flex-col">
                  <span className="text-muted-foreground">{key}</span>{" "}
                  <RecursiveUI documentField={value} />
                </div>
              );
            } else {
              return (
                <div key={index} className="">
                  <span className="text-muted-foreground">{key}:</span>{" "}
                  {value as React.ReactNode}{" "}
                </div>
              );
            }
          })}
    </div>
  );
};
