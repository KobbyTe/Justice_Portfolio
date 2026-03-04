import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/resume', label: 'Resume' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/gallery', label: 'Frames of Action' },
    { path: '/booking', label: 'Booking' },
    { path: '/wall', label: 'Wall' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-background/95 backdrop-blur-md shadow-soft border-b border-border'
        : 'bg-transparent'
    }`}>
      {/* Glow accent line on scroll */}
      {isScrolled && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Monogram */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Home"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/60 group-hover:shadow-glow">
              <span className="font-heading font-black text-primary text-sm tracking-tight">J.A</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-200 rotate-0" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - smooth height transition */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-border pt-4 pb-2 flex flex-col space-y-1">
            {navItems.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-left px-4 py-3 min-h-[44px] flex items-center rounded-md transition-all duration-200 text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 border-l-2 border-primary pl-5'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                style={{ transitionDelay: isMenuOpen ? `${i * 30}ms` : '0ms' }}
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
