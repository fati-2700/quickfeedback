'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const embedCode = '<script src="http://localhost:3000/widget.js"></script>';

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
        Feedback Dashboard
      </h1>
      
      <div style={{ 
        backgroundColor: '#f9fafb', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '32px',
        marginBottom: '32px'
      }}>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Feedback will appear here
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
          Embed Code
        </h2>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '12px',
          marginBottom: '16px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#374151',
          wordBreak: 'break-all'
        }}>
          {embedCode}
        </div>
        <button
          onClick={copyEmbedCode}
          style={{
            backgroundColor: copied ? '#10b981' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          {copied ? 'Copied!' : 'Copy Embed Code'}
        </button>
      </div>
    </div>
  );
}

