import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Clock, User, Mail, Phone, MessageSquare, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AppointmentManagement = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsOpen, setBookingsOpen] = useState(true);

  // Bulk scheduling state
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return format(start, 'yyyy-MM-dd');
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: '09:00', end: '10:00' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [slotsRes, bookingsRes] = await Promise.all([
      supabase.from('appointment_slots').select('*').order('slot_date', { ascending: true }).order('start_time', { ascending: true }),
      supabase.from('bookings').select('*, appointment_slots(slot_date, start_time, end_time)').order('created_at', { ascending: false }),
    ]);
    setSlots(slotsRes.data || []);
    setBookings(bookingsRes.data || []);
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const selectAllDays = () => {
    if (selectedDays.length === 7) {
      setSelectedDays([]);
    } else {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const selectWeekdays = () => {
    setSelectedDays([0, 1, 2, 3, 4]);
  };

  const addTimeSlot = () => {
    const last = timeSlots[timeSlots.length - 1];
    const nextStart = last?.end || '09:00';
    const [h, m] = nextStart.split(':').map(Number);
    const nextEnd = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setTimeSlots(prev => [...prev, { start: nextStart, end: nextEnd }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    setTimeSlots(prev => prev.map((ts, i) => i === index ? { ...ts, [field]: value } : ts));
  };

  const handleBulkAdd = async () => {
    if (selectedDays.length === 0) {
      toast.error('Select at least one day');
      return;
    }
    if (timeSlots.length === 0 || timeSlots.some(ts => !ts.start || !ts.end)) {
      toast.error('Add at least one complete time slot');
      return;
    }

    const weekStart = parseISO(weekStartDate);
    const slotsToInsert: { slot_date: string; start_time: string; end_time: string }[] = [];

    for (const dayIndex of selectedDays) {
      const date = addDays(weekStart, dayIndex);
      const dateStr = format(date, 'yyyy-MM-dd');
      for (const ts of timeSlots) {
        slotsToInsert.push({ slot_date: dateStr, start_time: ts.start, end_time: ts.end });
      }
    }

    try {
      const { error } = await supabase.from('appointment_slots').insert(slotsToInsert);
      if (error) throw error;
      toast.success(`${slotsToInsert.length} slot(s) added successfully`);
      loadData();
    } catch (error: any) {
      toast.error('Failed to add slots: ' + error.message);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const { error } = await supabase.from('appointment_slots').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slot deleted');
      loadData();
    } catch {
      toast.error('Failed to delete slot');
    }
  };

  const handleToggleSlot = async (id: string, currentAvailability: boolean) => {
    try {
      const { error } = await supabase.from('appointment_slots').update({ is_available: !currentAvailability }).eq('id', id);
      if (error) throw error;
      toast.success(`Slot ${!currentAvailability ? 'enabled' : 'disabled'}`);
      loadData();
    } catch {
      toast.error('Failed to update slot');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      if (status === 'confirmed') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          await supabase.from('appointment_slots').update({ is_available: false }).eq('id', booking.slot_id);
        }
      }
      toast.success(`Booking ${status}`);
      loadData();
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      toast.success('Booking deleted');
      loadData();
    } catch {
      toast.error('Failed to delete booking');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default' as const;
      case 'cancelled': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  const weekStart = parseISO(weekStartDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      {/* Bulk Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            Bulk Schedule Slots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Week selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Week starting</label>
            <Input
              type="date"
              value={weekStartDate}
              onChange={e => setWeekStartDate(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Day picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Select days</label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={selectWeekdays} className="text-xs h-7">
                  Weekdays
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={selectAllDays} className="text-xs h-7">
                  {selectedDays.length === 7 ? 'Clear all' : 'All'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                    selectedDays.includes(i)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-[10px] opacity-70">{format(weekDates[i], 'MMM d')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Time slots</label>
            <div className="space-y-2">
              {timeSlots.map((ts, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={ts.start}
                    onChange={e => updateTimeSlot(i, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={ts.end}
                    onChange={e => updateTimeSlot(i, 'end', e.target.value)}
                    className="w-32"
                  />
                  {timeSlots.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeTimeSlot(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addTimeSlot} className="mt-1">
                <Plus className="w-3 h-3 mr-1" /> Add time slot
              </Button>
            </div>
          </div>

          {/* Summary + submit */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedDays.length > 0 && timeSlots.length > 0
                ? `Will create ${selectedDays.length * timeSlots.length} slot(s)`
                : 'Select days and times'}
            </p>
            <Button onClick={handleBulkAdd} disabled={selectedDays.length === 0 || timeSlots.length === 0}>
              <CalendarPlus className="w-4 h-4 mr-1" /> Create Slots
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Available Slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-muted-foreground text-sm">No slots created yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{format(new Date(slot.slot_date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant={slot.is_available ? 'outline' : 'secondary'} onClick={() => handleToggleSlot(slot.id, slot.is_available)}>
                      {slot.is_available ? 'Available' : 'Disabled'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSlot(slot.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings */}
      <Collapsible open={bookingsOpen} onOpenChange={setBookingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span>Bookings ({bookings.length})</span>
                {bookingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking.id} className="p-4 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusColor(booking.status)}>{booking.status}</Badge>
                          {booking.appointment_slots && (
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(booking.appointment_slots.slot_date + 'T00:00:00'), 'MMM d, yyyy')} · {booking.appointment_slots.start_time.slice(0, 5)} – {booking.appointment_slots.end_time.slice(0, 5)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>Confirm</Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>Cancel</Button>
                            </>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {booking.name}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {booking.email}</span>
                        {booking.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</span>}
                        {booking.message && <span className="flex items-center gap-1 col-span-full"><MessageSquare className="w-3 h-3" /> {booking.message}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default AppointmentManagement;
