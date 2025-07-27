import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';

const Index = () => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and check for errors
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold">PULSE BENGALURU</h1>
          <p className="text-gray-300">Something went wrong. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center text-white">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            PULSE BENGALURU
          </h1>
          <div className="w-16 h-16 mx-auto border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading city intelligence...</p>
        </div>
      </div>
    );
  }

  // Main app
  try {
    return <AppLayout />;
  } catch (error) {
    console.error('Error rendering AppLayout:', error);
    setHasError(true);
    return null;
  }
};

export default Index;
