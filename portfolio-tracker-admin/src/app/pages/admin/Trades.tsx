import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Plus, Receipt, TrendingUp, TrendingDown, Loader2, Check, X } from "lucide-react";
import tradeService, { Trade, TradeType, TradeStatus, CreateTradeDto } from "../../../services/tradeService";
import memberService from "../../../services/memberService";
import { toast } from "sonner";

export function AdminTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterMember, setFilterMember] = useState<string>("all");
  const [filterType, setFilterType] = useState<TradeType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TradeStatus | "all">("all");

  // Create trade dialog states
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [newTrade, setNewTrade] = useState({
    memberId: "",
    quantity: "",
    notes: "",
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [currentPage, filterMember, filterType, filterStatus]);

  const loadData = async () => {
    await Promise.all([loadTrades(), loadMembers()]);
    setPageLoading(false);
  };

  const loadTrades = async () => {
    try {
      const filters: any = {};
      if (filterMember && filterMember !== "all") filters.memberId = filterMember;
      if (filterType && filterType !== "all") filters.tradeType = filterType;
      if (filterStatus && filterStatus !== "all") filters.status = filterStatus;

      const result = await tradeService.getAllTrades(currentPage, 10, filters);
      setTrades(result.data);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      console.error('Error loading trades:', error);
      toast.error('Failed to load trades');
    }
  };

  const loadMembers = async () => {
    try {
      const result = await memberService.getAllMembers(1, 100);
      setMembers(result.data);
    } catch (error: any) {
      console.error('Error loading members:', error);
    }
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toISOString().split("T")[0],
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  };

  const handleCreateBuyTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tradeData: CreateTradeDto = {
        memberId: newTrade.memberId,
        tradeType: TradeType.BUY,
        quantity: parseFloat(newTrade.quantity),
        notes: newTrade.notes || undefined,
      };

      await tradeService.createTrade(tradeData);
      toast.success('BUY trade created successfully!');

      // Reset form and reload
      setNewTrade({ memberId: "", quantity: "", notes: "" });
      setIsBuyDialogOpen(false);
      await loadTrades();
    } catch (error: any) {
      console.error('Error creating BUY trade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create BUY trade';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSellTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tradeData: CreateTradeDto = {
        memberId: newTrade.memberId,
        tradeType: TradeType.SELL,
        quantity: parseFloat(newTrade.quantity),
        notes: newTrade.notes || undefined,
      };

      await tradeService.createTrade(tradeData);
      toast.success('SELL trade created successfully!');

      // Reset form and reload
      setNewTrade({ memberId: "", quantity: "", notes: "" });
      setIsSellDialogOpen(false);
      await loadTrades();
    } catch (error: any) {
      console.error('Error creating SELL trade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create SELL trade';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTrade = async (tradeId: string) => {
    try {
      await tradeService.updateTradeStatus(tradeId, { status: TradeStatus.COMPLETED });
      toast.success('Trade approved successfully!');
      await loadTrades();
    } catch (error: any) {
      console.error('Error approving trade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve trade';
      toast.error(errorMessage);
    }
  };

  const handleRejectTrade = async (tradeId: string) => {
    try {
      await tradeService.updateTradeStatus(tradeId, { status: TradeStatus.CANCELLED });
      toast.success('Trade rejected successfully!');
      await loadTrades();
    } catch (error: any) {
      console.error('Error rejecting trade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject trade';
      toast.error(errorMessage);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    try {
      await tradeService.cancelTrade(tradeId);
      toast.success('BUY trade cancelled successfully! Gold reversed from member.');
      await loadTrades();
    } catch (error: any) {
      console.error('Error cancelling trade:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel trade';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>;
      case TradeStatus.COMPLETED:
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case TradeStatus.CANCELLED:
        return <Badge className="bg-red-600 hover:bg-red-700">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading trades...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Create Buttons */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Trade Management</h2>
          <div className="flex gap-3">
            {/* Create BUY Trade Dialog */}
            <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Create BUY
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Create BUY Trade
                  </DialogTitle>
                  <DialogDescription>
                    Admin creates BUY trade. Member receives gold.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBuyTrade} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-member">Member *</Label>
                    <Select
                      value={newTrade.memberId}
                      onValueChange={(value) => setNewTrade({ ...newTrade, memberId: value })}
                      required
                    >
                      <SelectTrigger id="buy-member">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.email}) - {member.goldHoldings}g
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buy-quantity">Quantity (grams) *</Label>
                    <Input
                      id="buy-quantity"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                      required
                      placeholder="0.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buy-notes">Notes (optional)</Label>
                    <Input
                      id="buy-notes"
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create BUY Trade'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Create SELL Trade Dialog */}
            <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-12 px-6 border-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Create SELL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                    Create SELL Trade
                  </DialogTitle>
                  <DialogDescription>
                    Admin creates SELL trade. Member's gold decreases.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSellTrade} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-member">Member *</Label>
                    <Select
                      value={newTrade.memberId}
                      onValueChange={(value) => setNewTrade({ ...newTrade, memberId: value })}
                      required
                    >
                      <SelectTrigger id="sell-member">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.email}) - {member.goldHoldings}g
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sell-quantity">Quantity (grams) *</Label>
                    <Input
                      id="sell-quantity"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                      required
                      placeholder="0.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sell-notes">Notes (optional)</Label>
                    <Input
                      id="sell-notes"
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create SELL Trade'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-member">Member</Label>
                <Select value={filterMember} onValueChange={setFilterMember}>
                  <SelectTrigger id="filter-member">
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All members</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-type">Type</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as TradeType | "all")}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TradeStatus | "all")}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilterMember("all");
                    setFilterType("all");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Receipt className="w-6 h-6" />
              All Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trades found. Create your first trade above.
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-100">
                        <TableHead className="font-semibold">Member</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold">Rate</TableHead>
                        <TableHead className="font-semibold">Total Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade) => {
                        const { date, time } = formatDateTime(trade.createdAt);
                        return (
                          <TableRow key={trade.id} className="hover:bg-blue-50">
                            <TableCell>
                              <div>
                                <div className="font-medium">{trade.memberId.name}</div>
                                <div className="text-sm text-gray-500">{trade.memberId.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={trade.tradeType === TradeType.BUY ? 'bg-green-600' : 'bg-orange-600'}>
                                {trade.tradeType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{trade.quantity}g</TableCell>
                            <TableCell className="font-medium">
                              {formatINR(trade.rateAtTrade)}/g
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatINR(trade.totalAmount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(trade.status)}</TableCell>
                            <TableCell>
                              <div>
                                <div>{date}</div>
                                <div className="text-sm text-gray-500">{time}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {trade.status === TradeStatus.PENDING && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproveTrade(trade.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectTrade(trade.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {trade.status === TradeStatus.COMPLETED && trade.tradeType === TradeType.BUY && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                  onClick={() => handleCancelTrade(trade.id)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {trade.status === TradeStatus.CANCELLED ||
                               (trade.status === TradeStatus.COMPLETED && trade.tradeType === TradeType.SELL) ? (
                                <span className="text-sm text-gray-500">-</span>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
