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

const TechStack = () => {
  const techItems = [
    { name: 'Raspberry Pi', icon: Cpu, category: 'Hardware' },
    { name: 'Arduino', icon: Zap, category: 'Hardware' },
    { name: 'micro:bit', icon: Bluetooth, category: 'Hardware' },
    { name: 'Avishkaar Robotics', icon: Bot, category: 'Hardware' },
    { name: 'EV3 Lego Mindstorm', icon: Wrench, category: 'Hardware' },
    { name: 'Spike', icon: Settings, category: 'Hardware' },
    { name: 'Vex', icon: Bot, category: 'Hardware' },
    { name: 'KidCad', icon: Palette, category: 'Design' },
    { name: 'Canva', icon: Palette, category: 'Design' },
    { name: 'Python', icon: Code, category: 'Programming' },
    { name: 'Java', icon: Coffee, category: 'Programming' },
    { name: 'C++', icon: FileCode, category: 'Programming' },
    { name: 'JavaScript', icon: Braces, category: 'Programming' },
    { name: 'MySQL', icon: Database, category: 'Database' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {techItems.map((tech, index) => {
        const Icon = tech.icon;
        return (
          <Card 
            key={tech.name}
            className="glass-card hover-lift group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform" 
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-xs sm:text-sm text-foreground leading-tight">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{tech.category}</p>
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