import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Initialize the ReactPlugin.
const reactPlugin = new ReactPlugin();

let appInsights: ApplicationInsights | undefined;

// Only run in the browser
if (typeof window !== 'undefined') {
    appInsights = new ApplicationInsights({
        config: {
            connectionString: process.env.NEXT_PUBLIC_AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING,
            extensions: [reactPlugin],
            // ... other settings
        }
    });
    appInsights.loadAppInsights();
}

export { reactPlugin, appInsights };

export const trackEventClientSide = (eventName: string, properties?: { [key: string]: any }) => {
    if (appInsights) {
        appInsights.trackEvent({ name: eventName, properties });
    }
};
