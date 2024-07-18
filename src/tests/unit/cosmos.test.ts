import { Container } from "@azure/cosmos"

import { containerFactory } from "@/features/common/services/cosmos"
import { getCosmosAccessToken, isTokenExpired } from "@/features/common/services/cosmos-auth"
import {
  ApplicationContainer,
  HistoryContainer,
  SmartGenContainer,
  TenantContainer,
  UserContainer,
} from "@/features/common/services/cosmos-service"

const { CosmosClient } = require("@azure/cosmos")

const cosmos = require("@/features/common/services/cosmos")
const cosmosAuth = require("@/features/common/services/cosmos-auth")

jest.mock("@azure/cosmos", () => ({
  CosmosClient: jest.fn(),
  PartitionKeyKind: jest.requireActual("@azure/cosmos").PartitionKeyKind,
  PartitionKeyDefinitionVersion: jest.requireActual("@azure/cosmos").PartitionKeyDefinitionVersion,
}))

describe("getCosmosAccessToken", () => {
  // Mock the fetch function
  global.fetch = jest.fn()

  it("should throw an error if fetch fails", async () => {
    // Arrange
    const dummyConfig = { endpoint: "", key: "", dbName: "" }
    const expectedErrorStatus = "Some Error Status"
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, statusText: expectedErrorStatus })
    // Act
    const actual = getCosmosAccessToken(dummyConfig)

    // Assert
    await expect(actual).rejects.toThrow(
      `Failed to fetch Cosmos Auth Token: ${JSON.stringify(new Error(expectedErrorStatus))}`
    )
  })

  it("should throw an error if fetch fails", async () => {
    // Arrange
    const dummyConfig = { endpoint: "", key: "", dbName: "" }
    const expectedError = new Error("Some Error")
    ;(global.fetch as jest.Mock).mockRejectedValue(expectedError)
    // Act
    const actual = getCosmosAccessToken(dummyConfig)

    // Assert
    await expect(actual).rejects.toThrow(`Failed to fetch Cosmos Auth Token: ${JSON.stringify(expectedError)}`)
  })
})

describe("isTokenExpired", () => {
  it("should returns true for null token", () => {
    // Arrange
    const nullToken = null
    const expected = true
    // Act
    const actual = isTokenExpired(nullToken)
    // Assert
    expect(actual).toBe(expected)
  })

  it("should returns true for expired token", () => {
    // Arrange
    const expiredToken = createMockToken(Date.now() / 1000 - 3600)
    const expected = true
    // Act
    const actual = isTokenExpired(expiredToken)
    // Assert
    expect(actual).toBe(expected)
  })

  it("should returns false for valid token", () => {
    // Arrange
    const validToken = createMockToken(Date.now() / 1000 + 3600)
    const expected = false
    // Act
    const actual = isTokenExpired(validToken)
    // Assert
    expect(actual).toBe(expected)
  })

  it("should throws an error for malformed token", () => {
    // Arrange
    const malformedToken = "malformed.token"
    // Act
    const actual = (): boolean => isTokenExpired(malformedToken)
    // Assert
    expect(actual).toThrow("Failed to check token expiry")
  })
})

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
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    const expectedNumberOfCalls = 1
    const validToken = createMockToken(Date.now() / 1000 + 3600)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: "OK",
      text: () => validToken,
    })
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))

    // Act
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(CosmosClient).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should return cached container if token is valid", async () => {
    // Arrange
    const dummyConfig = { endpoint: "https://dummy.com", key: "dummyKey", dbName: "dummyDb" }
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    const expectedNumberOfCalls = 0
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))

    // Act
    containerCache.set(containerMock.id, containerMock as unknown as Container)
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig, containerCache)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(CosmosClient).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should return new container instance if token is expired", async () => {
    // Arrange
    const dummyConfig = { endpoint: "https://dummy.com", key: "dummyKey", dbName: "dummyDb" }
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    const expectedNumberOfCalls = 1

    const createCosmosClientMock = jest.spyOn(cosmosAuth, "createCosmosClient")
    const isTokenExpiredMock = jest.spyOn(cosmosAuth, "isTokenExpired")
    isTokenExpiredMock.mockReturnValue(true)

    const validToken = createMockToken(Date.now() / 1000 + 3600)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: "OK",
      text: () => validToken,
    })
    CosmosClient.mockImplementation(() => mockCosmosClient(containerMock as unknown as Container))

    // Act
    containerCache.set(containerMock.id, containerMock as unknown as Container)
    const actual = await containerFactory(containerMock.id, containerMock.partitionKey, dummyConfig, containerCache)

    // Assert
    expect(actual.id).toBe(containerMock.id)
    expect(createCosmosClientMock).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })

  it("should throw an error if Cosmos DB is not configured", async () => {
    // Arrange
    const containerMock = { id: "someContainer", partitionKey: { paths: ["/id"] } }
    const dummyConfig = { endpoint: "", key: "", dbName: "" }

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

    // Act
    await Promise.all(containers.map(async container => container()))

    // Assert
    expect(containerFactoryMock).toHaveBeenCalledTimes(expectedNumberOfCalls)
  })
})

// #region Helpers
const mockCosmosClient = (result: Container) => ({
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

function createMockToken(expiryTime: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64")
  const payload = Buffer.from(JSON.stringify({ exp: expiryTime })).toString("base64")
  return `${header}.${payload}.signature`
}
// #endregion Helpers
