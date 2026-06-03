import { useEffect, useState, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { checkRateLimit } = useRateLimit(10000, 3, 300000);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('blog_comments')
      .select('id, name, content, created_at')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError("Couldn't load comments. Please try again.");
      setLoading(false);
      return;
    }
    const list = (data as Comment[]) || [];
    setComments(list);
    onCountChange?.(list.length);
    setLoading(false);
  }, [postId, onCountChange]);

  useEffect(() => {
    if (!open || !postId) return;
    load();
  }, [open, postId, load]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !email.trim() || content.trim().length < 5) {
      setSubmitError('Please fill all fields (comment must be at least 5 characters).');
      return;
    }
    const { allowed, message } = checkRateLimit();
    if (!allowed) { setSubmitError(message); return; }
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
    } catch {
      setSubmitError("Couldn't post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const avatarGradient = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 45%))`;
  };

  const canSubmit = !submitting && content.trim().length >= 5 && name.trim() && email.trim();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[71] bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[88dvh] sm:max-h-[85dvh] border-t border-border/60 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg md:max-w-xl sm:rounded-3xl sm:bottom-4"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
          >
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="flex items-center justify-between px-5 pt-3 pb-3 sm:pt-5">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Comments</h3>
                {!loading && comments.length > 0 && (
                  <span className="text-sm text-muted-foreground tabular-nums">{comments.length}</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close comments"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-px bg-border/60" />

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-5">
              {loading ? (
                // Skeleton list
                <div className="space-y-5" aria-busy="true" aria-label="Loading comments">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="h-2.5 w-10 rounded bg-muted/70" />
                        </div>
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-4/5 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{loadError}</p>
                  <Button onClick={load} variant="outline" size="sm" className="mt-4 rounded-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-14 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageCircle className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                    Be the first to share your thoughts.
                  </p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-sm"
                      style={{ background: avatarGradient(c.name) }}
                      aria-hidden="true"
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-1 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submit} className="border-t border-border/60 px-4 pt-3 pb-3 bg-background/95 backdrop-blur space-y-2">
              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{submitError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  className="h-11 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input px-4 text-base"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  className="h-11 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input px-4 text-base"
                  required
                />
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Add a comment…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  className="text-base resize-none rounded-2xl bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input pl-4 pr-14 py-3 min-h-[3rem]"
                  required
                />
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  size="icon"
                  className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-full"
                  aria-label="Post comment"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-muted-foreground">Comments are reviewed before publishing.</p>
                <p className="text-[10px] text-muted-foreground tabular-nums">{content.length}/1000</p>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VlogComments;
