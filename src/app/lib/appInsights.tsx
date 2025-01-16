import { tr } from '@markdoc/markdoc/dist/src/schema';
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

  export function trackEvent(name: string, properties?: {[key: string]: any}) {
    if (appInsights) {
      appInsights.trackEvent({ name }, properties);
    }
  }
  
  export function trackException(error: Error, severityLevel: number = 3){
    if(appInsights){
      appInsights.trackException({
        exception: error,
        severityLevel,
      });
    } 
  }
  
  export function setUserContext(userId: string, accountId?: string){
    if(appInsights){
      appInsights.setAuthenticatedUserContext(userId, accountId);
    }
  }

  export function flushTelemetry(){
    if(appInsights){
      appInsights.flush();
    }
  }
  export default appInsights;