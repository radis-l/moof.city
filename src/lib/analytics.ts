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
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) => {
  if (typeof window === 'undefined') return;
  
  const gaReady = await waitForGA();
  if (!gaReady) {
    console.warn(`Failed to track event: ${eventName} (GA not loaded)`);
    return;
  }
  
  try {
    window.gtag('event', eventName, parameters || {});
  } catch (error) {
    console.error('Error tracking GA4 event:', error);
  }
};

export const trackFortuneGeneration = (userData?: { age?: string; bloodGroup?: string; birthDay?: string }) => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'user_journey',
    engagement_value: 1,
    conversion_event: true
  };
  
  if (userData) {
    if (userData.age) parameters.age_group = userData.age;
    if (userData.bloodGroup) parameters.blood_group = userData.bloodGroup;
    if (userData.birthDay) parameters.birth_day_category = userData.birthDay;
  }
  
  trackEvent('fortune_complete', parameters);
};

export const trackEmailSubmission = (isNewUser: boolean, email?: string) => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'form_interaction',
    user_type: isNewUser ? 'new_user' : 'returning_user',
    engagement_value: 1
  };
  
  if (email) {
    parameters.email_domain = email.split('@')[1];
  }
  
  trackEvent('email_submit', parameters);
};

export const trackQuestionnaireStart = () => {
  trackEvent('questionnaire_begin', {
    event_category: 'user_journey',
    funnel_step: 1,
    engagement_value: 1
  });
};

export const trackQuestionnaireComplete = (completionTime?: number) => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'user_journey',
    funnel_step: 2,
    engagement_value: 1,
    conversion_event: true
  };
  
  if (completionTime !== undefined) {
    parameters.completion_time = completionTime;
  }
  
  trackEvent('questionnaire_complete', parameters);
};

export const trackResultView = (isNewUser?: boolean, fortuneType?: string) => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'engagement',
    content_type: 'fortune_result',
    engagement_value: 1
  };
  
  if (isNewUser !== undefined) {
    parameters.user_type = isNewUser ? 'new_user' : 'returning_user';
  }
  
  if (fortuneType) {
    parameters.fortune_type = fortuneType;
  }
  
  trackEvent('result_view', parameters);
};

export const trackMobileWarningShown = () => {
  trackEvent('mobile_warning_show', {
    event_category: 'ui_interaction',
    device_type: 'desktop',
    warning_type: 'mobile_only'
  });
};

export const trackAdminLogin = (success: boolean = true) => {
  trackEvent('admin_login', {
    event_category: 'admin',
    method: 'password',
    success: success
  });
};

export const trackError = (errorType: string, errorMessage?: string, errorLocation?: string) => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'error',
    error_type: errorType
  };
  
  if (errorMessage) {
    parameters.error_message = errorMessage;
  }
  
  if (errorLocation) {
    parameters.error_location = errorLocation;
  }
  
  trackEvent('error_occur', parameters);
};

export const trackPageView = async (pageName: string, userType?: string) => {
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
    
    // Track as custom event with additional parameters
    const parameters: Record<string, string | number | boolean> = {
      page_title: pageName,
      page_location: window.location.href
    };
    
    if (userType) {
      parameters.user_type = userType;
    }
    
    trackEvent('page_view', parameters);
  } catch (error) {
    console.error('Error tracking GA4 page view:', error);
  }
};

// Enhanced User Journey Events for GA4 2025
export const trackFormBegin = (formType: string) => {
  trackEvent('form_begin', {
    event_category: 'user_journey',
    form_type: formType,
    funnel_step: 1
  });
};

export const trackFormProgress = (formType: string, step: number, totalSteps: number) => {
  trackEvent('form_progress', {
    event_category: 'user_journey',
    form_type: formType,
    step_number: step,
    total_steps: totalSteps,
    progress_percentage: Math.round((step / totalSteps) * 100)
  });
};

export const trackResultShare = (shareMethod?: string) => {
  trackEvent('result_share', {
    event_category: 'engagement',
    share_method: shareMethod || 'unknown',
    content_type: 'fortune_result'
  });
};

export const trackSessionStart = (userType: string, deviceType: string) => {
  trackEvent('session_start', {
    event_category: 'user_journey',
    user_type: userType,
    device_type: deviceType,
    session_value: 1
  });
};

export const trackEngagementTime = (timeSpent: number, pageType: string) => {
  trackEvent('user_engagement', {
    event_category: 'engagement',
    engagement_time_msec: timeSpent,
    page_type: pageType
  });
};

// Conversion Events for GA4 Dashboard
export const trackConversion = (conversionType: string, value?: number, currency: string = 'THB') => {
  const parameters: Record<string, string | number | boolean> = {
    event_category: 'conversion',
    currency: currency,
    conversion_event: true
  };
  
  if (value !== undefined) {
    parameters.value = value;
  }
  
  trackEvent(conversionType, parameters);
};

export const verifyGAInstallation = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  const gaReady = await waitForGA();
  if (gaReady) {
    return true;
  } else {
    console.error('❌ Google Analytics 4 failed to load');
    return false;
  }
};