import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AppointmentManagement = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase.from('appointment_slots').insert([{
        slot_date: slotDate,
        start_time: startTime,
        end_time: endTime,
      }]);
      if (error) throw error;
      toast.success('Slot added successfully');
      setSlotDate('');
      setStartTime('');
      setEndTime('');
      loadData();
    } catch (error: any) {
      toast.error('Failed to add slot: ' + error.message);
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
        // Mark the slot as unavailable
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
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Slot Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Add Available Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} required className="w-44" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Start Time</label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-36" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">End Time</label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-36" />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-1" /> Add Slot
            </Button>
          </form>
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
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({bookings.length})</CardTitle>
        </CardHeader>
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
      </Card>
    </div>
  );
};

export default AppointmentManagement;
