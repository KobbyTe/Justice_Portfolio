import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
}

export const LikeButton = ({ postId, initialLikeCount }: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already liked this post
  useEffect(() => {
    checkIfLiked();
  }, [postId]);

  const checkIfLiked = async () => {
    try {
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      
      const { data } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('ip_address', ip)
        .single();
        
      setIsLiked(!!data);
    } catch (error) {
      // Ignore error - user hasn't liked the post
    }
  };

  const toggleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId)
          .eq('ip_address', ip);

        if (error) throw error;
        
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like the post
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            post_id: postId,
            ip_address: ip,
            user_agent: userAgent
          });

        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        
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