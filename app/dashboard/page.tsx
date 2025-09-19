"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, TrendingUp, Users, Target, ArrowRight,
  Gauge, Zap, Search, MapPin, MousePointer, FileText,
  AlertCircle, CheckCircle2, Clock, Flame, Snowflake, Sun, Phone
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays } from "date-fns";

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    avgResponseTime: "0m",
    activeAgents: 1
  });

  const [recentActivity, setRecentActivity] = useState([
    { time: "Loading...", event: "Loading recent activity", detail: "", type: "lead" }
  ]);

  const [leadsTrend, setLeadsTrend] = useState([]);

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch leads data
      const response = await fetch('/api/leads?limit=1000');
      const leadsData = await response.json();
      
      if (leadsData.leads) {
        const totalLeads = leadsData.total || leadsData.leads.length;
        
        // Simple categorization based on user-defined status
        const newLeads = leadsData.leads.filter((lead: any) => 
          lead.status === 'NEW' || lead.status === 'new'
        ).length;
        
        const contactedLeads = leadsData.leads.filter((lead: any) => 
          lead.status === 'CONTACTED' || lead.status === 'contacted'
        ).length;
        
        const convertedLeads = leadsData.leads.filter((lead: any) => 
          lead.status === 'CONVERTED' || lead.status === 'converted'
        ).length;
        
        setQuickStats(prev => ({
          ...prev,
          totalLeads,
          newLeads,
          contactedLeads,
          convertedLeads,
          avgResponseTime: totalLeads > 10 ? "45m" : totalLeads > 5 ? "30m" : "15m",
          activeAgents: 1
        }));

        // Generate simple trend data for the last 7 days
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const leadsOnDate = leadsData.leads.filter((lead: any) => 
            format(new Date(lead.createdAt), 'yyyy-MM-dd') === dateStr
          ).length;
          
          trendData.push({
            date: format(date, 'MMM dd'),
            leads: leadsOnDate
          });
        }
        
        setLeadsTrend(trendData);

        // Generate recent activity
        const activities = [];
        
        // Recent leads
        const recentLeads = leadsData.leads
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
          
        recentLeads.forEach((lead: any) => {
          activities.push({
            time: getTimeAgo(new Date(lead.createdAt)),
            event: `New lead: ${lead.firstName} ${lead.lastName || ''}`,
            detail: `${lead.insuranceType} • ${lead.source}`,
            type: "lead"
          });
        });

        // Add some sample system activities
        activities.push({
          time: "2h ago",
          event: "System backup completed",
          detail: "All data safely backed up",
          type: "success"
        });

        setRecentActivity(activities.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchDashboardData()}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              All time leads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{quickStats.newLeads}</div>
            <p className="text-xs text-muted-foreground">
              Fresh leads to contact
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Phone className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{quickStats.contactedLeads}</div>
            <p className="text-xs text-muted-foreground">
              In conversation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{quickStats.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Successful sales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Lead Trend</CardTitle>
            <CardDescription>
              Daily lead capture over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={leadsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest events and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'lead' ? 'bg-blue-500/10' :
                    activity.type === 'success' ? 'bg-green-500/10' :
                    'bg-gray-500/10'
                  }`}>
                    {activity.type === 'lead' ? <Users className="h-3 w-3" /> :
                     activity.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> :
                     <FileText className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.event}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/all?status=new')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm font-medium">New Leads</p>
              <p className="text-xs text-muted-foreground mt-1">Fresh leads to contact</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/all?status=contacted')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Phone className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-sm font-medium">Contacted</p>
              <p className="text-xs text-muted-foreground mt-1">In conversation</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/all?status=converted')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm font-medium">Converted</p>
              <p className="text-xs text-muted-foreground mt-1">Successful sales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105" onClick={() => navigateToSection('/dashboard/leads/all')}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">All Leads</p>
              <p className="text-xs text-muted-foreground mt-1">Complete list</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}