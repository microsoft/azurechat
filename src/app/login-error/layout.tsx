import { APP_NAME } from "@/app-global"

export const metadata = {
  title: `${APP_NAME} Login Error`,
  description: `${APP_NAME} - Login Error`,
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      <div className="col-span-12 size-full">{children}</div>
    </>
  )
}
