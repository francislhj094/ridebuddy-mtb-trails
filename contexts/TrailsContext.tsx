import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useRef } from 'react';
import { TRAILS } from '@/constants/trails';
import { trpc } from '@/lib/trpc';

export const [TrailsProvider, useTrails] = createContextHook(() => {
  const hasSynced = useRef(false);
  
  const trailsQuery = trpc.trails.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const syncMutation = trpc.trails.sync.useMutation();
  const rateMutation = trpc.trails.rate.useMutation({
    onSuccess: async () => {
      await trailsQuery.refetch();
    },
  });

  useEffect(() => {
    const syncTrails = async () => {
      if (!hasSynced.current && (!trailsQuery.data || trailsQuery.data.length === 0)) {
        hasSynced.current = true;
        try {
          await syncMutation.mutateAsync(TRAILS);
          await trailsQuery.refetch();
          console.log('Trail data synced with backend');
        } catch (error) {
          console.error('Failed to sync trails:', error);
        }
      }
    };

    syncTrails();
  }, [trailsQuery.data, syncMutation, trailsQuery]);

  const rateTrail = async (trailId: string, rating: number) => {
    try {
      await rateMutation.mutateAsync({ trailId, rating });
    } catch (error) {
      console.error('Failed to rate trail:', error);
      throw error;
    }
  };

  const trails = trailsQuery.data && trailsQuery.data.length > 0 ? trailsQuery.data : TRAILS;

  return {
    trails,
    rateTrail,
    isLoading: trailsQuery.isLoading,
  };
});
