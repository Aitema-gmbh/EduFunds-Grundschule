import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorProvider } from './contexts/ErrorContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ErrorBoundary } from "react-error-boundary";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

function Fallback({ error }: { error: Error }) {
  return (
    <div role="alert" style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Something went wrong:</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <DarkModeProvider>
        <ErrorProvider>
          <App />
        </ErrorProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
