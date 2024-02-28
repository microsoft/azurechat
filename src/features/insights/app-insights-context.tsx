import React, { createContext, useContext } from 'react';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { History } from 'history';
import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';

export interface IAppInsightsContext {
  appInsights?: ApplicationInsights;
  reactPlugin?: ReactPlugin;
  browserHistory?: History;
  clickPlugin?: ClickAnalyticsPlugin;
}

export const AppInsightsContext = createContext<IAppInsightsContext | null>(null);

export const useAppInsightsContext = () => {
  const context = useContext(AppInsightsContext);
  if (context === null) {
    throw new Error('useAppInsightsContext must be used within an AppInsightsProvider');
  }
  return context;
};