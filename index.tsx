import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Asegúrate de importar aquí tu CSS de Tailwind

/**
 * PUNTO DE ENTRADA CUBIC AI
 * Se encarga del montaje seguro de la aplicación en el DOM.
 */

const rootElement = document.getElementById('root');

// Verificación de seguridad para evitar errores en tiempo de ejecución
if (!rootElement) {
  const errorMsg = "Error Crítico: No se encontró el elemento 'root' en el HTML. La aplicación no puede iniciar.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="color: white; background: #1a1a1a; padding: 20px; font-family: sans-serif;">${errorMsg}</div>`;
  throw new Error(errorMsg);
}

// Inicialización de la raíz de React 18+
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * Nota: Se utiliza StrictMode en desarrollo para detectar
 * efectos secundarios y patrones de código obsoletos.
 */
