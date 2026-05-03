import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="bottom-center" toastOptions={{ style: { background: '#3b0764', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.4)' } }} />
    <App />
  </React.StrictMode>,
);