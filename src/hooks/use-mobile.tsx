import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function checkIsMobile() {
  if (typeof window === "undefined") return false;
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  return isSmallScreen || isTouchDevice;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(checkIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(checkIsMobile());
    };
    mql.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    setIsMobile(checkIsMobile());
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return isMobile;
}
