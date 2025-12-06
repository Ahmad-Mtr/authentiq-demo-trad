"use client";

import { useState, useEffect } from "react";

type BrowserType = "chromium" | "firefox" | "safari" | "unknown";

interface BrowserInfo {
  type: BrowserType;
  isChromium: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useBrowser(): BrowserInfo {
  const [browser, setBrowser] = useState<BrowserInfo>({
    type: "unknown",
    isChromium: false,
    isFirefox: false,
    isSafari: false,
    isDesktop: true,
    isMobile: false,
  });

  useEffect(() => {
    const detectBrowser = (): BrowserType => {
      const ua = navigator.userAgent.toLowerCase();
      
      // Firefox
      if (ua.includes("firefox")) {
        return "firefox";
      }
      
      // Safari (but not Chrome)
      if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
        return "safari";
      }
      
      // Chromium-based (Chrome, Edge, Opera, Brave, etc.)
      if (
        ua.includes("chrome") ||
        ua.includes("chromium") ||
        ua.includes("edg") ||
        ua.includes("opr") ||
        ua.includes("brave")
      ) {
        return "chromium";
      }
      
      return "unknown";
    };

    const detectMobile = (): boolean => {
      const ua = navigator.userAgent.toLowerCase();
      return (
        ua.includes("mobile") ||
        ua.includes("android") ||
        ua.includes("iphone") ||
        ua.includes("ipad") ||
        ua.includes("ipod") ||
        (typeof window !== "undefined" && window.innerWidth < 768)
      );
    };

    const type = detectBrowser();
    const isMobile = detectMobile();
    
    setBrowser({
      type,
      isChromium: type === "chromium",
      isFirefox: type === "firefox",
      isSafari: type === "safari",
      isMobile,
      isDesktop: !isMobile,
    });
  }, []);

  return browser;
}
