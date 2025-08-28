import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 sm:py-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 sm:space-y-6 md:space-y-0">
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
            © 2025 Justice Ansah. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/KobbyTe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/justice-ansah-85917529a/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter Profile"
            >
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a 
              href="mailto:justiceansah@gmail.com" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email Contact"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Back to top ↑
          </button>
        </div>
        
        <div className="flex justify-center space-x-4 sm:space-x-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;