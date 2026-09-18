import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './styles/global.css';

// Google sign-in is OPTIONAL: if no Client ID is configured the provider is
// skipped and the "Continue with Google" buttons simply don't render.
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const hasGoogle = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.trim());

function Root() {
  if (!hasGoogle) return <HashRouter><App /></HashRouter>;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HashRouter>
        <App />
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
