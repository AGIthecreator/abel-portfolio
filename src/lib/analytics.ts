type GtagEventParameters = Record<string, string | number | boolean>;

type Gtag = (
  command: "event",
  eventName: string,
  parameters?: GtagEventParameters,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export const trackEvent = (
  eventName: string,
  parameters?: GtagEventParameters,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};
