// Responsive design utilities and breakpoint helpers

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Mobile-first responsive classes
export const responsive = {
  // Layout utilities
  container: {
    base: 'w-full mx-auto px-4',
    sm: 'sm:px-6 sm:max-w-screen-sm',
    md: 'md:px-8 md:max-w-screen-md',
    lg: 'lg:max-w-screen-lg',
    xl: 'xl:max-w-screen-xl',
    all: 'w-full mx-auto px-4 sm:px-6 md:px-8 sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl'
  },

  // Grid utilities
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    autoFit: 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
    autoFill: 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    dashboard: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
  },

  // Flex utilities
  flex: {
    responsive: 'flex flex-col sm:flex-row',
    mobileStack: 'flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    mobileBetween: 'flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'
  },

  // Spacing utilities
  spacing: {
    section: 'py-6 sm:py-8 md:py-12',
    component: 'p-4 sm:p-6 md:p-8',
    gap: 'gap-4 sm:gap-6 md:gap-8',
    margin: 'mb-4 sm:mb-6 md:mb-8',
    gapMobile: 'gap-2 sm:gap-4 md:gap-6',
    paddingMobile: 'p-3 sm:p-4 md:p-6',
    paddingXMobile: 'px-3 sm:px-4 md:px-6',
    paddingYMobile: 'py-2 sm:py-3 md:py-4'
  },

  text: {
    responsive: {
      xs: 'text-xs sm:text-xs',
      sm: 'text-xs sm:text-sm',
      base: 'text-sm sm:text-base',
      lg: 'text-base sm:text-lg',
      xl: 'text-lg sm:text-xl',
      '2xl': 'text-xl sm:text-2xl',
      '3xl': 'text-2xl sm:text-3xl',
      '4xl': 'text-3xl sm:text-4xl'
    },
    heading: {
      h1: 'text-2xl sm:text-3xl md:text-4xl font-bold',
      h2: 'text-xl sm:text-2xl md:text-3xl font-semibold',
      h3: 'text-lg sm:text-xl md:text-2xl font-medium',
      h4: 'text-base sm:text-lg md:text-xl font-medium'
    }
  },

  // Mobile first button sizing
  button: {
    xs: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-xs',
    sm: 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    md: 'px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-3 sm:text-lg',
    icon: 'p-1.5 sm:p-2 md:p-2.5',
    large: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
    fullMobile: 'w-full sm:w-auto'
  },

  // Card sizing
  card: {
    height: 'min-h-[300px] sm:min-h-[350px]',
    padding: 'p-3 sm:p-4 md:p-6',
    roundedMobile: 'rounded-lg sm:rounded-xl',
    base: 'rounded-lg border shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-200'
  },

  // Input sizing
  input: {
    height: 'h-10 sm:h-11',
    textSize: 'text-sm sm:text-base',
    padding: 'px-3 sm:px-4 py-2 sm:py-2.5'
  },

  // Navigation utilities
  nav: {
    mobile: 'block sm:hidden',
    desktop: 'hidden sm:block',
    responsive: 'flex flex-col sm:flex-row sm:items-center'
  },

  // Hide/show utilities
  visibility: {
    mobileOnly: 'block sm:hidden',
    tabletUp: 'hidden sm:block',
    desktopOnly: 'hidden lg:block',
    mobileHidden: 'hidden sm:block'
  }
};

// Responsive hook for JavaScript logic
export const useResponsive = () => {
  const getBreakpoint = () => {
    if (typeof window === 'undefined') return 'lg'; // SSR fallback
    
    const width = window.innerWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  };

  const isMobile = () => getBreakpoint() === 'xs';
  const isTablet = () => ['xs', 'sm'].includes(getBreakpoint());
  const isDesktop = () => !['xs', 'sm'].includes(getBreakpoint());

  return {
    breakpoint: getBreakpoint(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop()
  };
};

// Tailwind class builder for responsive variants
export const buildResponsiveClasses = (
  base: string,
  variants: Partial<Record<keyof typeof breakpoints, string>>
): string => {
  let classes = base;
  
  Object.entries(variants).forEach(([breakpoint, value]) => {
    if (value) {
      classes += ` ${breakpoint}:${value}`;
    }
  });
  
  return classes;
};

// Common responsive patterns
export const responsivePatterns = {
  // Dashboard layouts
  dashboardGrid: 'grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  statsGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
  
  // Content layouts
  contentGrid: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
  sidebarLayout: 'flex flex-col lg:flex-row lg:gap-8',
  
  // Form layouts
  formGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  formActions: 'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
  
  // Navigation
  mobileMenu: 'fixed inset-0 z-50 lg:static lg:inset-auto lg:z-auto',
  mobileOverlay: 'fixed inset-0 bg-black bg-opacity-50 lg:hidden',
  
  // Cards and components
  cardContainer: 'space-y-4 sm:space-y-6',
  cardGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  
  // Modal and dialog
  modal: 'w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl',
  modalPadding: 'p-4 sm:p-6',
  
  // Table responsive
  table: 'min-w-full overflow-x-auto',
  tableWrapper: 'overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'
};

export default responsive;