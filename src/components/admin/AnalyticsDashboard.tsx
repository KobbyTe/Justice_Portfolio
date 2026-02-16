import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Eye, Users, Globe, Monitor, TrendingUp, Clock } from 'lucide-react';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(210, 70%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(340, 65%, 50%)',
];

// Animated counter hook
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
  const [data, setData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const since = startOfDay(subDays(new Date(), parseInt(range))).toISOString();
    const { data: rows, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (!error && rows) setData(rows);
    setLoading(false);
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Aggregations
  const totalViews = data.length;
  const uniqueSessions = new Set(data.map(d => d.session_id)).size;
  const todayViews = data.filter(d => {
    const t = new Date(d.created_at);
    const now = new Date();
    return t.toDateString() === now.toDateString();
  }).length;

  // Top page
  const pageCounts: Record<string, number> = {};
  data.forEach(d => { pageCounts[d.page_path] = (pageCounts[d.page_path] || 0) + 1; });
  const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Views over time
  const dailyCounts: Record<string, number> = {};
  data.forEach(d => {
    const day = format(parseISO(d.created_at), 'MMM dd');
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const viewsOverTime = Object.entries(dailyCounts).map(([date, views]) => ({ date, views }));

  // Top pages
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, views]) => ({ page: page === '/' ? 'Home' : page.replace('/', ''), views }));

  // Device breakdown
  const deviceCounts: Record<string, number> = {};
  data.forEach(d => { deviceCounts[d.device_type || 'unknown'] = (deviceCounts[d.device_type || 'unknown'] || 0) + 1; });
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

  // Browser breakdown
  const browserCounts: Record<string, number> = {};
  data.forEach(d => { browserCounts[d.browser || 'Other'] = (browserCounts[d.browser || 'Other'] || 0) + 1; });
  const browserData = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, views]) => ({ name, views }));

  // Referrer sources
  const refCounts: Record<string, number> = {};
  data.forEach(d => {
    let ref = d.referrer || 'Direct';
    if (ref && ref !== 'Direct') {
      try { ref = new URL(ref).hostname; } catch { /* keep as-is */ }
    }
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  });
  const referrerData = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, views]) => ({ source, views }));

  // Recent activity
  const recentActivity = [...data].reverse().slice(0, 20);

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
      {/* Header with range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Website Analytics</h2>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Views" value={totalViews} icon={<Eye className="w-5 h-5" />} subtitle={`Last ${range} days`} />
        <SummaryCard title="Today" value={todayViews} icon={<TrendingUp className="w-5 h-5" />} />
        <SummaryCard title="Unique Visitors" value={uniqueSessions} icon={<Users className="w-5 h-5" />} />
        <SummaryCard title="Pages Tracked" value={Object.keys(pageCounts).length} icon={<Globe className="w-5 h-5" />} subtitle={`Top: ${topPage}`} />
      </div>

      {/* Views Over Time */}
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
            <p className="text-center text-muted-foreground py-12">No data yet. Views will appear as visitors browse your site.</p>
          )}
        </CardContent>
      </Card>

      {/* Top Pages + Device Breakdown */}
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
            ) : (
              <p className="text-center text-muted-foreground py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Device Breakdown</CardTitle></CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser + Referrers */}
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
            ) : (
              <p className="text-center text-muted-foreground py-12">No data yet.</p>
            )}
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
            ) : (
              <p className="text-center text-muted-foreground py-12">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> {row.device_type}
                      </span>
                    </TableCell>
                    <TableCell>{row.browser}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-32 truncate">
                      {row.referrer || 'Direct'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
