import { Container, CosmosClient, Database, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos";
import { hashValue } from "../auth/helpers";

const AZURE_COSMOSDB_URI = process.env.AZURE_COSMOSDB_URI;
const AZURE_COSMOSDB_KEY = process.env.AZURE_COSMOSDB_KEY;
const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "localdev";
const CONTAINER_NAME = process.env.AZURE_COSMOSDB_USERS_CONTAINER_NAME || "users";
const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

export type UserIdentity = {
  id: string;
  userId: string;
  tenantId: string;
  email: string | null | undefined;
  name: string | null | undefined;
  upn: string;
  qchatAdmin: boolean;
};

export type UserActivity = {
  last_login: Date | null | undefined;
  first_login: Date | null | undefined;
  accepted_terms: boolean | null | undefined;
  accepted_terms_date: string | null | undefined;
  history?: string[];
    [key: string]: any;
  groups?: string[] | null | undefined;
  failed_login_attempts: number;
  last_failed_login: Date | null;
};

export type UserRecord = UserIdentity & UserActivity;

export class CosmosDBUserContainer {
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
        const database = this.client.database(this.databaseId);
        const partitionKey = {
            paths: ["/tenantId", "/userId"],
            kind: PartitionKeyKind.MultiHash,
            version: PartitionKeyDefinitionVersion.V2,
        };
        const containerResponse = await database.containers.createIfNotExists({
            id: CONTAINER_NAME,
            partitionKey: {
                paths: ["/tenantId", "/userId"],
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

    public async createUser(user: UserRecord): Promise<void> {
        user.failed_login_attempts = 0;
        user.last_failed_login = null;

        const container = await this.getContainer();
        const hashedUserId = hashValue(user.upn);
        const creationDate = new Date().toISOString();
        const historyLog = `${creationDate}: User created by ${hashedUserId}`;

        await container.items.create({
            ...user,
            id: hashedUserId,
            history: [historyLog],
        });
    }

    public async recordFailedLogin(tenantId: string, upn: string): Promise<void> {
      const container = await this.getContainer();
      const query = {
          query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.upn = @upn",
          parameters: [
              { name: "@tenantId", value: tenantId },
              { name: "@upn", value: upn }
          ],
      };
      const { resources } = await container.items.query<UserRecord>(query).fetchAll();
      let user = resources[0];
  
      if (!user) {
          user = {
              id: hashValue(upn),
              userId: upn,
              tenantId: tenantId,
              email: null,
              name: null,
              upn: upn,
              last_login: null,
              first_login: null,
              accepted_terms: null,
              accepted_terms_date: null,
              failed_login_attempts: 1,
              last_failed_login: new Date(),
              qchatAdmin: false,
              history: [`Failed login attempt recorded on ${new Date().toISOString()}`],
          };
  
          await container.items.create(user);
      } else {
          const historyUpdate = `Failed login attempt recorded on ${new Date().toISOString()}`;
          user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
          user.last_failed_login = new Date();
          user.history = user.history ? [...user.history, historyUpdate] : [historyUpdate];
  
          await container.items.upsert(user);
      }
  }
  
    public async getUserByUPN(tenantId: string, upn: string): Promise<UserRecord | undefined> {
        try {
            const container = await this.getContainer();
            const query = {
                query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.upn = @upn",
                parameters: [
                    { name: "@tenantId", value: tenantId },
                    { name: "@upn", value: upn }
                ],
            };
            const { resources } = await container.items.query<UserRecord>(query).fetchAll();
            return resources[0];
        } catch (e) {
            console.log("Error retrieving user by UPN:", e);
            return undefined;
        }
    };

    public async updateUser(user: UserRecord, tenantId: string, userId: string): Promise<void> {
        
        const keyUserId = user.userId;
        const keyTenantId = user.tenantId;
        const partitionKey = {paths:["/" + keyTenantId,"/" + keyUserId],
            kind: PartitionKeyKind.MultiHash,
            version: PartitionKeyDefinitionVersion.V2,
        };
    
        const container = await this.getContainer();
        if (!tenantId || tenantId.trim() === "") {
            throw new Error("tenantId is required to update a user.");
        }
    
        if (!userId) {
            throw new Error("User must have an id to be updated.");
        }
    
        // const { resource: existingUser } = await container.item(user.id, partitionKey as any).read<UserRecord>();
        // if (!existingUser) {
        //     throw new Error("User not found.");
        // }

        const updatedUser = user as UserRecord;
    
        const updateTimestamp = new Date().toISOString();
        const currentUser = hashValue(user.upn);
        const changes: string[] = updatedUser.history || [];
    
        Object.keys(user).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(updatedUser, key)) {
                if (user[key] !== updatedUser[key] && key !== 'history') {
                    changes.push(`${updateTimestamp}: ${key} changed from ${updatedUser[key]} to ${user[key]} by ${currentUser}`);
                }
            }
        });
    
        updatedUser.history = changes;
        updatedUser.last_login = new Date(updateTimestamp);
    
        await container.items.upsert(updatedUser);
    };
    
};
