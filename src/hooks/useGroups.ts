import { useApiService, usePaginatedApi, useMutation } from "./useApiService";
import { groupService, CreateGroupRequest, UpdateGroupRequest } from "../services/groupService";

export function useGroups(filters = {}) {
  return usePaginatedApi(
    (page, size) => groupService.getGroups({ ...filters, page, size }),
    { loadingInitial: true }
  );
}

export function useGroup(groupId: string) {
  return useApiService(() => groupService.getGroupById(groupId), {
    loadingInitial: true,
    enabled: !!groupId,
  });
}

export function useMyGroups() {
  return useApiService(() => groupService.getMyGroups(), {
    loadingInitial: true,
  });
}

export function useCreateGroup() {
  return useMutation((groupData: CreateGroupRequest) =>
    groupService.createGroup(groupData)
  );
}

export function useUpdateGroup(groupId: string) {
  return useMutation((groupData: UpdateGroupRequest) =>
    groupService.updateGroup(groupId, groupData)
  );
}

export function useDeleteGroup(groupId: string) {
  return useMutation(() => groupService.deleteGroup(groupId));
}

export function useJoinGroup() {
    return useMutation((groupId: string) => groupService.joinGroup(groupId));
}

export function useLeaveGroup() {
    return useMutation((groupId: string) => groupService.leaveGroup(groupId));
}

export function useGroupActivity(groupId: string) {
  return useApiService(() => groupService.getGroupActivity(groupId), {
    loadingInitial: true,
    enabled: !!groupId,
  });
}
