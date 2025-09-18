// Angels Care CRM Analytics Tracking Script
(function() {
  'use strict';

  // Configuration
  const API_ENDPOINT = 'https://your-app-url.com/api/analytics/capture';
  
  // Generate unique session and visitor IDs
  const getOrCreateId = (key, generateNew) => {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = generateNew ? generateNew() : generateUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Get UTM parameters
  const getUTMParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmTerm: params.get('utm_term'),
      utmContent: params.get('utm_content'),
    };
  };

  // Track page view
  const trackPageView = () => {
    const sessionId = getOrCreateId('ac_session_id');
    const visitorId = getOrCreateId('ac_visitor_id', () => {
      // Try to get from localStorage for persistent visitor ID
      let vid = localStorage.getItem('ac_visitor_id');
      if (!vid) {
        vid = generateUUID();
        localStorage.setItem('ac_visitor_id', vid);
      }
      return vid;
    });

    const startTime = Date.now();
    let duration = 0;
    let bounced = true;

    // Track time on page
    const trackDuration = () => {
      duration = Math.floor((Date.now() - startTime) / 1000);
    };

    // Track interaction to determine bounce
    const trackInteraction = () => {
      bounced = false;
      // Remove listeners after first interaction
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackInteraction);

    // Send analytics data
    const sendAnalytics = () => {
      trackDuration();
      
      const data = {
        sessionId,
        visitorId,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        duration,
        bounced,
        ...getUTMParams(),
      };

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API_ENDPOINT, JSON.stringify(data));
      } else {
        // Fallback to fetch
        fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(console.error);
      }
    };

    // Send analytics on page unload
    window.addEventListener('beforeunload', sendAnalytics);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sendAnalytics();
      }
    });

    // Also send after 30 seconds if user is still on page
    setTimeout(() => {
      if (!document.hidden) {
        sendAnalytics();
      }
    }, 30000);
  };

  // Track form submissions
  const trackFormSubmissions = () => {
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (form.tagName !== 'FORM') return;

      // Extract form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Look for common field names
      const email = formData.get('email') || formData.get('Email') || formData.get('EMAIL');
      const name = formData.get('name') || formData.get('Name') || formData.get('NAME') || 
                   formData.get('firstName') || formData.get('first_name');
      const phone = formData.get('phone') || formData.get('Phone') || formData.get('PHONE') ||
                    formData.get('tel') || formData.get('telephone');
      const company = formData.get('company') || formData.get('Company') || formData.get('COMPANY') ||
                      formData.get('organization');
      const message = formData.get('message') || formData.get('Message') || formData.get('MESSAGE') ||
                      formData.get('comments') || formData.get('inquiry');

      // Send to webhook if email is present
      if (email) {
        const webhookData = {
          formId: form.id || 'unknown',
          data,
          url: window.location.href,
          userAgent: navigator.userAgent,
          email,
          name,
          phone,
          company,
          message,
        };

        fetch('/api/webhooks/form-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData),
        }).catch(console.error);
      }
    });
  };

  // Initialize tracking
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        trackPageView();
        trackFormSubmissions();
      });
    } else {
      trackPageView();
      trackFormSubmissions();
    }
  };

  init();
})();