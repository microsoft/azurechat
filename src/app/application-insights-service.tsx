"use client"
import {ApplicationInsights, ITelemetryItem} from '@microsoft/applicationinsights-web';
import {ReactPlugin} from '@microsoft/applicationinsights-react-js';
import { SessionContextValue } from 'next-auth/react';

let logger: ApplicationInsights;

function initializeTelemetry(instrumentationKey: string, session: SessionContextValue): { reactPlugin: ReactPlugin, appInsights: ApplicationInsights } {

  const defaultBrowserHistory = {
    url: "/",
    location: { pathname: ""},
    state: { url: "" },
    listen: () => {},
  };

  let browserHistory = defaultBrowserHistory;

  if (typeof window !== "undefined") {
      browserHistory = { ...browserHistory, ...window.history };
      browserHistory.location.pathname = browserHistory?.state?.url;
  }

  const reactPlugin = new ReactPlugin();
  const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: instrumentationKey,
      extensions: [reactPlugin],
      extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory },
      },
      enableAutoRouteTracking: true,
      disableAjaxTracking: false,
      autoTrackPageVisitTime: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
    }
  });

  appInsights.loadAppInsights();

  appInsights.addTelemetryInitializer((env:ITelemetryItem) => {
      env.tags = env.tags || [];
      env.tags["ai.cloud.role"] = "Bühler ChatGPT";
      env.data = env.data || [];
      env.data["email"] = session?.data?.user?.email;
  });

  logger = appInsights;

  return { reactPlugin, appInsights };
}

export { initializeTelemetry, logger };
