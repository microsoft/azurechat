import {ApplicationInsights} from '@microsoft/applicationinsights-web';
let appInsights: ApplicationInsights | null = null;

export function initAppInsights(instrumentationKey: string) {
    if (!appInsights) {
      appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: instrumentationKey,
          enableAutoRouteTracking: true, // Automatically track route changes
        },
      });
      appInsights.loadAppInsights();
    }
    return appInsights;
  }
  
  export function trackPageView(name: string, uri: string) {
    if (appInsights) {
      appInsights.trackPageView({ name, uri });
    }
  }
  
  export default appInsights;