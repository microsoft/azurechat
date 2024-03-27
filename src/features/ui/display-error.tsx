import { FC } from "react"

export const DisplayError: FC<{ errors: Array<{ message: string }> }> = props => {
  return (
    <div className="container flex max-w-4xl items-center justify-center">
      {props.errors.map((err, index) => {
        return <p key={index}>{err.message}</p>
      })}
    </div>
  )
}
