import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@/assets/logo.png';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              className="md:hidden p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-200 rotate-0" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — full-screen overlay for better UX */}
      <div
        style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}
        className={`md:hidden fixed inset-x-0 bottom-0 sm:!top-[80px] z-40 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/98 backdrop-blur-lg"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu content */}
        <div className="relative z-10 flex flex-col px-6 pt-6 pb-8 h-full overflow-y-auto">
          <div className="flex flex-col space-y-1">
            {navItems.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`text-left px-4 py-3.5 min-h-[48px] flex items-center rounded-xl transition-all duration-200 text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 border-l-3 border-primary pl-5'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                style={{ 
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: isMenuOpen ? 1 : 0,
                  transition: `transform 0.3s ease ${i * 40}ms, opacity 0.3s ease ${i * 40}ms`
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;