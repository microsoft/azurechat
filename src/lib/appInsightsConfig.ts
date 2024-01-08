import * as appInsights from 'applicationinsights';

export const initializeAppInsights = (): typeof appInsights | null => {
    try {
        appInsights.setup(process.env.AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING)
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setAutoCollectConsole(true, false)
            .setUseDiskRetryCaching(true)
            .setAutoCollectPreAggregatedMetrics(true)
            .setSendLiveMetrics(true)
            .setAutoCollectHeartbeat(false)
            .setInternalLogging(false, true)
            .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
            .enableWebInstrumentation(false)
            .start();
        return appInsights;
    } catch (error) {
        // Log the initialization error to the console
        console.error("Failed to initialize Application Insights:", error);
        // Return null to signify that the initialization failed
        return null;
    }
};

export const performanceLogger = async (input: typeof appInsights, startTime?: number, endTime?: number) => {
    // Ensure the Application Insights client is available
    if (input) {
        const appInsightsClient = input.defaultClient;

        appInsightsClient.trackEvent({ name: 'TokenRendered' });

        if (startTime && endTime) {
            const elapsedTime = endTime - startTime;
            appInsightsClient.trackMetric({ name: "Time to First Token Render (ms)", value: elapsedTime });
        }
    } else {
        // Optionally handle the case where Application Insights is not initialized
        console.warn("Application Insights is not initialized. Performance metrics will not be logged.");
    }
};
