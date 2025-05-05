// src/components/ErrorCard.tsx
import React from 'react';

interface ErrorCardProps {
    message: string;
  }
  
  const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {message}</span>
    </div>
  );
  
  export default ErrorCard;