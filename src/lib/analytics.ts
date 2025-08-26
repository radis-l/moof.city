declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData: Record<string, string | number | boolean> = {
      event_category: category,
    };
    
    if (label !== undefined) {
      eventData.event_label = label;
    }
    
    if (value !== undefined) {
      eventData.value = value;
    }
    
    window.gtag('event', action, eventData);
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

export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
};