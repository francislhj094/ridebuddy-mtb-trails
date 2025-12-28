import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';

const BOOKMARKS_KEY = '@ridebuddy_bookmarks';

export const [BookmarksProvider, useBookmarks] = createContextHook(() => {
  const { user } = useAuth();

  const bookmarksQuery = trpc.bookmarks.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const toggleMutation = trpc.bookmarks.toggle.useMutation({
    onSuccess: async () => {
      await bookmarksQuery.refetch();
    },
  });

  const toggleBookmark = async (trailId: string) => {
    try {
      await toggleMutation.mutateAsync({ trailId });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      const current = bookmarksQuery.data || [];
      const isBookmarked = current.includes(trailId);
      const updated = isBookmarked
        ? current.filter(id => id !== trailId)
        : [...current, trailId];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    }
  };

  const isBookmarked = (trailId: string): boolean => {
    return (bookmarksQuery.data || []).includes(trailId);
  };

  return {
    bookmarkedTrailIds: bookmarksQuery.data || [],
    isLoading: bookmarksQuery.isLoading,
    toggleBookmark,
    isBookmarked
  };
});
