// Enhanced accessibility utilities
export class AccessibilityHelpers {
  // ARIA label generators
  static generateAriaLabel(context: string, item: any): string {
    switch (context) {
      case 'user':
        return `User ${item.firstName} ${item.lastName}, ${item.role}, ${item.status}`;
      case 'event':
        return `Event ${item.title}, scheduled for ${new Date(item.scheduledAt).toLocaleDateString()}`;
      case 'group':
        return `Group ${item.name}, ${item.members?.length || 0} members`;
      default:
        return item.name || item.title || 'Item';
    }
  }

  // Keyboard navigation helpers
  static handleArrowNavigation(
    event: React.KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onIndexChange: (index: number) => void
  ) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onIndexChange(Math.min(currentIndex + 1, totalItems - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        onIndexChange(Math.max(currentIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        break;
      case 'End':
        event.preventDefault();
        onIndexChange(totalItems - 1);
        break;
    }
  }

  // Focus management
  static trapFocus(container: HTMLElement, event: React.KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  // Screen reader announcements
  static announceToScreenReader(message: string) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Color contrast utilities
  static getContrastRatio(_color1: string, _color2: string): number {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd convert colors to RGB and calculate luminance
    return 4.5; // Placeholder - should meet WCAG AA standards
  }

  // High contrast mode detection
  static isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Reduced motion detection
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

// Micro-interaction utilities
export class MicroInteractions {
  // Smooth transitions
  static createSmoothTransition(element: HTMLElement, property: string, duration: number = 300) {
    element.style.transition = `${property} ${duration}ms ease-in-out`;
  }

  // Hover effects
  static addHoverEffect(element: HTMLElement, scale: number = 1.05) {
    const originalTransform = element.style.transform;
    
    element.addEventListener('mouseenter', () => {
      element.style.transform = `scale(${scale})`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = originalTransform;
    });
  }

  // Loading states
  static createPulseEffect(element: HTMLElement) {
    element.classList.add('animate-pulse');
    return () => element.classList.remove('animate-pulse');
  }

  // Success animations
  static showSuccessAnimation(element: HTMLElement) {
    element.classList.add('animate-bounce');
    setTimeout(() => {
      element.classList.remove('animate-bounce');
    }, 1000);
  }

  // Error shake animation
  static showErrorAnimation(element: HTMLElement) {
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  // Progressive disclosure
  static createProgressiveDisclosure(trigger: HTMLElement, content: HTMLElement) {
    content.style.maxHeight = '0';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease-in-out';
    
    let isOpen = false;
    
    trigger.addEventListener('click', () => {
      if (isOpen) {
        content.style.maxHeight = '0';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
      isOpen = !isOpen;
    });
  }
}

// Performance optimization utilities
export class UIPerformance {
  // Intersection Observer for lazy loading
  static createLazyLoader(callback: (entries: IntersectionObserverEntry[]) => void) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
    });
  }

  // Virtual scrolling helper
  static calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    overscan: number = 5
  ) {
    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEnd = Math.min(
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
      Number.MAX_SAFE_INTEGER
    );
    
    return { start: visibleStart, end: visibleEnd };
  }

  // Image optimization
  static createResponsiveImageLoader(img: HTMLImageElement, sizes: string[]) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const width = entry.boundingClientRect.width;
          const appropriateSize = sizes.find(size => parseInt(size) >= width) || sizes[sizes.length - 1];
          
          img.src = img.dataset.src?.replace('{size}', appropriateSize) || '';
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(img);
  }
}