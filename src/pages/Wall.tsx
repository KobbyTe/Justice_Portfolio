import { useState, useEffect, useRef, useCallback } from 'react';
import { useRateLimit } from '@/hooks/useRateLimit';
import { supabase } from "@/integrations/supabase/client";
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Sparkles, Quote, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WallEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

// Generate consistent color from name
const getAvatarColor = (name: string) => {
  const colors = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-orange-400',
    'from-pink-500 to-rose-400',
    'from-indigo-500 to-blue-400',
    'from-fuchsia-500 to-pink-400',
    'from-lime-500 to-green-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const WallCard = ({ entry, index }: { entry: WallEntry; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const color = getAvatarColor(entry.name);
  const initials = entry.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
        transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 60}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${index * 60}ms`,
      }}
    >
      <div className="relative rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)] hover:-translate-y-1">
        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 w-5 h-5 text-primary/10 group-hover:text-primary/20 transition-colors" />

        <div className="flex gap-4">
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-xs sm:text-sm">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {entry.name}
              </h3>
              <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                {timeAgo(entry.created_at)}
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {entry.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MAX_MESSAGE = 500;

interface ComposerProps {
  value: { name: string; message: string };
  onChange: (v: { name: string; message: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  justPosted: boolean;
}

const WallComposer = ({ value, onChange, onSubmit, isSubmitting, justPosted }: ComposerProps) => {
  const [expanded, setExpanded] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const initials =
    value.name.trim()
      ? value.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : '';
  const color = getAvatarColor(value.name.trim() || 'guest');

  const pct = Math.min(value.message.length / MAX_MESSAGE, 1);
  const ringColor =
    value.message.length >= MAX_MESSAGE ? 'text-destructive'
      : value.message.length > 450 ? 'text-amber-500'
      : 'text-primary';

  const open = () => {
    setExpanded(true);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const canSubmit = !isSubmitting && !!value.name.trim() && !!value.message.trim();

  return (
    <motion.div
      layout
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !value.name && !value.message) setExpanded(false);
      }}
      className="group relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm mb-12 sm:mb-16 transition-all duration-300 hover:-translate-y-0.5 focus-within:border-primary/50 focus-within:shadow-[0_0_36px_hsl(var(--primary)/0.12)]"
    >
      {/* Glow edge */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <AnimatePresence initial={false} mode="wait">
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={0}
            aria-expanded={false}
            aria-label="Leave a message on the wall"
            onClick={open}
            onFocus={open}
            onKeyDown={handleKeyDown}
            className="relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 min-h-[64px] cursor-text rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              {justPosted ? (
                <Check className="w-4 h-4 text-white" />
              ) : initials ? (
                <span className="text-white font-bold text-xs">{initials}</span>
              ) : (
                <MessageSquare className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="flex-1 text-muted-foreground text-[16px] sm:text-base truncate">
              {justPosted ? 'Thanks — your message is pending approval.' : 'Leave your mark…'}
            </span>
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="w-4 h-4" />
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            onSubmit={onSubmit}
            className="relative overflow-hidden p-5 sm:p-7"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mt-1`}>
                {initials ? (
                  <span className="text-white font-bold text-xs">{initials}</span>
                ) : (
                  <MessageSquare className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="flex-1 min-w-0 rounded-xl bg-background/50 border border-border/60 px-4 py-3">
                <label htmlFor="wall-name" className="sr-only">Your name</label>
                <Input
                  id="wall-name"
                  ref={nameRef}
                  placeholder="Your name"
                  value={value.name}
                  onChange={(e) => onChange({ ...value, name: e.target.value })}
                  maxLength={50}
                  className="border-0 bg-transparent px-0 h-9 text-[16px] font-semibold text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
                <div className="h-px bg-border/70 my-1" />
                <label htmlFor="wall-message" className="sr-only">Your message</label>
                <Textarea
                  id="wall-message"
                  placeholder="Write something inspiring, funny, or kind…"
                  value={value.message}
                  onChange={(e) => onChange({ ...value, message: e.target.value })}
                  maxLength={MAX_MESSAGE}
                  className="border-0 bg-transparent px-0 min-h-[104px] resize-none text-[16px] leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className={`w-6 h-6 -rotate-90 ${ringColor}`} aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2.5" className="stroke-border" />
                  <circle
                    cx="12" cy="12" r="9" fill="none" strokeWidth="2.5" strokeLinecap="round"
                    stroke="currentColor"
                    strokeDasharray={2 * Math.PI * 9}
                    strokeDashoffset={2 * Math.PI * 9 * (1 - pct)}
                    style={{ transition: 'stroke-dashoffset 0.25s ease' }}
                  />
                </svg>
                <span aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
                  {value.message.length}/{MAX_MESSAGE}
                </span>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="group/btn rounded-full px-6 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow hover:shadow-[0_0_28px_hsl(var(--primary)/0.4)] transition-all duration-300"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                )}
                {isSubmitting ? 'Posting…' : 'Post to Wall'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Wall = () => {
  const [wallMessage, setWallMessage] = useState({ name: '', message: '' });
  const [wallEntries, setWallEntries] = useState<WallEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const { checkRateLimit } = useRateLimit(5000, 3, 60000);

  useEffect(() => {
    loadWallMessages();
  }, []);

  const loadWallMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('wall_messages')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWallEntries(data || []);
    } catch (error) {
      console.error('Error loading wall messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallMessage.name.trim() || !wallMessage.message.trim()) {
      toast({ title: "Error", description: "Please fill in both fields.", variant: "destructive" });
      return;
    }

    const { allowed, message } = checkRateLimit();
    if (!allowed) {
      toast({ title: "Slow down", description: message, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('wall_messages')
        .insert([{ name: wallMessage.name.trim(), message: wallMessage.message.trim() }]);
      if (error) throw error;

      import('@/utils/notifications').then(({ sendNotification }) => {
        sendNotification('New Wall Message', `${wallMessage.name.trim()} posted on your wall`, '/wall');
      });

      toast({ title: "🎉 Submitted!", description: "Your message is pending approval and will appear shortly." });
      setWallMessage({ name: '', message: '' });
      loadWallMessages();
    } catch (error) {
      console.error('Error submitting message:', error);
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Community Wall" description="Leave a message on Justice Ansah's community wall — share thoughts, encouragement, or connect." url="/wall" />
      <Navigation />

      <section className="pt-20 pb-12 sm:pt-32 sm:pb-20 relative overflow-hidden">
        {/* Background ambient effects */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide uppercase">Community Wall</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 sm:mb-4">
              Leave Your <span className="text-primary">Mark</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Share your thoughts, drop some encouragement, or just say hello. Every message makes this wall special.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Form Card */}
            <div
              ref={formRef}
              className="relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 sm:p-8 mb-12 sm:mb-16 animate-fade-up"
              style={{ animationDelay: '150ms' }}
            >
              {/* Glow edge */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Sign the Wall</h2>
              </div>

              <form onSubmit={handleWallSubmit} className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={wallMessage.name}
                  onChange={(e) => setWallMessage(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/60 border-border focus:border-primary/50 h-11"
                  maxLength={50}
                />
                <Textarea
                  placeholder="Write something inspiring, funny, or kind..."
                  value={wallMessage.message}
                  onChange={(e) => setWallMessage(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-background/60 border-border focus:border-primary/50 min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/50">
                    {wallMessage.message.length}/500
                  </span>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !wallMessage.name.trim() || !wallMessage.message.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow hover:shadow-[0_0_28px_hsl(var(--primary)/0.4)] transition-all duration-300"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post to Wall"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Messages count */}
            {wallEntries.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs text-muted-foreground font-medium px-3">
                  {wallEntries.length} message{wallEntries.length !== 1 ? 's' : ''}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card/30 p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Wall entries */}
            {!isLoading && (
              <div className="space-y-4">
                {wallEntries.map((entry, i) => (
                  <WallCard key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            )}

            {!isLoading && wallEntries.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No messages yet.</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Be the first to leave your mark!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wall;
