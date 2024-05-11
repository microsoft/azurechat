import { FC } from "react"

import Typography from "@/components/typography"

export const DisplayError: FC<{ errors: Array<{ message: string }> }> = props => {
  return (
    <div className="container flex max-w-4xl items-center justify-center">
      {props.errors.map((err, index) => {
        return (
          <Typography variant="p" key={index}>
            {err.message}
          </Typography>
        )
      })}
    </div>
  )
}
