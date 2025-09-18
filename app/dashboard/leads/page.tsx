"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, TrendingUp, Target, Clock, ArrowRight,
  Phone, Mail, Calendar, DollarSign, Activity,
  UserPlus, CheckCircle2, XCircle, Filter, FileText
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { format, subDays } from "date-fns";

export default function LeadDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Quick stats
  const [quickStats] = useState({
    totalLeads: 1247,
    newToday: 34,
    newThisWeek: 189,
    conversionRate: 8.9,
    avgResponseTime: "2h 15m",
    qualifiedLeads: 423,
    totalValue: 125400,
    activeAgents: 8
  });

  // Lead trend data
  const leadTrend = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    leads: Math.floor(Math.random() * 30) + 20,
    converted: Math.floor(Math.random() * 5) + 2
  }));

  // Lead sources overview
  const [topSources] = useState([
    { source: "Google Ads", leads: 456, conversion: 12.3, value: 45600 },
    { source: "Organic Search", leads: 389, conversion: 9.8, value: 38900 },
    { source: "Facebook", leads: 234, conversion: 7.2, value: 23400 },
    { source: "Direct", leads: 123, conversion: 11.5, value: 14150 },
    { source: "Referral", leads: 45, conversion: 15.6, value: 7020 }
  ]);

  // Lead status distribution
  const [statusDistribution] = useState([
    { status: "New", count: 423, percentage: 33.9, color: "#3b82f6" },
    { status: "Contacted", count: 567, percentage: 45.5, color: "#f59e0b" },
    { status: "Qualified", count: 189, percentage: 15.2, color: "#8b5cf6" },
    { status: "Converted", count: 68, percentage: 5.4, color: "#10b981" }
  ]);

  // Recent activity
  const [recentActivity] = useState([
    { time: "2 min ago", event: "New lead captured", detail: "Patricia Brown - Medicare Advantage", type: "new" },
    { time: "15 min ago", event: "Lead contacted", detail: "Michael Johnson assigned to John Smith", type: "contact" },
    { time: "28 min ago", event: "Lead converted", detail: "Jennifer Davis - $380 value", type: "conversion" },
    { time: "45 min ago", event: "Form submission", detail: "Landing page: /medicare-plans", type: "form" },
    { time: "1 hour ago", event: "Lead qualified", detail: "Robert Wilson - High score", type: "qualified" }
  ]);

  // Agent performance
  const [agentPerformance] = useState([
    { agent: "John Smith", leads: 234, contacted: 189, converted: 23, responseTime: "1.5h" },
    { agent: "Jane Doe", leads: 198, contacted: 156, converted: 19, responseTime: "2.1h" },
    { agent: "Mike Johnson", leads: 167, contacted: 134, converted: 15, responseTime: "1.8h" },
    { agent: "Sarah Wilson", leads: 145, contacted: 112, converted: 12, responseTime: "2.4h" }
  ]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of lead capture and conversion performance
          </p>
        </div>
        <Button onClick={() => navigateToSection('/dashboard/leads/all')}>
          View All Leads
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToSection('/dashboard/leads/all')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalLeads.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                +{quickStats.newToday} today
              </Badge>
              <Badge variant="outline" className="text-xs">
                +{quickStats.newThisWeek} this week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.conversionRate}%</div>
            <Progress value={quickStats.conversionRate * 10} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 1.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↓ 15 min</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(quickStats.totalValue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              Potential revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Lead Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lead Capture Trend</CardTitle>
                <CardDescription>New leads and conversions over time</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToSection('/dashboard/leads/analytics')}>
                View Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={leadTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="New Leads" />
                <Area type="monotone" dataKey="converted" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((status) => (
                <div key={status.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{status.status}</span>
                    <span className="text-sm font-bold">{status.count}</span>
                  </div>
                  <div className="relative">
                    <Progress value={status.percentage} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{status.percentage}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Lead Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Lead Sources</CardTitle>
              <CardDescription>Performance by acquisition channel</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateToSection('/dashboard/leads/sources')}>
              View All Sources
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Source</th>
                  <th className="text-center p-2">Leads</th>
                  <th className="text-center p-2">Conversion Rate</th>
                  <th className="text-center p-2">Value</th>
                  <th className="text-center p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topSources.map((source) => (
                  <tr key={source.source} className="border-b">
                    <td className="p-2 font-medium">{source.source}</td>
                    <td className="p-2 text-center">{source.leads}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={source.conversion > 10 ? "text-green-500" : ""}>
                        {source.conversion}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center font-medium">${source.value.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance & Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Lead handling by agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agentPerformance.map((agent) => (
                <div key={agent.agent} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{agent.agent}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{agent.leads} leads</span>
                      <span>{agent.contacted} contacted</span>
                      <span className="text-green-500">{agent.converted} converted</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{agent.responseTime}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Avg response</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest lead events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'new' ? 'bg-blue-500/10' :
                    activity.type === 'contact' ? 'bg-yellow-500/10' :
                    activity.type === 'conversion' ? 'bg-green-500/10' :
                    activity.type === 'qualified' ? 'bg-purple-500/10' :
                    'bg-gray-500/10'
                  }`}>
                    {activity.type === 'new' ? <UserPlus className="h-3 w-3" /> :
                     activity.type === 'contact' ? <Phone className="h-3 w-3" /> :
                     activity.type === 'conversion' ? <CheckCircle2 className="h-3 w-3" /> :
                     activity.type === 'qualified' ? <Target className="h-3 w-3" /> :
                     <Activity className="h-3 w-3" />}
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
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/all')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">All Leads</p>
              <p className="text-xs text-muted-foreground mt-1">Manage leads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/sources')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Lead Sources</p>
              <p className="text-xs text-muted-foreground mt-1">Track channels</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/analytics')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-muted-foreground mt-1">Lead insights</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/forms')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Lead Forms</p>
              <p className="text-xs text-muted-foreground mt-1">Form performance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/settings')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Filter className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Settings</p>
              <p className="text-xs text-muted-foreground mt-1">Configure system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}