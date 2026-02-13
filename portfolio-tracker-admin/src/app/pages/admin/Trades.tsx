import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Receipt, TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: number;
  memberId: number;
  memberName: string;
  type: "BUY" | "SELL";
  date: string;
  grams: number;
  buyPrice: number;
  sellPrice: number | null;
  status: "Waiting" | "Processing" | "Completed";
  linkedBuyId?: number;
}

export function AdminTrades() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, memberId: 1, memberName: "John Doe", type: "BUY", date: "2026-02-10", grams: 50, buyPrice: 6480, sellPrice: null, status: "Completed" },
    { id: 2, memberId: 2, memberName: "Jane Smith", type: "BUY", date: "2026-02-11", grams: 30, buyPrice: 6495, sellPrice: null, status: "Completed" },
    { id: 3, memberId: 1, memberName: "John Doe", type: "SELL", date: "2026-02-12", grams: 50, buyPrice: 6480, sellPrice: 6520, status: "Waiting", linkedBuyId: 1 },
    { id: 4, memberId: 3, memberName: "Bob Johnson", type: "BUY", date: "2026-02-12", grams: 75, buyPrice: 6520, sellPrice: null, status: "Completed" },
    { id: 5, memberId: 2, memberName: "Jane Smith", type: "SELL", date: "2026-02-13", grams: 30, buyPrice: 6495, sellPrice: 6550, status: "Processing", linkedBuyId: 2 },
  ]);

  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [newBuyTrade, setNewBuyTrade] = useState({
    memberId: "",
    grams: "",
    buyPrice: "6550",
  });
  const [newSellTrade, setNewSellTrade] = useState({
    buyTransactionId: "",
    sellPrice: "6600",
  });

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Get available BUY transactions that haven't been sold
  const availableBuyTransactions = transactions.filter(
    t => t.type === "BUY" && !transactions.some(st => st.type === "SELL" && st.linkedBuyId === t.id && st.status === "Completed")
  );

  const handleCreateBuyTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const trade: Transaction = {
      id: transactions.length + 1,
      memberId: parseInt(newBuyTrade.memberId),
      memberName: `Member #${newBuyTrade.memberId}`,
      type: "BUY",
      date: new Date().toISOString().split("T")[0],
      grams: parseFloat(newBuyTrade.grams),
      buyPrice: parseFloat(newBuyTrade.buyPrice),
      sellPrice: null,
      status: "Completed",
    };
    setTransactions([...transactions, trade]);
    setNewBuyTrade({ memberId: "", grams: "", buyPrice: "6550" });
    setIsBuyDialogOpen(false);
  };

  const handleCreateSellTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const buyTransaction = transactions.find(t => t.id === parseInt(newSellTrade.buyTransactionId));
    if (!buyTransaction) return;

    const trade: Transaction = {
      id: transactions.length + 1,
      memberId: buyTransaction.memberId,
      memberName: buyTransaction.memberName,
      type: "SELL",
      date: new Date().toISOString().split("T")[0],
      grams: buyTransaction.grams,
      buyPrice: buyTransaction.buyPrice,
      sellPrice: parseFloat(newSellTrade.sellPrice),
      status: "Waiting",
      linkedBuyId: buyTransaction.id,
    };
    setTransactions([...transactions, trade]);
    setNewSellTrade({ buyTransactionId: "", sellPrice: "6600" });
    setIsSellDialogOpen(false);
  };

  const updateSellStatus = (id: number, status: "Waiting" | "Processing" | "Completed") => {
    setTransactions(transactions.map(t =>
      t.id === id ? { ...t, status } : t
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Trade Management</h2>
          <div className="flex gap-3">
            <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Create BUY Trade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Create BUY Trade
                  </DialogTitle>
                  <DialogDescription>Enter the details for the new buy trade</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBuyTrade} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-memberId">Member ID</Label>
                    <Input
                      id="buy-memberId"
                      type="number"
                      value={newBuyTrade.memberId}
                      onChange={(e) => setNewBuyTrade({ ...newBuyTrade, memberId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buy-grams">Grams</Label>
                    <Input
                      id="buy-grams"
                      type="number"
                      step="0.01"
                      value={newBuyTrade.grams}
                      onChange={(e) => setNewBuyTrade({ ...newBuyTrade, grams: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buy-buyPrice">Buy Price (per gram)</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹</span>
                      <Input
                        id="buy-buyPrice"
                        type="number"
                        step="0.01"
                        value={newBuyTrade.buyPrice}
                        onChange={(e) => setNewBuyTrade({ ...newBuyTrade, buyPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">Create BUY Trade</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Create SELL Trade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                    Create SELL Trade
                  </DialogTitle>
                  <DialogDescription>Select a BUY transaction to sell (entire transaction only)</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSellTrade} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-transaction">Select BUY Transaction</Label>
                    <Select
                      value={newSellTrade.buyTransactionId}
                      onValueChange={(value) => setNewSellTrade({ ...newSellTrade, buyTransactionId: value })}
                    >
                      <SelectTrigger id="sell-transaction">
                        <SelectValue placeholder="Choose a transaction" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBuyTransactions.map((tx) => (
                          <SelectItem key={tx.id} value={tx.id.toString()}>
                            #{tx.id} - {tx.memberName} - {tx.grams}g @ {formatINR(tx.buyPrice)}/g
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newSellTrade.buyTransactionId && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm space-y-1">
                          {(() => {
                            const tx = availableBuyTransactions.find(t => t.id === parseInt(newSellTrade.buyTransactionId));
                            return tx ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Member:</span>
                                  <span className="font-semibold">{tx.memberName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Grams:</span>
                                  <span className="font-semibold">{tx.grams}g (Full Transaction)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Original Buy Price:</span>
                                  <span className="font-semibold">{formatINR(tx.buyPrice)}/g</span>
                                </div>
                              </>
                            ) : null;
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="sell-sellPrice">Sell Price (per gram)</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹</span>
                      <Input
                        id="sell-sellPrice"
                        type="number"
                        step="0.01"
                        value={newSellTrade.sellPrice}
                        onChange={(e) => setNewSellTrade({ ...newSellTrade, sellPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-orange-600 hover:bg-orange-700" disabled={!newSellTrade.buyTransactionId}>
                    Create SELL Trade
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Receipt className="w-6 h-6" />
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-100">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Member</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Grams</TableHead>
                    <TableHead className="font-semibold">Buy Price</TableHead>
                    <TableHead className="font-semibold">Sell Price</TableHead>
                    <TableHead className="font-semibold">Total Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-amber-50">
                      <TableCell className="font-medium">#{transaction.id}</TableCell>
                      <TableCell>{transaction.memberName}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.type === "BUY" 
                            ? "bg-green-200 text-green-800" 
                            : "bg-orange-200 text-orange-800"
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.grams}g</TableCell>
                      <TableCell className="text-green-700 font-medium">{formatINR(transaction.buyPrice)}</TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {transaction.sellPrice ? formatINR(transaction.sellPrice) : "-"}
                      </TableCell>
                      <TableCell className="font-bold">
                        {transaction.type === "BUY" 
                          ? formatINR(transaction.grams * transaction.buyPrice)
                          : transaction.sellPrice ? formatINR(transaction.grams * transaction.sellPrice) : "-"
                        }
                      </TableCell>
                      <TableCell>
                        {transaction.type === "SELL" ? (
                          <Select
                            value={transaction.status}
                            onValueChange={(value: "Waiting" | "Processing" | "Completed") =>
                              updateSellStatus(transaction.id, value)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Waiting">Waiting</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-green-600 font-medium">{transaction.status}</span>
                        )}
                      </TableCell>
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
