import { RequestOptions } from "https";

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
    const { metrics } = require('@opentelemetry/api');
    const { SpanEnrichingProcessor } = require('./span-enriching-processor');

    const cosmosdb = new URL(process.env.AZURE_COSMOSDB_URI);
    const cosmosdbHost = cosmosdb.hostname;

    // Filter using HTTP instrumentation configuration
    const httpInstrumentationConfig = {
      enabled: true,
      ignoreIncomingRequestHook: (request: any) => {
          // Ignore OPTIONS incoming requests
          if (request.method === 'OPTIONS') {
              return true;
          }
          return false;
      },
      ignoreOutgoingRequestHook: (options: RequestOptions) => {
          // Ignore outgoing requests for cosmosdb
          if (options.hostname === cosmosdbHost) {
              return true;
          }
          
          // ignore all for now
          return true;
      }
    };

    useAzureMonitor({
      spanProcessors: [new SpanEnrichingProcessor()] ,
      azureMonitorExporterOptions: {
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",

      },
      enableStandardMetrics: true,
      enableLiveMetrics: false,
      instrumentationOptions: {
        azureSdk: { enabled: false },
        http: httpInstrumentationConfig
      },
    });

    console.log(metrics.getMeterProvider());

    console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  }
}