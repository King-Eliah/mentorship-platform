import { usePaginatedApi, useMutation, useApiService } from "./useApiService";
import { resourceService, UploadResourceRequest } from "../services/resourceService";

/**
 * Fetches a paginated list of resources.
 * @param filters - Optional filters for the query.
 */
export function useResources(filters: object = {}) {
  return usePaginatedApi(
    (page, size) => resourceService.getResources({ ...filters, page, size }),
    { loadingInitial: true }
  );
}

/**
 * Fetches a single resource by its ID.
 * @param id - The ID of the resource to fetch.
 * @param options - Options for the api service, e.g., { enabled: false }.
 */
export function useResource(id: string, options?: { enabled: boolean }) {
    return useApiService(
        () => resourceService.getResourceById(id),
        { ...options, loadingInitial: options?.enabled }
    );
}

/**
 * Provides a mutation function for uploading a new resource.
 * The mutation function expects an object with `file` and `resourceData`.
 */
export function useUploadResource() {
    return useMutation(
        (data: { file: File, resourceData: UploadResourceRequest }) => 
            resourceService.uploadResource(data.file, data.resourceData)
    );
}

/**
 * Provides a mutation function for deleting a resource.
 */
export function useDeleteResource() {
    return useMutation(
        (resourceId: string) => resourceService.deleteResource(resourceId)
    );
}

/**
 * Fetches resource statistics.
 */
export function useResourceStats() {
    return useApiService(
        () => resourceService.getResourceStats(),
        { loadingInitial: true }
    );
}


