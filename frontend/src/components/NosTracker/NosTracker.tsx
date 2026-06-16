import { useEffect } from 'react';

declare global {
  interface Window {
    NOS_TRACKER?: {
      initTracking: (config: {
        options: { brandId: number; brand: string };
        debug?: boolean;
      }) => void;
      enterPage: (payload: {
        program: string;
        page: string;
        chapter1?: string;
        chapter2?: string;
        chapter3?: string;
        pageTitle: string;
      }) => void;
      setClickTrackingData: (payload: {
        eventType: string;
        eventName: string;
      }) => Record<string, string>;
    };
  }
}

const BRAND_ID = 631004;
const BRAND = 'NOS.nl';

const SRC = 'https://static.nos.nl/tracking/tracking.js';

function NosTracker() {
  useEffect(() => {
    const init = () => {
      window.NOS_TRACKER?.initTracking({
        options: { brand: BRAND, brandId: BRAND_ID },
        debug: true,
      });
    };

    // Already loaded (e.g. client-side navigation)
    if (window.NOS_TRACKER) {
      init();
      return;
    }

    // Reuse an existing tag if some other component already inserted it
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const inserted = !script;
    if (!script) {
      script = document.createElement('script');
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    script.addEventListener('load', init);
    return () => {
      script?.removeEventListener('load', init);
      if (inserted) script?.remove();
    };
  }, []);

  return null;
}

// Returns data attributes to spread onto a clickable element, e.g.
//   <button {...clickTracking('Delen')}>. Safe no-op ({}) until the tracker
// script has loaded.
export function clickTracking(eventName: string): Record<string, string> {
  return window.NOS_TRACKER?.setClickTrackingData({ eventType: 'click', eventName }) ?? {};
}

export { NosTracker };
