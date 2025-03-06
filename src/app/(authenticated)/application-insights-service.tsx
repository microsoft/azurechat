"use client";

import { ApplicationInsights, ITelemetryItem } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { SessionContextValue } from 'next-auth/react';

let logger: ApplicationInsights;
let telemetryInitialized = false;

function initializeTelemetry(instrumentationKey: string, session: SessionContextValue): { reactPlugin: ReactPlugin, appInsights: ApplicationInsights } {
  if (telemetryInitialized) {
    return {
      reactPlugin: new ReactPlugin(),
      appInsights: logger
    };
  }

  const defaultBrowserHistory = {
    url: "/",
    location: { pathname: "" },
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
      disableAjaxTracking: true,
      disableFetchTracking: true,
      autoTrackPageVisitTime: false,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
    }
  });

  appInsights.loadAppInsights();

  appInsights.addTelemetryInitializer((env: ITelemetryItem) => {
    env.tags = env.tags || {};
    env.data = env.data || {};
    if (env.tags) {
      env.tags["ai.cloud.role"] = "Bühler ChatGPT";
    }
    if (env.data) {
      env.data["email"] = session?.data?.user?.email;
    }
  });

  logger = appInsights;
  telemetryInitialized = true;

  return { reactPlugin, appInsights };
}

export { initializeTelemetry, logger };
