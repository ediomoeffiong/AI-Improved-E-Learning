import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const ScrollReveal = ({ 
  children, 
  className = '', 
  animation = 'fade-in',
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  delay = 0
}) => {
  const [ref, isVisible] = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce
  });

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-in':
        return 'animate-slide-in';
      case 'slide-in-bottom':
        return 'animate-slide-in-bottom';
      case 'bounce-up':
        return 'animate-bounce-up';
      case 'scale-in':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  const baseClasses = 'scroll-reveal';
  const visibleClasses = isVisible ? `revealed ${getAnimationClass()}` : '';
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${visibleClasses} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
