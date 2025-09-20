import React from 'react';

function Logo({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle - represents Claude */}
      <circle 
        cx="16" 
        cy="16" 
        r="14" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Inner connections - represents MCP */}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <circle cx="24" cy="8" r="2" fill="currentColor" />
      <circle cx="8" cy="24" r="2" fill="currentColor" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
      
      {/* Connection lines */}
      <line x1="13" y1="13" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="19" y1="13" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="19" x2="10" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <line x1="19" y1="19" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default Logo;