"use client";

import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

// Initialize analytics instance
const analytics = typeof window !== 'undefined' ? Analytics({
  app: 'angels-care-crm',
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
  plugins: [
    // Add Google Analytics if ID is provided
    ...(process.env.NEXT_PUBLIC_GA_ID ? [
      googleAnalytics({
        measurementIds: [process.env.NEXT_PUBLIC_GA_ID]
      })
    ] : []),
  ]
}) : null;

// Event tracking functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (analytics) {
    analytics.track(eventName, properties);
  }
  // Also store in local database for internal analytics
  if (typeof window !== 'undefined') {
    storeEventLocally(eventName, properties);
  }
};

export const trackPageView = (url: string) => {
  if (analytics) {
    analytics.page({
      url,
      path: window.location.pathname,
      referrer: document.referrer
    });
  }
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (analytics) {
    analytics.identify(userId, traits);
  }
};

// Store events locally for internal analytics dashboard
const storeEventLocally = (eventName: string, properties?: Record<string, any>) => {
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  events.push({
    id: crypto.randomUUID(),
    sessionId: getSessionId(),
    eventName,
    properties,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
  // Keep only last 1000 events in localStorage
  if (events.length > 1000) {
    events.shift();
  }
  localStorage.setItem('analytics_events', JSON.stringify(events));
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Performance metrics tracking
export const trackPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) return;
  
  // Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        trackEvent('Core Web Vital', {
          metric: 'LCP',
          value: entry.startTime,
          rating: entry.startTime <= 2500 ? 'good' : entry.startTime <= 4000 ? 'needs-improvement' : 'poor'
        });
      }
      if (entry.entryType === 'first-input' && 'processingStart' in entry) {
        const fid = entry.processingStart - entry.startTime;
        trackEvent('Core Web Vital', {
          metric: 'FID',
          value: fid,
          rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'
        });
      }
      if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
        trackEvent('Core Web Vital', {
          metric: 'CLS',
          value: (entry as any).value,
          rating: (entry as any).value <= 0.1 ? 'good' : (entry as any).value <= 0.25 ? 'needs-improvement' : 'poor'
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
};

// Scroll depth tracking
export const trackScrollDepth = () => {
  if (typeof window === 'undefined') return;
  
  let maxScroll = 0;
  const thresholds = [25, 50, 75, 100];
  const trackedThresholds = new Set();
  
  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackEvent('Scroll Depth', {
            depth: threshold,
            page: window.location.pathname
          });
        }
      });
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
};

// Rage click detection
export const trackRageClicks = () => {
  if (typeof window === 'undefined') return;
  
  let clickCount = 0;
  let clickTimer: NodeJS.Timeout;
  let lastClickTarget: EventTarget | null = null;
  
  const handleClick = (e: MouseEvent) => {
    if (e.target === lastClickTarget) {
      clickCount++;
      
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        if (clickCount >= 3) {
          trackEvent('Rage Click Detected', {
            target: (e.target as HTMLElement).tagName,
            count: clickCount,
            page: window.location.pathname
          });
        }
        clickCount = 0;
        lastClickTarget = null;
      }, 1000);
    } else {
      clickCount = 1;
      lastClickTarget = e.target;
    }
  };
  
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
};

// Lead tracking events
export const trackLeadEvents = {
  formStarted: (formName: string) => trackEvent('Lead Form Started', { formName }),
  formFieldInteraction: (formName: string, fieldName: string) => 
    trackEvent('Form Field Interaction', { formName, fieldName }),
  formAbandoned: (formName: string, fieldsCompleted: number) => 
    trackEvent('Lead Form Abandoned', { formName, fieldsCompleted }),
  formSubmitted: (formName: string, source: string) => 
    trackEvent('Lead Form Submitted', { formName, source }),
  leadContacted: (leadId: string, method: string) =>
    trackEvent('Lead Contacted', { leadId, method }),
  leadConverted: (leadId: string, value?: number) =>
    trackEvent('Lead Converted', { leadId, value })
};

// A/B Testing helpers
export const trackExperiment = (experimentName: string, variant: string) => {
  trackEvent('Experiment Viewed', { experimentName, variant });
};

export const trackConversion = (experimentName: string, variant: string, value?: number) => {
  trackEvent('Experiment Conversion', { experimentName, variant, value });
};

// SEO Performance tracking
export const trackSEOMetrics = {
  pageLoadTime: (loadTime: number, device: 'mobile' | 'desktop') => 
    trackEvent('Page Load Time', { loadTime, device }),
  
  brokenLink: (url: string, referrer: string) =>
    trackEvent('Broken Link Detected', { url, referrer }),
    
  searchQuery: (query: string, resultsCount: number) =>
    trackEvent('Site Search', { query, resultsCount }),
    
  contentEngagement: (contentId: string, timeOnContent: number, scrollDepth: number) =>
    trackEvent('Content Engagement', { contentId, timeOnContent, scrollDepth }),
    
  internalLinkClick: (from: string, to: string) =>
    trackEvent('Internal Link Click', { from, to })
};

// Initialize performance tracking
if (typeof window !== 'undefined') {
  // Track performance metrics when page loads
  if (document.readyState === 'complete') {
    trackPerformanceMetrics();
  } else {
    window.addEventListener('load', trackPerformanceMetrics);
  }
  
  // Initialize scroll depth tracking
  trackScrollDepth();
  
  // Initialize rage click detection
  trackRageClicks();
}

export default analytics;