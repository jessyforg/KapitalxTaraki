import { useState, useEffect } from 'react';

// Custom hook for proper screen size detection
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isHighDPI: false,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    physicalWidth: 0, // Actual physical width accounting for DPI
  });

  useEffect(() => {
    const calculateScreenSize = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Calculate physical width (actual logical pixels)
      const physicalWidth = width;
      
      // More accurate mobile/tablet/desktop detection
      // Use logical pixels (CSS pixels) not physical pixels
      const isMobile = physicalWidth < 768;
      const isTablet = physicalWidth >= 768 && physicalWidth < 1024;
      const isDesktop = physicalWidth >= 1024;
      const isHighDPI = devicePixelRatio > 1.5;

      setScreenSize({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isHighDPI,
        devicePixelRatio,
        physicalWidth,
      });
    };

    // Calculate on mount
    calculateScreenSize();

    // Add resize listener with debounce
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateScreenSize, 150);
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateScreenSize, 500); // Delay for orientation change
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', calculateScreenSize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

// Alternative hook using matchMedia for more reliable breakpoint detection
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const queries = {
      sm: window.matchMedia('(min-width: 640px)'),
      md: window.matchMedia('(min-width: 768px)'),
      lg: window.matchMedia('(min-width: 1024px)'),
      xl: window.matchMedia('(min-width: 1280px)'),
      '2xl': window.matchMedia('(min-width: 1536px)'),
    };

    const updateBreakpoint = () => {
      if (queries['2xl'].matches) setBreakpoint('2xl');
      else if (queries.xl.matches) setBreakpoint('xl');
      else if (queries.lg.matches) setBreakpoint('lg');
      else if (queries.md.matches) setBreakpoint('md');
      else if (queries.sm.matches) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    // Initial check
    updateBreakpoint();

    // Add listeners
    Object.values(queries).forEach(query => {
      query.addEventListener('change', updateBreakpoint);
    });

    return () => {
      Object.values(queries).forEach(query => {
        query.removeEventListener('change', updateBreakpoint);
      });
    };
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
};

// Device detection utility
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    userAgent: '',
    platform: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // More comprehensive mobile detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const tabletRegex = /ipad|android(?!.*mobile)|kindle|playbook|silk/i;
    
    const isMobileByUA = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
    const isTabletByUA = tabletRegex.test(userAgent);
    
    // Get screen dimensions for combined detection
    const width = window.innerWidth;
    const isMobileByScreen = width < 768;
    const isTabletByScreen = width >= 768 && width < 1024;
    const isDesktopByScreen = width >= 1024;
    
    setDeviceInfo({
      isMobile: isMobileByUA || (isMobileByScreen && isTouchDevice),
      isTablet: isTabletByUA || (isTabletByScreen && isTouchDevice),
      isDesktop: !isMobileByUA && !isTabletByUA && isDesktopByScreen,
      isTouchDevice,
      userAgent,
      platform,
    });
  }, []);

  return deviceInfo;
}; 