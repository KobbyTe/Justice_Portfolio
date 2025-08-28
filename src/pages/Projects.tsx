import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Projects Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-6 sm:mb-8 text-3xl sm:text-4xl lg:text-5xl">💼 Projects</h1>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
            {['All', 'Web App', 'Mobile App', 'Robotics', 'AI'].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs sm:text-sm ${activeFilter === filter ? 'bg-primary' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

      <Footer />
    </div>
  );
};

export default Projects;