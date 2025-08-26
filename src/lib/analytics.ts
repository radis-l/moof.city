declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
    dataLayer: unknown[];
  }
}

const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         Array.isArray(window.dataLayer);
};

const waitForGA = (maxRetries = 10): Promise<boolean> => {
  return new Promise((resolve) => {
    let retries = 0;
    const checkGA = () => {
      if (isGALoaded()) {
        resolve(true);
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkGA, 100);
      } else {
        console.warn('Google Analytics failed to load after', maxRetries * 100, 'ms');
        resolve(false);
      }
    };
    checkGA();
  });
};

export const trackEvent = async (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined') return;
  
  const gaReady = await waitForGA();
  if (!gaReady) {
    console.warn(`Failed to track event: ${action} (GA not loaded)`);
    return;
  }
  
  const eventData: Record<string, string | number | boolean> = {
    event_category: category,
  };
  
  if (label !== undefined) {
    eventData.event_label = label;
  }
  
  if (value !== undefined) {
    eventData.value = value;
  }
  
  try {
    window.gtag('event', action, eventData);
    console.log(`GA Event tracked: ${action}`, eventData);
  } catch (error) {
    console.error('Error tracking GA event:', error);
  }
};

export const trackFortuneGeneration = () => {
  trackEvent('fortune_generated', 'engagement', 'new_fortune', 1);
};

export const trackEmailSubmission = (isNewUser: boolean) => {
  trackEvent(
    'email_submitted',
    'form_interaction',
    isNewUser ? 'new_user' : 'returning_user',
    1
  );
};

export const trackQuestionnaireStart = () => {
  trackEvent('questionnaire_started', 'user_journey', 'form_interaction', 1);
};

export const trackQuestionnaireComplete = () => {
  trackEvent('questionnaire_completed', 'user_journey', 'form_completion', 1);
};

export const trackResultView = () => {
  trackEvent('result_viewed', 'engagement', 'fortune_result', 1);
};

export const trackMobileWarningShown = () => {
  trackEvent('mobile_warning_shown', 'ui_interaction', 'desktop_redirect', 1);
};

export const trackAdminLogin = () => {
  trackEvent('admin_login', 'admin', 'authentication', 1);
};

export const trackError = (errorType: string, errorMessage?: string) => {
  trackEvent('error_occurred', 'error', `${errorType}: ${errorMessage}`, 1);
};

export const trackPageView = async (pageName: string) => {
  if (typeof window === 'undefined') return;
  
  const gaReady = await waitForGA();
  if (!gaReady) {
    console.warn(`Failed to track page view: ${pageName} (GA not loaded)`);
    return;
  }
  
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.error('GA Measurement ID not found in environment variables');
    return;
  }
  
  try {
    window.gtag('config', measurementId, {
      page_title: pageName,
      page_location: window.location.href,
    });
    console.log(`GA Page view tracked: ${pageName}`);
  } catch (error) {
    console.error('Error tracking GA page view:', error);
  }
};

export const verifyGAInstallation = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  const gaReady = await waitForGA();
  if (gaReady) {
    console.log('✅ Google Analytics is properly loaded');
    console.log('🔍 gtag function available:', typeof window.gtag === 'function');
    console.log('📊 dataLayer available:', Array.isArray(window.dataLayer));
    console.log('🆔 Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    return true;
  } else {
    console.error('❌ Google Analytics failed to load');
    return false;
  }
};