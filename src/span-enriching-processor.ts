// Import the necessary packages.
import { SpanKind, TraceFlags } from "@opentelemetry/api";
import { Span, SpanProcessor } from "@opentelemetry/sdk-trace-base";

// Create a new SpanEnrichingProcessor class.
export class SpanEnrichingProcessor implements SpanProcessor {
    forceFlush(): Promise<void> {
        return Promise.resolve();
    }

    shutdown(): Promise<void> {
        return Promise.resolve();
    }

    onStart(_span: Span): void {}

    onEnd(span: Span) {
        // If the span is an internal span, set the trace flags to NONE to prevent it from being collected.
        if(span.kind == SpanKind.INTERNAL){
            span.spanContext().traceFlags = TraceFlags.NONE;
        }
    }
}