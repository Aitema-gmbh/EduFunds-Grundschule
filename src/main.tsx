import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#eee',
      fontFamily: 'monospace'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        border: '2px solid #16c79a',
        borderRadius: '10px',
        backgroundColor: '#0f3460'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🚀 Ralph Loop mit Sonnet funktioniert! 🎉
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#16c79a' }}>
          Erfolgreich ausgeführt!
        </p>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Ralph Loop mit Sonnet funktioniert!');
