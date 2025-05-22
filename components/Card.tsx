
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-800 shadow-xl rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-emerald-400">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
