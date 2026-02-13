import { useState } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TrendingDown } from "lucide-react";
import { useNavigate } from "react-router";

interface Transaction {
  id: number;
  type: "BUY" | "SELL";
  date: string;
  buyPrice: number;
  sellPrice: number | null;
  grams: number;
  status: string;
}

export function MemberTransactions() {
  const navigate = useNavigate();
  const [transactions] = useState<Transaction[]>([
    { id: 1, type: "BUY", date: "2026-02-10", buyPrice: 6480, sellPrice: null, grams: 50, status: "Completed" },
    { id: 2, type: "BUY", date: "2026-02-05", buyPrice: 6450, sellPrice: null, grams: 30, status: "Completed" },
    { id: 3, type: "SELL", date: "2026-02-01", buyPrice: 6390, sellPrice: 6420, grams: 20, status: "Completed" },
    { id: 4, type: "BUY", date: "2026-01-28", buyPrice: 6390, sellPrice: null, grams: 45.5, status: "Completed" },
    { id: 5, type: "BUY", date: "2026-01-20", buyPrice: 6320, sellPrice: null, grams: 25, status: "Completed" },
    { id: 6, type: "SELL", date: "2026-01-15", buyPrice: 6280, sellPrice: 6310, grams: 15, status: "Completed" },
  ]);

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleSellClick = (transactionId: number) => {
    navigate(`/member/sell-trade?buyId=${transactionId}`);
  };

  return (
    <MemberLayout>
      <div className="space-y-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        transaction.type === "BUY" 
                          ? "bg-green-200 text-green-800" 
                          : "bg-orange-200 text-orange-800"
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">#{transaction.id}</span>
                    </div>
                    <div className="text-sm text-gray-600">{transaction.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-amber-700">{transaction.grams}g</div>
                    <div className="text-sm text-gray-600">{transaction.status}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t-2">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Buy Price</div>
                    <div className="font-bold text-green-700">{formatINR(transaction.buyPrice)}/g</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Sell Price</div>
                    <div className="font-bold text-orange-700">
                      {transaction.sellPrice ? `${formatINR(transaction.sellPrice)}/g` : "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2">
                  <div className="text-xs text-gray-500 font-medium mb-1">Total Amount</div>
                  <div className="font-bold text-lg">
                    {transaction.type === "BUY" 
                      ? formatINR(transaction.grams * transaction.buyPrice)
                      : transaction.sellPrice ? formatINR(transaction.grams * transaction.sellPrice) : "-"
                    }
                  </div>
                </div>

                {transaction.type === "BUY" && transaction.status === "Completed" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full mt-4 h-12 border-2 border-orange-500 text-orange-700 hover:bg-orange-50 font-bold"
                    onClick={() => handleSellClick(transaction.id)}
                  >
                    <TrendingDown className="w-5 h-5 mr-2" />
                    SELL THIS TRANSACTION
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}