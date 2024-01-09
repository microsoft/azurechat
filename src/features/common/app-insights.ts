import { ApplicationInsights, SeverityLevel } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

class CustomError extends Error {
  constructor(message: string, public readonly originalError: Error, public readonly customName: string) {
    super(message);
    this.name = customName;
    this.stack = originalError.stack;
  }
}

const reactPlugin = new ReactPlugin();
let appInsights: ApplicationInsights | undefined;

if (typeof window !== 'undefined') {
  const connectionString = process.env.NEXT_PUBLIC_AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (connectionString) {
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        extensions: [reactPlugin],
      }
    });
    appInsights.loadAppInsights();
  } else {
    console.error('Azure Application Insights connection string is not defined.');
  }
}

export { reactPlugin, appInsights };

export const trackEventClientSide = (eventName: string, properties?: { [key: string]: any }) => {
  appInsights?.trackEvent({ name: eventName, properties });
};

export const trackExceptionClientSide = (error: Error, customName?: string, severityLevel?: SeverityLevel) => {
  const wrappedError = customName ? new CustomError(error.message, error, customName) : error;
  appInsights?.trackException({ exception: wrappedError, severityLevel });
};
