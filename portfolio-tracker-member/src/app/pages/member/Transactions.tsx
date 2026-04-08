import { useState, useEffect } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { TrendingDown, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import tradeService, { Trade, TradeType, TradeStatus } from "../../../services/tradeService";
import goldRateService from "../../../services/goldRateService";

export function MemberTransactions() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [goldSellRate, setGoldSellRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sell dialog state
  const [sellTrade, setSellTrade] = useState<Trade | null>(null);
  const [sellNotes, setSellNotes] = useState("");
  const [submittingSell, setSubmittingSell] = useState(false);
  const [sellError, setSellError] = useState("");
  const [showSellSuccess, setShowSellSuccess] = useState(false);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError("");
      const [result, rate] = await Promise.all([
        tradeService.getMyTrades(),
        goldRateService.getActiveRate(),
      ]);
      setTrades(result.data);
      setGoldSellRate(rate.sellPrice);
    } catch (err: any) {
      console.error('Error loading trades:', err);
      setError('Failed to load transactions. Please try again.');
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

  const getCurrentValueInfo = (trade: Trade) => {
    const currentValue = trade.quantity * goldSellRate;
    const diff = currentValue - trade.totalAmount;
    const isProfit = diff > 0;
    const isLoss = diff < 0;
    return {
      currentValue,
      colorClass: isProfit ? 'text-green-700' : isLoss ? 'text-red-600' : 'text-gray-700',
    };
  };

  const getStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-200 text-yellow-800">PENDING</span>;
      case TradeStatus.COMPLETED:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-800">COMPLETED</span>;
      case TradeStatus.CANCELLED:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-800">{status}</span>;
    }
  };

  const getValidityInfo = (trade: Trade) => {
    const expiry = new Date(trade.createdAt);
    expiry.setDate(expiry.getDate() + (trade.validityDays ?? 30));
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
    const isExpired = daysLeft <= 0;
    return { isExpired, daysLeft, expiry };
  };

  const handleSellClick = (trade: Trade) => {
    setSellTrade(trade);
    setSellNotes("");
    setSellError("");
  };

  const handleConfirmSell = async () => {
    if (!sellTrade) return;
    try {
      setSubmittingSell(true);
      setSellError("");
      await tradeService.createSellTrade({
        quantity: sellTrade.quantity,
        notes: sellNotes.trim() || undefined,
        sourceBuyTradeId: sellTrade.id,
      });
      setSellTrade(null);
      setShowSellSuccess(true);
      // Refresh list after short delay
      setTimeout(() => {
        setShowSellSuccess(false);
        loadTrades();
      }, 2000);
    } catch (err: any) {
      setSellError(err.response?.data?.message || 'Failed to submit sell request.');
    } finally {
      setSubmittingSell(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-lg">Loading transactions...</span>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        </div>

        {trades.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">No transactions found.</p>
              <p className="text-gray-400 text-sm mt-2">Your trade history will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <Card key={trade.id} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          trade.tradeType === TradeType.BUY
                            ? "bg-green-200 text-green-800"
                            : "bg-orange-200 text-orange-800"
                        }`}>
                          {trade.tradeType}
                        </span>
                        {getStatusBadge(trade.status)}
                      </div>
                      <div className="text-sm text-gray-600">{formatDate(trade.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-amber-700">{trade.quantity}g</div>
                      <div className="text-xs text-gray-500">
                        Rate: {formatINR(trade.rateAtTrade)}/g
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t-2">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Rate at Trade</div>
                      <div className={`font-bold ${trade.tradeType === TradeType.BUY ? 'text-green-700' : 'text-orange-700'}`}>
                        {formatINR(trade.rateAtTrade)}/g
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Total Amount</div>
                      <div className="font-bold text-gray-900">
                        {formatINR(trade.totalAmount)}
                      </div>
                    </div>
                    {trade.status === TradeStatus.COMPLETED && trade.tradeType === TradeType.BUY && goldSellRate > 0 && (
                      <div className="col-span-2 pt-2 border-t">
                        <div className="text-xs text-gray-500 font-medium">Current Value</div>
                        <div className={`font-bold ${getCurrentValueInfo(trade).colorClass}`}>
                          {formatINR(getCurrentValueInfo(trade).currentValue)}
                        </div>
                      </div>
                    )}
                  </div>

                  {trade.notes && (
                    <div className="mt-3 pt-3 border-t-2">
                      <div className="text-xs text-gray-500 font-medium mb-1">Notes</div>
                      <div className="text-sm text-gray-700">{trade.notes}</div>
                    </div>
                  )}

                  {trade.tradeType === TradeType.BUY && trade.status === TradeStatus.COMPLETED && (() => {
                    const { isExpired, daysLeft } = getValidityInfo(trade);
                    return (
                      <div className="mt-4 space-y-2">
                        <div className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-md ${
                          isExpired
                            ? 'bg-red-50 text-red-600'
                            : daysLeft <= 5
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          <span className="font-medium">Sell Validity</span>
                          <span className="font-bold">
                            {isExpired ? 'Expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          className={`w-full h-12 border-2 font-bold ${
                            isExpired
                              ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                              : 'border-orange-500 text-orange-700 hover:bg-orange-50'
                          }`}
                          onClick={() => !isExpired && handleSellClick(trade)}
                          disabled={isExpired}
                        >
                          <TrendingDown className="w-5 h-5 mr-2" />
                          {isExpired ? 'SELL EXPIRED' : 'SELL'}
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Sell Confirmation Dialog */}
      {sellTrade && (
        <Dialog open={!!sellTrade} onOpenChange={(open) => { if (!open) setSellTrade(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Confirm Sell
              </DialogTitle>
              <DialogDescription>Review and confirm your sell request</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gold Amount</span>
                <span className="font-bold text-amber-700">{sellTrade.quantity}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Buy Rate</span>
                <span className="font-semibold text-green-700">{formatINR(sellTrade.rateAtTrade)}/g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Sell Rate</span>
                <span className="font-semibold text-orange-700">{formatINR(goldSellRate)}/g</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">You will receive</span>
                <span className="font-bold text-xl text-green-600">{formatINR(sellTrade.quantity * goldSellRate)}</span>
              </div>
              {goldSellRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit / Loss</span>
                  <span className={`font-bold ${(sellTrade.quantity * goldSellRate - sellTrade.totalAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(sellTrade.quantity * goldSellRate - sellTrade.totalAmount) >= 0 ? '+' : ''}
                    {formatINR(sellTrade.quantity * goldSellRate - sellTrade.totalAmount)}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div className="pt-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={sellNotes}
                  onChange={(e) => setSellNotes(e.target.value)}
                  placeholder="Add any notes..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={submittingSell}
                />
              </div>

              {sellError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{sellError}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This sell request will be PENDING until admin approves it.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setSellTrade(null)} className="flex-1" disabled={submittingSell}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSell}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={submittingSell}
              >
                {submittingSell ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  'Confirm Sell'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Dialog */}
      <Dialog open={showSellSuccess} onOpenChange={setShowSellSuccess}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <DialogTitle className="text-xl text-center">Sell Request Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Your sell request is pending admin approval.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </MemberLayout>
  );
}
