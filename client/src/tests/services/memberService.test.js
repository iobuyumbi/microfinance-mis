import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memberService } from '@/services/memberService';
import { mockApiResponse, mockApiError, createMockUser } from '../setup';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

import api from '@/lib/axios';

describe('memberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should fetch all members successfully', async () => {
      const mockMembers = [
        createMockUser({ name: 'John Doe' }),
        createMockUser({ name: 'Jane Smith' })
      ];
      
      api.get.mockResolvedValue(mockApiResponse(mockMembers));
      
      const result = await memberService.getMembers();
      
      expect(api.get).toHaveBeenCalledWith('/members');
      expect(result.data).toEqual(mockMembers);
    });

    it('should handle API errors', async () => {
      api.get.mockRejectedValue(mockApiError('Network error'));
      
      await expect(memberService.getMembers()).rejects.toThrow('Network error');
    });

    it('should pass query parameters correctly', async () => {
      const params = { status: 'active', page: 1, limit: 10 };
      api.get.mockResolvedValue(mockApiResponse([]));
      
      await memberService.getMembers(params);
      
      expect(api.get).toHaveBeenCalledWith('/members', { params });
    });
  });

  describe('getMemberById', () => {
    it('should fetch member by ID successfully', async () => {
      const mockMember = createMockUser({ name: 'John Doe' });
      api.get.mockResolvedValue(mockApiResponse(mockMember));
      
      const result = await memberService.getMemberById('123');
      
      expect(api.get).toHaveBeenCalledWith('/members/123');
      expect(result.data).toEqual(mockMember);
    });

    it('should handle member not found', async () => {
      api.get.mockRejectedValue(mockApiError('Member not found', 404));
      
      await expect(memberService.getMemberById('invalid-id')).rejects.toThrow('Member not found');
    });
  });

  describe('createMember', () => {
    it('should create member successfully', async () => {
      const memberData = {
        name: 'New Member',
        email: 'new@example.com',
        phone: '1234567890'
      };
      const createdMember = createMockUser(memberData);
      
      api.post.mockResolvedValue(mockApiResponse(createdMember, 201));
      
      const result = await memberService.createMember(memberData);
      
      expect(api.post).toHaveBeenCalledWith('/members', memberData);
      expect(result.data).toEqual(createdMember);
    });

    it('should handle validation errors', async () => {
      const invalidData = { name: '' };
      api.post.mockRejectedValue(mockApiError('Name is required', 400));
      
      await expect(memberService.createMember(invalidData)).rejects.toThrow('Name is required');
    });
  });

  describe('updateMember', () => {
    it('should update member successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedMember = createMockUser(updateData);
      
      api.put.mockResolvedValue(mockApiResponse(updatedMember));
      
      const result = await memberService.updateMember('123', updateData);
      
      expect(api.put).toHaveBeenCalledWith('/members/123', updateData);
      expect(result.data).toEqual(updatedMember);
    });
  });

  describe('deleteMember', () => {
    it('should delete member successfully', async () => {
      api.delete.mockResolvedValue(mockApiResponse({ message: 'Member deleted' }));
      
      const result = await memberService.deleteMember('123');
      
      expect(api.delete).toHaveBeenCalledWith('/members/123');
      expect(result.data.message).toBe('Member deleted');
    });

    it('should handle delete errors', async () => {
      api.delete.mockRejectedValue(mockApiError('Cannot delete member with active loans', 400));
      
      await expect(memberService.deleteMember('123')).rejects.toThrow('Cannot delete member with active loans');
    });
  });

  describe('getMemberStats', () => {
    it('should fetch member statistics successfully', async () => {
      const mockStats = {
        totalMembers: 100,
        activeMembers: 85,
        newThisMonth: 12,
        averageAge: 35
      };
      
      api.get.mockResolvedValue(mockApiResponse(mockStats));
      
      const result = await memberService.getMemberStats();
      
      expect(api.get).toHaveBeenCalledWith('/members/stats');
      expect(result.data).toEqual(mockStats);
    });
  });

  describe('searchMembers', () => {
    it('should search members successfully', async () => {
      const searchResults = [createMockUser({ name: 'John Doe' })];
      api.get.mockResolvedValue(mockApiResponse(searchResults));
      
      const result = await memberService.searchMembers('John');
      
      expect(api.get).toHaveBeenCalledWith('/members/search', { params: { q: 'John' } });
      expect(result.data).toEqual(searchResults);
    });

    it('should handle empty search results', async () => {
      api.get.mockResolvedValue(mockApiResponse([]));
      
      const result = await memberService.searchMembers('nonexistent');
      
      expect(result.data).toEqual([]);
    });
  });

  describe('updateMemberStatus', () => {
    it('should update member status successfully', async () => {
      const updatedMember = createMockUser({ status: 'inactive' });
      api.put.mockResolvedValue(mockApiResponse(updatedMember));
      
      const result = await memberService.updateMemberStatus('123', 'inactive');
      
      expect(api.put).toHaveBeenCalledWith('/members/123/status', { status: 'inactive' });
      expect(result.data.status).toBe('inactive');
    });
  });

  describe('getMemberTransactions', () => {
    it('should fetch member transactions successfully', async () => {
      const mockTransactions = [
        { id: '1', amount: 100, type: 'deposit' },
        { id: '2', amount: 50, type: 'withdrawal' }
      ];
      
      api.get.mockResolvedValue(mockApiResponse(mockTransactions));
      
      const result = await memberService.getMemberTransactions('123');
      
      expect(api.get).toHaveBeenCalledWith('/members/123/transactions');
      expect(result.data).toEqual(mockTransactions);
    });
  });

  describe('getMemberLoans', () => {
    it('should fetch member loans successfully', async () => {
      const mockLoans = [
        { id: '1', amount: 5000, status: 'active' },
        { id: '2', amount: 3000, status: 'paid' }
      ];
      
      api.get.mockResolvedValue(mockApiResponse(mockLoans));
      
      const result = await memberService.getMemberLoans('123');
      
      expect(api.get).toHaveBeenCalledWith('/members/123/loans');
      expect(result.data).toEqual(mockLoans);
    });
  });
});
