import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import { createBrowserHistory } from 'history';

const appInsightsKey = process.env.NEXT_PUBLIC_AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING;

export interface IAppInsightsContext {
  appInsights: ApplicationInsights;
  reactPlugin: ReactPlugin;
  browserHistory: ReturnType<typeof createBrowserHistory>;
  clickPlugin: ClickAnalyticsPlugin;
}

export const createAppInsights = (): IAppInsightsContext | null => {
  if (typeof window === 'undefined') {
    console.warn('Application Insights cannot be initialized server-side.');
    return null;
  }
  
  try {
    const browserHistory = createBrowserHistory();
    const reactPlugin = new ReactPlugin();
    const clickPlugin = new ClickAnalyticsPlugin();

    const connectionString = appInsightsKey;
    if (!connectionString) {
      throw new Error('Connection string for Application Insights is undefined or empty.');
    }

    const config = {
      connectionString,
      enableAutoRouteTracking: true,
      extensions: [reactPlugin, clickPlugin],
      extensionConfig: {
        [clickPlugin.identifier]: { autoCapture: true },
        [reactPlugin.identifier]: { history: browserHistory },
      },
    };

    const appInsights = new ApplicationInsights({ config });
    appInsights.loadAppInsights();
    appInsights.trackPageView();

    return { appInsights, reactPlugin, browserHistory, clickPlugin };
  } catch (error) {
    console.log('Failed to initialize Application Insights:', error);
    return null;
  }
};