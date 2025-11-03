import { useApiService } from "./useApiService";
import { AnalyticsService } from "../services/analyticsService";
import { DashboardStats } from "../types";

export function useAnalytics() {
  return useApiService<DashboardStats>(() => AnalyticsService.getDashboardStats(), {
    loadingInitial: true,
  });
}

export function useUserAnalytics(userId: string) {
    return useApiService(() => AnalyticsService.getDashboardStats(userId), {
        loadingInitial: true,
        enabled: !!userId,
    });
}
