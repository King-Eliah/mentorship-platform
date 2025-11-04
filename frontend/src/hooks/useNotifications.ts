import { useApiService, usePaginatedApi, useMutation } from "./useApiService";
import { notificationService } from "../services/notificationService";

export function useNotifications(filters = {}) {
  return usePaginatedApi(
    (page, size) =>
      notificationService.getNotifications({ ...filters, page, size }),
    { loadingInitial: true }
  );
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
