import { useState, useEffect } from 'react';
import { useRateLimit } from '@/hooks/useRateLimit';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Booking = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const { checkRateLimit } = useRateLimit(10000, 3, 300000);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('is_available', true)
      .gte('slot_date', today)
      .order('slot_date')
      .order('start_time');
    setSlots(data || []);
  };

  // Get unique dates
  const uniqueDates = [...new Set(slots.map(s => s.slot_date))];

  // Get slots for selected date
  const slotsForDate = slots.filter(s => s.slot_date === selectedDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { allowed, message } = checkRateLimit();
    if (!allowed) {
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').insert([{
        slot_id: selectedSlot.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim() || null,
      }]);
      if (error) throw error;
      
      // Send push notification
      import('@/utils/notifications').then(({ sendNotification }) => {
        sendNotification(
          'New Booking',
          `${formData.name.trim()} booked an appointment on ${format(parseISO(selectedSlot.slot_date), 'MMM d, yyyy')}`,
          '/admin'
        );
      });

      // Create Google Calendar event (non-blocking — booking is already saved)
      supabase.functions.invoke('create-booking-event', {
        body: {
          slot_date: selectedSlot.slot_date,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim() || null,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }).then(({ error: calErr }) => {
        if (calErr) console.error('Calendar sync failed:', calErr);
      });

      setStep('success');
    } catch (error: any) {
      toast.error('Failed to book appointment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventTitle = () => 'Appointment with Justice Ansah';
  const getEventDates = () => {
    if (!selectedSlot) return { start: '', end: '' };
    const date = selectedSlot.slot_date.replace(/-/g, '');
    const start = selectedSlot.start_time.replace(/:/g, '').slice(0, 4) + '00';
    const end = selectedSlot.end_time.replace(/:/g, '').slice(0, 4) + '00';
    return { start: `${date}T${start}`, end: `${date}T${end}` };
  };

  const getGoogleCalendarUrl = () => {
    const { start, end } = getEventDates();
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: getEventTitle(),
      dates: `${start}/${end}`,
      details: formData.message || 'Scheduled via portfolio booking.',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const downloadICS = () => {
    const { start, end } = getEventDates();
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Portfolio//Booking//EN',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `DTSTAMP:${now}`,
      `SUMMARY:${getEventTitle()}`,
      `DESCRIPTION:${formData.message || 'Scheduled via portfolio booking.'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    // Use data URI for iOS Safari compatibility
    const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    window.open(dataUri, '_blank');
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setStep('date');
    loadSlots();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Book an Appointment" description="Schedule a meeting or consultation with Justice Ansah." url="/booking" />
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Book an Appointment</h1>
            <p className="text-muted-foreground">Select a date and time that works for you.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Pick a date */}
            {step === 'date' && (
              <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {uniqueDates.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No available slots right now. Please check back later.</CardContent></Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uniqueDates.map(date => (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setStep('time'); }}
                        className="p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-center group"
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="font-semibold text-sm">{format(parseISO(date), 'EEE, MMM d')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {slots.filter(s => s.slot_date === date).length} slot(s)
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Pick a time */}
            {step === 'time' && selectedDate && (
              <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => { setStep('date'); setSelectedSlot(null); }}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to dates
                </Button>
                <h2 className="text-lg font-semibold mb-3">{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slotsForDate.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                      className="p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-center group"
                    >
                      <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="font-medium text-sm">{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Fill form */}
            {step === 'form' && selectedSlot && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => { setStep('time'); setSelectedSlot(null); }}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to times
                </Button>

                <Card className="mb-4">
                  <CardContent className="py-3 flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(parseISO(selectedSlot.slot_date), 'EEE, MMM d, yyyy')}</span>
                    <Clock className="w-4 h-4 text-primary ml-2" />
                    <span>{selectedSlot.start_time.slice(0, 5)} – {selectedSlot.end_time.slice(0, 5)}</span>
                  </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="Your full name" maxLength={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email *</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required placeholder="your@email.com" maxLength={255} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <Input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" maxLength={20} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="What would you like to discuss?" rows={3} maxLength={1000} />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">You'll receive a confirmation email shortly.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                  <Button asChild variant="default">
                    <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                      <Calendar className="w-4 h-4 mr-2" /> Add to Google Calendar
                    </a>
                  </Button>
                  <Button variant="secondary" onClick={downloadICS}>
                    <Calendar className="w-4 h-4 mr-2" /> Download .ics (Apple)
                  </Button>
                </div>
                <Button onClick={resetBooking} variant="outline">Book Another</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
