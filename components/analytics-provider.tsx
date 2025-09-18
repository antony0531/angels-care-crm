"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackEvent } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    // Track form interactions
    const handleFormStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const form = target.closest('form');
      if (form && form.dataset.trackForm) {
        trackEvent('Form Started', {
          formName: form.dataset.trackForm,
          field: target.getAttribute('name')
        });
      }
    };

    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (form.dataset.trackForm) {
        trackEvent('Form Submitted', {
          formName: form.dataset.trackForm
        });
      }
    };

    // Track clicks on CTAs
    const handleCtaClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-track-click]');
      if (button) {
        trackEvent('CTA Clicked', {
          ctaName: button.getAttribute('data-track-click'),
          ctaText: button.textContent
        });
      }
    };

    // Add event listeners
    document.addEventListener('focus', handleFormStart, true);
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', handleCtaClick);

    // Track session start
    if (typeof window !== 'undefined' && !sessionStorage.getItem('session_started')) {
      trackEvent('Session Started', {
        referrer: document.referrer,
        landingPage: window.location.pathname,
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
      });
      sessionStorage.setItem('session_started', 'true');
    }

    // Track page engagement
    let engagementTime = 0;
    const engagementInterval = setInterval(() => {
      engagementTime += 10;
      if (engagementTime === 30) {
        trackEvent('Page Engaged', { duration: 30 });
      } else if (engagementTime === 60) {
        trackEvent('Page Engaged', { duration: 60 });
      } else if (engagementTime === 180) {
        trackEvent('Page Engaged', { duration: 180 });
      }
    }, 10000); // Check every 10 seconds

    return () => {
      document.removeEventListener('focus', handleFormStart, true);
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('click', handleCtaClick);
      clearInterval(engagementInterval);
    };
  }, []);

  return <>{children}</>;
}