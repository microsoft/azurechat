import React, { useEffect, useState } from 'react';
import { AppInsightsContext, IAppInsightsContext } from './app-insights-context';
import { createAppInsights } from './app-insights';

type AppInsightsProviderProps = {
    children: React.ReactNode;
  };

export const AppInsightsProvider: React.FunctionComponent<AppInsightsProviderProps> = ({ children }) => {
  const [appInsights, setAppInsights] = useState<IAppInsightsContext | null>(null);

  useEffect(() => {
    const ai = createAppInsights();
    if (ai) setAppInsights(ai);
  }, []);

  return (
    <AppInsightsContext.Provider value={appInsights}>
      {children}
    </AppInsightsContext.Provider>
  );
};

export default AppInsightsProvider;