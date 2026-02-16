import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { UserPlus, Users, Search, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react";
import memberService, { Member, CreateMemberDto, UpdateMemberDto } from "../../../services/memberService";

export function AdminMembers() {
  // State for members list
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const limit = 10;

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // State for create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateMemberDto>({
    name: "",
    email: "",
    password: "",
    phone: "",
    goldHoldings: 0,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateMemberDto>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  /**
   * FETCH MEMBERS
   *
   * Load members from backend API
   */
  const fetchMembers = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (search.trim().length >= 2) {
        // Search members
        setIsSearching(true);
        result = await memberService.searchMembers(search, { page, limit });
      } else {
        // Get all members
        setIsSearching(false);
        result = await memberService.getAllMembers({ page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
      }

      setMembers(result.data);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.pages);
      setTotalMembers(result.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * INITIAL LOAD
   */
  useEffect(() => {
    fetchMembers(1);
  }, []);

  /**
   * SEARCH HANDLER
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMembers(1, searchQuery);
  };

  /**
   * CLEAR SEARCH
   */
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchMembers(1, "");
  };

  /**
   * CREATE MEMBER
   */
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    console.log('Creating member with data:', createFormData);

    try {
      await memberService.createMember(createFormData);

      // Reset form
      setCreateFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        goldHoldings: 0,
      });

      // Close dialog
      setIsCreateDialogOpen(false);

      // Refresh members list
      fetchMembers(currentPage, searchQuery);
    } catch (err: any) {
      console.error('Error creating member:', err);
      console.error('Error response:', err.response?.data);

      // Extract validation errors from nested structure
      const responseData = err.response?.data;
      let errorMessage = 'Failed to create member';

      if (responseData) {
        // Check for validation errors in data.validationErrors
        if (responseData.data?.validationErrors) {
          const validationErrors = responseData.data.validationErrors;
          // Flatten nested arrays of validation messages
          const messages = validationErrors.flat().filter(Boolean);
          errorMessage = messages.length > 0 ? messages.join(', ') : responseData.message;
        } else if (responseData.message) {
          errorMessage = Array.isArray(responseData.message)
            ? responseData.message.join(', ')
            : responseData.message;
        } else if (responseData.error_description) {
          errorMessage = responseData.error_description;
        }
      }

      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * OPEN EDIT DIALOG
   */
  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      phone: member.phone,
      goldHoldings: member.goldHoldings,
    });
    setEditError(null);
    setIsEditDialogOpen(true);
  };

  /**
   * UPDATE MEMBER
   */
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await memberService.updateMember(editingMember.id, editFormData);

      // Close dialog
      setIsEditDialogOpen(false);
      setEditingMember(null);
      setEditFormData({});

      // Refresh members list
      fetchMembers(currentPage, searchQuery);
    } catch (err: any) {
      console.error('Error updating member:', err);
      console.error('Error response:', err.response?.data);

      // Extract validation errors from nested structure
      const responseData = err.response?.data;
      let errorMessage = 'Failed to update member';

      if (responseData) {
        if (responseData.data?.validationErrors) {
          const validationErrors = responseData.data.validationErrors;
          const messages = validationErrors.flat().filter(Boolean);
          errorMessage = messages.length > 0 ? messages.join(', ') : responseData.message;
        } else if (responseData.message) {
          errorMessage = Array.isArray(responseData.message)
            ? responseData.message.join(', ')
            : responseData.message;
        } else if (responseData.error_description) {
          errorMessage = responseData.error_description;
        }
      }

      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * TOGGLE MEMBER STATUS
   */
  const handleToggleStatus = async (id: string) => {
    try {
      await memberService.toggleMemberStatus(id);
      fetchMembers(currentPage, searchQuery);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle member status');
      console.error('Error toggling status:', err);
    }
  };

  /**
   * DELETE MEMBER
   */
  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will deactivate the member account.`)) {
      return;
    }

    try {
      await memberService.deleteMember(id);
      fetchMembers(currentPage, searchQuery);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete member');
      console.error('Error deleting member:', err);
    }
  };

  /**
   * PAGINATION HANDLERS
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchMembers(newPage, searchQuery);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchMembers(newPage, searchQuery);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Member Management</h2>
            <p className="text-gray-500 mt-1">
              {totalMembers} {totalMembers === 1 ? 'member' : 'members'} total
            </p>
          </div>

          {/* Add Member Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 px-8">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>Enter the details of the new member</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateMember} className="space-y-4 mt-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="create-name">Full Name *</Label>
                  <Input
                    id="create-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Password *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    required
                    minLength={8}
                    placeholder="Example: SecurePass@123"
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-medium">
                      Requirements: Min 8 chars • Uppercase • Lowercase • Number • Special (@$!%*?&)
                    </p>
                    <p className="text-xs text-green-600">
                      ✓ Example: <span className="font-mono bg-green-50 px-1.5 py-0.5 rounded">SecurePass@123</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone Number *</Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    required
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-gold">Initial Gold Holdings (grams)</Label>
                  <Input
                    id="create-gold"
                    type="number"
                    step="0.1"
                    min="0"
                    value={createFormData.goldHoldings}
                    onChange={(e) => setCreateFormData({ ...createFormData, goldHoldings: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <Button type="submit" className="w-full h-12" disabled={createLoading}>
                  {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {createLoading ? 'Creating...' : 'Add Member'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name or email (min 2 characters)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading || searchQuery.trim().length < 2}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              {isSearching && (
                <Button type="button" variant="outline" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              {isSearching ? `Search Results (${totalMembers})` : 'Members List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {isSearching ? 'No members found matching your search.' : 'No members yet. Add your first member!'}
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Gold Holdings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.goldHoldings.toFixed(1)}g</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={member.isActive}
                                onCheckedChange={() => handleToggleStatus(member.id)}
                              />
                              <span className={member.isActive ? "text-green-600" : "text-gray-400"}>
                                {member.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEdit(member)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>Update member information</DialogDescription>
            </DialogHeader>

            {editingMember && (
              <form onSubmit={handleUpdateMember} className="space-y-4 mt-4">
                {editError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{editError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email (cannot be changed)</Label>
                  <Input
                    id="edit-email"
                    value={editingMember.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-gold">Gold Holdings (grams)</Label>
                  <Input
                    id="edit-gold"
                    type="number"
                    step="0.1"
                    min="0"
                    value={editFormData.goldHoldings || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, goldHoldings: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={editLoading}>
                    {editLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editLoading ? 'Updating...' : 'Update Member'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
