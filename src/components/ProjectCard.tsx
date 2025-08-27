interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  description?: string;
}

const ProjectCard = ({ title, category, image, description }: ProjectCardProps) => {
  return (
    <div className="group glass-card p-6 hover-lift">
      <div className="aspect-[4/3] bg-secondary rounded-lg mb-4 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
          {category}
        </span>
        <h3 className="font-heading font-semibold text-lg text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;