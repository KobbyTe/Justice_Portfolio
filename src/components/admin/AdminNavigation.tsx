import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, UserRound, TrendingUp, Cpu, Sparkles, Award, Folder, FileText, Film, Share2, Briefcase, MessageSquareQuote, Images, Heart, CalendarDays, ChartNoAxesCombined, Handshake } from 'lucide-react';

const groups = [
  { label: 'Portfolio', sections: [
    { value: 'hero', label: 'Hero', icon: Image }, { value: 'about', label: 'About', icon: UserRound },
    { value: 'impact', label: 'Impact', icon: TrendingUp }, { value: 'tech', label: 'Tech Stack', icon: Cpu },
    { value: 'skills', label: 'Skills', icon: Sparkles }, { value: 'certificates', label: 'Certificates', icon: Award },
    { value: 'projects', label: 'Projects', icon: Folder }, { value: 'resume', label: 'Resume', icon: Briefcase },
  ] },
  { label: 'Media', sections: [
    { value: 'blog', label: 'Blog', icon: FileText }, { value: 'vlogs', label: 'Vlogs', icon: Film },
    { value: 'gallery', label: 'Gallery', icon: Images },
  ] },
  { label: 'Community & activity', sections: [
    { value: 'social', label: 'Social', icon: Share2 }, { value: 'recommendations', label: 'Testimonials', icon: MessageSquareQuote },
    { value: 'wall', label: 'Wall', icon: Heart }, { value: 'appointments', label: 'Bookings', icon: CalendarDays },
    { value: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined }, { value: 'logos', label: 'Logos', icon: Handshake },
  ] },
];

export default function AdminNavigation({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <>
    <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
      <span id="admin-section-label" className="mb-2 block text-xs font-medium uppercase text-muted-foreground">Manage section</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-labelledby="admin-section-label" className="h-12 w-full bg-card text-base"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-[65dvh] min-w-[var(--radix-select-trigger-width)]">
          {groups.map(group => <SelectGroup key={group.label}>
            <SelectLabel className="py-3 text-xs text-muted-foreground">{group.label}</SelectLabel>
            {group.sections.map(section => <SelectItem key={section.value} value={section.value} className="min-h-12 text-base">
              <span className="flex items-center gap-3"><section.icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />{section.label}</span>
            </SelectItem>)}
          </SelectGroup>)}
        </SelectContent>
      </Select>
    </div>
    <TabsList aria-label="Admin sections" className="hidden h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/40 p-2 lg:flex">
      {groups.flatMap(group => group.sections).map(section => <TabsTrigger key={section.value} value={section.value} className="min-h-12 gap-2 rounded-md px-3">
        <section.icon aria-hidden="true" className="h-4 w-4" />{section.label}
      </TabsTrigger>)}
    </TabsList>
  </>;
}