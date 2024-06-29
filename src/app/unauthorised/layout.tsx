import { APP_NAME } from "@/app-global"

export const metadata = {
  title: `${APP_NAME} Unauthorised`,
  description: `${APP_NAME} - Unauthorised`,
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="col-span-12 size-full">{children}</div>
    </>
  )
}
