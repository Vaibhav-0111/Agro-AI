import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Field = Database['public']['Tables']['fields']['Row'];
type Sensor = Database['public']['Tables']['sensors']['Row'];
type SensorReading = Database['public']['Tables']['sensor_readings']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export type { Field, Sensor, SensorReading, Alert };

export function useFields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchFields = async () => {
      try {
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setFields(data || []);
      } catch (error) {
        console.error('Error fetching fields:', error);
        toast.error('Failed to load fields');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();

    // Realtime: keep fields in sync for this user
    const channel = supabase
      .channel('fields-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fields',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Re-fetch to keep derived lists and ordering correct
          fetchFields();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { fields, loading, setFields };
}

export function useSensors(fieldId?: string) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        let query = supabase
          .from('sensors')
          .select(`
            *,
            fields!inner(user_id)
          `);

        if (fieldId) {
          query = query.eq('field_id', fieldId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setSensors(data || []);
      } catch (error) {
        console.error('Error fetching sensors:', error);
        toast.error('Failed to load sensors');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();

    // Realtime: subscribe to sensor changes; we re-fetch to respect joins and filters
    const channel = supabase
      .channel('sensors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensors'
        },
        () => {
          fetchSensors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fieldId]);

  return { sensors, loading };
}

export function useSensorReadings(sensorId?: string, limit: number = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sensorId) return;

    const fetchReadings = async () => {
      try {
        const { data, error } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('sensor_id', sensorId)
          .order('recorded_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setReadings(data || []);
      } catch (error) {
        console.error('Error fetching sensor readings:', error);
        toast.error('Failed to load sensor readings');
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();

    // Realtime: stream new readings for this sensor
    const channel = supabase
      .channel(`sensor-readings-${sensorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `sensor_id=eq.${sensorId}`
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          // Prepend and cap to limit to keep UI performant
          setReadings(prev => [newReading, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sensorId, limit]);

  return { readings, loading };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setAlerts(data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        toast.error('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Set up real-time subscription for alerts
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Alert change received:', payload);
          fetchAlerts(); // Refetch alerts when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Failed to mark alert as read');
    }
  };

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { 
            ...alert, 
            is_resolved: true, 
            resolved_at: new Date().toISOString() 
          } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
      toast.error('Failed to mark alert as resolved');
    }
  };

  return { alerts, loading, markAsRead, markAsResolved };
}

export function useRealtimeSensorReadings() {
  const [latestReadings, setLatestReadings] = useState<Record<string, SensorReading>>({});

  useEffect(() => {
    // Subscribe to real-time sensor readings
    const channel = supabase
      .channel('sensor-readings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          setLatestReadings(prev => ({
            ...prev,
            [newReading.sensor_id]: newReading
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { latestReadings };
}
