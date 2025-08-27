import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import SkillBar from '@/components/SkillBar';
import ProjectCard from '@/components/ProjectCard';
import heroWorkspace from '@/assets/hero-workspace.jpg';
import portrait from '@/assets/portrait.jpg';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Mail, 
  Download, 
  ExternalLink,
  Calendar,
  MapPin,
  Send
} from 'lucide-react';

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [wallMessage, setWallMessage] = useState({ name: '', message: '' });
  const [wallEntries, setWallEntries] = useState([
    { id: 1, name: 'Elon', message: 'working on your o-1', timestamp: '2 days ago' },
    { id: 2, name: 'CyberCultist', message: "I'm f*cking cloning this", timestamp: '1 week ago' },
    { id: 3, name: 'Kalculus Guy', message: 'Nice one 👌. My Gat parked beside the road 😌😌', timestamp: '2 weeks ago' },
    { id: 4, name: 'Kelvin', message: 'Boss Buabassah, you do all 😭', timestamp: '1 month ago' },
  ]);

  const skills = [
    { name: 'Python', percentage: 95 },
    { name: 'JavaScript', percentage: 90 },
    { name: 'C++', percentage: 85 },
    { name: 'Java', percentage: 80 },
    { name: 'React', percentage: 88 },
    { name: 'Node.js', percentage: 82 },
  ];

  const projects = [
    { title: 'Birth Reg Mobile', category: 'Mobile App', image: '/api/placeholder/400/300', description: 'Smart birth registration mobile application' },
    { title: 'Birth Reg Deck', category: 'Robotics', image: '/api/placeholder/400/300', description: 'Smart birth registration hardware deck' },
    { title: 'Birth Reg Web', category: 'Web App', image: '/api/placeholder/400/300', description: 'Scheduling platform for birth registration' },
    { title: 'AI Assistant', category: 'AI', image: '/api/placeholder/400/300', description: 'Intelligent educational assistant' },
    { title: 'STEM Learning Hub', category: 'Web App', image: '/api/placeholder/400/300', description: 'Interactive learning platform' },
    { title: 'Robotics Controller', category: 'Robotics', image: '/api/placeholder/400/300', description: 'Advanced robotics control system' },
  ];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  const handleWallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wallMessage.name && wallMessage.message) {
      const newEntry = {
        id: Date.now(),
        ...wallMessage,
        timestamp: 'Just now'
      };
      setWallEntries([newEntry, ...wallEntries]);
      setWallMessage({ name: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-primary font-medium">Hello, I'm</p>
                <h1 className="hero-text">
                  Buabassah <span className="font-black">PRINCE</span>
                </h1>
                <p className="hero-subtitle">Full-Stack Developer & STEM Educator</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Résumé
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Portfolio
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroWorkspace} 
                alt="Developer workspace" 
                className="w-full rounded-2xl shadow-2xl"
              />
              <button className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-lg text-white hover:bg-black/40 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="section-heading">ABOUT</h2>
              <a href="mailto:buabassah@example.com" className="text-primary hover:underline font-medium">
                buabassah@example.com
              </a>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Full-Stack Developer and STEM Educator with expertise in educational technology, 
                robotics engineering, and innovative software solutions. Passionate about empowering 
                the next generation through hands-on learning experiences and cutting-edge technology 
                implementations.
              </p>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Accra, Ghana</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">East Legon, Greater Accra Region</p>
              </div>
            </div>

            <div className="relative">
              <img 
                src={portrait} 
                alt="Buabassah Prince" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="section-heading text-center mb-16">RÉSUMÉ</h2>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Education & Experience */}
            <div className="lg:col-span-2 space-y-12">
              {/* Education */}
              <div>
                <h3 className="text-xl font-heading font-semibold mb-6 text-primary">🎓 Education</h3>
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg">Aggrey Memorial A.M.E. Zion SHS</h4>
                    <p className="text-primary font-medium">General Science with ICT</p>
                    <p className="text-sm text-muted-foreground">2021 – 2023</p>
                  </CardContent>
                </Card>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xl font-heading font-semibold mb-6 text-primary">💼 Experience</h3>
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg">STEM Instructor & Jr. Robotics Engineer</h4>
                      <p className="text-primary font-medium">Inovtech STEM Center</p>
                      <p className="text-sm text-muted-foreground mb-3">February 2025 – Present</p>
                      <p className="text-sm text-muted-foreground">
                        Facilitated hands-on robotics workshops using LEGO® Mindstorms, Arduino, and Avishkaar platforms.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg">Girl Mentor</h4>
                      <p className="text-primary font-medium">Technovation</p>
                      <p className="text-sm text-muted-foreground mb-3">2025 – Present</p>
                      <p className="text-sm text-muted-foreground">
                        Empowered students to identify and solve global issues through innovative technology solutions.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg">Intern</h4>
                      <p className="text-primary font-medium">Academic City University MakeUp Lab</p>
                      <p className="text-sm text-muted-foreground mb-3">August 2024 – November 2024</p>
                      <p className="text-sm text-muted-foreground">
                        Assisted in developing sustainable technology tools including plastic shredder and 3D filament extruder.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-6 text-primary">🛠️ Tech Stack</h3>
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {skills.map((skill, index) => (
                      <SkillBar 
                        key={skill.name}
                        skill={skill.name}
                        percentage={skill.percentage}
                        delay={index * 100}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="section-heading text-center mb-8">💼 Projects</h2>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['All', 'Web App', 'Mobile App', 'Robotics', 'AI'].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? 'bg-primary' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                category={project.category}
                image={project.image}
                description={project.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="section-heading text-center mb-12">✍️ Blog</h2>
          
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card hover-lift">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="aspect-[4/3] bg-secondary rounded-lg"></div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">AI</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>21st December 2024</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-heading font-bold">The Expert Beginner</h3>
                    <p className="text-muted-foreground">
                      The sudden outburst of Artificial Intelligence (AI) has improved our lives, especially in...
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Read More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wall Section */}
      <section id="wall" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="section-heading text-center mb-12">💬 Sign On My Wall</h2>
          
          <div className="max-w-4xl mx-auto">
            {/* Wall Form */}
            <Card className="glass-card mb-12">
              <CardContent className="p-8">
                <form onSubmit={handleWallSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Your name"
                      value={wallMessage.name}
                      onChange={(e) => setWallMessage({ ...wallMessage, name: e.target.value })}
                      className="bg-background/50"
                    />
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4 mr-2" />
                      Sign On My Wall
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Leave a message..."
                    value={wallMessage.message}
                    onChange={(e) => setWallMessage({ ...wallMessage, message: e.target.value })}
                    className="bg-background/50 min-h-[100px]"
                  />
                </form>
              </CardContent>
            </Card>

            {/* Wall Entries */}
            <div className="grid gap-6">
              {wallEntries.map((entry) => (
                <Card key={entry.id} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">@{entry.name}</h4>
                      <span className="text-sm text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground">{entry.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 Buabassah Prince. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to top ↑
            </button>
          </div>
          
          <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-border">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;