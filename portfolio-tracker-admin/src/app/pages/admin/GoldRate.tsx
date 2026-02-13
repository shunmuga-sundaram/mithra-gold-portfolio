import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp } from "lucide-react";

export function AdminGoldRate() {
  const [goldBuyPrice, setGoldBuyPrice] = useState("6550");
  const [goldSellPrice, setGoldSellPrice] = useState("6600");
  const [priceHistory, setPriceHistory] = useState([
    { date: "2026-02-13", time: "10:30 AM", buyPrice: "₹6,550", sellPrice: "₹6,600" },
    { date: "2026-02-12", time: "02:15 PM", buyPrice: "₹6,520", sellPrice: "₹6,570" },
    { date: "2026-02-11", time: "09:00 AM", buyPrice: "₹6,495", sellPrice: "₹6,545" },
    { date: "2026-02-10", time: "11:45 AM", buyPrice: "₹6,510", sellPrice: "₹6,560" },
    { date: "2026-02-09", time: "03:20 PM", buyPrice: "₹6,480", sellPrice: "₹6,530" },
  ]);

  const formatINR = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newEntry = {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      buyPrice: formatINR(goldBuyPrice),
      sellPrice: formatINR(goldSellPrice),
    };
    setPriceHistory([newEntry, ...priceHistory]);
    alert(`Gold rates updated!\nBuy Price: ${formatINR(goldBuyPrice)}/g\nSell Price: ${formatINR(goldSellPrice)}/g`);
  };

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
                    />
                  </div>
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full md:w-auto h-16 px-12 text-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                Update Rates
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gold Price Update Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-100">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Buy Price</TableHead>
                    <TableHead className="font-semibold">Sell Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-amber-50">
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.time}</TableCell>
                      <TableCell className="font-medium text-green-700">{entry.buyPrice}</TableCell>
                      <TableCell className="font-medium text-orange-700">{entry.sellPrice}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}