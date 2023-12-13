import * as appInsights from 'applicationinsights';


export const initializeAppInsights = (): typeof appInsights => {
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
    .setAutoCollectIncomingRequestAzureFunctions(true)
    .setInternalLogging(false, true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .enableWebInstrumentation(false)
    .start();

    return appInsights;
};


export const performanceLogger  = async (input: typeof appInsights, startTime?: number, endTime?: number) => {
    const appInsightsClient = input.defaultClient;

    appInsightsClient.trackEvent({ name: 'TokenRendered' });

    if(startTime && endTime){
        const elapsedTime = endTime - startTime;
        appInsightsClient.trackMetric({name: "Time to First Token Render (ms)", value: elapsedTime});

    }
    

}

