import { useState, useEffect } from "react";
import { MemberLayout } from "../../components/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { TrendingDown, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

export function MemberSellTrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buyIdFromUrl = searchParams.get("buyId");
  
  const goldSellRate = 6600;

  // Mock buy transactions available for selling
  const buyTransactions = [
    { id: 1, date: "2026-02-10", grams: 50, buyPrice: 6480 },
    { id: 2, date: "2026-02-05", grams: 30, buyPrice: 6450 },
    { id: 4, date: "2026-01-28", grams: 45.5, buyPrice: 6390 },
    { id: 5, date: "2026-01-20", grams: 25, buyPrice: 6320 },
  ];

  const [selectedTransaction, setSelectedTransaction] = useState(buyIdFromUrl || "");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const selectedTx = buyTransactions.find(tx => tx.id.toString() === selectedTransaction);
  const calculatedValue = selectedTx ? selectedTx.grams * goldSellRate : 0;
  const profit = selectedTx ? (goldSellRate - selectedTx.buyPrice) * selectedTx.grams : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    setShowConfirmation(true);
  };

  const handleConfirmSell = () => {
    setShowConfirmation(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/member/transactions");
    }, 2000);
  };

  return (
    <MemberLayout>
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/member")} className="hover:bg-blue-100">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Create Sell Trade</h2>
        </div>

        <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-2 border-orange-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-6 h-6" />
              Current Sell Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">₹{goldSellRate.toFixed(2)}</div>
            <div className="text-orange-100 text-lg mt-1">per gram</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              Sell Full Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">
                  Select BUY Transaction to Sell *
                </label>
                <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                  <SelectTrigger className="h-14 text-lg border-2 border-blue-300">
                    <SelectValue placeholder="Choose a transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyTransactions.map((tx) => (
                      <SelectItem key={tx.id} value={tx.id.toString()} className="text-base">
                        #{tx.id} - {tx.date} - {tx.grams}g @ {formatINR(tx.buyPrice)}/g
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTx && (
                <>
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                          <span className="text-gray-700 font-semibold">Transaction ID:</span>
                          <span className="font-bold text-lg">#{selectedTx.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                          <span className="text-gray-700 font-semibold">Purchase Date:</span>
                          <span className="font-bold">{selectedTx.date}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                          <span className="text-gray-700 font-semibold">Gold Amount:</span>
                          <span className="font-bold text-xl text-amber-700">{selectedTx.grams}g</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                          <span className="text-gray-700 font-semibold">Original Buy Price:</span>
                          <span className="font-bold text-green-700">{formatINR(selectedTx.buyPrice)}/g</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b-2 border-blue-200">
                          <span className="text-gray-700 font-semibold">Current Sell Price:</span>
                          <span className="font-bold text-orange-700">{formatINR(goldSellRate)}/g</span>
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
                          {selectedTx.grams}g × {formatINR(goldSellRate)}/g
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
                disabled={!selectedTransaction}
              >
                <TrendingDown className="w-6 h-6 mr-2" />
                Proceed to Sell
              </Button>
            </form>
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
          {selectedTx && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction:</span>
                <span className="font-bold">#{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gold Amount:</span>
                <span className="font-bold text-amber-700">{selectedTx.grams}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sell Price:</span>
                <span className="font-bold text-orange-700">{formatINR(goldSellRate)}/g</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-xl text-green-600">{formatINR(calculatedValue)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmSell} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Confirm Sell
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
                Your sell request has been successfully submitted and is now pending approval.
              </DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </MemberLayout>
  );
}
