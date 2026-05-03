import { useEffect, useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface VlogCommentsProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

export const VlogComments = ({ postId, open, onClose, onCountChange }: VlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { checkRateLimit } = useRateLimit(10000, 3, 300000);

  useEffect(() => {
    if (!open || !postId) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blog_comments')
        .select('id, name, content, created_at')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      const list = (data as Comment[]) || [];
      setComments(list);
      onCountChange?.(list.length);
      setLoading(false);
    };
    load();
  }, [open, postId, onCountChange]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || content.trim().length < 5) {
      toast.error('Please fill all fields (comment min 5 chars)');
      return;
    }
    const { allowed, message } = checkRateLimit();
    if (!allowed) { toast.error(message); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('blog_comments').insert({
        post_id: postId,
        name: name.trim().slice(0, 80),
        email: email.trim().slice(0, 120),
        content: content.trim().slice(0, 1000),
      });
      if (error) throw error;
      toast.success('Comment submitted — awaiting approval');
      setContent('');
    } catch (err) {
      toast.error('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[71] bg-background rounded-t-2xl shadow-2xl flex flex-col max-h-[85dvh]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-foreground">
                Comments {comments.length > 0 && <span className="text-muted-foreground font-normal">({comments.length})</span>}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted min-w-12 min-h-12 flex items-center justify-center"
                aria-label="Close comments"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5 break-words">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submit} className="border-t border-border p-3 space-y-2 bg-background">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  className="text-base h-12"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  className="text-base h-12"
                  required
                />
              </div>
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="Add a comment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  className="text-base resize-none flex-1"
                  required
                />
                <Button type="submit" disabled={submitting} size="icon" className="h-12 w-12 flex-shrink-0">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VlogComments;
