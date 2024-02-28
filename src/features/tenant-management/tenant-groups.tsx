import { CosmosDBTenantContainer } from './tenant-cosmos';

export class CosmosDBTenantContainerExtended extends CosmosDBTenantContainer {
  public async areGroupsPresentForTenant(tenantId: string, groupsString: string): Promise<boolean> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant || !tenant.groups) {
        return false;
      }

      const groupsToCheck = groupsString.split(',').map(group => group.trim());
      return groupsToCheck.every(group => (tenant.groups ?? []).includes(group));
    } catch (e) {
      console.log("Error checking groups for tenant:", e);
      throw e;
    }
  }
}
