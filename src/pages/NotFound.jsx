import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
      <h1 className="text-8xl font-black text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        We couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors border-0"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
