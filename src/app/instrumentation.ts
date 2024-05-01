import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter"
import { registerOTel } from "@vercel/otel"

import { AI_NAME } from "@/features/theme/theme-config"

export function register(): void {
  registerOTel({
    serviceName: AI_NAME,
    traceExporter: new AzureMonitorTraceExporter({
      connectionString: process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING,
    }),
  })
}
