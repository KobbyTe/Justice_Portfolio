import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ExternalLink, Play, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const getYouTubeThumbnail = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const isVlog = (post: BlogPost) => !!post.featured_video_url;

export const BlogCard = ({ post, onClick }: BlogCardProps) => {
  const navigate = useNavigate();
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const vlog = isVlog(post);
  const youtubeThumb = post.featured_video_url ? getYouTubeThumbnail(post.featured_video_url) : null;

  const handleClick = () => {
    if (vlog) {
      window.scrollTo(0, 0);
      navigate(`/watch/${post.slug}`);
    } else {
      onClick(post.slug);
    }
  };

  return (
    <Card className="glass-card hover-lift group cursor-pointer overflow-hidden" onClick={handleClick}>
      <div className="relative">
        {vlog ? (
          // Video-first card for vlogs
          <div className="aspect-[16/9] overflow-hidden relative">
            {post.featured_image_url ? (
              <OptimizedImage
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : youtubeThumb ? (
              <img
                src={youtubeThumb}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5" />
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ) : post.featured_image_url ? (
          <div className="aspect-[16/9] overflow-hidden">
            <OptimizedImage
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-4xl font-bold text-primary/40">{post.title.charAt(0)}</div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {vlog && (
            <Badge className="bg-red-500/90 text-white border-0 backdrop-blur-sm">
              <Video className="w-3 h-3 mr-1" />
              Vlog
            </Badge>
          )}
          <Badge className="bg-primary text-primary-foreground backdrop-blur-sm">
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
            <span>{vlog ? `${post.read_time_minutes} min watch` : `${post.read_time_minutes} min read`}</span>
          </div>
        </div>
        
        <h2 className="text-xl font-heading font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        
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
          <span>{vlog ? 'Watch Now' : 'Read More'}</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
};
