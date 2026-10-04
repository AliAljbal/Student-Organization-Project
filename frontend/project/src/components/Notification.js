import React from 'react';

function Notification({ message }) {
  if (!message) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4 shadow-md animate-pulse">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default Notification;
