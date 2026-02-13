import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { LayoutDashboard, Receipt, TrendingUp, Users, LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/gold-rate", label: "Gold Rate", icon: TrendingUp },
    { path: "/admin/members", label: "Members", icon: Users },
    { path: "/admin/trades", label: "Trades", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header spans full width */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b-4 border-yellow-600 shadow-lg">
        <div className="px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Mithra Gold Portfolio Tracker - Admin Portal</h2>
          <Button variant="outline" asChild className="bg-white hover:bg-gray-100 border-2">
            <Link to="/">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-gray-200 shadow-lg flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors ${
                    isActive 
                      ? "bg-yellow-500 text-white" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}