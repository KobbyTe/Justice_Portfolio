import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
}

// Generate a persistent session-based fingerprint instead of fetching IP
const getFingerprint = (): string => {
  let fp = localStorage.getItem('like_fingerprint');
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem('like_fingerprint', fp);
  }
  return fp;
};

export const LikeButton = ({ postId, initialLikeCount }: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check locally if this post was liked
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '{}');
    setIsLiked(!!likedPosts[postId]);
  }, [postId]);

  const toggleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const fingerprint = getFingerprint();
    
    try {
      if (isLiked) {
        // Unlike: delete by fingerprint
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId)
          .eq('ip_address', fingerprint);

        if (error) throw error;
        
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '{}');
        delete likedPosts[postId];
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
      } else {
        // Like the post
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            post_id: postId,
            ip_address: fingerprint,
            user_agent: navigator.userAgent
          });

        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '{}');
        likedPosts[postId] = true;
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
        
        toast({
          title: "Thanks for the like! ❤️",
          description: "Your appreciation means a lot!",
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLike}
      disabled={isLoading}
      className={`transition-all ${
        isLiked 
          ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20' 
          : 'border-primary/20 hover:border-red-500 hover:text-red-500'
      }`}
    >
      <Heart 
        className={`w-4 h-4 mr-2 transition-all ${
          isLiked ? 'fill-red-500' : ''
        }`} 
      />
      {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
    </Button>
  );
};
