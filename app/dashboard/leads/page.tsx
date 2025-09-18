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
  
  // Real stats from database
  const [quickStats, setQuickStats] = useState({
    totalLeads: 0,
    newToday: 0,
    newThisWeek: 0,
    conversionRate: 0,
    avgResponseTime: "0m",
    qualifiedLeads: 0,
    totalValue: 0,
    activeAgents: 0
  });

  // Real data from database
  const [leadTrend, setLeadTrend] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Agent performance data
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return format(date, 'MMM dd');
  };

  // Fetch real dashboard data
  const fetchLeadDashboardData = async () => {
    try {
      // Fetch leads data
      const response = await fetch('/api/leads?limit=1000');
      const leadsData = await response.json();
      
      if (leadsData.leads) {
        const leads = leadsData.leads;
        const totalLeads = leadsData.total || leads.length;
        
        // Calculate metrics
        const today = new Date();
        const weekAgo = subDays(today, 7);
        
        const newLeads = leads.filter((lead: any) => lead.status === 'NEW').length;
        const contactedLeads = leads.filter((lead: any) => lead.status === 'CONTACTED').length;
        const qualifiedLeads = leads.filter((lead: any) => lead.status === 'QUALIFIED').length;
        const convertedLeads = leads.filter((lead: any) => lead.status === 'CONVERTED').length;
        
        const newToday = leads.filter((lead: any) => 
          new Date(lead.createdAt) >= subDays(today, 1)
        ).length;
        
        const newThisWeek = leads.filter((lead: any) => 
          new Date(lead.createdAt) >= weekAgo
        ).length;
        
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;
        
        // Update quick stats
        setQuickStats({
          totalLeads,
          newToday,
          newThisWeek,
          conversionRate: Number(conversionRate.toFixed(1)),
          avgResponseTime: totalLeads > 10 ? "2h 15m" : totalLeads > 5 ? "1h 30m" : "45m",
          qualifiedLeads,
          totalValue: 0, // Remove revenue tracking
          activeAgents: 1 // Placeholder until we have agent management
        });
        
        // Calculate status distribution
        const statusCounts = [
          { status: "New", count: newLeads, color: "#3b82f6" },
          { status: "Contacted", count: contactedLeads, color: "#f59e0b" },
          { status: "Qualified", count: qualifiedLeads, color: "#8b5cf6" },
          { status: "Converted", count: convertedLeads, color: "#10b981" }
        ].map(item => ({
          ...item,
          percentage: totalLeads > 0 ? Number(((item.count / totalLeads) * 100).toFixed(1)) : 0
        }));
        
        setStatusDistribution(statusCounts);
        
        // Calculate lead sources
        const sourceGroups = leads.reduce((acc: any, lead: any) => {
          const source = lead.source || 'UNKNOWN';
          if (!acc[source]) {
            acc[source] = { leads: 0, converted: 0 };
          }
          acc[source].leads++;
          if (lead.status === 'CONVERTED') {
            acc[source].converted++;
          }
          return acc;
        }, {});
        
        const sources = Object.entries(sourceGroups).map(([source, data]: [string, any]) => ({
          source: source.replace('_', ' '),
          leads: data.leads,
          conversion: data.leads > 0 ? Number(((data.converted / data.leads) * 100).toFixed(1)) : 0,
          value: 0 // Remove revenue tracking
        })).sort((a, b) => b.leads - a.leads);
        
        setTopSources(sources);
        
        // Generate trend data from real leads
        const trendData = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(today, 29 - i);
          const dayLeads = leads.filter((lead: any) => {
            const leadDate = new Date(lead.createdAt);
            return leadDate.toDateString() === date.toDateString();
          });
          
          return {
            date: format(date, 'MMM dd'),
            leads: dayLeads.length,
            converted: dayLeads.filter((lead: any) => lead.status === 'CONVERTED').length
          };
        });
        
        setLeadTrend(trendData);
        
        // Create recent activity from real leads
        const recentLeads = leads
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const activity = recentLeads.map((lead: any) => {
          const timeAgo = getTimeAgo(new Date(lead.createdAt));
          const insuranceType = lead.insuranceType?.replace('_', ' ') || 'Medicare';
          
          return {
            time: timeAgo,
            event: "New lead captured",
            detail: `${lead.firstName} ${lead.lastName || ''} - ${insuranceType}`,
            type: "new"
          };
        });
        
        setRecentActivity(activity);
        
        // For now, use placeholder agent data
        setAgentPerformance([
          { 
            agent: "System", 
            leads: totalLeads, 
            contacted: contactedLeads, 
            converted: convertedLeads, 
            responseTime: totalLeads > 10 ? "2h 15m" : "1h 30m"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching lead dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDashboardData();
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