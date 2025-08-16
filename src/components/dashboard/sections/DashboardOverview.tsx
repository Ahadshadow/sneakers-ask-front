import { StatsCard } from "../StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, TrendingUp, ShoppingBag, Star } from "lucide-react";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="12,847"
          change="+12.5%"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Active Sellers"
          value="1,243"
          change="+8.2%"
          changeType="positive"
          icon={ShoppingBag}
        />
        <StatsCard
          title="Monthly Revenue"
          value="$184,291"
          change="+23.1%"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New seller registered", user: "Jordan Store", time: "2 minutes ago" },
                { action: "Product listed", user: "Nike Air Max 90", time: "5 minutes ago" },
                { action: "Order completed", user: "#ORD-12847", time: "8 minutes ago" },
                { action: "User verification", user: "Mike Johnson", time: "12 minutes ago" },
                { action: "Seller payout", user: "$2,450", time: "15 minutes ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Air Jordan 1 Retro High", sales: 342, revenue: "$45,680" },
                { name: "Nike Dunk Low", sales: 298, revenue: "$38,740" },
                { name: "Adidas Yeezy 350", sales: 256, revenue: "$76,800" },
                { name: "Nike Air Force 1", sales: 213, revenue: "$21,300" },
                { name: "New Balance 550", sales: 187, revenue: "$28,050" },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <span className="text-sm font-bold text-success">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}