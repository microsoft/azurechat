'use client'

import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { createContext } from 'react'
import { reactPlugin } from './application-insights-service'

export const ApplicationInsightsContext = createContext({})

export default function ApplicationInsightsProvider({
    children,
}: {
    children: React.ReactNode
}) {
  return <AppInsightsContext.Provider value={reactPlugin}>{children}</AppInsightsContext.Provider>
}
