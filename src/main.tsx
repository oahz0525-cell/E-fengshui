import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { TRPCProvider } from './providers/trpc';
import { enableWebKitMobileLiteMode } from './lib/webkitMobileLite';
import './index.css';
import App from './App';

enableWebKitMobileLiteMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>
);
