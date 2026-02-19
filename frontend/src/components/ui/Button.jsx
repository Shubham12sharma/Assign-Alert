import React from 'react';

export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none';
  const styles = {
    primary: base + ' bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: base + ' bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: base + ' bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={styles[variant] || styles.primary} {...props}>
      {children}
    </button>
  );
}
