import * as React from "react";

const MOBILE_BREAKPOINT = 768; // px

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Guard for SSR and very old environments
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      setIsMobile(false);
      return;
    }


    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const mql = window.matchMedia(query);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobile(matches);
    };

    // Initialize
    setIsMobile(mql.matches);

    // Subscribe
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Safari fallback
    // @ts-ignore
    mql.addListener(onChange);
    // @ts-ignore
    return () => mql.removeListener(onChange);

  }, []);

  return isMobile;
}


export function useIsTiny(thresholdPx: number = 360): boolean {
  const [isTiny, setIsTiny] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      setIsTiny(false);
      return;
    }

    const mql = window.matchMedia(`(max-width: ${thresholdPx - 1}px)`);

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
      setIsTiny(matches);
    };

    // Initialize
    setIsTiny(mql.matches);

    // Subscribe
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Safari fallback
    // @ts-ignore
    mql.addListener(onChange);
    // @ts-ignore
    return () => mql.removeListener(onChange);
  }, [thresholdPx]);

  return isTiny;
}