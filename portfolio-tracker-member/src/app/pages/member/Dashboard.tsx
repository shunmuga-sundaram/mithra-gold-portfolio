import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingUp, Coins, DollarSign, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router";

export function MemberDashboard() {
  const navigate = useNavigate();

  const goldBuyRate = 6550;
  const goldSellRate = 6600;
  const totalGoldHoldings = 125.5;
  const portfolioValue = goldSellRate * totalGoldHoldings;

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <MemberLayout>
      <div className="space-y-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        
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
            <div className="text-4xl font-bold text-amber-900">{totalGoldHoldings.toFixed(1)}g</div>
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
            <div className="space-y-3">
              {[
                { type: "BUY", date: "Feb 10, 2026", grams: 50, price: 6480 },
                { type: "BUY", date: "Feb 5, 2026", grams: 30, price: 6495 },
                { type: "SELL", date: "Feb 1, 2026", grams: 20, price: 6420 },
              ].map((transaction, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-blue-50 rounded px-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        transaction.type === "BUY" 
                          ? "bg-green-200 text-green-800" 
                          : "bg-orange-200 text-orange-800"
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="text-sm text-gray-600">{transaction.date}</span>
                    </div>
                    <div className="mt-1 text-gray-700">{transaction.grams}g @ {formatINR(transaction.price)}/g</div>
                  </div>
                  <div className="text-right font-bold">
                    {formatINR(transaction.grams * transaction.price)}
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
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}