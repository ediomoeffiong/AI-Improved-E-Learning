import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage body scroll locking for modals and overlays
 * Prevents the scroll restoration bug by properly managing the overflow state
 */
export const useScrollLock = (isLocked = false) => {
  const originalOverflowRef = useRef(null);
  const lockCountRef = useRef(0);

  useEffect(() => {
    if (isLocked) {
      // Store the original overflow value only if not already stored
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = document.body.style.overflow || '';
      }
      
      // Increment lock count
      lockCountRef.current += 1;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Decrement lock count
        lockCountRef.current -= 1;
        
        // Only restore scroll if no other components are locking it
        if (lockCountRef.current <= 0) {
          lockCountRef.current = 0;
          document.body.style.overflow = originalOverflowRef.current || 'auto';
          originalOverflowRef.current = null;
        }
      };
    }
  }, [isLocked]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Force restore scroll on unmount if this component was locking it
      if (lockCountRef.current > 0) {
        lockCountRef.current = Math.max(0, lockCountRef.current - 1);
        if (lockCountRef.current === 0) {
          document.body.style.overflow = originalOverflowRef.current || 'auto';
          originalOverflowRef.current = null;
        }
      }
    };
  }, []);
};

/**
 * Alternative hook that provides manual control over scroll locking
 */
export const useScrollLockManual = () => {
  const originalOverflowRef = useRef(null);
  const isLockedRef = useRef(false);

  const lockScroll = () => {
    if (!isLockedRef.current) {
      originalOverflowRef.current = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      isLockedRef.current = true;
    }
  };

  const unlockScroll = () => {
    if (isLockedRef.current) {
      document.body.style.overflow = originalOverflowRef.current || 'auto';
      originalOverflowRef.current = null;
      isLockedRef.current = false;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
      }
    };
  }, []);

  return { lockScroll, unlockScroll, isLocked: isLockedRef.current };
};

export default useScrollLock;
