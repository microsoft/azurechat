import Typography from "@/components/typography"

import { UserRecord } from "@/features/models/user-models"
import { GetUsersByTenantId } from "@/features/services/user-service"
import UserList from "@/features/settings/admin/user-list"

const getUsersByTenantId = async (tenantId: string): Promise<UserRecord[]> => {
  const result = await GetUsersByTenantId(tenantId)
  if (result.status !== "OK") throw new Error("Failed to get user records")
  return result.response
}

type Props = { params: { tenantId: string } }
export default async function TenantPage({ params: { tenantId } }: Props): Promise<JSX.Element> {
  return (
    <div className="flex flex-col">
      <div>
        <Typography variant="h2" className="text-2xl font-bold tracking-tight">
          User Management
        </Typography>
        <Typography variant="h3" className="text-muted-foreground">
          Below is a list of users
        </Typography>
      </div>
      <UserList
        searchParams={{ pageSize: 10, pageNumber: 0 }}
        users={await getUsersByTenantId(tenantId)}
        tenantId={tenantId}
      />
    </div>
  )
}
