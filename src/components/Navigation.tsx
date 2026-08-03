import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@/assets/logo.png';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Close the mobile menu with Escape and return focus to the toggle
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);


  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/resume', label: 'Resume' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/booking', label: 'Booking' },
    { path: '/wall', label: 'Wall' },
  ];

  return (
    <motion.nav
      aria-label="Main navigation"

      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-soft border-b border-border'
          : 'bg-background/40 backdrop-blur-sm sm:bg-transparent'
      }`}>

      {/* Glow accent line on scroll */}
      {isScrolled && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Monogram */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="Home"
          >
            <img src={logoImg} alt="Justice Ansah logo" className="h-10 sm:h-14 w-auto rounded-lg object-contain" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`relative text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md group ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
                {/* Animated underline indicator */}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                  isActive(item.path) ? 'w-4/5 opacity-100' : 'w-0 opacity-0 group-hover:w-3/5 group-hover:opacity-60'
                }`} />
              </Link>
            ))}
          </div>

          {/* Theme toggle + Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>

            <button
              type="button"
              ref={menuButtonRef}
              className="md:hidden p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-200 rotate-0" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu — full-screen overlay for better UX */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}
            className="md:hidden fixed inset-x-0 bottom-0 sm:!top-[80px] z-40"
          >
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-background/98 backdrop-blur-lg"
              onClick={() => setIsMenuOpen(false)}
            />


            {/* Menu content */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
              }}
              className="relative z-10 flex flex-col px-6 pt-6 pb-8 h-full overflow-y-auto"
            >
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  >
                    <Link
                      to={item.path}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                      className={`text-left px-4 py-3.5 min-h-[48px] flex items-center rounded-xl transition-all duration-200 text-base font-medium ${
                        isActive(item.path)
                          ? 'text-primary bg-primary/10 border-l-3 border-primary pl-5'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;