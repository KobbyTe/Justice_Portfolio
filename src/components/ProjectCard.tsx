import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCardProps {
  title: string;
  category: string;
  image?: string;
  description?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
}

const ProjectCard = ({ title, category, image, description, projectUrl, githubUrl, technologies }: ProjectCardProps) => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <div className="group glass-card overflow-hidden hover-lift glow-border-hover transition-all duration-300">
        {/* Image with hover overlay */}
        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
          {/* Slide-up overlay on hover — hidden on touch devices */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-gradient-to-t from-background/98 via-background/90 to-transparent p-5 flex-col justify-end gap-2 hidden md:flex">
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
            )}
            <div className="flex gap-2 pt-1">
              {projectUrl && (
                <>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs" onClick={() => setShowDemo(true)}>
                    <Play className="w-3 h-3 mr-1" />
                    Live Demo
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-xs border-primary/40 hover:bg-primary/10">
                    <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </>
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
        <div className="p-4 sm:p-5 space-y-3">
          <h3 className="font-heading font-semibold text-base text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description — visible on mobile only */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 md:hidden">{description}</p>
          )}

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

          {/* Action buttons — always visible on mobile */}
          {(projectUrl || githubUrl) && (
            <div className="flex gap-2 pt-1 md:hidden">
              {projectUrl && (
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs h-10" onClick={() => setShowDemo(true)}>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Live Demo
                </Button>
              )}
              {githubUrl && (
                <Button asChild size="sm" variant="outline" className="flex-1 text-xs border-primary/40 hover:bg-primary/10 h-10">
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-3.5 h-3.5 mr-1.5" />
                    Code
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Fallback buttons for desktop when no image */}
          {!image && (projectUrl || githubUrl) && (
            <div className="hidden md:flex gap-2 pt-1">
              {projectUrl && (
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setShowDemo(true)}>
                  <Play className="w-3 h-3 mr-1" />
                  Demo
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

      {/* Interactive Demo Modal */}
      <AnimatePresence>
        {showDemo && projectUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-[80vh] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Demo header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-destructive/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono truncate max-w-[300px]">{projectUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="ghost" className="text-xs h-7">
                    <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </a>
                  </Button>
                  <button onClick={() => setShowDemo(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <iframe
                src={projectUrl}
                title={`${title} - Live Demo`}
                className="w-full h-[calc(100%-44px)]"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectCard;