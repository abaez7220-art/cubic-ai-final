import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Eliminamos la línea de index.css para que Netlify no de error si no encuentra el archivo
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Error: No se encontró el elemento root.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="background:#1a1a1a;color:white;padding:20px;">${errorMsg}</div>`;
  throw new Error(errorMsg);
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
