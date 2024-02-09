import { NodeSDK } from '@opentelemetry/sdk-node';
import { metrics } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { AzureMonitorMetricExporter } from '@azure/monitor-opentelemetry-exporter';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';


// Set up the Azure Monitor Metric Exporter
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

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

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'Bühler Chat',
  }),
  metricsProcessor: metricReader
});

sdk.start();

console.log("Application Insights Connection String: ", process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)