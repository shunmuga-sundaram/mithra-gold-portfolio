import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, Coins, Clock, TrendingUp, Plus, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";

export function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Members",
      value: "142",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Gold Holdings",
      value: "2,845.5g",
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Pending Sell Requests",
      value: "8",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Current Buy Rate",
      value: "₹6,550/g",
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
              <div className="text-4xl font-bold text-green-600">₹6,550.00</div>
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
              <div className="text-4xl font-bold text-orange-600">₹6,600.00</div>
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
            <div className="space-y-4">
              {[
                { action: "Gold rates updated - Buy: ₹6,550/g, Sell: ₹6,600/g", time: "2 hours ago" },
                { action: "New member registered: John Doe", time: "5 hours ago" },
                { action: "Sell request completed for Member #142", time: "1 day ago" },
                { action: "Buy trade created: 50g for Member #128", time: "1 day ago" },
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-amber-50 px-2 rounded">
                  <span className="text-gray-700">{activity.action}</span>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}