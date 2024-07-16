import { UserDetailsForm } from "@/features/settings/user-details"
import { UserDetailsFormProps } from "@/features/settings/user-details/user-details-form"
import { UserRecord } from "@/features/user-management/models"
import { GetUserById } from "@/features/user-management/user-service"

export const dynamic = "force-dynamic"

const toUserDetailsForm = (user: UserRecord): UserDetailsFormProps => ({
  preferences: user.preferences || { contextPrompt: "" },
  name: user.name || "",
  email: user.email || "",
})

const getPersona = async (tenantId: string, personaId: string): Promise<UserDetailsFormProps> => {
  if (!tenantId || !personaId) throw new Error("TenantId and PersonaId are required")
  const result = await GetUserById(tenantId, personaId)
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  return toUserDetailsForm(result.response)
}

type Props = {
  params: {
    tenantId: string
    personaId: string
  }
}
export default async function Home({ params: { tenantId, personaId } }: Props): Promise<JSX.Element> {
  const persona = await getPersona(tenantId, personaId)
  return (
    <div>
      <UserDetailsForm preferences={persona.preferences} name={persona.name} email={persona.email} />
    </div>
  )
}
