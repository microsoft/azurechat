import { FC } from "react";

export const DisplayError: FC<{ errors: Array<{ message: string }> }> = (
  props
) => {
  return (
    <div className="container max-w-4xl flex items-center justify-center">
      {props.errors.map((err, index) => {
        return <p key={index}>{err.message}</p>;
      })}
    </div>
  );
};
