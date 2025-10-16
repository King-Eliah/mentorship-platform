import { frontendService } from './frontendService';
import { CreateGroupRequest, CreateGroupsRandomRequest } from '../types';

export const groupService = {
  async getGroups() {
    return frontendService.getGroups();
  },
  
  async getGroupById(groupId: string) {
    return frontendService.getGroup(groupId);
  },
  
  async getMyGroups() {
    return frontendService.getMyGroups();
  },
  
  async createGroup(groupData: CreateGroupRequest) {
    return frontendService.createGroup(groupData);
  },
  
  async createGroupsRandomly(request: CreateGroupsRandomRequest) {
    return frontendService.createGroupsRandomly(request);
  },
  
  async updateGroup(groupId: string, groupData: Partial<CreateGroupRequest>) {
    return frontendService.updateGroup(groupId, groupData);
  },
  
  async deleteGroup(groupId: string) {
    return frontendService.deleteGroup(groupId);
  },
  
  async joinGroup(groupId: string) {
    return frontendService.joinGroup(groupId);
  },
  
  async leaveGroup(groupId: string) {
    return frontendService.leaveGroup(groupId);
  },
  
  async getGroupActivity(groupId: string) {
    return frontendService.getGroupActivity(groupId);
  },
  
  async getAvailableUsers() {
    return frontendService.getAvailableUsers();
  }
};

export type { CreateGroupRequest, CreateGroupsRandomRequest };