import { useState } from 'react';
import { Button } from './Button';

/**
 * Test component to verify ErrorBoundary functionality
 * This component can be temporarily added to any page to test error handling
 */
export const ErrorTester: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    // This will trigger an error that the ErrorBoundary will catch
    throw new Error('This is a test error for ErrorBoundary verification');
  }

  return (
    <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
        Error Boundary Tester
      </h3>
      <p className="text-red-600 dark:text-red-300 text-sm mb-3">
        This component is for testing the ErrorBoundary. Click the button below to trigger an error.
      </p>
      <Button 
        variant="danger" 
        onClick={() => setShouldError(true)}
        size="sm"
      >
        Trigger Error
      </Button>
    </div>
  );
};