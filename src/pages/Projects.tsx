import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { supabase } from '@/integrations/supabase/client';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects(data || []);
      const uniqueCategories = ['All', ...new Set(data?.map((project: any) => project.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((project: any) => project.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-up">
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">My Work</p>
            <h1 className="section-heading text-center text-3xl sm:text-4xl lg:text-5xl mb-4">Projects</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A collection of robotics, IoT, and web projects born from curiosity and a drive to solve real problems.
            </p>
          </div>

          {/* Animated filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 overflow-hidden group ${
                  activeFilter === filter
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                    : 'border-border text-muted-foreground hover:text-primary hover:border-primary/60 bg-transparent'
                }`}
              >
                {/* Animated fill on hover */}
                {activeFilter !== filter && (
                  <span className="absolute inset-0 bg-primary/8 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-full" />
                )}
                <span className="relative">{filter}</span>
              </button>
            ))}
          </div>

          {/* Project Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project: any, i: number) => (
                <div
                  key={project.id}
                  style={{
                    opacity: 1,
                    animation: `fade-up 0.5s ease both ${i * 80}ms`
                  }}
                >
                  <ProjectCard
                    title={project.title}
                    category={project.category}
                    image={project.image_url}
                    description={project.description}
                    projectUrl={project.project_url}
                    githubUrl={project.github_url}
                    technologies={project.technologies}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
