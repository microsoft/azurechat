import { TenantDetails } from "@/features/models/tenant-models"
import { GetTenantDetails } from "@/features/services/tenant-service"
import {
  Administrators,
  DepartmentName,
  DomainDetails,
  LoginManagement,
  SupportEmail,
  TenantDetailsForm,
  GroupList,
} from "@/features/settings/tenant-details"

const getTenantDetails = async (): Promise<TenantDetails> => {
  const result = await GetTenantDetails()
  if (result.status !== "OK") throw new Error("Failed to get tenant details")
  return result.response
}

export const dynamic = "force-dynamic"
export default async function Home(): Promise<JSX.Element> {
  const tenant = await getTenantDetails()

  return (
    <>
      <div>
        <TenantDetailsForm tenant={tenant} />
      </div>
      <div>
        <DomainDetails domain={tenant.primaryDomain} />
        <SupportEmail email={tenant.supportEmail} />
        <DepartmentName name={tenant.departmentName} />
        <Administrators administrators={tenant.administrators} tenantId={tenant.id} />
        <LoginManagement requiresGroupLogin={!!tenant?.requiresGroupLogin} tenantId={tenant.id} />
        <GroupList tenantGroups={tenant.groups} tenantId={tenant.id} />
      </div>
    </>
  )
}
