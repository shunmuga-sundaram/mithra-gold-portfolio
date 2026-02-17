import { useState, useEffect } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import tradeService, { Trade, TradeType, TradeStatus } from "../../../services/tradeService";

export function MemberTransactions() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await tradeService.getMyTrades();
      setTrades(result.data);
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

  const handleSellClick = () => {
    navigate('/member/sell-trade');
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
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>

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
                  </div>

                  {trade.notes && (
                    <div className="mt-3 pt-3 border-t-2">
                      <div className="text-xs text-gray-500 font-medium mb-1">Notes</div>
                      <div className="text-sm text-gray-700">{trade.notes}</div>
                    </div>
                  )}

                  {trade.tradeType === TradeType.BUY && trade.status === TradeStatus.COMPLETED && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mt-4 h-12 border-2 border-orange-500 text-orange-700 hover:bg-orange-50 font-bold"
                      onClick={handleSellClick}
                    >
                      <TrendingDown className="w-5 h-5 mr-2" />
                      INITIATE SELL TRADE
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
