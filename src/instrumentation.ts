export async function register() {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { metrics } = require("@opentelemetry/api");
    const { MeterProvider, PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
    const { AzureMonitorMetricExporter } = require("@azure/monitor-opentelemetry-exporter");
    const exporter = new AzureMonitorMetricExporter({
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
    });
    console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    const metricReaderOptions = {
        exporter: exporter,
    };
    const metricReader = new PeriodicExportingMetricReader(metricReaderOptions);
    const meterProvider = new MeterProvider({
        readers: [metricReader]
    });
    
    // Register Meter Provider as global
    metrics.setGlobalMeterProvider(meterProvider);
  }
}
