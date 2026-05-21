/**
 * useIsMobile Hook
 * 
 * A simple hook to detect if the current viewport is below the mobile breakpoint.
 * Uses window.matchMedia for performance and reactive updates on resize.
 */
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Setup media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Listen for changes (e.g., rotating device or resizing window)
    mql.addEventListener("change", onChange);
    
    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
