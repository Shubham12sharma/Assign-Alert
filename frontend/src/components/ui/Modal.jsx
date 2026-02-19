import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
