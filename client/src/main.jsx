import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Comentado para probar si interfiere con Tailwind
// Removed: import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Removed BrowserRouter wrapper */}
    <App />
  </React.StrictMode>
);