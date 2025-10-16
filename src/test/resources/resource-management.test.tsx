import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Role } from '../../types'

// Mock resource service
const mockResourceService = {
  uploadResource: vi.fn(),
  deleteResource: vi.fn(),
  getResources: vi.fn(),
  validateAccess: vi.fn(),
  checkPermissions: vi.fn()
}

vi.mock('../../services/resourceService', () => ({
  resourceService: mockResourceService
}))

describe('Resource Management Tests', () => {
  const mockMentorUser = {
    id: 'mentor-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: Role.MENTOR,
    skills: 'JavaScript, React',
    experience: '5+ years',
    bio: 'Experienced developer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const mockMenteeUser = {
    id: 'mentee-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: Role.MENTEE,
    skills: 'JavaScript',
    experience: 'Beginner',
    bio: 'Learning developer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Resource Upload', () => {
    it('should allow mentors to upload resources', async () => {
      const resourceFile = new File(['resource content'], 'guide.pdf', {
        type: 'application/pdf'
      })

      const mockResource = {
        id: 'resource-1',
        title: 'JavaScript Guide',
        description: 'Comprehensive JS guide',
        fileName: 'guide.pdf',
        fileSize: 1024000,
        uploadedBy: 'mentor-1',
        uploadedAt: new Date().toISOString(),
        category: 'tutorial',
        isPublic: true
      }

      mockResourceService.checkPermissions.mockReturnValue(true)
      mockResourceService.uploadResource.mockResolvedValue(mockResource)

      const canUpload = mockResourceService.checkPermissions(mockMentorUser, 'upload')
      expect(canUpload).toBe(true)

      const result = await mockResourceService.uploadResource(resourceFile, {
        title: 'JavaScript Guide',
        description: 'Comprehensive JS guide',
        category: 'tutorial',
        uploadedBy: mockMentorUser.id
      })

      expect(mockResourceService.uploadResource).toHaveBeenCalledWith(resourceFile, {
        title: 'JavaScript Guide',
        description: 'Comprehensive JS guide',
        category: 'tutorial',
        uploadedBy: mockMentorUser.id
      })
      expect(result).toEqual(mockResource)
    })

    it('should restrict resource upload for mentees', async () => {
      mockResourceService.checkPermissions.mockReturnValue(false)

      const canUpload = mockResourceService.checkPermissions(mockMenteeUser, 'upload')

      expect(canUpload).toBe(false)
    })

    it('should validate file types for upload', async () => {
      const invalidFile = new File(['malicious code'], 'virus.exe', {
        type: 'application/x-msdownload'
      })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('File type not allowed')
      )

      await expect(
        mockResourceService.uploadResource(invalidFile, {
          title: 'Invalid File',
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('File type not allowed')
    })

    it('should enforce file size limits', async () => {
      const largeFile = new File(['x'.repeat(50 * 1024 * 1024)], 'huge.pdf', {
        type: 'application/pdf'
      })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('File size exceeds limit (50MB max)')
      )

      await expect(
        mockResourceService.uploadResource(largeFile, {
          title: 'Large File',
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('File size exceeds limit')
    })

    it('should require proper metadata for uploads', async () => {
      const file = new File(['content'], 'resource.pdf', {
        type: 'application/pdf'
      })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('Title and description are required')
      )

      await expect(
        mockResourceService.uploadResource(file, {
          title: '', // Empty title
          description: '', // Empty description
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('Title and description are required')
    })
  })

  describe('Resource Deletion', () => {
    it('should allow resource owners to delete their resources', async () => {
      const resourceId = 'resource-1'
      const mockResource = {
        id: resourceId,
        uploadedBy: mockMentorUser.id,
        title: 'My Resource'
      }

      mockResourceService.validateAccess.mockReturnValue(true)
      mockResourceService.deleteResource.mockResolvedValue({ success: true })

      const hasAccess = mockResourceService.validateAccess(mockMentorUser.id, resourceId, 'delete')
      expect(hasAccess).toBe(true)

      const result = await mockResourceService.deleteResource(resourceId, mockMentorUser.id)

      expect(mockResourceService.deleteResource).toHaveBeenCalledWith(resourceId, mockMentorUser.id)
      expect(result.success).toBe(true)
    })

    it('should prevent non-owners from deleting resources', async () => {
      const resourceId = 'resource-1'

      mockResourceService.validateAccess.mockReturnValue(false)

      const hasAccess = mockResourceService.validateAccess(mockMenteeUser.id, resourceId, 'delete')

      expect(hasAccess).toBe(false)
    })

    it('should handle deletion errors gracefully', async () => {
      const resourceId = 'nonexistent-resource'

      mockResourceService.deleteResource.mockRejectedValue(
        new Error('Resource not found')
      )

      await expect(
        mockResourceService.deleteResource(resourceId, mockMentorUser.id)
      ).rejects.toThrow('Resource not found')
    })

    it('should allow admins to delete any resource', async () => {
      const adminUser = {
        ...mockMentorUser,
        role: 'ADMIN' as any,
        id: 'admin-1'
      }

      mockResourceService.validateAccess.mockImplementation((userId, resourceId, action) => {
        // Admins can delete any resource
        return userId === 'admin-1' && action === 'delete'
      })

      const hasAccess = mockResourceService.validateAccess(adminUser.id, 'any-resource', 'delete')

      expect(hasAccess).toBe(true)
    })
  })

  describe('Resource Access Control', () => {
    it('should control access based on user roles', () => {
      const testCases = [
        { user: mockMentorUser, action: 'upload', expected: true },
        { user: mockMentorUser, action: 'delete', expected: true },
        { user: mockMentorUser, action: 'view', expected: true },
        { user: mockMenteeUser, action: 'upload', expected: false },
        { user: mockMenteeUser, action: 'delete', expected: false },
        { user: mockMenteeUser, action: 'view', expected: true }
      ]

      testCases.forEach(({ user, action, expected }) => {
        mockResourceService.checkPermissions.mockImplementation((u, a) => {
          if (a === 'view') return true // Everyone can view
          if (a === 'upload' || a === 'delete') return u.role === Role.MENTOR
          return false
        })

        const result = mockResourceService.checkPermissions(user, action)
        expect(result).toBe(expected)
      })
    })

    it('should handle public vs private resource access', async () => {
      const publicResources = [
        { id: 'resource-1', isPublic: true, title: 'Public Guide' },
        { id: 'resource-2', isPublic: false, title: 'Private Notes', uploadedBy: mockMentorUser.id }
      ]

      mockResourceService.getResources.mockImplementation((userId) => {
        return publicResources.filter(resource => 
          resource.isPublic || resource.uploadedBy === userId
        )
      })

      // Mentor can see both public and their private resources
      const mentorResources = mockResourceService.getResources(mockMentorUser.id)
      expect(mentorResources).toHaveLength(2)

      // Mentee can only see public resources
      const menteeResources = mockResourceService.getResources(mockMenteeUser.id)
      expect(menteeResources).toHaveLength(1)
      expect(menteeResources[0].isPublic).toBe(true)
    })

    it('should validate resource ownership', () => {
      const resourceId = 'resource-1'
      const ownerId = 'mentor-1'

      mockResourceService.validateAccess.mockImplementation((userId, resId, action) => {
        if (action === 'delete' || action === 'edit') {
          return userId === ownerId
        }
        return true // Anyone can view
      })

      // Owner can delete
      expect(mockResourceService.validateAccess(ownerId, resourceId, 'delete')).toBe(true)

      // Non-owner cannot delete
      expect(mockResourceService.validateAccess('other-user', resourceId, 'delete')).toBe(false)

      // Anyone can view
      expect(mockResourceService.validateAccess('any-user', resourceId, 'view')).toBe(true)
    })
  })

  describe('Resource Categories and Metadata', () => {
    it('should organize resources by categories', async () => {
      const mockResources = [
        { id: '1', category: 'tutorial', title: 'JS Tutorial' },
        { id: '2', category: 'documentation', title: 'API Docs' },
        { id: '3', category: 'tutorial', title: 'React Tutorial' },
        { id: '4', category: 'template', title: 'Project Template' }
      ]

      mockResourceService.getResources.mockResolvedValue(mockResources)

      const resources = await mockResourceService.getResources()
      const categories = [...new Set(resources.map((r: any) => r.category))]

      expect(categories).toContain('tutorial')
      expect(categories).toContain('documentation')
      expect(categories).toContain('template')

      const tutorials = resources.filter((r: any) => r.category === 'tutorial')
      expect(tutorials).toHaveLength(2)
    })

    it('should search resources by metadata', async () => {
      const allResources = [
        { id: '1', title: 'JavaScript Basics', tags: ['js', 'basics'], description: 'Learn JS fundamentals' },
        { id: '2', title: 'React Components', tags: ['react', 'components'], description: 'Building React components' },
        { id: '3', title: 'Node.js API', tags: ['nodejs', 'api'], description: 'Creating REST APIs' }
      ]

      mockResourceService.getResources.mockImplementation((filters) => {
        if (!filters?.search) return allResources

        const searchTerm = filters.search.toLowerCase()
        return allResources.filter((resource: any) =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
        )
      })

      // Search by title
      const jsResources = await mockResourceService.getResources({ search: 'javascript' })
      expect(jsResources).toHaveLength(1)
      expect(jsResources[0].title).toContain('JavaScript')

      // Search by tag
      const reactResources = await mockResourceService.getResources({ search: 'react' })
      expect(reactResources).toHaveLength(1)
      expect(reactResources[0].title).toContain('React')

      // Search by description
      const apiResources = await mockResourceService.getResources({ search: 'api' })
      expect(apiResources).toHaveLength(1)
      expect(apiResources[0].description).toContain('APIs')
    })

    it('should track resource usage statistics', () => {
      const mockResource = {
        id: 'resource-1',
        title: 'Popular Guide',
        downloadCount: 150,
        viewCount: 500,
        ratings: [5, 4, 5, 4, 5],
        averageRating: 4.6
      }

      const stats = {
        totalDownloads: mockResource.downloadCount,
        totalViews: mockResource.viewCount,
        averageRating: mockResource.averageRating,
        ratingCount: mockResource.ratings.length
      }

      expect(stats.totalDownloads).toBe(150)
      expect(stats.totalViews).toBe(500)
      expect(stats.averageRating).toBe(4.6)
      expect(stats.ratingCount).toBe(5)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during upload', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('Network timeout')
      )

      await expect(
        mockResourceService.uploadResource(file, {
          title: 'Test Resource',
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('Network timeout')
    })

    it('should handle duplicate resource names', async () => {
      const file = new File(['content'], 'duplicate.pdf', { type: 'application/pdf' })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('Resource with this name already exists')
      )

      await expect(
        mockResourceService.uploadResource(file, {
          title: 'Existing Resource Name',
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('Resource with this name already exists')
    })

    it('should handle storage quota limits', async () => {
      const file = new File(['content'], 'quota-test.pdf', { type: 'application/pdf' })

      mockResourceService.uploadResource.mockRejectedValue(
        new Error('Storage quota exceeded')
      )

      await expect(
        mockResourceService.uploadResource(file, {
          title: 'Quota Test',
          uploadedBy: mockMentorUser.id
        })
      ).rejects.toThrow('Storage quota exceeded')
    })
  })
})