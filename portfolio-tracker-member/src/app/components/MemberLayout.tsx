import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { LayoutDashboard, Receipt, TrendingDown, LogOut } from "lucide-react";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/member", label: "Dashboard", icon: LayoutDashboard },
    { path: "/member/transactions", label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 border-b-4 border-orange-700 shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-xl font-bold text-white">Gold Portfolio</h1>
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-orange-700">
              <Link to="/">
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">{children}</div>
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t-4 border-gray-800 shadow-2xl">
          <div className="max-w-md mx-auto flex justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                    isActive 
                      ? "text-white bg-gray-800 font-bold" 
                      : "text-gray-400 hover:bg-gray-900"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}