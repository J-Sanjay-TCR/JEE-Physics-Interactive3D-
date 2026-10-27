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

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
}


