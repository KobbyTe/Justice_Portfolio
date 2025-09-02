import { Card, CardContent } from '@/components/ui/card';
import { 
  Cpu, 
  Zap, 
  Bluetooth, 
  Bot, 
  Wrench, 
  Settings, 
  Palette, 
  Code,
  FileCode,
  Braces,
  Coffee,
  Database
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TechStack = () => {
  const [techStack, setTechStack] = useState([]);

  useEffect(() => {
    loadTechStack();
  }, []);

  const loadTechStack = async () => {
    try {
      const { data } = await supabase.from('tech_stack').select('*').eq('is_active', true);
      setTechStack(data || []);
    } catch (error) {
      console.error('Error loading tech stack:', error);
    }
  };

  const getIconForTech = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('raspberry') || lowerName.includes('pi')) return Cpu;
    if (lowerName.includes('arduino')) return Zap;
    if (lowerName.includes('micro') || lowerName.includes('bluetooth')) return Bluetooth;
    if (lowerName.includes('robot') || lowerName.includes('avishkaar') || lowerName.includes('vex')) return Bot;
    if (lowerName.includes('lego') || lowerName.includes('mindstorm')) return Wrench;
    if (lowerName.includes('spike') || lowerName.includes('settings')) return Settings;
    if (lowerName.includes('design') || lowerName.includes('canva') || lowerName.includes('cad')) return Palette;
    if (lowerName.includes('python') || lowerName.includes('code')) return Code;
    if (lowerName.includes('java')) return Coffee;
    if (lowerName.includes('c++')) return FileCode;
    if (lowerName.includes('javascript') || lowerName.includes('js')) return Braces;
    if (lowerName.includes('database') || lowerName.includes('mysql') || lowerName.includes('sql')) return Database;
    return Code; // Default icon
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {techStack.map((tech) => {
        const Icon = getIconForTech(tech.name);
        return (
          <Card 
            key={tech.id}
            className="glass-card hover-lift group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {tech.icon_url ? (
                    <img 
                      src={tech.icon_url.replace(/\s+/g, '')} 
                      alt={tech.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain group-hover:scale-110 transition-transform" 
                      onError={(e) => {
                        console.error(`Failed to load icon for ${tech.name}:`, tech.icon_url);
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallbackElement = parent.querySelector('.fallback-icon') as HTMLElement;
                          if (fallbackElement) fallbackElement.style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <Icon 
                    className={`fallback-icon w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform ${tech.icon_url ? 'hidden' : 'block'}`}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm text-foreground leading-tight">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{tech.category || 'Technology'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TechStack;