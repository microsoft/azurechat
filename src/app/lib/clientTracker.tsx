'use client'; // Ensure this runs on the client side
import { useEffect } from 'react';
import { usePathname } from "next/navigation";
import { initAppInsights, trackPageView } from './appInsights';

export default function ClientTracker() {
    const pathname = usePathname();
  
    useEffect(() => {
      const instrumentationKey = 'ff525cc3-db0d-4416-904f-f10ec055a0d5'; // Replace with your actual key
      initAppInsights(instrumentationKey);
  
      // Track the initial page view
      trackPageView(document.title, window.location.href);
  
      // Track page views on pathname changes
      trackPageView(document.title, pathname);
    }, [pathname]);
  
    return null; // No UI needed
}