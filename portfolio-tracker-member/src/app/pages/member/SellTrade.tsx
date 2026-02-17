import { useState, useEffect } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { TrendingDown, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import goldRateService, { GoldRate } from "../../../services/goldRateService";
import tradeService, { Trade, TradeType, TradeStatus } from "../../../services/tradeService";
import authService from "../../../services/authService";

export function MemberSellTrade() {
  const navigate = useNavigate();

  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [goldHoldings, setGoldHoldings] = useState<number>(0);
  const [buyTransactions, setBuyTransactions] = useState<Trade[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch active gold rate and member trades in parallel
      const [rate, tradesResponse] = await Promise.all([
        goldRateService.getActiveRate(),
        tradeService.getMyTrades(1, 100)
      ]);

      setGoldRate(rate);

      // Filter only COMPLETED BUY transactions
      const completedBuyTrades = tradesResponse.data.filter(
        (trade) => trade.tradeType === TradeType.BUY && trade.status === TradeStatus.COMPLETED
      );
      setBuyTransactions(completedBuyTrades);

      // Get member's gold holdings
      const memberData = authService.getMemberData();
      if (memberData) {
        setGoldHoldings(memberData.goldHoldings || 0);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const selectedTrade = buyTransactions.find((trade) => trade.id === selectedTradeId);
  const sellPrice = goldRate?.sellPrice || 0;
  const quantity = selectedTrade?.quantity || 0;
  const calculatedValue = quantity * sellPrice;
  const buyPrice = selectedTrade?.rateAtTrade || 0;
  const profit = (sellPrice - buyPrice) * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrade) {
      setError('Please select a transaction to sell');
      return;
    }

    setError("");
    setShowConfirmation(true);
  };

  const handleConfirmSell = async () => {
    setShowConfirmation(false);

    if (!selectedTrade) return;

    try {
      setSubmitting(true);
      setError("");

      await tradeService.createSellTrade({
        quantity: selectedTrade.quantity,
        notes: notes.trim() || undefined,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/member/transactions");
      }, 2500);
    } catch (err: any) {
      console.error('Error creating sell trade:', err);
      setError(err.response?.data?.message || 'Failed to create sell trade. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      </MemberLayout>
    );
  }

  if (error && !goldRate) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/member")} className="hover:bg-blue-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Create Sell Trade</h2>
          </div>

          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-semibold">{error}</p>
              <Button
                onClick={loadData}
                className="mt-3 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/member")} className="hover:bg-blue-100">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Create Sell Trade</h2>
        </div>

        {/* Display available gold holdings */}
        <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600 font-semibold">Your Gold Holdings</div>
                <div className="text-3xl font-bold text-amber-700">{goldHoldings}g</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Value</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatINR(goldHoldings * sellPrice)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current sell rate card */}
        <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-2 border-orange-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-6 h-6" />
              Current Sell Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">₹{sellPrice.toFixed(2)}</div>
            <div className="text-orange-100 text-lg mt-1">per gram</div>
          </CardContent>
        </Card>

        {/* Sell form */}
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              Sell Full Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {buyTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No completed buy transactions available to sell.</p>
                <p className="text-gray-400 text-sm mt-2">You need to have completed buy transactions before you can sell.</p>
                <Button
                  onClick={() => navigate("/member/transactions")}
                  className="mt-4"
                  variant="outline"
                >
                  View Transactions
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Transaction selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">
                    Select BUY Transaction to Sell *
                  </label>
                  <Select value={selectedTradeId} onValueChange={setSelectedTradeId}>
                    <SelectTrigger className="h-14 text-lg border-2 border-blue-300">
                      <SelectValue placeholder="Choose a transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyTransactions.map((trade) => (
                        <SelectItem key={trade.id} value={trade.id} className="text-base">
                          {formatDate(trade.createdAt)} - {trade.quantity}g @ {formatINR(trade.rateAtTrade)}/g
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Select a completed buy transaction to sell the full quantity
                  </p>
                </div>

                {/* Notes input */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">
                    Notes (Optional)
                  </label>
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    className="h-12 border-2 border-blue-300"
                  />
                </div>

                {/* Transaction details preview */}
                {selectedTrade && (
                  <>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                            <span className="text-gray-700 font-semibold">Purchase Date:</span>
                            <span className="font-bold">{formatDate(selectedTrade.createdAt)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                            <span className="text-gray-700 font-semibold">Gold Amount:</span>
                            <span className="font-bold text-xl text-amber-700">{selectedTrade.quantity}g</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                            <span className="text-gray-700 font-semibold">Original Buy Price:</span>
                            <span className="font-bold text-green-700">{formatINR(buyPrice)}/g</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                            <span className="text-gray-700 font-semibold">Current Sell Price:</span>
                            <span className="font-bold text-orange-700">{formatINR(sellPrice)}/g</span>
                          </div>
                          <div className="flex justify-between items-center py-3 bg-white rounded-lg px-3 mt-3">
                            <span className="text-gray-700 font-semibold">Profit/Loss:</span>
                            <span className={`font-bold text-xl ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profit >= 0 ? '+' : ''}{formatINR(profit)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400 shadow-md">
                      <CardContent className="p-5">
                        <div className="text-center">
                          <div className="text-sm text-gray-700 font-semibold mb-2">You will receive</div>
                          <div className="text-5xl font-bold text-green-600">
                            {formatINR(calculatedValue)}
                          </div>
                          <div className="text-sm text-gray-600 mt-3 bg-white rounded-full py-2 px-4 inline-block">
                            {quantity}g × {formatINR(sellPrice)}/g
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 text-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg font-bold"
                  disabled={!selectedTradeId || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-6 h-6 mr-2" />
                      Proceed to Sell
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Your sell request will be submitted for admin approval
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Sell Transaction</DialogTitle>
            <DialogDescription>
              Please review your sell transaction details
            </DialogDescription>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Date:</span>
                <span className="font-bold">{formatDate(selectedTrade.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gold Amount:</span>
                <span className="font-bold text-amber-700">{quantity}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sell Price:</span>
                <span className="font-bold text-orange-700">{formatINR(sellPrice)}/g</span>
              </div>
              {notes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes:</span>
                  <span className="font-medium text-sm">{notes}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-xl text-green-600">{formatINR(calculatedValue)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Profit/Loss:</span>
                <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}{formatINR(profit)}
                </span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This sell request will be submitted as PENDING and requires admin approval before completion.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSell} className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Sell'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <DialogTitle className="text-2xl text-center">Sell Request Submitted!</DialogTitle>
              <DialogDescription className="text-center">
                Your sell request has been successfully submitted and is now pending admin approval.
              </DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </MemberLayout>
  );
}
