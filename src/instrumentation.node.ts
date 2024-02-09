import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';


// Set up the Azure Monitor Metric Exporter

// const exporter = new AzureMonitorMetricExporter({
//     connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
// });

// const metricReaderOptions = {
//     exporter: exporter,
//     DiagLogLevel: DiagLogLevel.DEBUG,
// };
// const metricReader = new PeriodicExportingMetricReader(metricReaderOptions);


// const sdk = new NodeSDK({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: 'Bühler Chat',
//   }),
//   metricReader: metricReader
// });

// sdk.start();
process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "VERBOSE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";
useAzureMonitor({
    azureMonitorExporterOptions: {
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",

    },

  });

//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)