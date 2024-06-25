import { UserDetailsForm } from "@/features/settings/user-details"
import { UserRecord } from "@/features/user-management/models"
import { GetUserById } from "@/features/user-management/user-service"

export const dynamic = "force-dynamic"

const getPersona = async (tenantId: string, personaId: string): Promise<UserRecord> => {
  if (!tenantId || !personaId) throw new Error("TenantId and PersonaId are required")
  const result = await GetUserById(tenantId, personaId)
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  return result.response
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
      <UserDetailsForm
        preferences={persona.preferences || { contextPrompt: "" }}
        name={persona.name || ""}
        email={persona.email || ""}
      />
    </div>
  )
}
