import { Container, CosmosClient, Database, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos";
import { createHash } from 'crypto';
import { userHashedId } from "../auth/helpers";

const AZURE_COSMOSDB_URI = process.env.AZURE_COSMOSDB_URI;
const AZURE_COSMOSDB_KEY = process.env.AZURE_COSMOSDB_KEY;
const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "localdev";
const CONTAINER_NAME = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "tenants";
const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

export type TenantRecord = {
    readonly id: string;
    readonly tenantId: string;
    primaryDomain: string | null | undefined;
    email: string | null | undefined;
    supportEmail: string | null | undefined;
    dateCreated: Date | null | undefined;
    dateUpdated: Date | null | undefined;
    dateOnBoarded: Date | null | undefined;
    dateOffBoarded: Date | null | undefined;
    modifiedBy: string | null | undefined;
    createdBy: string | null | undefined;
    departmentName: string | null | undefined;
    groups: string[] | null | undefined;
    administrators: string[] | null | undefined;
    features: string[] | null | undefined;
    serviceTier: string | null | undefined;
    history?: string[];
    requiresGroupLogin: boolean;
    [key: string]: any;
};

export class CosmosDBTenantContainer {
  private readonly client: CosmosClient;
  private readonly databaseId: string = DB_NAME;
  private readonly container: Promise<Container>;

  constructor() {
    if (!AZURE_COSMOSDB_URI || !AZURE_COSMOSDB_KEY || !DB_NAME || !CONTAINER_NAME || !defaultHeaders) {
      throw new Error("Missing required environment variables for CosmosDB connection.");
    }
    this.client = new CosmosClient({
      endpoint: AZURE_COSMOSDB_URI,
      key: AZURE_COSMOSDB_KEY,
      defaultHeaders: defaultHeaders
    });
    this.container = this.initDBContainer();
  }

  private async initDBContainer(): Promise<Container> {
    await this.createDatabaseIfNotExists();
    const database = this.client.database(this.databaseId);
    const containerResponse = await database.containers.createIfNotExists({
      id: CONTAINER_NAME,
      partitionKey: {
        paths: ["/tenantId"],
        kind: PartitionKeyKind.MultiHash,
        version: PartitionKeyDefinitionVersion.V2,
      },
    });
    return containerResponse.container;
  }

  public async createDatabaseIfNotExists(): Promise<Database> {
    const databaseResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId,
    });
    return databaseResponse.database;
  }

  public async getContainer(): Promise<Container> {
    return await this.container;
  }

  public async createTenant(tenant: TenantRecord): Promise<void> {
    try {
        if (!tenant.tenantId) {
            throw new Error("Tenant must have a tenantId to be created.");
        }

        const container = await this.container;
        const hashedTenantId = this.hashTenantId(tenant.tenantId);

        await container.items.create({
            ...tenant,
            id: hashedTenantId,
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
            createdBy: userHashedId(),
            modifiedBy: userHashedId(),
            requiresGroupLogin: tenant.requiresGroupLogin,
        });
    } catch (e) {
        console.log("Error creating tenant:", e);
        throw e;
    }
  }


  public async getTenantById(tenantId: string): Promise<TenantRecord | undefined> {
    try {
      const container = await this.getContainer();
      const query = {
        query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
        parameters: [{ name: "@tenantId", value: tenantId }],
      };
      const { resources } = await container.items.query<TenantRecord>(query).fetchAll();
      return resources[0];
    } catch (e) {
      console.log("Error retrieving Tenant by Tenant ID:", e);
      return undefined;
    }
  }

  public async updateTenant(tenant: TenantRecord): Promise<void> {
    try {
      const container = await this.getContainer();
      if (!tenant.id) {
        throw new Error("Tenant must have an id to be updated.");
      }
  
      const response = await container.item(tenant.id).read<TenantRecord>();
      const existingTenant = response.resource;
  
      if (!existingTenant) {
        console.log("Tenant not found:", tenant.id);
        throw new Error("Tenant not found.");
      }
  
      if (!existingTenant.history) {
        existingTenant.history = [];
      }
  
      const currentUser = userHashedId();
  
      const changes: string[] = [];
  
      const updateTimestamp = new Date().toISOString();
      Object.entries(tenant).forEach(([key, newValue]) => {
        const oldValue = (existingTenant)[key];
        if (newValue !== oldValue && key !== "history") {
          changes.push(`${updateTimestamp}: ${key} changed from ${oldValue} to ${newValue} by ${currentUser}`);
        }
      });
  
      const updatedHistory = [...existingTenant.history, ...changes];
  
      const updatedTenant = {
        ...existingTenant,
        ...tenant,
        history: updatedHistory,
        dateUpdated: updateTimestamp,
      };
  
      await container.items.upsert(updatedTenant);
    } catch (e) {
      console.log("Error updating tenant:", e);
      throw e;
    }
  }
  
  private hashTenantId(tenantId: string): string {
    return createHash('sha256').update(tenantId).digest('hex');
  }
}
