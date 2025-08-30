interface ProjectCardProps {
  title: string;
  category: string;
  image?: string;
  description?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
}

import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';

const ProjectCard = ({ title, category, image, description, projectUrl, githubUrl, technologies }: ProjectCardProps) => {
  return (
    <div className="group glass-card p-6 hover-lift">
      <div className="aspect-[4/3] bg-secondary rounded-lg mb-4 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
            {category}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        )}
        
        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                {tech}
              </span>
            ))}
            {technologies.length > 3 && (
              <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                +{technologies.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {projectUrl && (
            <Button asChild size="sm" variant="outline" className="flex-1">
              <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </a>
            </Button>
          )}
          {githubUrl && (
            <Button asChild size="sm" variant="outline" className="flex-1">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-1" />
                Code
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;