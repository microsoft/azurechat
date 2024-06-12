export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // console.log('Node.js instrumentation');
    // const { useAzureMonitor } = require('@azure/monitor-opentelemetry');
    // const { metrics } = require('@opentelemetry/api');

    // //process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "VERBOSE";
    // //process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";
    // useAzureMonitor({
    //     azureMonitorExporterOptions: {
    //       connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
    //     },
    //     instrumentationOptions: {
    //       azureSdk: {
    //         enabled: true
    //       }
    //     }
    //   });

    const { metrics } = require("@opentelemetry/api");
    const { MeterProvider, PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
    const { AzureMonitorMetricExporter } = require("@azure/monitor-opentelemetry-exporter");

    // Add the exporter into the MetricReader and register it with the MeterProvider
    const exporter = new AzureMonitorMetricExporter({
      connectionString:
        process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"] || "",
    });
    const metricReaderOptions = {
      exporter: exporter,
    };
    const metricReader = new PeriodicExportingMetricReader(metricReaderOptions);
    const meterProvider = new MeterProvider();
    meterProvider.addMetricReader(metricReader);

    // Register Meter Provider as global
    metrics.setGlobalMeterProvider(meterProvider);

    console.log(metrics.getMeterProvider());

    console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  }
}
