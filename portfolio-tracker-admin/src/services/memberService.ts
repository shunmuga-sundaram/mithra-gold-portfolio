import api from './api';

/**
 * MEMBER SERVICE
 *
 * API calls for Member CRUD operations
 *
 * All endpoints require admin authentication (JWT token automatically attached by api.ts)
 *
 * Base URL: /members
 */

/**
 * Member Interface
 *
 * Matches backend Member model structure
 */
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  goldHoldings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Member DTO
 *
 * Required fields for creating a new member
 */
export interface CreateMemberDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  goldHoldings?: number;
}

/**
 * Update Member DTO
 *
 * Optional fields for updating a member
 */
export interface UpdateMemberDto {
  name?: string;
  phone?: string;
  goldHoldings?: number;
}

/**
 * Pagination Result
 *
 * Paginated response from backend
 */
export interface PaginatedMembers {
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Member Statistics
 */
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
}

/**
 * Query Options
 */
export interface MemberQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  activeOnly?: boolean;
}

/**
 * MEMBER SERVICE - API Methods
 */
const memberService = {
  /**
   * GET ALL MEMBERS
   *
   * Endpoint: GET /members
   *
   * @param options - Pagination and filter options
   * @returns Promise<PaginatedMembers>
   *
   * Example:
   * const result = await memberService.getAllMembers({ page: 1, limit: 10 });
   */
  getAllMembers: async (options: MemberQueryOptions = {}): Promise<PaginatedMembers> => {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.activeOnly) params.append('activeOnly', 'true');

    const response = await api.get<PaginatedMembers>(`/members?${params.toString()}`);
    return response.data;
  },

  /**
   * GET MEMBER BY ID
   *
   * Endpoint: GET /members/:id
   *
   * @param id - Member ID
   * @returns Promise<Member>
   *
   * Example:
   * const member = await memberService.getMemberById("507f1f77bcf86cd799439011");
   */
  getMemberById: async (id: string): Promise<Member> => {
    const response = await api.get<Member>(`/members/${id}`);
    return response.data;
  },

  /**
   * CREATE MEMBER
   *
   * Endpoint: POST /members
   *
   * @param memberData - Member creation data
   * @returns Promise<Member>
   *
   * Example:
   * const member = await memberService.createMember({
   *   name: "John Doe",
   *   email: "john@example.com",
   *   password: "SecurePass@123",
   *   phone: "+1234567890"
   * });
   */
  createMember: async (memberData: CreateMemberDto): Promise<Member> => {
    const response = await api.post<Member>('/members', memberData);
    return response.data;
  },

  /**
   * UPDATE MEMBER
   *
   * Endpoint: PUT /members/:id
   *
   * @param id - Member ID
   * @param updateData - Fields to update
   * @returns Promise<Member>
   *
   * Example:
   * const updated = await memberService.updateMember(id, {
   *   name: "Jane Doe",
   *   phone: "+9876543210"
   * });
   */
  updateMember: async (id: string, updateData: UpdateMemberDto): Promise<Member> => {
    const response = await api.put<Member>(`/members/${id}`, updateData);
    return response.data;
  },

  /**
   * TOGGLE MEMBER STATUS
   *
   * Endpoint: PATCH /members/:id/toggle-status
   *
   * @param id - Member ID
   * @returns Promise<Member>
   *
   * Example:
   * const member = await memberService.toggleMemberStatus(id);
   * // member.isActive is now toggled
   */
  toggleMemberStatus: async (id: string): Promise<Member> => {
    const response = await api.patch<Member>(`/members/${id}/toggle-status`);
    return response.data;
  },

  /**
   * DELETE MEMBER (SOFT DELETE)
   *
   * Endpoint: DELETE /members/:id
   *
   * @param id - Member ID
   * @returns Promise<Member>
   *
   * Note: This is a soft delete (sets isActive = false)
   *
   * Example:
   * const deleted = await memberService.deleteMember(id);
   * // deleted.isActive === false
   */
  deleteMember: async (id: string): Promise<Member> => {
    const response = await api.delete<Member>(`/members/${id}`);
    return response.data;
  },

  /**
   * SEARCH MEMBERS
   *
   * Endpoint: GET /members/search
   *
   * @param query - Search term (min 2 characters)
   * @param options - Pagination options
   * @returns Promise<PaginatedMembers>
   *
   * Example:
   * const results = await memberService.searchMembers("john", { page: 1, limit: 10 });
   */
  searchMembers: async (query: string, options: MemberQueryOptions = {}): Promise<PaginatedMembers> => {
    const params = new URLSearchParams();

    params.append('query', query);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get<PaginatedMembers>(`/members/search?${params.toString()}`);
    return response.data;
  },

  /**
   * GET MEMBER STATISTICS
   *
   * Endpoint: GET /members/stats
   *
   * @returns Promise<MemberStats>
   *
   * Example:
   * const stats = await memberService.getStats();
   * // { total: 100, active: 85, inactive: 15 }
   */
  getStats: async (): Promise<MemberStats> => {
    const response = await api.get<MemberStats>('/members/stats');
    return response.data;
  },
};

export default memberService;

/**
 * USAGE EXAMPLES:
 *
 * // Get all members (first page)
 * const members = await memberService.getAllMembers({ page: 1, limit: 10 });
 *
 * // Get active members only
 * const activeMembers = await memberService.getAllMembers({ activeOnly: true });
 *
 * // Search members
 * const results = await memberService.searchMembers("john");
 *
 * // Create member
 * const newMember = await memberService.createMember({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePass@123",
 *   phone: "+1234567890"
 * });
 *
 * // Update member
 * const updated = await memberService.updateMember(memberId, {
 *   name: "Jane Doe"
 * });
 *
 * // Toggle status
 * const toggled = await memberService.toggleMemberStatus(memberId);
 *
 * // Delete member
 * const deleted = await memberService.deleteMember(memberId);
 *
 * // Get statistics
 * const stats = await memberService.getStats();
 *
 * ERROR HANDLING:
 *
 * try {
 *   const member = await memberService.createMember(data);
 * } catch (error: any) {
 *   if (error.response) {
 *     // Server responded with error
 *     console.error('Error:', error.response.data.message);
 *
 *     // Handle specific errors
 *     if (error.response.status === 409) {
 *       alert('Email already exists');
 *     }
 *   } else {
 *     // Network error
 *     console.error('Network error:', error.message);
 *   }
 * }
 */
