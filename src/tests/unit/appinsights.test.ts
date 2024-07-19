import { jest } from "@jest/globals"
import { SeverityLevel } from "@microsoft/applicationinsights-common"
import {
  ApplicationInsights,
  IEventTelemetry,
  ITraceTelemetry,
  ITelemetryItem,
  Snippet,
} from "@microsoft/applicationinsights-web"

import logger, { applicationInsights } from "@/features/insights/app-insights"

type MockedApplicationInsights = jest.Mocked<ApplicationInsights>

jest.mock("@microsoft/applicationinsights-web", () => {
  const mApplicationInsights = {
    loadAppInsights: jest.fn(),
    trackTrace: jest.fn(),
    trackEvent: jest.fn(),
    addTelemetryInitializer: jest.fn(),
  }
  return { ApplicationInsights: jest.fn((_snippet: Snippet) => mApplicationInsights) }
})

describe("Telemetry Service", () => {
  let appInsightsInstance: MockedApplicationInsights

  beforeEach(() => {
    jest.clearAllMocks()
    appInsightsInstance = new ApplicationInsights({} as Snippet) as MockedApplicationInsights
  })

  describe("initialize", () => {
    it("should initialize ApplicationInsights with correct configuration", () => {
      const connectionString = "test_connection_string"
      applicationInsights.initialize(connectionString)

      expect(ApplicationInsights).toHaveBeenCalledWith({
        config: {
          connectionString,
          enableAutoRouteTracking: true,
          disableFetchTracking: false,
          enableAjaxErrorStatusText: true,
          enableUnhandledPromiseRejectionTracking: true,
          extensionConfig: {
            ClickAnalyticsPlugin: { autoCapture: true },
          },
        },
      })

      expect(appInsightsInstance.loadAppInsights).toHaveBeenCalled()
      expect(appInsightsInstance.addTelemetryInitializer).toHaveBeenCalled()
    })

    it("should correctly handle telemetry initializer logic", () => {
      applicationInsights.initialize("test_connection_string")

      const telemetryInitializer = appInsightsInstance.addTelemetryInitializer.mock.calls[0][0]

      const pageviewTelemetry: ITelemetryItem = {
        name: "PageviewTelemetry",
        baseType: "PageviewData",
        baseData: { refUri: "url", uri: "url" },
      }

      const fetchTelemetry: ITelemetryItem = {
        name: "FetchTelemetry",
        baseType: "DependencyData",
        baseData: { type: "Fetch", success: true },
      }

      const otherTelemetry: ITelemetryItem = {
        name: "OtherTelemetry",
        baseType: "EventData",
      }

      expect(telemetryInitializer(pageviewTelemetry)).toBe(false)
      expect(telemetryInitializer(fetchTelemetry)).toBe(false)
      expect(telemetryInitializer(otherTelemetry)).toBe(true)
    })
  })

  describe("logging methods", () => {
    it("should log info messages", () => {
      const message = "Info message"
      const customProperties = { key: "value" }
      logger.info(message, customProperties)

      const expectedTelemetry: ITraceTelemetry = {
        message,
        severityLevel: SeverityLevel.Information,
      }
      expect(appInsightsInstance.trackTrace).toHaveBeenCalledWith(expectedTelemetry, customProperties)
    })

    it("should log warning messages", () => {
      const message = "Warning message"
      const customProperties = { key: "value" }
      logger.warning(message, customProperties)

      const expectedTelemetry: ITraceTelemetry = {
        message,
        severityLevel: SeverityLevel.Warning,
      }
      expect(appInsightsInstance.trackTrace).toHaveBeenCalledWith(expectedTelemetry, customProperties)
    })

    it("should log error messages", () => {
      const message = "Error message"
      const customProperties = { key: "value" }
      logger.error(message, customProperties)

      const expectedTelemetry: ITraceTelemetry = {
        message,
        severityLevel: SeverityLevel.Error,
      }
      expect(appInsightsInstance.trackTrace).toHaveBeenCalledWith(expectedTelemetry, customProperties)
    })

    it("should log critical messages", () => {
      const message = "Critical message"
      const customProperties = {
        message,
        key: "value",
        stacktrace: "stacktrace",
        token: "token",
      }
      logger.critical(message, customProperties)

      const expectedTelemetry: ITraceTelemetry = {
        message,
        severityLevel: SeverityLevel.Critical,
      }
      expect(appInsightsInstance.trackTrace).toHaveBeenCalledWith(expectedTelemetry, customProperties)
    })

    it("should log events", () => {
      const name = "Event name"
      const customProperties = { key: "value" }
      logger.event(name, customProperties)

      const expectedTelemetry: IEventTelemetry = {
        name,
        properties: customProperties,
      }
      expect(appInsightsInstance.trackEvent).toHaveBeenCalledWith(expectedTelemetry)
    })
  })
})
