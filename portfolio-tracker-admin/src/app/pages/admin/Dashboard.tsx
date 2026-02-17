import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, Coins, Clock, TrendingUp, Plus, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import statisticsService, { DashboardStatistics } from "../../../services/statisticsService";
import goldRateService, { GoldRate } from "../../../services/goldRateService";
import tradeService, { Trade, TradeStatus } from "../../../services/tradeService";

export function AdminDashboard() {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all data in parallel
      const [stats, rate, tradesResponse] = await Promise.all([
        statisticsService.getDashboardStatistics(),
        goldRateService.getActiveRate(),
        tradeService.getAllTrades(1, 5)
      ]);

      setStatistics(stats);
      setGoldRate(rate);
      setRecentTrades(tradesResponse.data);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
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
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getTradeDescription = (trade: Trade): string => {
    const memberName = trade.memberId.name;
    const action = trade.tradeType === 'BUY' ? 'purchased' : 'sold';
    return `${memberName} ${action} ${trade.quantity}g @ ${formatINR(trade.rateAtTrade)}/g`;
  };

  const getStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">PENDING</span>;
      case TradeStatus.COMPLETED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">COMPLETED</span>;
      case TradeStatus.CANCELLED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="ml-2 text-lg">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !statistics || !goldRate) {
    return (
      <AdminLayout>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-semibold">{error || 'Failed to load dashboard data'}</p>
          </div>
          <Button
            onClick={loadDashboardData}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: "Total Members",
      value: statistics.totalMembers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Gold Holdings",
      value: `${statistics.totalGoldHoldings.toFixed(1)}g`,
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Pending Sell Requests",
      value: statistics.pendingSellRequests.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Current Buy Rate",
      value: formatINR(goldRate.buyPrice) + "/g",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-6 h-6" />
                Current Buy Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{formatINR(goldRate.buyPrice)}</div>
              <div className="text-green-600 mt-1">per gram</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingUp className="w-6 h-6" />
                Current Sell Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{formatINR(goldRate.sellPrice)}</div>
              <div className="text-orange-600 mt-1">per gram</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button
            size="lg"
            className="h-16 px-10 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            onClick={() => navigate("/admin/gold-rate")}
          >
            <DollarSign className="w-6 h-6 mr-2" />
            Update Gold Rates
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 px-10 text-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/admin/trades")}
          >
            <Plus className="w-6 h-6 mr-2" />
            Create Trade
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent trades yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-amber-50 px-2 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          trade.tradeType === 'BUY'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {trade.tradeType}
                        </span>
                        {getStatusBadge(trade.status)}
                        <span className="text-gray-700">{getTradeDescription(trade)}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 ml-4">{formatDate(trade.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
