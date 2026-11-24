import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary.tsx';
import './index.css';
import 'katex/dist/katex.min.css';

// Ensure initial HTML preloader is cleanly removed when React mounts
try {
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    preloader.remove();
  }
} catch (e) {
  console.warn('Preloader cleanup error:', e);
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    // Ignore benign abort/HMR/autoplay promise rejections in embedded environments
    if (
      event.reason?.name === 'AbortError' ||
      /aborted|NotAllowedError|ResizeObserver|WebSocket/i.test(msg)
    ) {
      event.preventDefault();
    } else {
      console.warn('[Physics Studio] Caught unhandled promise rejection:', event.reason);
      event.preventDefault();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary variant="fullscreen" label="JEE 3D Physics Studio">
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
}


