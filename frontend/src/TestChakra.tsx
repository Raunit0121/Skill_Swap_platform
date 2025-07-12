import React from 'react';

const TestChakra: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3182ce' }}>
        Skill Swap Platform
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#4a5568', marginBottom: '1.5rem' }}>
        Welcome to your Skill Swap Platform! This is a simple test component.
      </p>
      <button 
        style={{
          backgroundColor: '#3182ce',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Get Started
      </button>
    </div>
  );
};

export default TestChakra;
