import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* reducedMotion="user" honors the OS-level prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ThemeProvider>
  </HelmetProvider>
);
