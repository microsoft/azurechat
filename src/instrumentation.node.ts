import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { metrics } from "@opentelemetry/api";

//process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "VERBOSE";
//process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";
useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
    }
  });

console.log(metrics.getMeterProvider());

console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)