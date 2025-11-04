import { useApiService, useMutation } from "./useApiService";
import { notificationService } from "../services/notificationService";
import { useEffect } from "react";

export function useNotifications(filters = {}) {
  const { data, loading, execute } = useApiService(
    () => notificationService.getNotifications(filters),
    { loadingInitial: false }
  );

  // Load on mount
  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items: data?.notifications || [],
    loading,
    unreadCount: data?.unreadCount || 0,
    refresh: execute
  };
}

export function useMarkAsRead() {
  return useMutation((notificationId: string) =>
    notificationService.markAsRead(notificationId)
  );
}

export function useMarkAllAsRead() {
  return useMutation(() => notificationService.markAllAsRead());
}

export function useNotificationCount() {
  return useApiService(() => notificationService.getNotificationCount());
}
