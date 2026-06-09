import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { useGraphicsStore } from '@/stores/graphics.store';
import { useLocaleStore } from '@/stores/locale.store';
import '@/styles/global.css';

useGraphicsStore.getState().hydrate();
useLocaleStore.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);