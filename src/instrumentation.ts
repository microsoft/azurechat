import { registerOTel } from "@vercel/otel";

export async function register() {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    registerOTel("Bühler ChatGPT");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
    const { metrics } = require("@opentelemetry/api");
    const { MeterProvider, PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
    const { AzureMonitorMetricExporter } = require("@azure/monitor-opentelemetry-exporter");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAzureMonitor({
        azureMonitorExporterOptions: {
            connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
        }
    });

    // Add the exporter into the MetricReader and register it with the MeterProvider
    const exporter = new AzureMonitorMetricExporter({
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
    });
    const metricReaderOptions = {
      exporter: exporter,
    };
    const metricReader = new PeriodicExportingMetricReader(metricReaderOptions);
    const meterProvider = new MeterProvider();
    meterProvider.addMetricReader(metricReader);

    // Register Meter Provider as global
    metrics.setGlobalMeterProvider(meterProvider);
  }
}
