import { metrics } from "@opentelemetry/api";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { AzureMonitorMetricExporter } from "@azure/monitor-opentelemetry-exporter";

const exporter = new AzureMonitorMetricExporter({
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
});
const metricReaderOptions = {
    exporter: exporter,
};
const metricReader = new PeriodicExportingMetricReader(metricReaderOptions);
const meterProvider = new MeterProvider({
    readers: [metricReader]
});

// Register Meter Provider as global
metrics.setGlobalMeterProvider(meterProvider);