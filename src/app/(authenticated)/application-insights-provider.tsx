'use client'

import { AppInsightsContext } from '@microsoft/applicationinsights-react-js'
import { initializeTelemetry } from './application-insights-service'
import { useSession } from 'next-auth/react'

export default function ApplicationInsightsProvider({
  instrumentationKey,  
  children,
}: {
    instrumentationKey: string,
    children: React.ReactNode
}) {
  const session = useSession()
  const { reactPlugin } = initializeTelemetry(instrumentationKey, session)
  return <AppInsightsContext.Provider value={reactPlugin}>{children}</AppInsightsContext.Provider>
}
