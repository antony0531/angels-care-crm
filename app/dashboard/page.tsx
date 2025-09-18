"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, TrendingUp, Users, Target, ArrowRight,
  Gauge, Zap, Search, MapPin, MousePointer, FileText,
  AlertCircle, CheckCircle2, Clock, DollarSign
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Quick stats for main dashboard
  const [quickStats] = useState({
    totalVisitors: 45234,
    totalLeads: 1247,
    conversionRate: 2.76,
    avgResponseTime: "8m",
    coreWebVitals: 92,
    activeTests: 3,
    uptime: 99.98,
    revenue: 125400
  });

  const [recentActivity] = useState([
    { time: "2 min ago", event: "New lead captured", detail: "John Smith - Medicare Plan", type: "lead" },
    { time: "5 min ago", event: "A/B Test Started", detail: "Homepage CTA Button", type: "test" },
    { time: "12 min ago", event: "Performance Alert", detail: "Page speed improved by 15%", type: "success" },
    { time: "18 min ago", event: "Content Published", detail: "New blog post went live", type: "content" },
    { time: "25 min ago", event: "Lead Converted", detail: "Sarah Johnson - $2,400", type: "conversion" }
  ]);

  const performanceTrend = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    visitors: Math.floor(Math.random() * 2000) + 3000,
    leads: Math.floor(Math.random() * 50) + 150,
    conversions: Math.floor(Math.random() * 20) + 30
  }));

  useEffect(() => {
    setLoading(false);
  }, []);

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToSection('/dashboard/analytics')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToSection('/dashboard/leads')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToSection('/dashboard/analytics/core-web-vitals')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
              <Gauge className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{quickStats.coreWebVitals}</div>
            <Progress value={quickStats.coreWebVitals} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToSection('/dashboard/analytics/conversion-funnel')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(quickStats.revenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 18%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Performance Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Last 7 days trend</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToSection('/dashboard/analytics')}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="leads" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area type="monotone" dataKey="conversions" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Badge variant="outline">{recentActivity.length} new</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'lead' ? 'bg-blue-500/10' :
                    activity.type === 'conversion' ? 'bg-green-500/10' :
                    activity.type === 'test' ? 'bg-purple-500/10' :
                    activity.type === 'success' ? 'bg-green-500/10' :
                    'bg-gray-500/10'
                  }`}>
                    {activity.type === 'lead' ? <Users className="h-3 w-3" /> :
                     activity.type === 'conversion' ? <DollarSign className="h-3 w-3" /> :
                     activity.type === 'test' ? <Activity className="h-3 w-3" /> :
                     activity.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
                     <FileText className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/analytics/core-web-vitals')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Gauge className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Core Web Vitals</p>
              <p className="text-xs text-muted-foreground mt-1">Monitor performance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/analytics/technical-seo')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Search className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Technical SEO</p>
              <p className="text-xs text-muted-foreground mt-1">Site health check</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/analytics/user-engagement')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <MousePointer className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">User Engagement</p>
              <p className="text-xs text-muted-foreground mt-1">Behavior analytics</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/analytics/conversion-funnel')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Conversion Funnel</p>
              <p className="text-xs text-muted-foreground mt-1">Track conversions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/analytics/real-time')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Real-time Monitor</p>
              <p className="text-xs text-muted-foreground mt-1">Live tracking</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">All Systems Operational</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Uptime: <span className="font-semibold text-green-500">{quickStats.uptime}%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Active A/B Tests: <span className="font-semibold">{quickStats.activeTests}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Response: <span className="font-semibold">{quickStats.avgResponseTime}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateToSection('/dashboard/analytics')}>
              View Full Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}