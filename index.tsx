import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Error Crítico: El contenedor 'root' no existe en el HTML.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="background:#1a1a1a;color:white;padding:20px;font-family:sans-serif;">${errorMsg}</div>`;
  throw new Error(errorMsg);
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
