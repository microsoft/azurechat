// import { notFound } from "next/navigation"
// import { getServerSession } from "next-auth"

import { TenantDetailsForm } from "@/features/settings/tenant-details.form"

export const dynamic = "force-dynamic"
export default async function Home(): Promise<JSX.Element> {
  // const session = await getServerSession()
  // console.log(session?.user.admin)
  // if (!session?.user.admin) return notFound()
  return (
    <>
      <TenantDetailsForm />
    </>
  )
}
