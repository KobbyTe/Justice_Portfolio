import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const commentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  content: z.string().min(10, 'Comment must be at least 10 characters')
});

type CommentForm = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
  parent_id?: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
}

export const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema)
  });

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments with replies
      const organized = organizeComments(data || []);
      setComments(organized);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const organizeComments = (flatComments: any[]): Comment[] => {
    const commentsMap = new Map();
    const rootComments: Comment[] = [];

    // First pass: create all comment objects
    flatComments.forEach(comment => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    flatComments.forEach(comment => {
      const commentObj = commentsMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    return rootComments;
  };

  const onSubmit = async (data: CommentForm) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          parent_id: replyingTo,
          name: data.name,
          email: data.email,
          content: data.content
        });

      if (error) throw error;

      import('@/utils/notifications').then(({ sendNotification }) => {
        sendNotification('New Blog Comment', `${data.name} commented on a blog post`, '/admin');
      });

      toast({
        title: "Comment submitted!",
        description: "Your comment is awaiting approval and will appear soon.",
      });

      reset();
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className={isReply ? 'ml-8 mt-4' : ''}>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-primary/20">
                  {comment.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{comment.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed">{comment.content}</p>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <Card className="mt-4 ml-8 glass-card">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register('name')}
                      placeholder="Your name"
                      className="bg-surface border-primary/20"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="Your email"
                      className="bg-surface border-primary/20"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Textarea
                    {...register('content')}
                    placeholder="Write your reply..."
                    rows={3}
                    className="bg-surface border-primary/20 resize-none"
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-heading font-bold">
          Comments ({comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Comment form */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  {...register('name')}
                  placeholder="Your name"
                  className="bg-surface border-primary/20"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Your email"
                  className="bg-surface border-primary/20"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>
            
            <div>
              <Textarea
                {...register('content')}
                placeholder="Share your thoughts..."
                rows={4}
                className="bg-surface border-primary/20 resize-none"
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Post Comment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};