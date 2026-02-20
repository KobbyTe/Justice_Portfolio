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
    <div className="group glass-card overflow-hidden hover-lift glow-border-hover transition-all duration-300">
      {/* Image with hover overlay */}
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        {/* Slide-up overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-gradient-to-t from-background/98 via-background/90 to-transparent p-5 flex flex-col justify-end gap-2">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
          )}
          <div className="flex gap-2 pt-1">
            {projectUrl && (
              <Button asChild size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </a>
              </Button>
            )}
            {githubUrl && (
              <Button asChild size="sm" variant="outline" className="flex-1 text-xs border-primary/40 hover:bg-primary/10">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-3 h-3 mr-1" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-background/80 backdrop-blur-sm text-primary rounded-full border border-primary/30 group-hover:border-primary/60 group-hover:shadow-glow transition-all duration-300">
            {category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <h3 className="font-heading font-semibold text-base text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded border border-border">
                {tech}
              </span>
            ))}
            {technologies.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded border border-border">
                +{technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Fallback buttons when no image (overlay won't be seen) */}
        {!image && (
          <div className="flex gap-2 pt-1">
            {projectUrl && (
              <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </a>
              </Button>
            )}
            {githubUrl && (
              <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-3 h-3 mr-1" />
                  Code
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
