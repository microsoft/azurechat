import { Container } from "@azure/cosmos"

import { containerFactory } from "@/features/database/cosmos"
import {
  ApplicationContainer,
  HistoryContainer,
  SmartGenContainer,
  TenantContainer,
  UserContainer,
} from "@/features/database/cosmos-containers"

const { CosmosClient } = require("@azure/cosmos")

const cosmos = require("@/features/database/cosmos")
const cosmosAuth = require("@/features/database/cosmos-auth")

jest.mock("@azure/cosmos", () => ({
  CosmosClient: jest.fn(),
  PartitionKeyKind: jest.requireActual("@azure/cosmos").PartitionKeyKind,
  PartitionKeyDefinitionVersion: jest.requireActual("@azure/cosmos").PartitionKeyDefinitionVersion,
}))

describe("containerFactory", () => {
  // Mock the fetch function
  global.fetch = jest.fn()
  const containerCache: Map<string, Container> = new Map()

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks()
    containerCache.clear()
  })

  it("should return a container", async () => {
    // Arrange
    const dummyConfig = { endpoint: "https://dummy.com", key: "dummyKey", dbName: "dummyDb" }
    const expectedNumberOfCalls = 1
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))

    // Act
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(CosmosClient).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should return cached container", async () => {
    // Arrange
    const dummyConfig = { endpoint: "https://dummy.com", key: "dummyKey", dbName: "dummyDb" }
    const expectedNumberOfCalls = 0
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))
    const createCosmosClientMock = jest.spyOn(cosmosAuth, "createCosmosClient")

    // Act
    containerCache.set(containerMock.id, containerMock as unknown as Container)
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig, containerCache)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(createCosmosClientMock).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should return new container instance when not cached", async () => {
    // Arrange
    const dummyConfig = { endpoint: "https://dummy.com", dbName: "dummyDb" }
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    const expectedNumberOfCalls = 1
    const createCosmosClientMock = jest.spyOn(cosmosAuth, "createCosmosClient")

    // Act
    containerCache.delete(containerMock.id)
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig, containerCache)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(createCosmosClientMock).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should throw an error if Cosmos DB is not configured", async () => {
    // Arrange
    const dummyConfig = { endpoint: "", key: "", dbName: "" }
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))

    // Act
    const actual = containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig)

    // Assert
    await expect(actual).rejects.toThrow("Azure Cosmos DB is not configured")
  })
})

describe("Containers", () => {
  it("should call containerFactory on Container creation", async () => {
    // Arrange
    const containers = [HistoryContainer, UserContainer, TenantContainer, SmartGenContainer, ApplicationContainer]
    const expectedNumberOfCalls = containers.length
    const containerFactoryMock = jest.spyOn(cosmos, "containerFactory")
    containerFactoryMock.mockResolvedValue(expect.anything())

    // Function to call each container
    const callContainer = async (container: () => Promise<Container>): Promise<Container> => {
      return await container()
    }

    // Act
    await Promise.all(containers.map(callContainer))

    // Assert
    expect(containerFactoryMock).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })
})

// #region Helpers
const mockCosmosClient = (
  result: Container
): {
  databases: {
    createIfNotExists: jest.Mock<
      Promise<{ database: { containers: { createIfNotExists: jest.Mock<Promise<{ container: Container }>> } } }>
    >
  }
} => ({
  databases: {
    createIfNotExists: jest.fn().mockResolvedValue({
      database: {
        containers: {
          createIfNotExists: jest.fn().mockResolvedValue({
            container: result,
          }),
        },
      },
    }),
  },
})
// #endregion Helpers
