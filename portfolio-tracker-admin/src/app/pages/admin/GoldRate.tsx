import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import goldRateService, { GoldRate as GoldRateType, CreateGoldRateDto } from "../../../services/goldRateService";
import { toast } from "sonner";

export function AdminGoldRate() {
  const [goldBuyPrice, setGoldBuyPrice] = useState("");
  const [goldSellPrice, setGoldSellPrice] = useState("");
  const [priceHistory, setPriceHistory] = useState<GoldRateType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadActiveRate(), loadPriceHistory()]);
    setPageLoading(false);
  };

  const loadActiveRate = async () => {
    try {
      const rate = await goldRateService.getActiveRate();
      setGoldBuyPrice(rate.buyPrice.toString());
      setGoldSellPrice(rate.sellPrice.toString());
    } catch (error: any) {
      console.log('No active rate found yet');
      // Don't show error - it's okay if no rate exists yet
    }
  };

  const loadPriceHistory = async (page: number = 1) => {
    try {
      const result = await goldRateService.getAllRates(page, 10);
      setPriceHistory(result.data);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      console.error('Error loading price history:', error);
      toast.error('Failed to load price history');
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

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rateData: CreateGoldRateDto = {
        buyPrice: parseFloat(goldBuyPrice),
        sellPrice: parseFloat(goldSellPrice)
      };

      await goldRateService.createRate(rateData);

      toast.success('Gold rates updated successfully!');

      // Reload data
      await loadActiveRate();
      await loadPriceHistory();
    } catch (error: any) {
      console.error('Error updating rates:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update rates';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="ml-2 text-lg">Loading gold rates...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="w-7 h-7 text-amber-600" />
              Update Gold Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateRate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="gold-buy-price" className="text-lg font-semibold">
                    Gold Buy Price (₹ per gram) *
                  </Label>
                  <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-green-300 p-2">
                    <span className="text-3xl font-bold text-green-600 pl-2">₹</span>
                    <Input
                      id="gold-buy-price"
                      type="number"
                      step="0.01"
                      value={goldBuyPrice}
                      onChange={(e) => setGoldBuyPrice(e.target.value)}
                      className="text-2xl h-16 border-0 focus-visible:ring-0"
                      required
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="gold-sell-price" className="text-lg font-semibold">
                    Gold Sell Price (₹ per gram) *
                  </Label>
                  <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-orange-300 p-2">
                    <span className="text-3xl font-bold text-orange-600 pl-2">₹</span>
                    <Input
                      id="gold-sell-price"
                      type="number"
                      step="0.01"
                      value={goldSellPrice}
                      onChange={(e) => setGoldSellPrice(e.target.value)}
                      className="text-2xl h-16 border-0 focus-visible:ring-0"
                      required
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto h-16 px-12 text-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Rates'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gold Price Update Log</CardTitle>
          </CardHeader>
          <CardContent>
            {priceHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No price history available. Create your first gold rate above.
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-100">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Time</TableHead>
                        <TableHead className="font-semibold">Buy Price</TableHead>
                        <TableHead className="font-semibold">Sell Price</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceHistory.map((entry) => {
                        const { date, time } = formatDateTime(entry.createdAt);
                        return (
                          <TableRow key={entry.id} className="hover:bg-amber-50">
                            <TableCell>{date}</TableCell>
                            <TableCell>{time}</TableCell>
                            <TableCell className="font-medium text-green-700">
                              {formatINR(entry.buyPrice)}
                            </TableCell>
                            <TableCell className="font-medium text-orange-700">
                              {formatINR(entry.sellPrice)}
                            </TableCell>
                            <TableCell>
                              {entry.isActive && (
                                <Badge className="bg-green-600 hover:bg-green-700">
                                  Active
                                </Badge>
                              )}
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
                      onClick={() => loadPriceHistory(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => loadPriceHistory(currentPage + 1)}
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