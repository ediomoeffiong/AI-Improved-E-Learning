import { useCallback } from 'react';

export const useScrollToTop = () => {
  const scrollToTop = useCallback((options = {}) => {
    const {
      behavior = 'smooth',
      top = 0,
      left = 0,
      delay = 0
    } = options;

    const performScroll = () => {
      window.scrollTo({
        top,
        left,
        behavior
      });
    };

    if (delay > 0) {
      setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  }, []);

  const scrollToElement = useCallback((elementId, options = {}) => {
    const {
      behavior = 'smooth',
      block = 'start',
      inline = 'nearest',
      offset = 0,
      delay = 0
    } = options;

    const performScroll = () => {
      const element = document.getElementById(elementId);
      if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior
        });
      }
    };

    if (delay > 0) {
      setTimeout(performScroll, delay);
    } else {
      performScroll();
    }
  }, []);

  const isScrolledDown = useCallback(() => {
    return window.scrollY > 100;
  }, []);

  return {
    scrollToTop,
    scrollToElement,
    isScrolledDown
  };
};
