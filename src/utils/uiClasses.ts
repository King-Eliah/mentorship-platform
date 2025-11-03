// Utility classes for consistent modal and overlay styling

export const modalOverlayClasses = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

export const modalContentClasses = `
  bg-white dark:bg-gray-800 
  rounded-2xl shadow-2xl 
  w-full max-w-lg max-h-[90vh] overflow-y-auto 
  border border-gray-200 dark:border-gray-700
`;

export const modalHeaderClasses = `
  flex items-center justify-between p-6 
  border-b border-gray-200 dark:border-gray-700 
  bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
  rounded-t-2xl
`;

export const modalFooterClasses = `
  flex flex-col sm:flex-row sm:justify-end gap-3 p-6 
  border-t border-gray-200 dark:border-gray-700 
  bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 
  rounded-b-2xl
`;

export const dropdownClasses = `
  absolute min-w-48 
  bg-white dark:bg-gray-800 
  rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 
  z-50 py-2 
  animate-in fade-in-0 zoom-in-95 duration-100
`;

export const dropdownItemClasses = `
  flex items-center px-4 py-2 text-sm transition-colors w-full text-left
  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
`;

export const dropdownItemDestructiveClasses = `
  flex items-center px-4 py-2 text-sm transition-colors w-full text-left
  text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
`;

// Position utilities for dropdowns
export const dropdownPositions = {
  'bottom-left': 'left-0 top-full mt-2',
  'bottom-right': 'right-0 top-full mt-2',
  'top-left': 'left-0 bottom-full mb-2',
  'top-right': 'right-0 bottom-full mb-2',
} as const;

// Z-index hierarchy
export const zIndexes = {
  navbar: 'z-50',
  sidebar: 'z-40',
  sidebarBackdrop: 'z-30',
  dropdown: 'z-50',
  modal: 'z-50',
  tooltip: 'z-60',
} as const;