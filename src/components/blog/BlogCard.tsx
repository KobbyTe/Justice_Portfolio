import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url?: string;
  featured_video_url?: string;
  category: string;
  tags?: string[];
  read_time_minutes: number;
  published_at: string;
  slug: string;
}

interface BlogCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
}

export const BlogCard = ({ post, onClick }: BlogCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="glass-card hover-lift group cursor-pointer overflow-hidden" onClick={() => onClick(post.slug)}>
      <div className="relative">
        {post.featured_image_url ? (
          <div className="aspect-[16/9] overflow-hidden">
            <OptimizedImage
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : post.featured_video_url ? (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="text-4xl text-white/80 z-10">▶</div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Video
            </div>
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-4xl font-bold text-primary/40">{post.title.charAt(0)}</div>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">
            {post.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.read_time_minutes} min read</span>
          </div>
        </div>
        
        <h2 className="text-xl font-heading font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
          <span>Read More</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
};