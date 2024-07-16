import {
  Administrators,
  DepartmentName,
  DomainDetails,
  GroupList,
  LoginManagement,
  SupportEmail,
  TenantDetailsForm,
} from "@/features/settings/tenant-details"
import { SmartToolsConfig } from "@/features/settings/tenant-details/smart-tools-config"
import { TenantDetails, toTenantDetails } from "@/features/tenant-management/models"
import { GetTenantById } from "@/features/tenant-management/tenant-service"

export const dynamic = "force-dynamic"

const getTenantDetails = async (tenantId: string): Promise<TenantDetails> => {
  const result = await GetTenantById(tenantId)
  if (result.status !== "OK") throw new Error("Failed to get tenant details")
  return toTenantDetails(result.response)
}

type Props = { params: { tenantId: string } }
export default async function Home({ params: { tenantId } }: Props): Promise<JSX.Element> {
  const tenant = await getTenantDetails(tenantId)

  return (
    <>
      <div>
        <TenantDetailsForm tenant={tenant} />
        <SmartToolsConfig tools={tenant.smartTools} tenantId={tenantId} />
      </div>
      <div>
        <DomainDetails domain={tenant.primaryDomain} />
        <SupportEmail email={tenant.supportEmail} />
        <DepartmentName name={tenant.departmentName} />
        <Administrators administrators={tenant.administrators} tenantId={tenantId} />
        <LoginManagement requiresGroupLogin={!!tenant?.requiresGroupLogin} tenantId={tenantId} />
        {tenant.requiresGroupLogin && <GroupList tenantGroups={tenant.groups} tenantId={tenantId} />}
      </div>
    </>
  )
}
