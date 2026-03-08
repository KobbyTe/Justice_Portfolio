import { useState, useEffect } from 'react';
import { Trophy, Flame, Eye, BookOpen, FolderOpen, MessageSquare, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

const PAGES_MAP: Record<string, string> = {
  '/': 'home', '/about': 'about', '/projects': 'projects',
  '/blog': 'blog', '/gallery': 'gallery', '/wall': 'wall',
  '/resume': 'resume', '/booking': 'booking',
};

const getVisitorData = () => {
  try {
    const raw = localStorage.getItem('visitor_gamification');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { visitedPages: [], totalVisits: 0, streak: 0, lastVisitDate: null, achievements: [] };
};

const saveVisitorData = (data: any) => {
  localStorage.setItem('visitor_gamification', JSON.stringify(data));
};

const GamificationWidget = () => {
  const location = useLocation();
  const [data, setData] = useState(getVisitorData);
  const [showBadge, setShowBadge] = useState<Achievement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Track visits and streaks
  useEffect(() => {
    const pageKey = PAGES_MAP[location.pathname];
    if (!pageKey) return;

    setData((prev: any) => {
      const today = new Date().toDateString();
      const isNewDay = prev.lastVisitDate !== today;
      const isConsecutive = prev.lastVisitDate && 
        (new Date().getTime() - new Date(prev.lastVisitDate).getTime()) < 2 * 24 * 60 * 60 * 1000;

      const visitedPages = prev.visitedPages.includes(pageKey) 
        ? prev.visitedPages 
        : [...prev.visitedPages, pageKey];

      const updated = {
        ...prev,
        visitedPages,
        totalVisits: prev.totalVisits + 1,
        streak: isNewDay ? (isConsecutive ? prev.streak + 1 : 1) : prev.streak,
        lastVisitDate: today,
      };

      saveVisitorData(updated);
      return updated;
    });
  }, [location.pathname]);

  // Check achievements
  useEffect(() => {
    const achievements = getAchievements(data);
    const newlyUnlocked = achievements.find(a => a.unlocked && !data.achievements?.includes(a.id));
    if (newlyUnlocked) {
      setShowBadge(newlyUnlocked);
      const updated = { ...data, achievements: [...(data.achievements || []), newlyUnlocked.id] };
      saveVisitorData(updated);
      setData(updated);
      setTimeout(() => setShowBadge(null), 4000);
    }
  }, [data.visitedPages?.length, data.totalVisits, data.streak]);

  const achievements = getAchievements(data);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <>
      {/* Achievement toast */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[60] bg-background border border-primary/40 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {showBadge.icon}
            </div>
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
              <p className="text-sm font-bold text-foreground">{showBadge.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trophy button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="relative w-12 h-12 rounded-full bg-secondary border border-border text-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        >
          <Trophy className="w-5 h-5 text-primary" />
          {unlockedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unlockedCount}
            </span>
          )}
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 left-0 w-72 bg-background border border-border rounded-xl shadow-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> Explorer Achievements
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {data.streak} day streak
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {unlockedCount}/{achievements.length} unlocked · {data.totalVisits} total visits
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {achievements.map(a => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                      a.unlocked ? 'bg-primary/5' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      a.unlocked ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

function getAchievements(data: any): Achievement[] {
  const vp = data.visitedPages || [];
  return [
    { id: 'first_visit', title: 'First Steps', description: 'Visit the portfolio for the first time', icon: <Eye className="w-4 h-4" />, unlocked: data.totalVisits >= 1 },
    { id: 'explorer', title: 'Explorer', description: 'Visit 3 different pages', icon: <Star className="w-4 h-4" />, unlocked: vp.length >= 3 },
    { id: 'deep_dive', title: 'Deep Diver', description: 'Visit all 8 pages', icon: <BookOpen className="w-4 h-4" />, unlocked: vp.length >= 8 },
    { id: 'project_viewer', title: 'Project Scout', description: 'Check out the projects page', icon: <FolderOpen className="w-4 h-4" />, unlocked: vp.includes('projects') },
    { id: 'wall_writer', title: 'Wall Contributor', description: 'Visit the community wall', icon: <MessageSquare className="w-4 h-4" />, unlocked: vp.includes('wall') },
    { id: 'streak_3', title: 'Loyal Visitor', description: 'Visit 3 days in a row', icon: <Flame className="w-4 h-4" />, unlocked: data.streak >= 3 },
    { id: 'power_user', title: 'Power User', description: 'Visit 20+ times', icon: <Trophy className="w-4 h-4" />, unlocked: data.totalVisits >= 20 },
  ];
}

export default GamificationWidget;
