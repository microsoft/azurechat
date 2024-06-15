export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
