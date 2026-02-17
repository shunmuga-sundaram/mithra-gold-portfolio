import { useState, useEffect } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingUp, Coins, DollarSign, TrendingDown, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import goldRateService, { GoldRate } from "../../../services/goldRateService";
import tradeService, { Trade } from "../../../services/tradeService";
import authService from "../../../services/authService";

export function MemberDashboard() {
  const navigate = useNavigate();

  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [memberName, setMemberName] = useState<string>("");
  const [goldHoldings, setGoldHoldings] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Trade[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      // Fetch all data in parallel
      const [rate, tradesResponse] = await Promise.all([
        goldRateService.getActiveRate(),
        tradeService.getMyTrades(1, 3)
      ]);

      setGoldRate(rate);
      setRecentTransactions(tradesResponse.data);

      // Get member data from local storage
      const memberData = authService.getMemberData();
      if (memberData) {
        setMemberName(memberData.name || "");
        setGoldHoldings(memberData.goldHoldings || 0);
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
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
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const goldBuyRate = goldRate?.buyPrice || 0;
  const goldSellRate = goldRate?.sellPrice || 0;
  const portfolioValue = goldSellRate * goldHoldings;

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading dashboard...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back{memberName ? `, ${memberName}` : ''}!
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-blue-100"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-5 h-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white border-2 border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <TrendingUp className="w-4 h-4" />
                Buy Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{goldBuyRate.toFixed(2)}</div>
              <div className="text-green-100 text-xs mt-1">per gram</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-2 border-orange-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <TrendingDown className="w-4 h-4" />
                Sell Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{goldSellRate.toFixed(2)}</div>
              <div className="text-orange-100 text-xs mt-1">per gram</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Coins className="w-6 h-6 text-amber-600" />
              Total Gold Holding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-900">{goldHoldings.toFixed(1)}g</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <DollarSign className="w-6 h-6 text-green-600" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{formatINR(portfolioValue)}</div>
            <div className="text-sm text-green-700 mt-2">
              Based on current sell price
            </div>
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full h-16 text-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg"
          onClick={() => navigate("/member/sell-trade")}
        >
          <TrendingDown className="w-6 h-6 mr-2" />
          Create Sell Trade
        </Button>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet.</p>
                <p className="text-sm mt-1">Your transaction history will appear here.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-blue-50 rounded px-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            transaction.tradeType === "BUY"
                              ? "bg-green-200 text-green-800"
                              : "bg-orange-200 text-orange-800"
                          }`}>
                            {transaction.tradeType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            transaction.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {transaction.status}
                          </span>
                          <span className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-gray-700">{transaction.quantity}g @ {formatINR(transaction.rateAtTrade)}/g</div>
                      </div>
                      <div className="text-right font-bold">
                        {formatINR(transaction.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/member/transactions")}
                >
                  View All Transactions
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
