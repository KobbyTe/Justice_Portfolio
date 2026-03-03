import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Eye, Users, Globe, Monitor, TrendingUp, Clock, CalendarCheck, BookOpen, Heart, MessageSquare } from 'lucide-react';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(210, 70%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(340, 65%, 50%)',
  'hsl(45, 80%, 50%)',
];

const useAnimatedCounter = (target: number, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
}

const SummaryCard = ({ title, value, icon, subtitle }: SummaryCardProps) => {
  const animated = useAnimatedCounter(value);
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{animated.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboard = () => {
  const [range, setRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogLikes, setBlogLikes] = useState<any[]>([]);
  const [blogComments, setBlogComments] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const since = startOfDay(subDays(new Date(), parseInt(range))).toISOString();

    const [viewsRes, bookingsRes, postsRes, likesRes, commentsRes] = await Promise.all([
      supabase.from('page_views').select('*').gte('created_at', since).order('created_at', { ascending: true }),
      supabase.from('bookings').select('*').gte('created_at', since).order('created_at', { ascending: true }),
      supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('blog_likes').select('*').gte('created_at', since).order('created_at', { ascending: true }),
      supabase.from('blog_comments').select('*').gte('created_at', since).order('created_at', { ascending: true }),
    ]);

    setPageViews(viewsRes.data || []);
    setBookings(bookingsRes.data || []);
    setBlogPosts(postsRes.data || []);
    setBlogLikes(likesRes.data || []);
    setBlogComments(commentsRes.data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // === PAGE VIEW AGGREGATIONS ===
  const totalViews = pageViews.length;
  const uniqueSessions = new Set(pageViews.map(d => d.session_id)).size;
  const todayViews = pageViews.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length;

  const pageCounts: Record<string, number> = {};
  pageViews.forEach(d => { pageCounts[d.page_path] = (pageCounts[d.page_path] || 0) + 1; });
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const dailyCounts: Record<string, number> = {};
  pageViews.forEach(d => {
    const day = format(parseISO(d.created_at), 'MMM dd');
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const viewsOverTime = Object.entries(dailyCounts).map(([date, views]) => ({ date, views }));

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, views]) => ({ page: page === '/' ? 'Home' : page.replace('/', ''), views }));

  const deviceCounts: Record<string, number> = {};
  pageViews.forEach(d => { deviceCounts[d.device_type || 'unknown'] = (deviceCounts[d.device_type || 'unknown'] || 0) + 1; });
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  const browserCounts: Record<string, number> = {};
  pageViews.forEach(d => { browserCounts[d.browser || 'Other'] = (browserCounts[d.browser || 'Other'] || 0) + 1; });
  const browserData = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, views]) => ({ name, views }));

  const refCounts: Record<string, number> = {};
  pageViews.forEach(d => {
    let ref = d.referrer || 'Direct';
    if (ref !== 'Direct') { try { ref = new URL(ref).hostname; } catch {} }
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  });
  const referrerData = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([source, views]) => ({ source, views }));

  const recentActivity = [...pageViews].reverse().slice(0, 20);

  // === BOOKING AGGREGATIONS ===
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  const bookingsByDay: Record<string, { total: number; confirmed: number; pending: number }> = {};
  bookings.forEach(b => {
    const day = format(parseISO(b.created_at), 'MMM dd');
    if (!bookingsByDay[day]) bookingsByDay[day] = { total: 0, confirmed: 0, pending: 0 };
    bookingsByDay[day].total += 1;
    if (b.status === 'confirmed') bookingsByDay[day].confirmed += 1;
    else if (b.status === 'pending') bookingsByDay[day].pending += 1;
  });
  const bookingTrend = Object.entries(bookingsByDay).map(([date, v]) => ({ date, ...v }));

  const statusCounts: Record<string, number> = {};
  bookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });
  const bookingStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // === BLOG AGGREGATIONS ===
  const publishedPosts = blogPosts.filter(p => p.is_published).length;
  const totalLikes = blogLikes.length;
  const totalComments = blogComments.length;

  const likesByDay: Record<string, number> = {};
  blogLikes.forEach(l => {
    const day = format(parseISO(l.created_at), 'MMM dd');
    likesByDay[day] = (likesByDay[day] || 0) + 1;
  });
  const commentsByDay: Record<string, number> = {};
  blogComments.forEach(c => {
    const day = format(parseISO(c.created_at), 'MMM dd');
    commentsByDay[day] = (commentsByDay[day] || 0) + 1;
  });
  const allEngagementDays = new Set([...Object.keys(likesByDay), ...Object.keys(commentsByDay)]);
  const engagementTrend = Array.from(allEngagementDays).map(date => ({
    date,
    likes: likesByDay[date] || 0,
    comments: commentsByDay[date] || 0,
  }));

  // Likes per post (top 5)
  const likesPerPost: Record<string, number> = {};
  blogLikes.forEach(l => { likesPerPost[l.post_id] = (likesPerPost[l.post_id] || 0) + 1; });
  const topLikedPosts = Object.entries(likesPerPost)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([postId, likes]) => {
      const post = blogPosts.find(p => p.id === postId);
      return { title: post?.title?.slice(0, 30) || 'Unknown', likes };
    });

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  blogPosts.filter(p => p.is_published).forEach(p => {
    categoryCounts[p.category || 'Uncategorized'] = (categoryCounts[p.category || 'Uncategorized'] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Today</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pageviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pageviews" className="flex items-center gap-2"><Eye className="w-4 h-4" /> Page Views</TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> Bookings</TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Blog</TabsTrigger>
        </TabsList>

        {/* ==================== PAGE VIEWS TAB ==================== */}
        <TabsContent value="pageviews" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Views" value={totalViews} icon={<Eye className="w-5 h-5" />} subtitle={`Last ${range} days`} />
            <SummaryCard title="Today" value={todayViews} icon={<TrendingUp className="w-5 h-5" />} />
            <SummaryCard title="Unique Visitors" value={uniqueSessions} icon={<Users className="w-5 h-5" />} />
            <SummaryCard title="Pages Tracked" value={Object.keys(pageCounts).length} icon={<Globe className="w-5 h-5" />} subtitle={`Top: ${topPage}`} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Views Over Time</CardTitle></CardHeader>
            <CardContent>
              {viewsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={viewsOverTime}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No data yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
              <CardContent>
                {topPages.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topPages} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="page" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Device Breakdown</CardTitle></CardHeader>
              <CardContent>
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data yet.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Browsers</CardTitle></CardHeader>
              <CardContent>
                {browserData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={browserData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="views" fill="hsl(210, 70%, 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Referral Sources</CardTitle></CardHeader>
              <CardContent>
                {referrerData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={referrerData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="views" fill="hsl(150, 60%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data yet.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Referrer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs">{format(parseISO(row.created_at), 'MMM dd, HH:mm')}</TableCell>
                        <TableCell className="font-medium">{row.page_path}</TableCell>
                        <TableCell><span className="inline-flex items-center gap-1"><Monitor className="w-3 h-3" /> {row.device_type}</span></TableCell>
                        <TableCell>{row.browser}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-32 truncate">{row.referrer || 'Direct'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center text-muted-foreground py-8">No recent activity.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== BOOKINGS TAB ==================== */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard title="Total Bookings" value={totalBookings} icon={<CalendarCheck className="w-5 h-5" />} subtitle={`Last ${range} days`} />
            <SummaryCard title="Pending" value={pendingBookings} icon={<Clock className="w-5 h-5" />} />
            <SummaryCard title="Confirmed" value={confirmedBookings} icon={<TrendingUp className="w-5 h-5" />} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Booking Trends</CardTitle></CardHeader>
            <CardContent>
              {bookingTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="confirmed" stackId="a" fill="hsl(150, 60%, 45%)" radius={[0, 0, 0, 0]} name="Confirmed" />
                    <Bar dataKey="pending" stackId="a" fill="hsl(45, 80%, 50%)" radius={[4, 4, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No bookings in this period.</p>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
              <CardContent>
                {bookingStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent Bookings</CardTitle></CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...bookings].reverse().slice(0, 10).map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="text-xs">{format(parseISO(b.created_at), 'MMM dd, HH:mm')}</TableCell>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              b.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {b.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-center text-muted-foreground py-8">No bookings yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== BLOG TAB ==================== */}
        <TabsContent value="blog" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Published Posts" value={publishedPosts} icon={<BookOpen className="w-5 h-5" />} />
            <SummaryCard title="Total Likes" value={totalLikes} icon={<Heart className="w-5 h-5" />} subtitle={`Last ${range} days`} />
            <SummaryCard title="Comments" value={totalComments} icon={<MessageSquare className="w-5 h-5" />} subtitle={`Last ${range} days`} />
            <SummaryCard title="Drafts" value={blogPosts.length - publishedPosts} icon={<Edit className="w-5 h-5" />} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Engagement Over Time</CardTitle></CardHeader>
            <CardContent>
              {engagementTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="hsl(340, 65%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Likes" />
                    <Line type="monotone" dataKey="comments" stroke="hsl(210, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Comments" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No engagement data yet.</p>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Most Liked Posts</CardTitle></CardHeader>
              <CardContent>
                {topLikedPosts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topLikedPosts} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <YAxis dataKey="title" type="category" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="likes" fill="hsl(340, 65%, 50%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No likes yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Post Categories</CardTitle></CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No published posts yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Small icon component used inline
const Edit = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

export default AnalyticsDashboard;
