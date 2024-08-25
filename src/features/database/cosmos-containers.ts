import { PartitionKeyKind, PartitionKeyDefinitionVersion, Container } from "@azure/cosmos"

import { containerFactory } from "./cosmos"

const HistoryContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_CHAT_CONTAINER_NAME || "history"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const UserContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "users"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const TenantContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "tenants"
  const partitionKey = {
    paths: ["/tenantId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const SmartGenContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_SMART_GEN_CONTAINER_NAME || "smart-gen"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const ApplicationContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_APPLICATION_CONTAINER_NAME || "applications"
  const partitionKey = {
    paths: ["/applicationId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const ActivityLogsContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_ACTIVITY_LOGS_CONTAINER_NAME || "activity-logs"
  const partitionKey = {
    paths: ["/entityType"],
    kind: PartitionKeyKind.Hash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const SmartToolContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_SMART_TOOLS_CONTAINER_NAME || "smart-tools"
  const partitionKey = {
    paths: ["/smartToolId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const FeatureContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_FEATURE_CONTAINER_NAME || "features"
  const partitionKey = {
    paths: ["/featureId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

const IndexContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_INDEX_CONTAINER_NAME || "indexes"
  const partitionKey = {
    paths: ["/indexId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

export {
  HistoryContainer,
  UserContainer,
  TenantContainer,
  SmartGenContainer,
  ApplicationContainer,
  ActivityLogsContainer,
  SmartToolContainer,
  FeatureContainer,
  IndexContainer,
}
