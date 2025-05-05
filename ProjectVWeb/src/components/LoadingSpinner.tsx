// src/components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-32">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  export default LoadingSpinner;