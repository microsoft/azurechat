import {
  Administrators,
  DepartmentName,
  DomainDetails,
  LoginManagement,
  SupportEmail,
  TenantDetailsForm,
  GroupList,
} from "@/features/settings/tenant-details"
import { TenantDetails } from "@/features/tenant-management/models"
import { GetTenantDetails } from "@/features/tenant-management/tenant-service"

const getTenantDetails = async (): Promise<TenantDetails> => {
  const result = await GetTenantDetails()
  if (result.status !== "OK") throw new Error("Failed to get tenant details")
  return result.response
}

export const dynamic = "force-dynamic"
export default async function Home(): Promise<JSX.Element> {
  const tenant = await getTenantDetails()

  return (
    <div className="mb-8 grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 sm:grid-cols-2 sm:gap-2">
      <div>
        <TenantDetailsForm tenant={tenant} />
      </div>
      <div>
        <DomainDetails domain={tenant.primaryDomain} />
        <SupportEmail email={tenant.supportEmail} />
        <DepartmentName name={tenant.departmentName} />
        <Administrators administrators={tenant.administrators} />
        <LoginManagement requiresGroupLogin={!!tenant?.requiresGroupLogin} />
        <GroupList tenantGroups={tenant.groups} />
      </div>
    </div>
  )
}
